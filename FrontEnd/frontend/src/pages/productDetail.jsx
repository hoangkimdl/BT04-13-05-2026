import { EnvironmentOutlined, MinusOutlined, PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Divider, InputNumber, Spin, Tag, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fallbackProducts, findLocalProduct, formatPrice, getProductKey } from '../data/products';
import axios from '../util/axios.customize';

const getBrandFromProduct = (product) => {
    if (product.brand) return product.brand;
    return fallbackProducts.find((item) => item.name.toLowerCase().includes(product.category?.toLowerCase()))?.brand
        || product.category
        || 'Đang cập nhật';
};

const getFirstAvailableSize = (product) =>
    product?.sizes?.find((size) => !product.unavailableSizes?.includes(size)) || product?.sizes?.[0] || null;

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [qty, setQty] = useState(1);
    const [selectedSize, setSelectedSize] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const localProduct = findLocalProduct(id);
            if (localProduct) {
                setProduct(localProduct);
                setSelectedSize(getFirstAvailableSize(localProduct));
                setLoading(false);
                setActiveImage(0);
                setQty(1);
                return;
            }

            try {
                const apiProduct = await axios.get(`/v1/api/products/${id}`);
                const nextProduct = apiProduct?._id
                    ? { ...localProduct, ...apiProduct, images: apiProduct.images?.length ? apiProduct.images : localProduct?.images }
                    : localProduct;
                setProduct(nextProduct || null);
                setSelectedSize(getFirstAvailableSize(nextProduct));
            } catch (error) {
                console.error(error);
                const localProduct = findLocalProduct(id) || null;
                setProduct(localProduct);
                setSelectedSize(getFirstAvailableSize(localProduct));
            } finally {
                setLoading(false);
                setActiveImage(0);
                setQty(1);
            }
        };
        load();
    }, [id]);

    const images = useMemo(() => product?.images?.length ? product.images : ['/logo.jpg'], [product]);

    const addToCart = async (goToCart = false) => {
        if (!product) return;

        if (!selectedSize && product.sizes?.length) {
            message.warning('Vui lòng chọn size');
            return;
        }

        const productId = getProductKey(product);
        const isLocalProduct = fallbackProducts.some((item) => getProductKey(item) === productId);

        if (isLocalProduct && !String(productId).match(/^[0-9a-fA-F]{24}$/)) {
            const currentCart = JSON.parse(localStorage.getItem('local_cart') || '[]');
            const existingItem = currentCart.find((item) => item.productId === productId && item.size === selectedSize);
            const nextCart = existingItem
                ? currentCart.map((item) => item === existingItem ? { ...item, qty: item.qty + qty } : item)
                : [...currentCart, { productId, qty, size: selectedSize }];
            localStorage.setItem('local_cart', JSON.stringify(nextCart));
            message.success('Đã thêm sản phẩm mẫu vào giỏ hàng');
            if (goToCart) navigate('/cart');
            return;
        }

        const result = await axios.post('/v1/api/cart/items', { productId, qty });
        if (result?.EC === 0) {
            message.success('Đã thêm vào giỏ hàng');
            if (goToCart) navigate('/cart');
            return;
        }

        message.error(result?.EM || 'Chưa thể thêm vào giỏ hàng');
    };

    if (loading) {
        return (
            <div className="product-detail-page product-detail-page--loading">
                <Spin />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="shop-page empty-state">
                <h2>Không tìm thấy sản phẩm</h2>
                <Button type="primary" onClick={() => navigate('/')}>Về trang chủ</Button>
            </div>
        );
    }

    const unavailableSizes = product.unavailableSizes || [];
    const brand = getBrandFromProduct(product);

    return (
        <main className="product-detail-page">
            <section className="product-detail-layout">
                <div className="product-gallery">
                    <div className="product-gallery__main">
                        <img src={images[activeImage]} alt={product.name} />
                    </div>
                    <div className="product-gallery__dots">
                        {images.map((image, index) => (
                            <button
                                key={image}
                                className={index === activeImage ? 'active' : ''}
                                type="button"
                                aria-label={`Ảnh ${index + 1}`}
                                onClick={() => setActiveImage(index)}
                            />
                        ))}
                    </div>
                    <div className="product-gallery__thumbs">
                        {images.map((image, index) => (
                            <button
                                key={image}
                                className={index === activeImage ? 'active' : ''}
                                type="button"
                                onClick={() => setActiveImage(index)}
                            >
                                <img src={image} alt={`${product.name} ${index + 1}`} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="product-buybox">
                    <h1>{product.name}</h1>
                    <Divider />
                    <div className="status-row">
                        <span>Tình trạng:</span>
                        <strong>{product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</strong>
                    </div>
                    <ul className="product-facts">
                        <li><span>Thương hiệu:</span><b>{brand}</b></li>
                        <li><span>Danh mục:</span><b>{product.category || 'Giày cầu lông'}</b></li>
                    </ul>

                    <div className="price-row">
                        <span>Giá bán:</span>
                        <strong>{formatPrice(product.price)}</strong>
                    </div>

                    {product.sizes?.length ? (
                        <div className="size-row">
                            {product.sizes.map((size) => {
                                const disabled = unavailableSizes.includes(size);
                                return (
                                    <button
                                        key={size}
                                        type="button"
                                        disabled={disabled}
                                        className={selectedSize === size ? 'selected' : ''}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                    ) : null}

                    <div className="buy-actions">
                        <div className="quantity-control">
                            <InputNumber min={1} max={product.stock || 99} value={qty} onChange={(value) => setQty(value || 1)} />
                            <div className="quantity-buttons">
                                <Button icon={<PlusOutlined />} onClick={() => setQty((value) => Math.min(value + 1, product.stock || 99))} />
                                <Button icon={<MinusOutlined />} onClick={() => setQty((value) => Math.max(value - 1, 1))} />
                            </div>
                        </div>
                        <div className="action-stack">
                            <Button className="buy-now-btn" type="primary" size="large" onClick={() => addToCart(true)}>
                                Mua ngay
                            </Button>
                            <Button className="add-cart-btn" size="large" icon={<ShoppingCartOutlined />} onClick={() => addToCart(false)}>
                                Thêm vào giỏ hàng
                            </Button>
                        </div>
                    </div>

                    <Divider dashed />
                    <a className="store-title" href="#stores">Danh sách cửa hàng có sản phẩm:</a>
                    <div id="stores" className="store-box">
                        <EnvironmentOutlined />
                        <div>
                            <b>Phú Nhuận</b>
                            <p>+84363315527 - 184B Lê Văn Sỹ P10 Q.Phú Nhuận</p>
                        </div>
                    </div>

                    <div className="description-box">
                        <Tag color="blue">Chính hãng</Tag>
                        <Tag color="green">Bảo hành</Tag>
                        <p>{product.description}</p>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default ProductDetail;
