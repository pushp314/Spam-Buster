require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieSession = require('cookie-session');
const { google } = require('googleapis');
const Message = require('./models/Message');
const { emailQueue } = require('./config/queue');
const { classifyMessage } = require('./utils/classifier');

const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security & Performance Middlewares
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// Global Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Session Stability
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'secret_key_needs_replacement'],
  maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'lax',
}));

// Database Stability
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: \${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1); // Stop server on DB failure
  }
};
connectDB();

// Google OAuth Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

// --- ROUTES ---

// 1. Get Auth URL
app.get('/api/auth/google/url', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  res.json({ url });
});

// 2. Auth Callback
app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    req.session.tokens = tokens;
    res.redirect(`${CLIENT_URL}/?connected=true`);
  } catch (err) {
    console.error('OAuth Error:', err);
    res.redirect(`${CLIENT_URL}/?error=auth_failed`);
  }
});

// 3. Status
app.get('/api/auth/status', async (req, res) => {
  if (!req.session.tokens) return res.json({ connected: false });
  try {
    oauth2Client.setCredentials(req.session.tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    res.json({ connected: true, user: userInfo.data });
  } catch (err) {
    req.session = null;
    res.json({ connected: false });
  }
});

// 4. Logout
app.post('/api/auth/logout', (req, res) => {
  req.session = null;
  res.json({ message: 'Logged out' });
});

// 5. Queue-Based Email Sync
app.get('/api/gmail/sync', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Gmail not connected' });
  const { model, groqKey, geminiKey, openAIKey, limit = 15 } = req.query;

  try {
    const job = await emailQueue.add('sync-emails', {
      tokens: req.session.tokens,
      model,
      limit,
      keys: { groqKey, geminiKey, openAIKey }
    });
    
    res.json({ success: true, jobId: job.id, message: 'Email sync job added to queue' });
  } catch (err) {
    console.error('❌ Sync job queue error:', err);
    res.status(500).json({ error: 'Failed to queue sync job', message: err.message });
  }
});

// 6. Manual Text Check (Still synchronous but uses robust classifier)
app.post('/api/messages/check', async (req, res) => {
  const { text, model, keys } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });
  try {
    const classification = await classifyMessage('Manual Entry', text, model, keys);
    res.json(classification);
  } catch (err) {
    console.error('Manual check error:', err);
    res.status(500).json({ error: 'Manual check failed' });
  }
});

// 7. Standard CRUD for messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.patch('/api/messages/:id/label', async (req, res) => {
  const { label } = req.body;
  if (!['spam', 'not spam'].includes(label)) return res.status(400).json({ error: 'Invalid label' });
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id, 
      { label, confidence: 100, reason: 'Manual correction' }, 
      { new: true }
    );
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update label' });
  }
});

app.patch('/api/messages/:id/department', async (req, res) => {
  const { department } = req.body;
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id, 
      { department }, 
      { new: true }
    );
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update department' });
  }
});

app.patch('/api/messages/bulk/update', async (req, res) => {
  const { ids, label, department } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'Invalid IDs' });

  const updateData = {};
  if (label && ['spam', 'not spam'].includes(label)) {
    updateData.label = label;
    updateData.confidence = 100;
    updateData.reason = 'Bulk manual correction';
  }
  if (department) {
    updateData.department = department; // Should ideally validate against enum
  }

  try {
    await Message.updateMany({ _id: { $in: ids } }, { $set: updateData });
    const updatedMessages = await Message.find({ _id: { $in: ids } });
    res.json(updatedMessages);
  } catch (err) {
    res.status(500).json({ error: 'Bulk update failed' });
  }
});

app.delete('/api/messages', async (req, res) => {
  try {
    await Message.deleteMany({});
    res.json({ message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed cleanup' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message 
  });
});

// Process-level monitoring
process.on('uncaughtException', (err) => {
  console.error('🔥 CRITICAL: Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
