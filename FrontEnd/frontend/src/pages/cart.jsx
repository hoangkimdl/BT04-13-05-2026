import { Button, Empty, List, Spin, message } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fallbackProducts, formatPrice, getProductKey } from '../data/products';
import axios from '../util/axios.customize';

const getLocalCart = () => {
    const localCart = JSON.parse(localStorage.getItem('local_cart') || '[]');
    return localCart
        .map((item) => {
            const product = fallbackProducts.find((fallbackProduct) => getProductKey(fallbackProduct) === item.productId);
            return product ? { product, qty: item.qty, size: item.size } : null;
        })
        .filter(Boolean);
};

const CartPage = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCart = async () => {
            try {
                const result = await axios.get('/v1/api/cart');
                const apiItems = result?.cart?.items || [];
                setCart({ items: apiItems.length ? apiItems : getLocalCart() });
            } catch (error) {
                console.error(error);
                setCart({ items: getLocalCart() });
            } finally {
                setLoading(false);
            }
        };
        loadCart();
    }, []);

    const checkout = async () => {
        const result = await axios.post('/v1/api/cart/checkout');
        if (result?.EC === 0) {
            message.success('Thanh toán thành công');
            setCart(result.cart || null);
        } else {
            localStorage.removeItem('local_cart');
            setCart({ items: [] });
            message.success('Đã hoàn tất đơn hàng mẫu');
        }
    };

    if (loading) {
        return (
            <main className="shop-page empty-state">
                <Spin />
            </main>
        );
    }

    const items = cart?.items || [];
    const total = items.reduce((sum, item) => sum + ((item.product?.price || 0) * item.qty), 0);

    return (
        <main className="shop-page cart-page">
            <h2>Giỏ hàng</h2>
            {items.length ? (
                <>
                    <List
                        itemLayout="horizontal"
                        dataSource={items}
                        renderItem={(item) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<img className="cart-thumb" src={item.product?.images?.[0] || '/logo.jpg'} alt={item.product?.name} />}
                                    title={item.product?.name || 'Sản phẩm'}
                                    description={`Số lượng: ${item.qty}${item.size ? ` - Size ${item.size}` : ''}`}
                                />
                                <b>{formatPrice((item.product?.price || 0) * item.qty)}</b>
                            </List.Item>
                        )}
                    />
                    <div className="cart-summary">
                        <strong>Tổng cộng: {formatPrice(total)}</strong>
                        <Button type="primary" onClick={checkout}>Thanh toán</Button>
                    </div>
                </>
            ) : (
                <Empty description="Giỏ hàng đang trống">
                    <Link to="/search">
                        <Button type="primary">Xem sản phẩm</Button>
                    </Link>
                </Empty>
            )}
        </main>
    );
};

export default CartPage;
