import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth.js';
import medicineRoutes from './routes/medicines.js';
import adherenceRoutes from './routes/adherence.js';
import messageRoutes from './routes/messages.js';
import userRoutes from './routes/users.js';
import orderRoutes from './routes/orders.js';
import notificationRoutes from './routes/notifications.js';
import reminderRoutes from './routes/reminders.js';

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/adherence', adherenceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/admin/medicines', medicineRoutes); // Reuse medicine routes for admin endpoints

app.get('/', (req, res) => {
    res.send('MedSmart API is running');
});

// Initialize Agenda job queue for reminders and schedule any unsent reminders on startup
(async () => {
    try {
        const { initAgenda } = await import('./jobs/agenda2.js');
        const agenda = await initAgenda(process.env.MONGODB_URI);

        if (!agenda) {
            console.warn('Agenda not available — skipping reminder scheduling.');
            return;
        }

        const Reminder = (await import('./models/Reminder.js')).default;
        const unsent = await Reminder.find({ sent: false });
        const now = new Date();

        for (const r of unsent) {
            try {
                if (r.isRecurring) {
                    // compute next occurrence based on recurrence settings
                    const next = agenda.computeNextOccurrence(r, new Date());
                    if (next) {
                        await agenda.create('process reminder', { reminderId: r._id }).unique({ 'data.reminderId': r._id }).schedule(next).save();
                    }
                } else {
                    const when = new Date(r.scheduledAt);
                    if (when <= now) {
                        // run immediately if already due
                        await agenda.now('process reminder', { reminderId: r._id });
                    } else {
                        await agenda.create('process reminder', { reminderId: r._id }).unique({ 'data.reminderId': r._id }).schedule(when).save();
                    }
                }
            } catch (err) {
                console.error('Failed to schedule reminder job', r._id, err.message);
            }
        }
    } catch (err) {
        console.error('Failed to initialize Agenda', err.message);
    }
})();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
