import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    name: { type: String },
    price: { type: Number },
    quantity: { type: Number, default: 1 }
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    deliveryDate: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);