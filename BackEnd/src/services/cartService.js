const Cart = require('../models/cart');
const Product = require('../models/product');

const getItemProductId = (item) => String(item.product?._id || item.product);

const getCartByEmail = async (email) => {
    try {
        let cart = await Cart.findOne({ userEmail: email }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ userEmail: email, items: [] });
        }
        return cart;
    } catch (error) {
        console.error(error);
        return null;
    }
}

const addItem = async (email, productId, qty = 1, size = null) => {
    try {
        const product = await Product.findById(productId);
        if (!product) return { EC: 1, EM: 'Product not found' };
        if (product.stock <= 0) return { EC: 2, EM: 'Product out of stock' };
        const cart = await getCartByEmail(email);
        const idx = cart.items.findIndex(i => getItemProductId(i) === productId.toString() && String(i.size || '') === String(size || ''));
        if (idx >= 0) {
            const newQty = cart.items[idx].qty + Number(qty);
            if (newQty > product.stock) return { EC: 3, EM: 'Not enough stock' };
            cart.items[idx].qty = newQty;
        } else {
            if (qty > product.stock) return { EC: 3, EM: 'Not enough stock' };
            cart.items.push({ product: productId, qty: Number(qty), size });
        }
        cart.updatedAt = new Date();
        await cart.save();
        return { EC: 0, cart };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: 'Server error' };
    }
}

const setItemQty = async (email, productId, qty, size = null) => {
    try {
        const product = await Product.findById(productId);
        if (!product) return { EC: 1, EM: 'Product not found' };
        const cart = await getCartByEmail(email);
        const idx = cart.items.findIndex(i => getItemProductId(i) === productId.toString() && String(i.size || '') === String(size || ''));
        if (qty <= 0) {
            if (idx >= 0) cart.items.splice(idx, 1);
        } else {
            if (qty > product.stock) return { EC: 3, EM: 'Not enough stock' };
            if (idx >= 0) cart.items[idx].qty = Number(qty);
            else cart.items.push({ product: productId, qty: Number(qty), size });
        }
        cart.updatedAt = new Date();
        await cart.save();
        return { EC: 0, cart };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: 'Server error' };
    }
}

const removeItem = async (email, productId, size = null) => {
    try {
        const cart = await getCartByEmail(email);
        const idx = cart.items.findIndex(i => getItemProductId(i) === productId.toString() && String(i.size || '') === String(size || ''));
        if (idx >= 0) cart.items.splice(idx, 1);
        cart.updatedAt = new Date();
        await cart.save();
        return { EC: 0, cart };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: 'Server error' };
    }
}

const clearCart = async (email) => {
    try {
        const cart = await getCartByEmail(email);
        cart.items = [];
        cart.updatedAt = new Date();
        await cart.save();
        return { EC: 0 };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: 'Server error' };
    }
}

const checkoutCart = async (email) => {
    try {
        const cart = await getCartByEmail(email);
        if (!cart || cart.items.length === 0) return { EC: 1, EM: 'Cart is empty' };
        // validate stock
        for (const it of cart.items) {
            const product = await Product.findById(it.product);
            if (!product) return { EC: 2, EM: `Product ${it.product} not found` };
            if (product.stock < it.qty) return { EC: 3, EM: `Not enough stock for ${product.name}` };
        }
        // deduct stock and increase sold
        for (const it of cart.items) {
            await Product.findByIdAndUpdate(it.product, { $inc: { stock: -it.qty, sold: it.qty } });
        }
        cart.items = [];
        cart.updatedAt = new Date();
        await cart.save();
        return { EC: 0, EM: 'Checkout success' };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: 'Server error' };
    }
}

module.exports = {
    getCartByEmail,
    addItem,
    setItemQty,
    removeItem,
    clearCart,
    checkoutCart
};
