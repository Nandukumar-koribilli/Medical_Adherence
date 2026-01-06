import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    medicineName: { type: String, required: true },
    // One-off scheduled date (for single reminders)
    scheduledAt: { type: Date },
    // Recurring
    isRecurring: { type: Boolean, default: false },
    recurrenceType: { type: String, enum: ['weekly','daily','everyX'] },
    daysOfWeek: [{ type: String }], // e.g. ['Mon','Wed']
    time: { type: String }, // 'HH:MM' (24h)
    everyXDays: { type: Number },

    message: { type: String },
    sent: { type: Boolean, default: false },
    lastRun: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Reminder', reminderSchema);