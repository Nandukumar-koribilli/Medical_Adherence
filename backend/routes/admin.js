const express = require('express');
const router = express.Router();
const DoctorPatient = require('../models/DoctorPatient');
const Medicine = require('../models/Medicine');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Assign patient to doctor
router.post('/assign-patient', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { doctorId, patientId } = req.body;
    
    const assignment = new DoctorPatient({
      doctorId,
      patientId
    });

    await assignment.save();
    res.status(201).json({ message: 'Patient assigned successfully', data: assignment });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning patient', error: error.message });
  }
});

// Get all medicines (for admin to manage)
router.get('/medicines', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const medicines = await Medicine.find().populate('uploadedBy', 'name');
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medicines', error: error.message });
  }
});

// Update medicine stock status
router.put('/medicines/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { inStock } = req.body;
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { inStock, updatedAt: new Date() },
      { new: true }
    );
    res.json({ message: 'Medicine updated successfully', medicine });
  } catch (error) {
    res.status(500).json({ message: 'Error updating medicine', error: error.message });
  }
});

module.exports = router;
