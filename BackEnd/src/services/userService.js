require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendPasswordResetCode } = require("./emailService");

const saltRounds = 10;
const RESET_CODE_TTL_MS = 10 * 60 * 1000;

const createUserService = async (name, email, password) => {
    try {
        const user = await User.findOne({ email });
        if (user) {
            console.log(`>>> user exist, choose another email: ${email}`);
            return null;
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const result = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "User"
        });

        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
};

const loginService = async (email, password) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return {
                EC: 1,
                EM: "Email hoặc mật khẩu không hợp lệ!"
            };
        }

        const isMatchPassword = await bcrypt.compare(password, user.password);
        if (!isMatchPassword) {
            return {
                EC: 2,
                EM: "Email hoặc mật khẩu không hợp lệ!"
            };
        }

        const payload = {
            email: user.email,
            name: user.name
        };
        const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        });

        return {
            EC: 0,
            access_token,
            user: {
                email: user.email,
                name: user.name
            }
        };
    } catch (error) {
        console.log(error);
        return null;
    }
};

const getUserService = async () => {
    try {
        const result = await User.find({}).select("-password -resetCode -resetCodeExpireAt");
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
};

const forgotPasswordService = async (email) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return {
                EC: 1,
                EM: "Email không tồn tại"
            };
        }

        const code = String(Math.floor(100000 + Math.random() * 900000));

        try {
            await sendPasswordResetCode(email, code);
        } catch (mailError) {
            console.error("Gửi email thất bại:", mailError.message);
            return {
                EC: 2,
                EM: mailError.message || "Không thể gửi email. Vui lòng kiểm tra cấu hình Gmail trong BackEnd/.env"
            };
        }

        user.resetCode = code;
        user.resetCodeExpireAt = new Date(Date.now() + RESET_CODE_TTL_MS);
        await user.save();

        return {
            EC: 0,
            EM: "Mã xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (cả mục Thư rác)."
        };
    } catch (error) {
        console.log(error);
        return {
            EC: -1,
            EM: "Có lỗi máy chủ"
        };
    }
};

const verifyResetCodeService = async (email, code) => {
    try {
        const user = await User.findOne({ email });
        if (!user || !user.resetCode || !user.resetCodeExpireAt) {
            return { EC: 1, EM: "Yêu cầu đặt lại mật khẩu không hợp lệ." };
        }

        if (user.resetCode !== String(code)) {
            return { EC: 2, EM: "Mã xác thực không đúng." };
        }

        if (new Date(user.resetCodeExpireAt).getTime() < Date.now()) {
            return { EC: 3, EM: "Mã xác thực đã hết hạn." };
        }

        return { EC: 0, EM: "Xác thực thành công." };
    } catch (error) {
        console.log(error);
        return { EC: -1, EM: "Có lỗi máy chủ" };
    }
};

const resetPasswordService = async (email, code, newPassword) => {
    try {
        const verify = await verifyResetCodeService(email, code);
        if (!verify || verify.EC !== 0) return verify;

        const user = await User.findOne({ email });
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedPassword;
        user.resetCode = null;
        user.resetCodeExpireAt = null;
        await user.save();

        return {
            EC: 0,
            EM: "Đặt lại mật khẩu thành công."
        };
    } catch (error) {
        console.log(error);
        return { EC: -1, EM: "Có lỗi máy chủ" };
    }
};

module.exports = {
    createUserService,
    loginService,
    getUserService,
    forgotPasswordService,
    verifyResetCodeService,
    resetPasswordService
};