import { DeleteOutlined, MinusOutlined, PlusOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Button, Empty, Form, Input, InputNumber, List, Radio, Spin, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../data/products';
import axios from '../util/axios.customize';

const getProductId = (item) => item.product?._id || item.product?.id || item.product;

const CartPage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);
    const isAuthenticated = Boolean(localStorage.getItem('access_token'));

    const loadCart = async () => {
        setLoading(true);
        try {
            const result = await axios.get('/v1/api/cart');
            setCart(result?.cart || { items: [] });
        } catch (error) {
            console.error(error);
            setCart({ items: [] });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        queueMicrotask(() => {
            if (isAuthenticated) loadCart();
            else setLoading(false);
        });
    }, [isAuthenticated]);

    const items = useMemo(() => cart?.items || [], [cart]);
    const total = useMemo(
        () => items.reduce((sum, item) => sum + ((item.product?.price || 0) * item.qty), 0),
        [items]
    );

    const updateQty = async (item, qty) => {
        const productId = getProductId(item);
        const result = await axios.put(`/v1/api/cart/items/${productId}`, { qty, size: item.size || null });
        if (result?.EC === 0) {
            setCart(result.cart);
            return;
        }
        message.error(result?.EM || 'Không thể cập nhật giỏ hàng');
    };

    const removeItem = async (item) => {
        const productId = getProductId(item);
        const params = item.size ? `?size=${item.size}` : '';
        const result = await axios.delete(`/v1/api/cart/items/${productId}${params}`);
        if (result?.EC === 0) {
            setCart(result.cart);
            return;
        }
        message.error(result?.EM || 'Không thể xóa sản phẩm');
    };

    const checkout = async (values) => {
        setCheckingOut(true);
        try {
            const result = await axios.post('/v1/api/cart/checkout', {
                ...values,
                paymentMethod: 'COD'
            });
            if (result?.EC === 0) {
                message.success('Đặt hàng COD thành công');
                navigate(`/orders/${result.order._id}`);
            } else {
                message.error(result?.EM || 'Không thể đặt hàng');
            }
        } finally {
            setCheckingOut(false);
        }
    };

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
                <Empty description="Bạn cần đăng nhập để sử dụng giỏ hàng">
                    <Link to="/login">
                        <Button type="primary">Đăng nhập</Button>
                    </Link>
                </Empty>
            </main>
        );
    }

    return (
        <main className="shop-page cart-page">
            <section className="cart-layout">
                <div className="cart-items-panel">
                    <div className="section-heading">
                        <h2>Giỏ hàng</h2>
                        <Link to="/orders">Lịch sử đơn hàng</Link>
                    </div>

                    {items.length ? (
                        <List
                            itemLayout="horizontal"
                            dataSource={items}
                            renderItem={(item) => (
                                <List.Item
                                    actions={[
                                        <div className="cart-qty" key="qty">
                                            <Button icon={<MinusOutlined />} onClick={() => updateQty(item, item.qty - 1)} />
                                            <InputNumber min={1} max={item.product?.stock || 99} value={item.qty} onChange={(value) => updateQty(item, value || 1)} />
                                            <Button icon={<PlusOutlined />} onClick={() => updateQty(item, item.qty + 1)} />
                                        </div>,
                                        <Button key="delete" danger icon={<DeleteOutlined />} onClick={() => removeItem(item)} />
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<img className="cart-thumb" src={item.product?.thumbnail || item.product?.images?.[0] || '/logo.jpg'} alt={item.product?.name} />}
                                        title={<Link to={`/product/${getProductId(item)}`}>{item.product?.name || 'Sản phẩm'}</Link>}
                                        description={`Size: ${item.size || 'Không chọn'} - Đơn giá: ${formatPrice(item.product?.price || 0)}`}
                                    />
                                    <b>{formatPrice((item.product?.price || 0) * item.qty)}</b>
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Empty description="Giỏ hàng đang trống">
                            <Link to="/search">
                                <Button type="primary">Xem sản phẩm</Button>
                            </Link>
                        </Empty>
                    )}
                </div>

                <aside className="checkout-panel">
                    <h2>Thanh toán</h2>
                    <div className="checkout-total">
                        <span>Tổng cộng</span>
                        <strong>{formatPrice(total)}</strong>
                    </div>

                    <Form form={form} layout="vertical" onFinish={checkout} disabled={!items.length || checkingOut}>
                        <Form.Item label="Phương thức thanh toán" name="paymentMethod" initialValue="COD">
                            <Radio.Group>
                                <Radio.Button value="COD"><ShoppingOutlined /> COD</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item label="Họ tên người nhận" name="customerName" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                            <Input placeholder="Nguyễn Văn A" />
                        </Form.Item>
                        <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                            <Input placeholder="090..." />
                        </Form.Item>
                        <Form.Item label="Địa chỉ giao hàng" name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
                            <Input.TextArea rows={3} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" />
                        </Form.Item>
                        <Form.Item label="Ghi chú" name="note">
                            <Input.TextArea rows={2} placeholder="Thời gian nhận hàng, lưu ý cho shop..." />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={checkingOut} block size="large">
                            Đặt hàng COD
                        </Button>
                    </Form>
                </aside>
            </section>
        </main>
    );
};

export default CartPage;
