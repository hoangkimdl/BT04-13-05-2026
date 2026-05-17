import {
    CheckCircleOutlined,
    EnvironmentOutlined,
    FireOutlined,
    MinusOutlined,
    PlusOutlined,
    SafetyCertificateOutlined,
    ShoppingCartOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { Button, Col, InputNumber, Row, Spin, Tag, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    fallbackProducts,
    findLocalProduct,
    formatPrice,
    getProductKey,
    getProductsByBrand,
    getRelatedProducts,
    getSoldText,
} from '../data/products';
import axios from '../util/axios.customize';

const getBrandFromProduct = (product) => {
    if (product.brand) return product.brand;
    return fallbackProducts.find((item) => item.name.toLowerCase().includes(product.category?.toLowerCase()))?.brand
        || product.category
        || 'Đang cập nhật';
};

const getFirstAvailableSize = (product) =>
    product?.sizes?.find((size) => !product.unavailableSizes?.includes(size)) || product?.sizes?.[0] || null;

const RelatedProductCard = ({ product }) => (
    <Link className="related-card" to={`/product/${getProductKey(product)}`}>
        <div className="related-card__image">
            <img src={product.thumbnail || product.images?.[0] || '/logo.jpg'} alt={product.name} />
            {product.discountPercent ? <span>-{product.discountPercent}%</span> : null}
        </div>
        <div className="related-card__body">
            <small>{product.brand}</small>
            <h3>{product.name}</h3>
            <div className="related-card__price">
                <strong>{formatPrice(product.price)}</strong>
                <del>{formatPrice(product.originalPrice || product.price)}</del>
            </div>
            <p>{getSoldText(product.sold)}</p>
        </div>
    </Link>
);

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
                setProduct(apiProduct || null);
                setSelectedSize(getFirstAvailableSize(apiProduct));
            } catch (error) {
                console.error(error);
                setProduct(null);
                setSelectedSize(null);
            } finally {
                setLoading(false);
                setActiveImage(0);
                setQty(1);
            }
        };
        load();
    }, [id]);

    const images = useMemo(() => product?.images?.length ? product.images : ['/logo.jpg'], [product]);
    const relatedProducts = useMemo(() => getRelatedProducts(product, 8), [product]);

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
            message.success('Đã thêm sản phẩm vào giỏ hàng');
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
    const isLocalProduct = fallbackProducts.some((item) => getProductKey(item) === getProductKey(product));
    const productChoices = isLocalProduct ? getProductsByBrand(brand) : [];
    const mainImage = isLocalProduct ? (product.thumbnail || images[0]) : images[activeImage];
    const discountPercent = product.discountPercent || product.discount || 0;
    const originalPrice = product.originalPrice || product.price;

    return (
        <main className="product-detail-page detail-redesign">
            <section className="product-detail-shell">
                <div className="product-gallery">
                    <div className="product-gallery__main">
                        {discountPercent ? <span className="detail-sale-ribbon">-{discountPercent}%</span> : null}
                        <img src={mainImage} alt={product.name} />
                    </div>
                    <div className="product-gallery__thumbs product-gallery__product-thumbs">
                        {isLocalProduct
                            ? productChoices.map((choice) => {
                                const choiceKey = getProductKey(choice);
                                const active = choiceKey === getProductKey(product);
                                return (
                                    <button
                                        key={choiceKey}
                                        className={active ? 'active' : ''}
                                        type="button"
                                        aria-label={choice.name}
                                        onClick={() => navigate(`/product/${choiceKey}`)}
                                    >
                                        <img src={choice.thumbnail || choice.images?.[0]} alt={choice.name} />
                                        <span>{formatPrice(choice.price)}</span>
                                    </button>
                                );
                            })
                            : images.map((image, index) => (
                                <button
                                    key={image}
                                    className={index === activeImage ? 'active' : ''}
                                    type="button"
                                    aria-label={`Ảnh ${index + 1}`}
                                    onClick={() => setActiveImage(index)}
                                >
                                    <img src={image} alt={`${product.name} ${index + 1}`} />
                                </button>
                            ))}
                    </div>
                </div>

                <div className="product-buybox">
                    <div className="product-kicker">
                        <Tag color="blue">{brand}</Tag>
                        {discountPercent ? <Tag color="red">Sale {discountPercent}%</Tag> : null}
                        <Tag color="gold">{getSoldText(product.sold)}</Tag>
                    </div>

                    <h1>{product.name}</h1>

                    <div className="product-benefits">
                        <span><CheckCircleOutlined /> Còn hàng</span>
                        <span><SafetyCertificateOutlined /> Chính hãng</span>
                        <span><ThunderboltOutlined /> Giao nhanh</span>
                    </div>

                    <div className="price-panel">
                        <div>
                            <span className="price-label">Giá sale</span>
                            <strong>{formatPrice(product.price)}</strong>
                        </div>
                        <div className="price-side">
                            <span>Giá gốc</span>
                            <del>{formatPrice(originalPrice)}</del>
                            {discountPercent ? <b>Giảm {discountPercent}%</b> : null}
                        </div>
                    </div>

                    <div className="info-grid">
                        <div>
                            <span>Tình trạng</span>
                            <b>{product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</b>
                        </div>
                        <div>
                            <span>Đã bán</span>
                            <b>{product.sold}</b>
                        </div>
                        <div>
                            <span>Danh mục</span>
                            <b>{product.category || 'Giày cầu lông'}</b>
                        </div>
                    </div>

                    {product.sizes?.length ? (
                        <div className="option-block">
                            <div className="option-title">Chọn size</div>
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
                            <Button className="buy-now-btn" type="primary" size="large" icon={<FireOutlined />} onClick={() => addToCart(true)}>
                                Mua ngay
                            </Button>
                            <Button className="add-cart-btn" size="large" icon={<ShoppingCartOutlined />} onClick={() => addToCart(false)}>
                                Thêm vào giỏ hàng
                            </Button>
                        </div>
                    </div>

                    <div id="stores" className="store-box">
                        <EnvironmentOutlined />
                        <div>
                            <span>Danh sách cửa hàng có sẵn sản phẩm</span>
                            <b>Phú Nhuận</b>
                            <p>+84363315527 - 184B Lê Văn Sỹ P10 Q.Phú Nhuận</p>
                        </div>
                    </div>

                    <div className="description-box">
                        <Tag color="blue">Bảo hành</Tag>
                        <Tag color="green">Đổi trả linh hoạt</Tag>
                        <p>{product.description}</p>
                    </div>
                </div>
            </section>

            <section className="related-section">
                <div className="section-heading">
                    <h2>Sản phẩm tương tự</h2>
                    <Link to={`/search?brand=${encodeURIComponent(brand)}`}>Xem thêm {brand}</Link>
                </div>
                <Row gutter={[16, 16]}>
                    {relatedProducts.map((item) => (
                        <Col key={getProductKey(item)} xs={24} sm={12} md={8} lg={6}>
                            <RelatedProductCard product={item} />
                        </Col>
                    ))}
                </Row>
            </section>
        </main>
    );
};

export default ProductDetail;
