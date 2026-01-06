import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  avatar: { type: String }, // Cloudinary URL
  // Assigned doctor (set by admin)
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Track how many distinct days the user opened the app
  openDaysCount: { type: Number, default: 0 },
  lastOpened: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
