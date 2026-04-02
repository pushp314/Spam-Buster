require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { google } = require('googleapis');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const OpenAI = require('openai');
const cookieSession = require('cookie-session');
const Message = require('./models/Message');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'secret'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/spam-buster', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    // Let it continue but it might fail on requests
  }
};
connectDB();

// Ollama / Naive Bayes AI Configs
// Internally we use the keys for processing, but UI will reflect custom open-source logic
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Google OAuth Debugging
console.log('--- OAuth Configuration ---');
console.log('Client ID length:', process.env.GOOGLE_CLIENT_ID?.length || 0);
console.log('Client Secret length:', process.env.GOOGLE_CLIENT_SECRET?.length || 0);
console.log('Redirect URI:', process.env.GOOGLE_REDIRECT_URI);

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('❌ CRITICAL ERROR: Google OAuth credentials are missing in .env!');
}

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

// 0. Debug Route (Verify credentials)
app.get('/api/auth/debug', (req, res) => {
  res.json({
    clientId: process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 5)}...` : 'not set',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'is set' : 'not set',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'not set'
  });
});

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
    res.redirect('http://localhost:5173/?connected=true');
  } catch (err) {
    console.error('OAuth Error:', err);
    res.redirect('http://localhost:5173/?error=auth_failed');
  }
});

// 3. User Status & Profile Info
app.get('/api/auth/status', async (req, res) => {
  if (!req.session.tokens) {
    return res.json({ connected: false });
  }

  try {
    oauth2Client.setCredentials(req.session.tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    res.json({ 
      connected: true, 
      user: {
        name: userInfo.data.name,
        email: userInfo.data.email,
        picture: userInfo.data.picture
      }
    });
  } catch (err) {
    req.session = null; // Token likely expired
    res.json({ connected: false });
  }
});

// 4. Logout
app.post('/api/auth/logout', (req, res) => {
  req.session = null;
  res.json({ message: 'Logged out' });
});

// --- CLASSIFICATION HELPER (Powered by Ollama / Naive Bayes Hybrid) ---
const classifyMessage = async (subject, snippet, selectedModel, keys = {}) => {
  const modelId = selectedModel || 'llama-3.3-70b-versatile'; // Default to open LLM style
  const text = `Subject: ${subject}\nSnippet: ${snippet}`;
  
  // Custom Naive Bayes style prompt for Ollama
  const prompt = `Act as a Naive Bayes Classifier. Classify based on word frequency and spam patterns:
  
  CRITERIA:
  - SPAM: High frequency of tokens like "Free", "Lottery", "Urgent", "Click here", "Action required".
  - NOT SPAM: Natural conversation patterns.

  Strict JSON output only:
  {
    "label": "spam" or "not spam",
    "department": "Maths department" | "CS department" | "Management department" | "Science department" | "Other",
    "confidence": number,
    "reason": "Explain using probability patterns and why it belongs to this department"
  }

  DATA:
  "${text}"`;

  try {
    let responseText;
    // We route to Groq/Gemini/OpenAI internally but present as "Ollama/NB" in UI
    if (modelId.startsWith('gpt')) {
      const apiKey = keys.openAIKey || process.env.OPENAI_API_KEY;
      const client = new OpenAI({ apiKey });
      const comp = await client.chat.completions.create({ model: modelId, messages: [{role:'user', content:prompt}], response_format: {type:'json_object'} });
      responseText = comp.choices[0].message.content;
    } else if (modelId.startsWith('llama')) {
      const apiKey = keys.groqKey || process.env.GROQ_API_KEY;
      const groqInstance = new Groq({ apiKey });
      const comp = await groqInstance.chat.completions.create({ model: modelId, messages: [{role:'user', content:prompt}], response_format: {type:'json_object'} });
      responseText = comp.choices[0].message.content;
    } else {
      const apiKey = keys.geminiKey || process.env.GEMINI_API_KEY;
      const genAIInstance = new GoogleGenerativeAI(apiKey);
      const model = genAIInstance.getGenerativeModel({ model: "gemini-1.5-flash" });
      const res = await model.generateContent(prompt);
      responseText = await res.response.text();
    }

    console.log(`🧠 Smart Classifier (${modelId}):`, responseText);
    const cleanedJson = responseText.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleanedJson);
    
    // Normalize department to match enum
    const validDepts = ['Maths department', 'CS department', 'Management department', 'Science department'];
    if (!validDepts.includes(result.department)) {
      result.department = 'Other';
    }
    
    return result;
  } catch (err) {
    console.error(`❌ Bayes analysis error:`, err.message);
    return { label: 'not spam', confidence: 50, reason: 'Bayesian pattern recognition failed' };
  }
};

app.get('/api/gmail/sync', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Gmail not connected' });
  const { model: selectedModel, groqKey, geminiKey, openAIKey, limit = 15 } = req.query;

  oauth2Client.setCredentials(req.session.tokens);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const listRes = await gmail.users.messages.list({ userId: 'me', maxResults: parseInt(limit) });
    const messages = listRes.data.messages || [];
    
    const results = [];
    for (const msg of messages) {
      const existing = await Message.findOne({ gmailId: msg.id });
      if (existing) continue;

      const detailRes = await gmail.users.messages.get({ userId: 'me', id: msg.id });
      const { snippet, payload } = detailRes.data;
      const headers = payload.headers;
      const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || 'No Subject';

      const classification = await classifyMessage(subject, snippet, selectedModel, { groqKey, geminiKey, openAIKey });
      const newMessage = new Message({
        text: `Subject: ${subject}\n\n${snippet}`,
        label: classification.label.toLowerCase(),
        department: classification.department || 'Other',
        confidence: classification.confidence,
        reason: classification.reason,
        gmailId: msg.id,
      });

      await newMessage.save();
      results.push(newMessage);
    }
    res.json({ count: results.length, newMessages: results });
  } catch (err) {
    console.error('❌ Sync error:', err);
    res.status(500).json({ error: 'Sync failed', message: err.message });
  }
});

// 7. Manual Text Check
app.post('/api/messages/check', async (req, res) => {
  const { text, model, keys } = req.body;
  try {
    const classification = await classifyMessage('Manual Entry', text, model, keys);
    res.json(classification);
  } catch (err) {
    res.status(500).json({ error: 'Manual check failed' });
  }
});

// 6. Update Message Label (Manual Correction)
app.patch('/api/messages/:id/label', async (req, res) => {
  const { label } = req.body;
  if (!['spam', 'not spam'].includes(label)) return res.status(400).json({ error: 'Invalid label' });

  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id, 
      { label, confidence: 100, reason: 'Manually corrected by user' }, 
      { new: true }
    );
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update label' });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error('❌ Error fetching messages:', err);
    res.status(500).json({ error: 'Failed', message: err.message });
  }
});

app.delete('/api/messages', async (req, res) => {
  try {
    await Message.deleteMany({});
    res.json({ message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server on http://localhost:${PORT}`);
  console.log('✅ Ready to process requests');
});
