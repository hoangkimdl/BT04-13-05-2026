import { useState } from 'react';
import { Button, Form, Input, notification } from 'antd';
import { LockOutlined, MailOutlined, SafetyOutlined, SendOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell';
import { forgotPasswordApi, resetPasswordApi, verifyResetCodeApi } from '../util/api';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const sendCode = async (values) => {
        setSubmitting(true);
        try {
            const res = await forgotPasswordApi(values.email);
            if (res && res.EC === 0) {
                setEmail(values.email);
                setStep(2);
                notification.success({
                    message: 'Quên mật khẩu',
                    description: res?.EM ?? 'Đã gửi mã xác thực.'
                });
            } else {
                notification.error({
                    message: 'Quên mật khẩu',
                    description: res?.EM ?? 'Không thể gửi mã xác thực.'
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const verifyCode = async (values) => {
        setSubmitting(true);
        try {
            const res = await verifyResetCodeApi(email, values.code);
            if (res && res.EC === 0) {
                setCode(values.code);
                setStep(3);
                notification.success({
                    message: 'Xác thực',
                    description: 'Mã xác thực hợp lệ.'
                });
            } else {
                notification.error({
                    message: 'Xác thực',
                    description: res?.EM ?? 'Mã xác thực không hợp lệ.'
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const changePassword = async (values) => {
        setSubmitting(true);
        try {
            const res = await resetPasswordApi(email, code, values.newPassword);
            if (res && res.EC === 0) {
                notification.success({
                    message: 'Đặt lại mật khẩu',
                    description: res?.EM ?? 'Mật khẩu đã được cập nhật.'
                });
                navigate('/login');
            } else {
                notification.error({
                    message: 'Đặt lại mật khẩu',
                    description: res?.EM ?? 'Không thể đặt lại mật khẩu.'
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthShell
            logoSrc="/logo3.jpg"
            logoAlt="Speedstride Sports forgot password"
            title="Quên mật khẩu"
            subtitle="Bước 1: Nhập email, Bước 2: Nhập mã xác thực, Bước 3: Đặt mật khẩu mới."
            backTo="/login"
            backLabel="Quay lại đăng nhập"
            footer={<>Nhớ mật khẩu? <Link to="/login">Đăng nhập ngay</Link></>}
        >
            {step === 1 ? (
                <Form className="auth-form" name="forgot-password-email" onFinish={sendCode} autoComplete="off" layout="vertical">
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
                    <Button className="auth-submit" type="primary" htmlType="submit" loading={submitting} icon={<SendOutlined />} size="large" block>
                        Gửi mã xác thực
                    </Button>
                </Form>
            ) : null}

            {step === 2 ? (
                <Form className="auth-form" name="forgot-password-code" onFinish={verifyCode} autoComplete="off" layout="vertical">
                    <Form.Item label="Email">
                        <Input value={email} disabled size="large" />
                    </Form.Item>
                    <Form.Item
                        label="Mã xác thực"
                        name="code"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã xác thực!' },
                            { len: 6, message: 'Mã xác thực gồm 6 chữ số.' }
                        ]}
                    >
                        <Input prefix={<SafetyOutlined />} placeholder="Nhập mã 6 chữ số" size="large" maxLength={6} />
                    </Form.Item>
                    <Button className="auth-submit" type="primary" htmlType="submit" loading={submitting} icon={<SafetyOutlined />} size="large" block>
                        Xác thực mã
                    </Button>
                </Form>
            ) : null}

            {step === 3 ? (
                <Form className="auth-form" name="forgot-password-new" onFinish={changePassword} autoComplete="off" layout="vertical">
                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: 'Mật khẩu cần ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" size="large" />
                    </Form.Item>
                    <Form.Item
                        label="Nhập lại mật khẩu mới"
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                }
                            })
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu mới" size="large" />
                    </Form.Item>
                    <Button className="auth-submit" type="primary" htmlType="submit" loading={submitting} icon={<LockOutlined />} size="large" block>
                        Đặt lại mật khẩu
                    </Button>
                </Form>
            ) : null}
        </AuthShell>
    );
};

export default ForgotPasswordPage;
