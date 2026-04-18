require('dotenv').config();
const { Worker } = require('bullmq');
const { google } = require('googleapis');
const mongoose = require('mongoose');
const IORedis = require('ioredis');
const Message = require('../models/Message');
const { classifyMessage } = require('../utils/classifier');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Worker connected to MongoDB');
  } catch (err) {
    console.error('❌ Worker MongoDB Connection Error:', err.message);
    process.exit(1); 
  }
};

connectDB();

const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  family: 4,
});

const worker = new Worker(
  'email-sync',
  async (job) => {
    const { tokens, model, keys, limit, userEmail } = job.data;
    console.log(`🚀 Processing job \${job.id} for user \${userEmail} sync of up to \${limit} messages`);

    // Progress tracking
    await job.updateProgress(0);

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

          const classification = await classifyMessage(subject, snippet, model, keys);
          const newMessage = new Message({
            text: `Subject: \${subject}\n\n\${snippet}`,
            label: classification.label,
            department: classification.department,
            confidence: classification.confidence,
            reason: classification.reason,
            gmailId: msg.id,
            userEmail,
          });

          await newMessage.save();
          processedCount++;
          
          const progress = Math.round((messages.indexOf(msg) + 1) / messages.length * 100);
          await job.updateProgress(progress);
        } catch (msgErr) {
          console.error(`❌ Error processing message \${msg.id}:`, msgErr.message);
        }
      }
      
      console.log(`✅ Job \${job.id} done. Processed \${processedCount} new messages.`);
      return { processedCount };
    } catch (err) {
      console.error(`❌ Sync job execution failed:`, err.message);
      throw err; 
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on('failed', (job, err) => {
  console.error(`❌ Job \${job.id} failed:`, err.message);
});

worker.on('completed', (job) => {
  console.log(`✔ Job \${job.id} successfully completed`);
});
