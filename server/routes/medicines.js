import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import Medicine from '../models/Medicine.js';
import UserMedicine from '../models/UserMedicine.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const upload = multer({ dest: UPLOAD_DIR });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Admin Get All Medicines (mapped to /api/admin/medicines)
router.get('/', auth, async (req, res) => {
    try {
        const medicines = await Medicine.find();
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all store medicines
router.get('/store', auth, async (req, res) => {
    try {
        const medicines = await Medicine.find();
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin add new medicine to store
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const { name, description, category, price, stock } = req.body;
        let imageUrl = '';

        if (req.file) {
            console.log('Uploading file at', req.file.path);
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;
            try { if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); } catch(e) { console.warn('Failed to remove temp upload', e); }
        }

        const medicine = new Medicine({ name, description, category, price, stock, image: imageUrl });
        await medicine.save();
        res.status(201).json(medicine);
    } catch (error) {
        console.error('Upload Error:', error, error?.stack);
        try { if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); } catch(e) { console.warn('Failed to cleanup file on error', e); }
        res.status(500).json({ error: `Upload failed: ${error?.message || 'unknown error'}` });
    }
});

// Get User's medicines
router.get('/my-medicines', auth, async (req, res) => {
    try {
        const userMedicines = await UserMedicine.find({ userId: req.user.id }).populate('medicineId');
        res.json(userMedicines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add medicine to User's list
router.post('/add-to-user', auth, async (req, res) => {
    try {
        const { medicineId, frequency, time, dosage } = req.body;
        const userMedicine = new UserMedicine({
            userId: req.user.id,
            medicineId,
            frequency,
            time,
            dosage
        });
        await userMedicine.save();
        res.status(201).json(userMedicine);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await Medicine.findByIdAndDelete(req.params.id);
        res.json({ message: 'Medicine deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
