import express from 'express';
import Adherence from '../models/Adherence.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Log Adherence
router.post('/log', auth, async (req, res) => {
    try {
        const { medicineId, medicineName, status, date } = req.body;
        const log = new Adherence({
            userId: req.user.id,
            medicineId,
            medicineName,
            status,
            date: new Date(date)
        });
        await log.save();
        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get User Logs
router.get('/user-logs', auth, async (req, res) => {
    try {
        const logs = await Adherence.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
