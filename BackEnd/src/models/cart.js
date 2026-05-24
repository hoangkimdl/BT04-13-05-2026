const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, default: 1 },
    size: { type: Number, default: null }
});

const cartSchema = new mongoose.Schema({
    userEmail: { type: String, required: true, index: true },
    items: { type: [cartItemSchema], default: [] },
    updatedAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
