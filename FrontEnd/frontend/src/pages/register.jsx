import { useState } from 'react';
import { Button, Form, Input, notification } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined, UserAddOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell';
import { createUserApi } from '../util/api';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const onFinish = async (values) => {
        const { name, email, password } = values;
        setSubmitting(true);

        try {
            const res = await createUserApi(name, email, password);

            if (res) {
                notification.success({
                    message: 'Đăng ký',
                    description: 'Tạo tài khoản thành công.'
                });
                navigate('/login');
            } else {
                notification.error({
                    message: 'Đăng ký',
                    description: 'Email đã tồn tại hoặc không thể tạo tài khoản.'
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthShell
            logoSrc="/logo1.jpg"
            logoAlt="Speedstride Sports register"
            title="Đăng ký tài khoản"
            subtitle="Tạo tài khoản để lưu giỏ hàng và theo dõi đơn mua."
            backTo="/"
            backLabel="Quay lại trang chủ"
            footer={<>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></>}
        >
            <Form
                className="auth-form"
                name="register"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
            >
                <Form.Item
                    label="Họ tên"
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                >
                    <Input prefix={<UserOutlined />} placeholder="Tên của bạn" size="large" />
                </Form.Item>

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
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu!' },
                        { min: 6, message: 'Mật khẩu cần ít nhất 6 ký tự!' }
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Tạo mật khẩu" size="large" />
                </Form.Item>

                <Button
                    className="auth-submit"
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    icon={<UserAddOutlined />}
                    size="large"
                    block
                >
                    Đăng ký
                </Button>
            </Form>
        </AuthShell>
    );
};

export default RegisterPage;
