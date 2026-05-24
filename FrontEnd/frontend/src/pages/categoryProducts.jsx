import { ArrowLeftOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Row, Spin, Tag, Typography } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    fallbackProducts,
    formatPrice,
    getProductKey,
    getSoldText,
} from '../data/products';
import axios from '../util/axios.customize';

const { Title } = Typography;
const PAGE_SIZE = 8;

const ProductCard = ({ product }) => (
    <Link className="product-card-link" to={`/product/${getProductKey(product)}`}>
        <Card hoverable className="product-card search-card" bodyStyle={{ padding: 14 }}>
            <div className="product-card__image">
                <img alt={product.name} src={product.thumbnail || product.images?.[0] || '/logo.jpg'} />
                {product.discountPercent ? <span className="product-card__badge">-{product.discountPercent}%</span> : null}
            </div>
            <div className="product-card__body">
                <div className="product-card__brand">{product.brand}</div>
                <Card.Meta
                    title={product.name}
                    description={
                        <div className="product-card__footer">
                            <div className="product-price-stack">
                                <b>{formatPrice(product.price)}</b>
                                <del>{formatPrice(product.originalPrice || product.price)}</del>
                            </div>
                            <div className="product-card__bottom">
                                <span>{getSoldText(product.sold)}</span>
                                {product.views ? <Tag color="purple">{product.views} lượt xem</Tag> : null}
                            </div>
                        </div>
                    }
                />
            </div>
        </Card>
    </Link>
);

const CategoryProductsPage = () => {
    const { category } = useParams();
    const decodedCategory = useMemo(() => decodeURIComponent(category || ''), [category]);
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const sentinelRef = useRef(null);

    useEffect(() => {
        queueMicrotask(() => {
            setItems([]);
            setPage(1);
            setTotal(0);
            setHasMore(true);
        });
    }, [decodedCategory]);

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    category: decodedCategory,
                    page: String(page),
                    limit: String(PAGE_SIZE),
                });
                const result = await axios.get(`/v1/api/products?${params.toString()}`);
                setItems((current) => page === 1 ? (result?.items || []) : [...current, ...(result?.items || [])]);
                setTotal(result?.total || 0);
                setHasMore(Boolean(result?.hasMore));
            } catch (error) {
                console.error(error);
                const localItems = fallbackProducts.filter((product) => product.category === decodedCategory);
                const end = page * PAGE_SIZE;
                setItems(localItems.slice(0, end));
                setTotal(localItems.length);
                setHasMore(end < localItems.length);
            } finally {
                setLoading(false);
            }
        };

        if (decodedCategory) loadProducts();
    }, [decodedCategory, page]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return undefined;

        const observer = new IntersectionObserver((entries) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !loading) {
                setPage((current) => current + 1);
            }
        }, { rootMargin: '260px' });

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loading]);

    return (
        <main className="shop-page category-page">
            <Link className="article-back" to="/"><ArrowLeftOutlined /> Trang chủ</Link>
            <section className="category-hero">
                <span>Danh mục sản phẩm</span>
                <Title level={1}>{decodedCategory}</Title>
                <p>Kéo xuống cuối trang để tải tiếp sản phẩm trong danh mục.</p>
                <b>{items.length}/{total} sản phẩm đã hiển thị</b>
            </section>

            {items.length ? (
                <Row gutter={[16, 16]}>
                    {items.map((product) => (
                        <Col key={getProductKey(product)} xs={24} sm={12} md={8} lg={6}>
                            <ProductCard product={product} />
                        </Col>
                    ))}
                </Row>
            ) : !loading ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Danh mục này chưa có sản phẩm" />
            ) : null}

            <div ref={sentinelRef} className="lazy-load-sentinel">
                {loading ? <Spin /> : hasMore ? <span>Cuộn để tải thêm</span> : <span>Đã hiển thị tất cả sản phẩm</span>}
            </div>
        </main>
    );
};

export default CategoryProductsPage;
