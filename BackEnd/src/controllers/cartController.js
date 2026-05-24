const cartService = require('../services/cartService');
const orderService = require('../services/orderService');

const getCart = async (req, res) => {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ EC: 1, EM: 'Unauthorized' });
    const cart = await cartService.getCartByEmail(email);
    return res.status(200).json({ EC: 0, cart });
}

const addCartItem = async (req, res) => {
    const email = req.user?.email;
    const { productId, qty, size } = req.body;
    if (!email) return res.status(401).json({ EC: 1, EM: 'Unauthorized' });
    if (!productId) return res.status(400).json({ EC: 2, EM: 'productId required' });
    const q = Number(qty) || 1;
    const result = await cartService.addItem(email, productId, q, size || null);
    if (result.EC !== 0) return res.status(400).json(result);
    return res.status(200).json(result);
}

const setCartItem = async (req, res) => {
    const email = req.user?.email;
    const { productId } = req.params;
    const { qty, size } = req.body;
    if (!email) return res.status(401).json({ EC: 1, EM: 'Unauthorized' });
    const q = Number(qty);
    if (Number.isNaN(q)) return res.status(400).json({ EC: 2, EM: 'qty required' });
    const result = await cartService.setItemQty(email, productId, q, size || null);
    if (result.EC !== 0) return res.status(400).json(result);
    return res.status(200).json(result);
}

const removeCartItem = async (req, res) => {
    const email = req.user?.email;
    const { productId } = req.params;
    if (!email) return res.status(401).json({ EC: 1, EM: 'Unauthorized' });
    const { size } = req.query;
    const result = await cartService.removeItem(email, productId, size || null);
    if (result.EC !== 0) return res.status(400).json(result);
    return res.status(200).json(result);
}

const checkout = async (req, res) => {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ EC: 1, EM: 'Unauthorized' });
    const result = await orderService.createOrderFromCart(email, req.body);
    if (result.EC !== 0) return res.status(400).json(result);
    return res.status(200).json(result);
}

module.exports = { getCart, addCartItem, setCartItem, removeCartItem, checkout };
