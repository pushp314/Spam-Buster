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
    
    // Fetch user info to get email and store it in session for isolation
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    req.session.userEmail = userInfo.data.email;
    
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
    // Refresh userEmail in session if needed
    req.session.userEmail = userInfo.data.email;
    res.json({ connected: true, user: userInfo.data });
  } catch (err) {
    req.session = null;
    res.json({ connected: false });
  }
});

// 4. Logout
app.post('/api/auth/logout', async (req, res) => {
  try {
    // Optionally clear user's messages on logout if that's what "vanish" means
    // But usually data should persist between logins of the same user.
    // However, the user said "its data should vanish all mails only show when mail id inbox mails only"
    // and they seem to want per-session or per-login cleanup? 
    // Actually, "its data should vanish" probably means "shouldn't be shown to others".
    // I'll keep the data but filter it by userEmail in GET /api/messages.
    // If they want to explicitely clear it, they can use the delete endpoint.
    // I'll modify this to ONLY logout and NOT delete records, OR only delete current user's.
    // Given the user's request, I'll make it only delete current user's history to satisfy "data should vanish".
    if (req.session.userEmail) {
        await Message.deleteMany({ userEmail: req.session.userEmail });
    }
    req.session = null;
    res.json({ message: 'Logged out and history cleared' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// 5. Direct Email Sync (No Redis Required)
app.get('/api/gmail/sync', async (req, res) => {
  if (!req.session.tokens || !req.session.userEmail) {
    return res.status(401).json({ error: 'Gmail not connected' });
  }
  const { model, groqKey, geminiKey, openAIKey, limit = 15 } = req.query;
  const userEmail = req.session.userEmail;
  const tokens = req.session.tokens;

  // We respond immediately to keep the UI responsive, processing in background
  res.json({ success: true, message: 'Email sync started in background' });

  // Background execution without Redis
  (async () => {
    console.log(`🚀 Starting direct sync for user ${userEmail} (Up to ${limit} messages)`);
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
      const listRes = await gmail.users.messages.list({ 
        userId: 'me', 
        maxResults: parseInt(limit) 
      });
      const messages = listRes.data.messages || [];
      
      let processedCount = 0;
      for (const msg of messages) {
        try {
          const existing = await Message.findOne({ gmailId: msg.id, userEmail });
          if (existing) continue;

          const detailRes = await gmail.users.messages.get({ userId: 'me', id: msg.id });
          const { snippet, payload } = detailRes.data;
          const headers = payload.headers;
          const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || 'No Subject';

          const classification = await classifyMessage(subject, snippet, model, { groqKey, geminiKey, openAIKey });
          const newMessage = new Message({
            text: `Subject: ${subject}\n\n${snippet}`,
            label: classification.label,
            department: classification.department,
            confidence: classification.confidence,
            reason: classification.reason,
            gmailId: msg.id,
            userEmail,
          });

          await newMessage.save();
          processedCount++;
          console.log(`✅ Processed [${processedCount}/${messages.length}]: ${subject}`);
        } catch (msgErr) {
          console.error(`❌ Error processing message ${msg.id}:`, msgErr.message);
        }
      }
      console.log(`✨ Direct sync complete. Processed ${processedCount} new messages.`);
    } catch (err) {
      console.error(`❌ Direct sync failed:`, err.message);
    }
  })();
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
  if (!req.session.userEmail) return res.json([]);
  try {
    const messages = await Message.find({ userEmail: req.session.userEmail }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.patch('/api/messages/:id/label', async (req, res) => {
  if (!req.session.userEmail) return res.status(401).json({ error: 'Unauthorized' });
  const { label } = req.body;
  if (!['spam', 'not spam'].includes(label)) return res.status(400).json({ error: 'Invalid label' });
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, userEmail: req.session.userEmail }, 
      { label, confidence: 100, reason: 'Manual correction' }, 
      { new: true }
    );
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update label' });
  }
});

app.patch('/api/messages/:id/department', async (req, res) => {
  if (!req.session.userEmail) return res.status(401).json({ error: 'Unauthorized' });
  const { department } = req.body;
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, userEmail: req.session.userEmail }, 
      { department }, 
      { new: true }
    );
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update department' });
  }
});

app.patch('/api/messages/bulk/update', async (req, res) => {
  if (!req.session.userEmail) return res.status(401).json({ error: 'Unauthorized' });
  const { ids, label, department } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'Invalid IDs' });

  const updateData = {};
  if (label && ['spam', 'not spam'].includes(label)) {
    updateData.label = label;
    updateData.confidence = 100;
    updateData.reason = 'Bulk manual correction';
  }
  if (department) {
    updateData.department = department; 
  }

  try {
    await Message.updateMany({ _id: { $in: ids }, userEmail: req.session.userEmail }, { $set: updateData });
    const updatedMessages = await Message.find({ _id: { $in: ids }, userEmail: req.session.userEmail });
    res.json(updatedMessages);
  } catch (err) {
    res.status(500).json({ error: 'Bulk update failed' });
  }
});

app.delete('/api/messages', async (req, res) => {
  if (!req.session.userEmail) return res.status(401).json({ error: 'Unauthorized' });
  try {
    await Message.deleteMany({ userEmail: req.session.userEmail });
    res.json({ message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed cleanup' });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  if (!req.session.userEmail) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const result = await Message.deleteOne({ _id: req.params.id, userEmail: req.session.userEmail });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

app.post('/api/messages/bulk/delete', async (req, res) => {
  if (!req.session.userEmail) return res.status(401).json({ error: 'Unauthorized' });
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'Invalid IDs' });
  try {
    await Message.deleteMany({ _id: { $in: ids }, userEmail: req.session.userEmail });
    res.json({ message: 'Bulk delete successful' });
  } catch (err) {
    res.status(500).json({ error: 'Bulk delete failed' });
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
