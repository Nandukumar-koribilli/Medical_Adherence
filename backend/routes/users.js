const express = require('express');
const router = express.Router();
const User = require('../models/User');
const DoctorPatient = require('../models/DoctorPatient');
const { authMiddleware } = require('../middleware/auth');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get user profile
router.get('/profile/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Update user profile
router.put('/profile/:id', authMiddleware, async (req, res) => {
  try {
    const { name, phone, age, address } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, age, address, updatedAt: new Date() },
      { new: true }
    ).select('-password');
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
});

// Get assigned doctor for user
router.get('/assigned-doctor', authMiddleware, async (req, res) => {
  try {
    const assignment = await DoctorPatient.findOne({ patientId: req.userId }).populate('doctorId', '-password');
    if (!assignment) {
      return res.status(404).json({ message: 'No assigned doctor found' });
    }
    res.json(assignment.doctorId);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assigned doctor', error: error.message });
  }
});

module.exports = router;
