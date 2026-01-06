import mongoose from 'mongoose';

const userMedicineSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    frequency: { type: String, required: true }, // e.g., "Daily", "Twice a day"
    time: { type: String, required: true }, // e.g., "08:00 AM"
    dosage: { type: String, required: true }, // e.g., "1 pill"
    startDate: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
});

export default mongoose.model('UserMedicine', userMedicineSchema);
