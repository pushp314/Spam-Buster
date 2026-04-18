const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    enum: ['spam', 'not spam'],
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  gmailId: {
    type: String,
    unique: true,
  },
  department: {
    type: String,
    enum: ['Maths department', 'CS department', 'Management department', 'Science department', 'Other'],
    default: 'Other',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', MessageSchema);
