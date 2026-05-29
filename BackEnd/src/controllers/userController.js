const {
    createUserService,
    loginService,
    getUserService,
    forgotPasswordService,
    verifyResetCodeService,
    resetPasswordService,
    getAccountService,
    updateAccountService,
    changePasswordService
} = require("../services/userService");

const createUser = async (req, res) => {
    const { name, email, password } = req.body;
    const data = await createUserService(name, email, password);
    return res.status(200).json(data);
};

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    const data = await loginService(email, password);
    return res.status(200).json(data);
};

const getUser = async (req, res) => {
    const data = await getUserService();
    return res.status(200).json(data);
};

const getAccount = async (req, res) => {
    const data = await getAccountService(req.user.email);
    return res.status(200).json(data);
};

const updateAccount = async (req, res) => {
    const { name, phone, address } = req.body;
    const data = await updateAccountService(req.user.email, { name, phone, address });
    return res.status(200).json(data);
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const data = await changePasswordService(req.user.email, currentPassword, newPassword);
    return res.status(200).json(data);
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const data = await forgotPasswordService(email);
    return res.status(200).json(data);
};

const verifyResetCode = async (req, res) => {
    const { email, code } = req.body;
    const data = await verifyResetCodeService(email, code);
    return res.status(200).json(data);
};

const resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    const data = await resetPasswordService(email, code, newPassword);
    return res.status(200).json(data);
};

module.exports = {
    createUser,
    handleLogin,
    getUser,
    getAccount,
    updateAccount,
    changePassword,
    forgotPassword,
    verifyResetCode,
    resetPassword
};
