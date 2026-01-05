const mongoose = require('mongoose');

const userMedicineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  dosage: String,
  frequency: String,
  startDate: Date,
  endDate: Date,
  timeSlots: [String], // ["08:00", "14:00", "20:00"]
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserMedicine', userMedicineSchema);
