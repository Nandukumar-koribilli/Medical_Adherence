const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { authMiddleware } = require('../middleware/auth');

// Send message
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { receiverId, subject, message, messageType } = req.body;
    
    const newMessage = new Message({
      senderId: req.userId,
      receiverId,
      subject,
      message,
      messageType: messageType || 'text'
    });

    await newMessage.save();
    res.status(201).json({ message: 'Message sent successfully', data: newMessage });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Get received messages
router.get('/received', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ receiverId: req.userId })
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// Get sent messages
router.get('/sent', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ senderId: req.userId })
      .populate('receiverId', 'name email')
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sent messages', error: error.message });
  }
});

// Mark message as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json({ message: 'Message marked as read', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Error updating message', error: error.message });
  }
});

module.exports = router;
