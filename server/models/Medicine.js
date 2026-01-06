import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String }, // Cloudinary URL
    stock: { type: Number, default: 0 },
    category: { type: String },
    price: { type: Number },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Medicine', medicineSchema);
