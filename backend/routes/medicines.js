const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const UserMedicine = require('../models/UserMedicine');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const upload = multer({ storage: multer.memoryStorage() });

// Get all medicines (for medicine store)
router.get('/store', async (req, res) => {
  try {
    const medicines = await Medicine.find({ inStock: true }).populate('uploadedBy', 'name');
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medicines', error: error.message });
  }
});

// Add medicine to user (user purchases/adds from store)
router.post('/add-to-user', authMiddleware, async (req, res) => {
  try {
    const { medicineId, dosage, frequency, startDate, endDate, timeSlots } = req.body;
    
    const userMedicine = new UserMedicine({
      userId: req.userId,
      medicineId,
      dosage,
      frequency,
      startDate,
      endDate,
      timeSlots
    });

    await userMedicine.save();
    res.status(201).json({ message: 'Medicine added successfully', data: userMedicine });
  } catch (error) {
    res.status(500).json({ message: 'Error adding medicine', error: error.message });
  }
});

// Get user's medicines
router.get('/my-medicines', authMiddleware, async (req, res) => {
  try {
    const userMedicines = await UserMedicine.find({ userId: req.userId })
      .populate('medicineId');
    res.json(userMedicines);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user medicines', error: error.message });
  }
});

// Upload medicine (admin only)
router.post('/upload', authMiddleware, roleMiddleware(['admin']), upload.single('image'), async (req, res) => {
  try {
    const { name, dosage, frequency, description, price, manufacturer, category } = req.body;

    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
        resource_type: 'image'
      });
      imageUrl = result.secure_url;
    }

    const medicine = new Medicine({
      name,
      dosage,
      frequency,
      description,
      price,
      image: imageUrl,
      manufacturer,
      category,
      uploadedBy: req.userId,
      inStock: true
    });

    await medicine.save();
    res.status(201).json({ message: 'Medicine uploaded successfully', medicine });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading medicine', error: error.message });
  }
});

// Delete medicine (admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting medicine', error: error.message });
  }
});

module.exports = router;
