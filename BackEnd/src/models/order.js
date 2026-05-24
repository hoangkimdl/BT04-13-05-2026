const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    size: { type: Number, default: null }
});

const orderSchema = new mongoose.Schema({
    userEmail: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    note: { type: String, default: '' },
    paymentMethod: { type: String, enum: ['COD'], default: 'COD' },
    status: {
        type: String,
        enum: ['NEW', 'CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'CANCEL_REQUESTED'],
        default: 'NEW',
        index: true
    },
    items: { type: [orderItemSchema], default: [] },
    totalAmount: { type: Number, default: 0 },
    cancelDeadline: { type: Date, required: true },
    statusHistory: {
        type: [{
            status: String,
            note: String,
            changedAt: { type: Date, default: Date.now }
        }],
        default: []
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
