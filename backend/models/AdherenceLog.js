const mongoose = require('mongoose');

const adherenceLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  date: Date,
  time: String,
  status: { type: String, enum: ['taken', 'missed', 'snoozed'], default: 'missed' },
  dosage: String,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdherenceLog', adherenceLogSchema);
