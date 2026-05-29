import {
    FileTextOutlined,
    HomeOutlined,
    LogoutOutlined,
    SearchOutlined,
    SettingOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
} from '@ant-design/icons';
import { Col, Menu, Row } from 'antd';
import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';

const Header = () => {
    const navigate = useNavigate();
    const { auth, logout } = useContext(AuthContext);
    const [current, setCurrent] = useState('home');

    const handleLogout = () => {
        logout();
        setCurrent('home');
        navigate('/', { replace: true });
    };

    const items = [
        {
            label: <Link to="/">Trang chủ</Link>,
            key: 'home',
            icon: <HomeOutlined />,
        },
        {
            label: <Link to="/search">Sản phẩm</Link>,
            key: 'search',
            icon: <SearchOutlined />,
        },
        {
            label: <Link to="/tin-tuc">Tin tức</Link>,
            key: 'articles',
            icon: <FileTextOutlined />,
        },
        {
            label: <Link to="/cart">Giỏ hàng</Link>,
            key: 'cart',
            icon: <ShoppingCartOutlined />,
        },
        ...(auth.isAuthenticated ? [{
            label: <Link to="/orders">Đơn hàng</Link>,
            key: 'orders',
            icon: <ShoppingOutlined />,
        }] : []),
        {
            label: auth.isAuthenticated ? `Xin chào ${auth?.user?.name ?? auth?.user?.email ?? ''}` : 'Tài khoản',
            key: 'account',
            icon: <SettingOutlined />,
            children: auth.isAuthenticated ? [
                {
                    label: <Link to="/profile">Hồ sơ cá nhân</Link>,
                    key: 'profile',
                },
                {
                    label: (
                        <span className="logout-menu-item" onClick={handleLogout}>
                            <LogoutOutlined /> Đăng xuất
                        </span>
                    ),
                    key: 'logout',
                },
            ] : [
                {
                    label: <Link to="/login">Đăng nhập</Link>,
                    key: 'login',
                },
            ],
        },
    ];

    return (
        <header className="site-header">
            <Row align="middle" gutter={[16, 12]} className="site-header__inner">
                <Col flex="260px">
                    <Link className="site-logo" to="/">
                        <img src="/logo.jpg" alt="Speedstride Sports" />
                        <span>Speedstride</span>
                    </Link>
                </Col>
                <Col flex="auto" className="site-menu-wrap">
                    <Menu onClick={(event) => setCurrent(event.key)} selectedKeys={[current]} mode="horizontal" items={items} />
                </Col>
            </Row>
        </header>
    );
};

export default Header;
