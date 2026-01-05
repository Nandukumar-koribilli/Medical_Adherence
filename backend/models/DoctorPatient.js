const mongoose = require('mongoose');

const doctorPatientSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedDate: { type: Date, default: Date.now },
  notes: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DoctorPatient', doctorPatientSchema);
