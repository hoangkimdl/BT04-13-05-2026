const Order = require('../models/order');
const Product = require('../models/product');
const Cart = require('../models/cart');

const AUTO_CONFIRM_MS = 30 * 60 * 1000;

const orderSteps = ['NEW', 'CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED'];

const applyAutoConfirm = async (order) => {
    if (!order) return order;
    if (order.status !== 'NEW') return order;
    if (Date.now() - new Date(order.createdAt).getTime() < AUTO_CONFIRM_MS) return order;

    order.status = 'CONFIRMED';
    order.statusHistory.push({
        status: 'CONFIRMED',
        note: 'Tự động xác nhận sau 30 phút'
    });
    await order.save();
    return order;
};

const normalizeOrder = async (order) => {
    const updated = await applyAutoConfirm(order);
    return updated;
};

const createOrderFromCart = async (email, payload = {}) => {
    try {
        const { customerName, phone, address, note = '', paymentMethod = 'COD' } = payload;

        if (paymentMethod !== 'COD') {
            return { EC: 2, EM: 'Hiện tại chỉ hỗ trợ thanh toán COD.' };
        }
        if (!customerName || !phone || !address) {
            return { EC: 3, EM: 'Vui lòng nhập họ tên, số điện thoại và địa chỉ nhận hàng.' };
        }

        const cart = await Cart.findOne({ userEmail: email }).populate('items.product');
        if (!cart || cart.items.length === 0) return { EC: 1, EM: 'Giỏ hàng đang trống.' };

        const orderItems = [];
        let totalAmount = 0;

        for (const item of cart.items) {
            const product = await Product.findById(item.product?._id || item.product);
            if (!product) return { EC: 4, EM: 'Sản phẩm không tồn tại.' };
            if (product.stock < item.qty) return { EC: 5, EM: `Không đủ tồn kho cho ${product.name}.` };

            const price = Number(product.price || 0);
            totalAmount += price * item.qty;
            orderItems.push({
                product: product._id,
                name: product.name,
                image: product.thumbnail || product.images?.[0] || '',
                price,
                qty: item.qty,
                size: item.size || null
            });
        }

        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product?._id || item.product, {
                $inc: { stock: -item.qty, sold: item.qty }
            });
        }

        const order = await Order.create({
            userEmail: email,
            customerName,
            phone,
            address,
            note,
            paymentMethod,
            status: 'NEW',
            items: orderItems,
            totalAmount,
            cancelDeadline: new Date(Date.now() + AUTO_CONFIRM_MS),
            statusHistory: [{ status: 'NEW', note: 'Đơn hàng mới được tạo' }]
        });

        cart.items = [];
        cart.updatedAt = new Date();
        await cart.save();

        return { EC: 0, EM: 'Đặt hàng thành công.', order };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: 'Có lỗi máy chủ.' };
    }
};

const getOrdersByEmail = async (email) => {
    const orders = await Order.find({ userEmail: email }).sort({ createdAt: -1 });
    return Promise.all(orders.map((order) => normalizeOrder(order)));
};

const getOrderById = async (email, orderId) => {
    const order = await Order.findOne({ _id: orderId, userEmail: email });
    return normalizeOrder(order);
};

const updateOrderStatus = async (orderId, status, note = '') => {
    try {
        if (![...orderSteps, 'CANCELLED', 'CANCEL_REQUESTED'].includes(status)) {
            return { EC: 1, EM: 'Trạng thái đơn hàng không hợp lệ.' };
        }

        const order = await Order.findById(orderId);
        if (!order) return { EC: 2, EM: 'Không tìm thấy đơn hàng.' };

        order.status = status;
        order.statusHistory.push({ status, note: note || 'Cập nhật trạng thái đơn hàng' });
        await order.save();
        return { EC: 0, order };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: 'Có lỗi máy chủ.' };
    }
};

const cancelOrder = async (email, orderId) => {
    try {
        const order = await Order.findOne({ _id: orderId, userEmail: email });
        if (!order) return { EC: 1, EM: 'Không tìm thấy đơn hàng.' };

        await applyAutoConfirm(order);

        if (['DELIVERED', 'CANCELLED', 'CANCEL_REQUESTED'].includes(order.status)) {
            return { EC: 2, EM: 'Không thể hủy đơn hàng ở trạng thái hiện tại.' };
        }

        const withinCancelWindow = Date.now() <= new Date(order.cancelDeadline).getTime();
        if (withinCancelWindow && ['NEW', 'CONFIRMED'].includes(order.status)) {
            order.status = 'CANCELLED';
            order.statusHistory.push({ status: 'CANCELLED', note: 'Khách hàng hủy trong 30 phút đầu' });

            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.qty, sold: -item.qty }
                });
            }

            await order.save();
            return { EC: 0, EM: 'Đã hủy đơn hàng.', order };
        }

        if (order.status === 'PREPARING') {
            order.status = 'CANCEL_REQUESTED';
            order.statusHistory.push({ status: 'CANCEL_REQUESTED', note: 'Khách hàng gửi yêu cầu hủy khi shop đang chuẩn bị hàng' });
            await order.save();
            return { EC: 0, EM: 'Đã gửi yêu cầu hủy đơn cho shop.', order };
        }

        return { EC: 3, EM: 'Đơn hàng đã quá thời gian hủy trực tiếp.' };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: 'Có lỗi máy chủ.' };
    }
};

module.exports = {
    createOrderFromCart,
    getOrdersByEmail,
    getOrderById,
    updateOrderStatus,
    cancelOrder
};
