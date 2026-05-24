import { ArrowLeftOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Button, Descriptions, Empty, List, Spin, Steps, Tag, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatPrice } from '../data/products';
import axios from '../util/axios.customize';

const statusLabel = {
    NEW: 'Đơn hàng mới',
    CONFIRMED: 'Đã xác nhận đơn hàng',
    PREPARING: 'Shop đang chuẩn bị hàng',
    SHIPPING: 'Đang giao hàng',
    DELIVERED: 'Đã giao thành công',
    CANCELLED: 'Hủy đơn hàng',
    CANCEL_REQUESTED: 'Gửi yêu cầu hủy đơn'
};

const mainStatuses = ['NEW', 'CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED'];

const getCurrentStep = (status) => {
    const index = mainStatuses.indexOf(status);
    return index >= 0 ? index : 0;
};

const OrderDetailPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    const loadOrder = async () => {
        setLoading(true);
        try {
            const result = await axios.get(`/v1/api/orders/${id}`);
            setOrder(result?.order || null);
        } catch (error) {
            console.error(error);
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        queueMicrotask(() => loadOrder());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const canCancel = useMemo(() => {
        if (!order) return false;
        return ['NEW', 'CONFIRMED', 'PREPARING'].includes(order.status);
    }, [order]);

    const cancelOrder = async () => {
        setCancelling(true);
        try {
            const result = await axios.post(`/v1/api/orders/${order._id}/cancel`);
            if (result?.EC === 0) {
                message.success(result.EM || 'Đã cập nhật yêu cầu hủy đơn');
                setOrder(result.order);
            } else {
                message.error(result?.EM || 'Không thể hủy đơn');
            }
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <main className="shop-page empty-state">
                <Spin />
            </main>
        );
    }

    if (!order) {
        return (
            <main className="shop-page empty-state">
                <Empty description="Không tìm thấy đơn hàng">
                    <Link to="/orders"><Button type="primary">Về lịch sử đơn hàng</Button></Link>
                </Empty>
            </main>
        );
    }

    const isCancelled = ['CANCELLED', 'CANCEL_REQUESTED'].includes(order.status);

    return (
        <main className="shop-page order-detail-page">
            <Link className="article-back" to="/orders"><ArrowLeftOutlined /> Lịch sử đơn hàng</Link>

            <section className="order-detail-shell">
                <div className="order-detail-heading">
                    <div>
                        <span>Đơn #{order._id.slice(-8).toUpperCase()}</span>
                        <h1>Theo dõi đơn hàng</h1>
                    </div>
                    <Tag color={isCancelled ? 'red' : 'blue'}>{statusLabel[order.status] || order.status}</Tag>
                </div>

                {isCancelled ? (
                    <div className="cancel-state">
                        <CloseCircleOutlined />
                        <b>{statusLabel[order.status]}</b>
                    </div>
                ) : (
                    <Steps
                        className="order-steps"
                        current={getCurrentStep(order.status)}
                        items={mainStatuses.map((status) => ({ title: statusLabel[status] }))}
                    />
                )}

                <Descriptions bordered column={2} className="order-info">
                    <Descriptions.Item label="Người nhận">{order.customerName}</Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">{order.phone}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ" span={2}>{order.address}</Descriptions.Item>
                    <Descriptions.Item label="Thanh toán">COD</Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền">{formatPrice(order.totalAmount)}</Descriptions.Item>
                    <Descriptions.Item label="Hạn hủy trực tiếp" span={2}>{new Date(order.cancelDeadline).toLocaleString('vi-VN')}</Descriptions.Item>
                    {order.note ? <Descriptions.Item label="Ghi chú" span={2}>{order.note}</Descriptions.Item> : null}
                </Descriptions>

                <List
                    className="order-products"
                    header={<b>Sản phẩm đã mua</b>}
                    dataSource={order.items}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<img className="cart-thumb" src={item.image || '/logo.jpg'} alt={item.name} />}
                                title={item.name}
                                description={`Số lượng: ${item.qty}${item.size ? ` - Size ${item.size}` : ''}`}
                            />
                            <b>{formatPrice(item.price * item.qty)}</b>
                        </List.Item>
                    )}
                />

                {canCancel ? (
                    <Button danger loading={cancelling} onClick={cancelOrder}>
                        {order.status === 'PREPARING' ? 'Gửi yêu cầu hủy đơn' : 'Hủy đơn hàng'}
                    </Button>
                ) : null}

                <div className="status-history">
                    <h2>Lịch sử trạng thái</h2>
                    {order.statusHistory?.map((item, index) => (
                        <div key={`${item.status}-${index}`}>
                            <Tag>{statusLabel[item.status] || item.status}</Tag>
                            <span>{new Date(item.changedAt).toLocaleString('vi-VN')}</span>
                            <p>{item.note}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default OrderDetailPage;
