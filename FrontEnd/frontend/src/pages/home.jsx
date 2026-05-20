import {
    ArrowRightOutlined,
    EyeOutlined,
    FireOutlined,
    LeftOutlined,
    RightOutlined,
    StarOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Row, Skeleton, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    brands,
    fallbackProducts,
    formatPrice,
    getProductKey,
    getSoldText,
} from '../data/products';
import { articles } from '../data/articles';
import axios from '../util/axios.customize';

const { Title } = Typography;
const TOP_PAGE_SIZE = 4;

const ProductCard = ({ p, metric }) => (
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
                                <span>{metric === 'views' ? `${p.views || 0} lượt xem` : getSoldText(p.sold)}</span>
                                {p.isNew ? <Tag color="blue">Mới</Tag> : null}
                            </div>
                        </div>
                    }
                />
            </div>
        </Card>
    </Link>
);

const BrandCard = ({ brand, products }) => (
    <Link className="brand-card" to={`/search?brand=${encodeURIComponent(brand)}`}>
        <div className="brand-card__media">
            {products.slice(0, 3).map((product) => (
                <img key={getProductKey(product)} src={product.thumbnail || product.images?.[0]} alt={product.name} />
            ))}
        </div>
        <div>
            <strong>{brand}</strong>
            <span>{products.length} sản phẩm</span>
        </div>
        <ArrowRightOutlined />
    </Link>
);

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

const TopProductPager = ({ title, icon, endpoint, fallbackItems, metric }) => {
    const [items, setItems] = useState(fallbackItems.slice(0, TOP_PAGE_SIZE));
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(Math.min(fallbackItems.length, 10));
    const [loading, setLoading] = useState(false);
    const [prefetchedPages, setPrefetchedPages] = useState({});
    const totalPages = Math.max(Math.ceil(total / TOP_PAGE_SIZE), 1);

    useEffect(() => {
        const loadPage = async () => {
            setLoading(true);
            try {
                const cached = prefetchedPages[page];
                if (cached) {
                    setItems(cached.items || []);
                    setTotal(cached.total ?? 0);
                    setLoading(false);
                    return;
                }

                const result = await axios.get(`${endpoint}?page=${page}&limit=${TOP_PAGE_SIZE}`);
                setItems(result?.items || []);
                setTotal(result?.total ?? 0);
                setPrefetchedPages((current) => ({ ...current, [page]: result }));

                const nextPage = page + 1;
                if (nextPage <= Math.max(Math.ceil((result?.total || 0) / TOP_PAGE_SIZE), 1) && !prefetchedPages[nextPage]) {
                    axios.get(`${endpoint}?page=${nextPage}&limit=${TOP_PAGE_SIZE}`)
                        .then((nextResult) => {
                            setPrefetchedPages((current) => ({ ...current, [nextPage]: nextResult }));
                        })
                        .catch(() => {});
                }
            } catch (error) {
                console.error(error);
                const start = (page - 1) * TOP_PAGE_SIZE;
                setItems(fallbackItems.slice(start, start + TOP_PAGE_SIZE));
                setTotal(Math.min(fallbackItems.length, 10));
            } finally {
                setLoading(false);
            }
        };

        loadPage();
    }, [endpoint, fallbackItems, page, prefetchedPages]);

    return (
        <section className="top-products-section">
            <div className="section-heading top-products-heading">
                <Title level={3}>{icon}{title}</Title>
                <div className="horizontal-pager">
                    <Button
                        aria-label="Trang trước"
                        icon={<LeftOutlined />}
                        disabled={page === 1 || loading}
                        onClick={() => setPage((current) => Math.max(current - 1, 1))}
                    />
                    <div className="horizontal-pager__meta" aria-live="polite">
                        <strong>{page}</strong>
                        <span>/ {totalPages}</span>
                    </div>
                    <Button
                        aria-label="Trang sau"
                        icon={<RightOutlined />}
                        disabled={page >= totalPages || loading}
                        onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                    />
                </div>
            </div>
            <div className={`top-products-track${loading ? ' is-loading' : ''}`}>
                {loading && items.length === 0 ? Array.from({ length: TOP_PAGE_SIZE }).map((_, index) => (
                    <div key={`skeleton-${index}`} className="top-product-skeleton"><Skeleton active paragraph={{ rows: 4 }} /></div>
                )) : items.map((product) => (
                    <ProductCard key={getProductKey(product)} p={product} metric={metric} />
                ))}
            </div>
        </section>
    );
};

const ArticlePreview = ({ article }) => (
    <Link className="news-card" to={`/tin-tuc/${article.slug}`}>
        <img src={article.cover} alt={article.title} />
        <div>
            <span>{article.category}</span>
            <h3>{article.title}</h3>
            <p>{article.summary}</p>
        </div>
    </Link>
);

const HomePage = () => {
    const [products, setProducts] = useState(fallbackProducts);
    const [bestSellers, setBestSellers] = useState([...fallbackProducts].sort((a, b) => b.sold - a.sold).slice(0, 10));
    const [mostViewed, setMostViewed] = useState([...fallbackProducts].sort((a, b) => (b.views || b.sold) - (a.views || a.sold)).slice(0, 10));

    useEffect(() => {
        const loadHomeData = async () => {
            try {
                const [productResult, bestsellerResult, mostViewedResult] = await Promise.all([
                    axios.get('/v1/api/products?limit=100'),
                    axios.get('/v1/api/products/top/bestsellers?limit=10'),
                    axios.get('/v1/api/products/top/most-viewed?limit=10'),
                ]);

                if (productResult?.items?.length) setProducts(productResult.items);
                if (bestsellerResult?.items?.length) setBestSellers(bestsellerResult.items);
                if (mostViewedResult?.items?.length) setMostViewed(mostViewedResult.items);
            } catch (error) {
                console.error(error);
                setProducts(fallbackProducts);
            }
        };

        loadHomeData();
    }, []);

    const getBrandProducts = (brand) =>
        products.filter((product) => product.brand?.toLowerCase() === brand.toLowerCase());
    const saleProducts = products.filter((p) => p.isOnSale).slice(0, 8);
    const newestProducts = products.filter((p) => p.isNew).slice(0, 8);

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
                    <BrandCard key={brand} brand={brand} products={getBrandProducts(brand)} />
                ))}
            </section>

            <TopProductPager
                title="Top 10 sản phẩm bán chạy nhất"
                icon={<TrophyOutlined />}
                endpoint="/v1/api/products/top/bestsellers"
                fallbackItems={bestSellers}
                metric="sold"
            />
            <TopProductPager
                title="Top 10 sản phẩm xem nhiều nhất"
                icon={<EyeOutlined />}
                endpoint="/v1/api/products/top/most-viewed"
                fallbackItems={mostViewed}
                metric="views"
            />

            <ProductSection title="Khuyến mãi nổi bật" icon={<FireOutlined />} products={saleProducts} />
            <ProductSection title="Mẫu mới nhất" icon={<StarOutlined />} products={newestProducts} />

            {brands.map((brand) => (
                <ProductSection
                    key={brand}
                    brand={brand}
                    title={`Tất cả sản phẩm ${brand}`}
                    products={getBrandProducts(brand)}
                />
            ))}

            <section className="news-section">
                <div className="section-heading">
                    <Title level={3}>Tin và bài viết</Title>
                    <Link to="/tin-tuc">Xem tất cả <ArrowRightOutlined /></Link>
                </div>
                <div className="news-grid">
                    {articles.slice(0, 3).map((article) => (
                        <ArticlePreview key={article.slug} article={article} />
                    ))}
                </div>
            </section>
        </main>
    );
};

export default HomePage;
