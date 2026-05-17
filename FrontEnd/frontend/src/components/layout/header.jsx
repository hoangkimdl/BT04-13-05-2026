import { HomeOutlined, SearchOutlined, SettingOutlined, ShoppingCartOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Col, Menu, Row } from 'antd';
import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';

const Header = () => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);
    const [current, setCurrent] = useState('home');

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
            label: <Link to="/cart">Giỏ hàng</Link>,
            key: 'cart',
            icon: <ShoppingCartOutlined />,
        },
        ...(auth.isAuthenticated ? [{
            label: <Link to="/user">Users</Link>,
            key: 'user',
            icon: <UsergroupAddOutlined />,
        }] : []),
        {
            label: auth.isAuthenticated ? `Xin chào ${auth?.user?.name ?? auth?.user?.email ?? ''}` : 'Tài khoản',
            key: 'account',
            icon: <SettingOutlined />,
            children: auth.isAuthenticated ? [
                {
                    label: (
                        <span onClick={() => {
                            localStorage.removeItem('access_token');
                            localStorage.removeItem('user_name');
                            localStorage.removeItem('user_email');
                            setCurrent('home');
                            setAuth({
                                isAuthenticated: false,
                                user: {
                                    email: '',
                                    name: '',
                                },
                            });
                            navigate('/');
                        }}
                        >
                            Đăng xuất
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
