const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, default: 0 },
    images: { type: [String], default: [] },
    category: { type: String, default: 'Uncategorized' },
    stock: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    isNew: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
    discount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
