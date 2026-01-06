import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get User Profile
router.get('/profile/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Profile
router.put('/profile/:id', auth, async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        const { name, email, avatar } = req.body; // Add other fields as needed
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, avatar },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark app opened for user (increments openDaysCount once per calendar day)
router.put('/profile/:id/open', auth, async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const now = new Date();
        const last = user.lastOpened ? new Date(user.lastOpened) : null;
        const sameDay = last && last.getFullYear() === now.getFullYear() && last.getMonth() === now.getMonth() && last.getDate() === now.getDate();
        if (!sameDay) {
            user.openDaysCount = (user.openDaysCount || 0) + 1;
            user.lastOpened = now;
            await user.save();
        }

        const safe = user.toObject();
        delete safe.password;
        res.json(safe);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Users (for Admin/Doctors finding patients)
router.get('/', auth, async (req, res) => {
    try {
        const users = await User.find().select('-password').populate('assignedDoctor', 'name email avatar');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: assign a doctor to a patient
router.put('/assign-doctor/:userId', auth, async (req, res) => {
    try {
        // Only admins can assign
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });

        const { doctorId } = req.body;
        const patientId = req.params.userId;

        const patient = await User.findById(patientId);
        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        if (!doctorId) {
            // Unassign
            const prevDoctor = patient.assignedDoctor ? await User.findById(patient.assignedDoctor) : null;
            patient.assignedDoctor = undefined;
            patient.assignedAt = undefined;
            patient.assignedBy = undefined;
            await patient.save();

            try {
                const Notification = (await import('../models/Notification.js')).default;
                await Notification.create({ userId: patient._id, title: 'Doctor Unassigned', message: `Your doctor assignment has been removed by admin.` });
                if (prevDoctor) await Notification.create({ userId: prevDoctor._id, title: 'Patient Unassigned', message: `Patient ${patient.name} is no longer assigned to you.` });
            } catch (e) {
                console.error('Error creating notifications:', e);
            }
        } else {
            const doctor = await User.findById(doctorId);
            if (!doctor || doctor.role !== 'doctor') return res.status(400).json({ error: 'Invalid doctor' });

            patient.assignedDoctor = doctorId;
            patient.assignedAt = new Date();
            patient.assignedBy = req.user.id;
            await patient.save();

            // Create notifications for both patient and doctor
            try {
                const Notification = (await import('../models/Notification.js')).default;
                await Notification.create({ userId: patient._id, title: 'Doctor Assigned', message: `Dr. ${doctor.name} has been assigned to you.` });
                await Notification.create({ userId: doctor._id, title: 'New Patient Assigned', message: `You have been assigned to patient ${patient.name}.` });
            } catch (e) {
                console.error('Error creating notifications:', e);
            }
        }

        // Return updated patient with assignedDoctor populated
        const updated = await User.findById(patient._id).select('-password').populate('assignedDoctor', 'name email avatar');
        const safe = updated.toObject();
        delete safe.password;
        res.json(safe);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
