import { EyeOutlined } from '@ant-design/icons';
import { Button, Empty, List, Spin, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../data/products';
import axios from '../util/axios.customize';

const statusLabel = {
    NEW: 'Đơn hàng mới',
    CONFIRMED: 'Đã xác nhận',
    PREPARING: 'Shop đang chuẩn bị hàng',
    SHIPPING: 'Đang giao hàng',
    DELIVERED: 'Đã giao thành công',
    CANCELLED: 'Đã hủy',
    CANCEL_REQUESTED: 'Đã gửi yêu cầu hủy'
};

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const isAuthenticated = Boolean(localStorage.getItem('access_token'));

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const result = await axios.get('/v1/api/orders');
                setOrders(result?.orders || []);
            } catch (error) {
                console.error(error);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        queueMicrotask(() => {
            if (isAuthenticated) loadOrders();
            else setLoading(false);
        });
    }, [isAuthenticated]);

    if (loading) {
        return (
            <main className="shop-page empty-state">
                <Spin />
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <main className="shop-page empty-state">
                <Empty description="Bạn cần đăng nhập để xem đơn hàng">
                    <Link to="/login"><Button type="primary">Đăng nhập</Button></Link>
                </Empty>
            </main>
        );
    }

    return (
        <main className="shop-page orders-page">
            <div className="section-heading">
                <h2>Lịch sử mua hàng</h2>
                <Link to="/cart">Quay lại giỏ hàng</Link>
            </div>

            {orders.length ? (
                <List
                    className="order-list"
                    dataSource={orders}
                    renderItem={(order) => (
                        <List.Item
                            actions={[
                                <Link key="view" to={`/orders/${order._id}`}>
                                    <Button icon={<EyeOutlined />}>Theo dõi</Button>
                                </Link>
                            ]}
                        >
                            <List.Item.Meta
                                title={<Link to={`/orders/${order._id}`}>Đơn #{order._id.slice(-8).toUpperCase()}</Link>}
                                description={`${order.items.length} sản phẩm - ${new Date(order.createdAt).toLocaleString('vi-VN')}`}
                            />
                            <div className="order-list__side">
                                <Tag color="blue">{statusLabel[order.status] || order.status}</Tag>
                                <strong>{formatPrice(order.totalAmount)}</strong>
                            </div>
                        </List.Item>
                    )}
                />
            ) : (
                <Empty description="Bạn chưa có đơn hàng nào">
                    <Link to="/search"><Button type="primary">Mua sắm ngay</Button></Link>
                </Empty>
            )}
        </main>
    );
};

export default OrdersPage;
