const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, index: true },
    brand: { type: String, default: '' },
    description: { type: String, default: '' },
    price: { type: Number, required: true, default: 0 },
    originalPrice: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    thumbnail: { type: String, default: '' },
    category: { type: String, default: 'Uncategorized' },
    stock: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    sizes: { type: [Number], default: [] },
    unavailableSizes: { type: [Number], default: [] },
    isNew: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
    discount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
}, { suppressReservedKeysWarning: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
