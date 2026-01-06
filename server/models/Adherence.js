import mongoose from 'mongoose';

const adherenceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }, // Optional if tracking general adherence
    medicineName: { type: String }, // redundant store for quick access
    status: { type: String, enum: ['taken', 'missed', 'skipped'], required: true },
    date: { type: Date, required: true },
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('Adherence', adherenceSchema);
