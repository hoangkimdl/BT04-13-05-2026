const orderService = require('../services/orderService');

const getMyOrders = async (req, res) => {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ EC: 1, EM: 'Unauthorized' });
    const orders = await orderService.getOrdersByEmail(email);
    return res.status(200).json({ EC: 0, orders });
};

const getOrderDetail = async (req, res) => {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ EC: 1, EM: 'Unauthorized' });
    const order = await orderService.getOrderById(email, req.params.id);
    if (!order) return res.status(404).json({ EC: 1, EM: 'Không tìm thấy đơn hàng.' });
    return res.status(200).json({ EC: 0, order });
};

const cancelOrder = async (req, res) => {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ EC: 1, EM: 'Unauthorized' });
    const result = await orderService.cancelOrder(email, req.params.id);
    if (result.EC !== 0) return res.status(400).json(result);
    return res.status(200).json(result);
};

const updateOrderStatus = async (req, res) => {
    const { status, note } = req.body;
    const result = await orderService.updateOrderStatus(req.params.id, status, note);
    if (result.EC !== 0) return res.status(400).json(result);
    return res.status(200).json(result);
};

module.exports = {
    getMyOrders,
    getOrderDetail,
    cancelOrder,
    updateOrderStatus
};
