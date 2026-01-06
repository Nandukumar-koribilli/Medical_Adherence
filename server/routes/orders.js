import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import UserMedicine from '../models/UserMedicine.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Place order (patient)
router.post('/', auth, async (req, res) => {
    try {
        const { items } = req.body;
        const order = new Order({ userId: req.user.id, items });
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get my orders (patient)
router.get('/my', auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Get all orders
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });
        const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Accept order
router.put('/:id/accept', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });
        const delivery = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days
        const order = await Order.findByIdAndUpdate(req.params.id, { status: 'accepted', deliveryDate: delivery }, { new: true });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Decrement stock for each ordered item
        for (const it of order.items) {
            try {
                await (await import('../models/Medicine.js')).default.findByIdAndUpdate(it.medicineId, { $inc: { stock: -Math.max(1, it.quantity) } });
            } catch (e) {
                console.error('Failed to decrement stock for', it.medicineId, e.message);
            }
        }

        // Create an in-app notification for the user
        try {
            await Notification.create({
                userId: order.userId,
                title: 'Order Accepted',
                message: `Your order #${order._id} was accepted and will arrive in 2 days.`
            });
        } catch (e) {
            console.error('Failed to create notification for user', order.userId, e.message);
        }

        // Add medicines to user's regimen (or reactivate existing entries)
        for (const it of order.items) {
            try {
                const existing = await UserMedicine.findOne({ userId: order.userId, medicineId: it.medicineId });
                if (existing) {
                    existing.active = true;
                    existing.startDate = new Date();
                    existing.dosage = existing.dosage || 'As directed';
                    existing.frequency = existing.frequency || 'Daily';
                    existing.time = existing.time || '09:00 AM';
                    await existing.save();
                } else {
                    await UserMedicine.create({
                        userId: order.userId,
                        medicineId: it.medicineId,
                        frequency: 'Daily',
                        time: '09:00 AM',
                        dosage: 'As directed'
                    });
                }
            } catch (e) {
                console.error('Failed to add medicine to user regimen for', order.userId, it.medicineId, e.message);
            }
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;