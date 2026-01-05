const express = require('express');
const router = express.Router();
const AdherenceLog = require('../models/AdherenceLog');
const { authMiddleware } = require('../middleware/auth');

// Log medicine intake
router.post('/log', authMiddleware, async (req, res) => {
  try {
    const { medicineId, date, time, status, dosage, notes } = req.body;
    
    const log = new AdherenceLog({
      userId: req.userId,
      medicineId,
      date,
      time,
      status,
      dosage,
      notes
    });

    await log.save();
    res.status(201).json({ message: 'Adherence logged successfully', log });
  } catch (error) {
    res.status(500).json({ message: 'Error logging adherence', error: error.message });
  }
});

// Get adherence logs for user
router.get('/user-logs', authMiddleware, async (req, res) => {
  try {
    const logs = await AdherenceLog.find({ userId: req.userId })
      .populate('medicineId')
      .sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
});

// Get adherence statistics
router.get('/stats/:userId', authMiddleware, async (req, res) => {
  try {
    const logs = await AdherenceLog.find({ userId: req.params.userId });
    
    const totalDoses = logs.length;
    const takenDoses = logs.filter(log => log.status === 'taken').length;
    const missedDoses = logs.filter(log => log.status === 'missed').length;
    const adherencePercentage = totalDoses > 0 ? ((takenDoses / totalDoses) * 100).toFixed(2) : 0;

    res.json({
      totalDoses,
      takenDoses,
      missedDoses,
      adherencePercentage
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

module.exports = router;
