import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Send Message
router.post('/send', auth, async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const message = new Message({
            senderId: req.user.id,
            receiverId,
            content
        });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Received Messages
router.get('/received', auth, async (req, res) => {
    try {
        const messages = await Message.find({ receiverId: req.user.id })
            .populate('senderId', 'name email avatar')
            .sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get message thread between authenticated user and another user
router.get('/thread/:userId', auth, async (req, res) => {
    try {
        const otherId = req.params.userId;
        const messages = await Message.find({
            $or: [
                { senderId: req.user.id, receiverId: otherId },
                { senderId: otherId, receiverId: req.user.id }
            ]
        })
            .populate('senderId', 'name email avatar')
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark messages from a specific user as read
router.post('/mark-read/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await Message.updateMany({ senderId: userId, receiverId: req.user.id, read: false }, { $set: { read: true } });
        res.json({ modifiedCount: result.modifiedCount || result.nModified || 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
