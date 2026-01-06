import express from 'express';
import Notification from '../models/Notification.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get my notifications
router.get('/', auth, async (req, res) => {
    try {
        const notes = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        const note = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
        res.json(note);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;