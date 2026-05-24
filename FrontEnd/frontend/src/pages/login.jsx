import { useContext, useState } from 'react';
import { Button, Form, Input, notification } from 'antd';
import { LockOutlined, LoginOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import AuthShell from '../components/auth/AuthShell';
import { loginApi } from '../util/api';

const LoginPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useContext(AuthContext);
    const [submitting, setSubmitting] = useState(false);

    const onFinish = async (values) => {
        const { email, password } = values;
        setSubmitting(true);

        try {
            const res = await loginApi(email, password);

            if (res && res.EC === 0) {
                localStorage.setItem('access_token', res.access_token);
                localStorage.setItem('user_name', res?.user?.name ?? '');
                localStorage.setItem('user_email', res?.user?.email ?? '');

                setAuth({
                    isAuthenticated: true,
                    user: {
                        email: res?.user?.email ?? '',
                        name: res?.user?.name ?? ''
                    }
                });

                notification.success({
                    message: 'Đăng nhập',
                    description: 'Đăng nhập thành công.'
                });
                navigate('/');
            } else {
                notification.error({
                    message: 'Đăng nhập',
                    description: res?.EM ?? 'Email hoặc mật khẩu không hợp lệ.'
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthShell
            logoSrc="/logo2.jpg"
            logoAlt="Speedstride Sports login"
            title="Đăng nhập"
            subtitle="Truy cập tài khoản để tiếp tục mua sắm."
            backTo="/"
            backLabel="Quay lại trang chủ"
            footer={<>Chưa có tài khoản? <Link to="/register">Đăng ký tại đây</Link></>}
        >
            <Form
                className="auth-form"
                name="login"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
            >
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                >
                    <Input prefix={<MailOutlined />} placeholder="email@example.com" size="large" />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" size="large" />
                </Form.Item>

                <div className="auth-form__meta">
                    <span />
                    <Link to="/forgot-password">Quên mật khẩu?</Link>
                </div>

                <Button
                    className="auth-submit"
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    icon={<LoginOutlined />}
                    size="large"
                    block
                >
                    Đăng nhập
                </Button>
            </Form>
        </AuthShell>
    );
};

export default LoginPage;
