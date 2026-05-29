import {
    HomeOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    SaveOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Button, Card, Col, Empty, Form, Input, Row, Spin, Typography, message } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext, persistUserSession } from '../components/context/auth.context';
import { changePasswordApi, getAccountApi, updateAccountApi } from '../util/api';

const { Title, Text } = Typography;

const ProfilePage = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const isAuthenticated = auth.isAuthenticated;

    useEffect(() => {
        const loadProfile = async () => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            try {
                const res = await getAccountApi();
                if (res?.EC === 0 && res.user) {
                    profileForm.setFieldsValue({
                        name: res.user.name,
                        phone: res.user.phone,
                        address: res.user.address,
                        email: res.user.email
                    });
                    persistUserSession(res.user);
                    setAuth({
                        isAuthenticated: true,
                        user: {
                            email: res.user.email,
                            name: res.user.name,
                            phone: res.user.phone,
                            address: res.user.address,
                            role: res.user.role
                        }
                    });
                } else {
                    message.error(res?.EM || 'Không thể tải hồ sơ.');
                }
            } catch (error) {
                console.error(error);
                message.error('Không thể tải hồ sơ.');
            } finally {
                setLoading(false);
            }
        };

        queueMicrotask(loadProfile);
    }, [isAuthenticated, profileForm, setAuth]);

    const onSaveProfile = async (values) => {
        setSavingProfile(true);
        try {
            const res = await updateAccountApi({
                name: values.name,
                phone: values.phone,
                address: values.address
            });

            if (res?.EC === 0) {
                persistUserSession(res.user, res.access_token);
                setAuth({
                    isAuthenticated: true,
                    user: {
                        email: res.user.email,
                        name: res.user.name,
                        phone: res.user.phone,
                        address: res.user.address,
                        role: res.user.role
                    }
                });
                message.success(res.EM || 'Cập nhật hồ sơ thành công.');
            } else {
                message.error(res?.EM || 'Không thể cập nhật hồ sơ.');
            }
        } finally {
            setSavingProfile(false);
        }
    };

    const onChangePassword = async (values) => {
        setChangingPassword(true);
        try {
            const res = await changePasswordApi(values.currentPassword, values.newPassword);

            if (res?.EC === 0) {
                message.success(res.EM || 'Đổi mật khẩu thành công.');
                passwordForm.resetFields();
            } else {
                message.error(res?.EM || 'Không thể đổi mật khẩu.');
            }
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <main className="shop-page empty-state">
                <Spin />
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <main className="shop-page empty-state">
                <Empty description="Bạn cần đăng nhập để chỉnh sửa hồ sơ">
                    <Link to="/login">
                        <Button type="primary">Đăng nhập</Button>
                    </Link>
                </Empty>
            </main>
        );
    }

    return (
        <main className="shop-page profile-page">
            <div className="section-heading">
                <div>
                    <Title level={2} style={{ margin: 0 }}>Hồ sơ cá nhân</Title>
                    <Text type="secondary">Cập nhật thông tin và mật khẩu tài khoản</Text>
                </div>
                <Link to="/">
                    <HomeOutlined /> Trang chủ
                </Link>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={14}>
                    <Card title="Thông tin tài khoản" className="profile-card">
                        <Form
                            form={profileForm}
                            layout="vertical"
                            onFinish={onSaveProfile}
                            requiredMark="optional"
                        >
                            <Form.Item
                                label="Họ và tên"
                                name="name"
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên.' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" size="large" />
                            </Form.Item>

                            <Form.Item label="Email" name="email">
                                <Input prefix={<MailOutlined />} disabled size="large" />
                            </Form.Item>

                            <Form.Item
                                label="Số điện thoại"
                                name="phone"
                                rules={[
                                    {
                                        validator: (_, value) => {
                                            const trimmed = String(value || '').trim();
                                            if (!trimmed) return Promise.resolve();
                                            if (/^[0-9+\-\s()]{8,20}$/.test(trimmed)) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Số điện thoại không hợp lệ.'));
                                        }
                                    }
                                ]}
                            >
                                <Input prefix={<PhoneOutlined />} placeholder="09xxxxxxxx" size="large" />
                            </Form.Item>

                            <Form.Item label="Địa chỉ giao hàng mặc định" name="address">
                                <Input.TextArea rows={3} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" />
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={savingProfile}
                                size="large"
                            >
                                Lưu thay đổi
                            </Button>
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} lg={10}>
                    <Card title="Đổi mật khẩu" className="profile-card">
                        <Form
                            form={passwordForm}
                            layout="vertical"
                            onFinish={onChangePassword}
                        >
                            <Form.Item
                                label="Mật khẩu hiện tại"
                                name="currentPassword"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại.' }]}
                            >
                                <Input.Password prefix={<LockOutlined />} size="large" />
                            </Form.Item>

                            <Form.Item
                                label="Mật khẩu mới"
                                name="newPassword"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu mới.' },
                                    { min: 6, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' }
                                ]}
                            >
                                <Input.Password prefix={<LockOutlined />} size="large" />
                            </Form.Item>

                            <Form.Item
                                label="Xác nhận mật khẩu mới"
                                name="confirmPassword"
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới.' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp.'));
                                        }
                                    })
                                ]}
                            >
                                <Input.Password prefix={<LockOutlined />} size="large" />
                            </Form.Item>

                            <Button
                                type="default"
                                htmlType="submit"
                                loading={changingPassword}
                                size="large"
                                block
                            >
                                Cập nhật mật khẩu
                            </Button>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </main>
    );
};

export default ProfilePage;
