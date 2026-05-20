import { Card, Col, Empty, Input, Row, Select, Spin, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    brands,
    fallbackProducts,
    formatPrice,
    getProductKey,
    getSoldText,
    searchLocalProducts,
} from '../data/products';
import axios from '../util/axios.customize';

const { Title } = Typography;

const ProductResultCard = ({ product }) => (
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
                            </div>
                        </div>
                    }
                />
            </div>
        </Card>
    </Link>
);

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems] = useState(fallbackProducts);
    const [loading, setLoading] = useState(false);

    const filters = useMemo(() => ({
        name: searchParams.get('name') || searchParams.get('q') || '',
        brand: searchParams.get('brand') || '',
        sort: searchParams.get('sort') || '',
    }), [searchParams]);

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ limit: '100' });
                if (filters.name) params.set('name', filters.name);
                if (filters.brand) params.set('brand', filters.brand);
                if (filters.sort) params.set('sort', filters.sort);

                const result = await axios.get(`/v1/api/products?${params.toString()}`);
                setItems(result?.items?.length ? result.items : []);
            } catch (error) {
                console.error(error);
                setItems(searchLocalProducts(filters));
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [filters]);

    const updateFilter = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value);
        else next.delete(key);
        setSearchParams(next);
    };

    return (
        <main className="shop-page search-page">
            <div className="search-hero">
                <img src="/logo.jpg" alt="Speedstride Sports" />
                <div>
                    <span>{items.length} sản phẩm</span>
                    <Title level={2}>Tìm kiếm sản phẩm</Title>
                    <p>Lọc nhanh toàn bộ ảnh Kawasaki, Yonex, Lining và Victor từ dữ liệu MongoDB.</p>
                </div>
            </div>

            <div className="search-tools">
                <Input.Search
                    allowClear
                    enterButton
                    placeholder="Nhập tên hoặc thương hiệu..."
                    value={filters.name}
                    onChange={(event) => updateFilter('name', event.target.value)}
                    onSearch={(value) => updateFilter('name', value)}
                />
                <Select
                    allowClear
                    placeholder="Thương hiệu"
                    value={filters.brand || undefined}
                    onChange={(value) => updateFilter('brand', value)}
                    options={brands.map((brand) => ({ label: brand, value: brand }))}
                />
                <Select
                    allowClear
                    placeholder="Sắp xếp"
                    value={filters.sort || undefined}
                    onChange={(value) => updateFilter('sort', value)}
                    options={[
                        { label: 'Giá tăng dần', value: 'price_asc' },
                        { label: 'Giá giảm dần', value: 'price_desc' },
                        { label: 'Bán chạy', value: 'bestseller' },
                    ]}
                />
            </div>

            {loading ? (
                <div className="empty-state">
                    <Spin />
                </div>
            ) : items.length ? (
                <Row gutter={[16, 16]}>
                    {items.map((product) => (
                        <Col key={getProductKey(product)} xs={24} sm={12} md={8} lg={6}>
                            <ProductResultCard product={product} />
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không tìm thấy sản phẩm phù hợp" />
            )}
        </main>
    );
};

export default SearchPage;
