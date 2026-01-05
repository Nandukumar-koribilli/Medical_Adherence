const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: String,
  dosage: String,
  frequency: String,
  description: String,
  price: Number,
  image: String,
  manufacturer: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who uploaded
  category: String,
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Medicine', medicineSchema);
