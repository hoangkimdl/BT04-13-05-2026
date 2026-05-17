import { ArrowRightOutlined, FireOutlined, StarOutlined } from '@ant-design/icons';
import { Card, Col, Row, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import {
    brands,
    fallbackProducts,
    formatPrice,
    getProductKey,
    getProductsByBrand,
    getSoldText,
} from '../data/products';

const { Title } = Typography;

const ProductCard = ({ p }) => (
    <Link className="product-card-link" to={`/product/${getProductKey(p)}`}>
        <Card hoverable className="product-card" bodyStyle={{ padding: 14 }}>
            <div className="product-card__image">
                <img alt={p.name} src={p.thumbnail || p.images?.[0] || '/logo.jpg'} />
                {p.discountPercent ? <span className="product-card__badge">-{p.discountPercent}%</span> : null}
            </div>
            <div className="product-card__body">
                <div className="product-card__brand">{p.brand}</div>
                <Card.Meta
                    title={p.name}
                    description={
                        <div className="product-card__footer">
                            <div className="product-price-stack">
                                <b>{formatPrice(p.price)}</b>
                                <del>{formatPrice(p.originalPrice || p.price)}</del>
                            </div>
                            <div className="product-card__bottom">
                                <span>{getSoldText(p.sold)}</span>
                                {p.isNew ? <Tag color="blue">Mới</Tag> : null}
                            </div>
                        </div>
                    }
                />
            </div>
        </Card>
    </Link>
);

const BrandCard = ({ brand }) => {
    const products = getProductsByBrand(brand);
    return (
        <Link className="brand-card" to={`/search?brand=${encodeURIComponent(brand)}`}>
            <div className="brand-card__media">
                {products.slice(0, 3).map((product) => (
                    <img key={getProductKey(product)} src={product.thumbnail} alt={product.name} />
                ))}
            </div>
            <div>
                <strong>{brand}</strong>
                <span>{products.length} sản phẩm</span>
            </div>
            <ArrowRightOutlined />
        </Link>
    );
};

const ProductSection = ({ title, icon, products, brand }) => (
    <section className="product-section" id={brand ? `brand-${brand.toLowerCase()}` : undefined}>
        <div className="section-heading">
            <Title level={3}>{icon}{title}</Title>
            {brand ? <Link to={`/search?brand=${encodeURIComponent(brand)}`}>Xem tất cả <ArrowRightOutlined /></Link> : null}
        </div>
        <Row gutter={[16, 16]}>
            {products.map((p) => (
                <Col key={getProductKey(p)} xs={24} sm={12} md={8} lg={6}>
                    <ProductCard p={p} />
                </Col>
            ))}
        </Row>
    </section>
);

const HomePage = () => {
    const saleProducts = fallbackProducts.filter((p) => p.isOnSale).slice(0, 8);
    const newestProducts = fallbackProducts.filter((p) => p.isNew).slice(0, 8);

    return (
        <main className="shop-page home-page">
            <section className="home-hero">
                <div className="home-hero__logo">
                    <img src="/logo.jpg" alt="Speedstride Sports" />
                </div>
                <div className="home-hero__content">
                    <span>Speedstride Sports</span>
                    <h1>Giày cầu lông chính hãng cho từng pha bứt tốc</h1>
                    <p>Khám phá đầy đủ ảnh sản phẩm Kawasaki, Yonex, Lining và Victor đang có sẵn.</p>
                </div>
            </section>

            <section className="brand-grid">
                {brands.map((brand) => (
                    <BrandCard key={brand} brand={brand} />
                ))}
            </section>

            <ProductSection title="Khuyến mãi nổi bật" icon={<FireOutlined />} products={saleProducts} />
            <ProductSection title="Mẫu mới nhất" icon={<StarOutlined />} products={newestProducts} />

            {brands.map((brand) => (
                <ProductSection
                    key={brand}
                    brand={brand}
                    title={`Tất cả sản phẩm ${brand}`}
                    products={getProductsByBrand(brand)}
                />
            ))}
        </main>
    );
};

export default HomePage;
