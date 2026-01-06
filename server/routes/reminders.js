import express from 'express';
import Reminder from '../models/Reminder.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create reminder
router.post('/', auth, async (req, res) => {
    try {
        const { medicineId, medicineName, scheduledAt, message, isRecurring, recurrenceType, daysOfWeek, time, everyXDays } = req.body;
        const reminder = new Reminder({ userId: req.user.id, medicineId, medicineName, scheduledAt, message, isRecurring: !!isRecurring, recurrenceType, daysOfWeek, time, everyXDays });
        await reminder.save();

        // Try to schedule the job in Agenda (if initialized)
        try {
            const { getAgenda } = await import('../jobs/agenda.js');
            const agenda = getAgenda();
            if (reminder.isRecurring) {
                const next = agenda.computeNextOccurrence(reminder, new Date());
                if (next) {
                    await agenda.create('process reminder', { reminderId: reminder._id }).unique({ 'data.reminderId': reminder._id }).schedule(next).save();
                }
            } else {
                const when = new Date(reminder.scheduledAt);
                if (when <= new Date()) {
                    await agenda.now('process reminder', { reminderId: reminder._id });
                } else {
                    await agenda.create('process reminder', { reminderId: reminder._id }).unique({ 'data.reminderId': reminder._id }).schedule(when).save();
                }
            }
        } catch (err) {
            console.error('Failed to schedule reminder job', err.message);
        }

        res.status(201).json(reminder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update reminder (reschedule)
router.put('/:id', auth, async (req, res) => {
    try {
        const { scheduledAt, message, isRecurring, recurrenceType, daysOfWeek, time, everyXDays } = req.body;
        const rem = await Reminder.findOne({ _id: req.params.id, userId: req.user.id });
        if (!rem) return res.status(404).json({ error: 'Reminder not found' });
        if (!rem.isRecurring && rem.sent) return res.status(400).json({ error: 'Reminder already sent' });

        rem.scheduledAt = scheduledAt || rem.scheduledAt;
        rem.message = message || rem.message;
        rem.isRecurring = isRecurring !== undefined ? !!isRecurring : rem.isRecurring;
        rem.recurrenceType = recurrenceType || rem.recurrenceType;
        rem.daysOfWeek = daysOfWeek || rem.daysOfWeek;
        rem.time = time || rem.time;
        rem.everyXDays = everyXDays || rem.everyXDays;
        await rem.save();

        // reschedule Agenda job
        try {
            const { getAgenda } = await import('../jobs/agenda.js');
            const agenda = getAgenda();
            await agenda.cancel({ 'data.reminderId': rem._id });
            if (rem.isRecurring) {
                const next = agenda.computeNextOccurrence(rem, new Date());
                if (next) await agenda.create('process reminder', { reminderId: rem._id }).unique({ 'data.reminderId': rem._id }).schedule(next).save();
            } else {
                const when = new Date(rem.scheduledAt);
                if (when <= new Date()) {
                    await agenda.now('process reminder', { reminderId: rem._id });
                } else {
                    await agenda.create('process reminder', { reminderId: rem._id }).unique({ 'data.reminderId': rem._id }).schedule(when).save();
                }
            }
        } catch (err) {
            console.error('Failed to reschedule reminder job', err.message);
        }

        res.json(rem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get my reminders
router.get('/my', auth, async (req, res) => {
    try {
        const reminders = await Reminder.find({ userId: req.user.id }).sort({ scheduledAt: -1 });
        res.json(reminders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cancel reminder
router.delete('/:id', auth, async (req, res) => {
    try {
        const rem = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!rem) return res.status(404).json({ error: 'Reminder not found' });

        try {
            const { getAgenda } = await import('../jobs/agenda.js');
            const agenda = getAgenda();
            await agenda.cancel({ 'data.reminderId': req.params.id });
        } catch (err) {
            console.error('Failed to cancel reminder job', err.message);
        }

        res.json({ message: 'Reminder cancelled' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;