import axios from './axios.customize';

const createUserApi = (name, email, password) => {
    const URL_API = "/v1/api/register";
    const data = {
        name, email, password
    }

    return axios.post(URL_API, data)
}

const loginApi = (email, password) => {
    const URL_API = "/v1/api/login";
    const data = {
        email, password
    }

    return axios.post(URL_API, data)
}

const getUserApi = () => {
    const URL_API = "/v1/api/user";
    return axios.get(URL_API)
}

const forgotPasswordApi = (email) => {
    const URL_API = "/v1/api/forgot-password";
    return axios.post(URL_API, { email });
}

const verifyResetCodeApi = (email, code) => {
    const URL_API = "/v1/api/verify-reset-code";
    return axios.post(URL_API, { email, code });
}

const resetPasswordApi = (email, code, newPassword) => {
    const URL_API = "/v1/api/reset-password";
    return axios.post(URL_API, { email, code, newPassword });
}

const getAccountApi = () => {
    const URL_API = "/v1/api/account";
    return axios.get(URL_API);
}

const updateAccountApi = (data) => {
    const URL_API = "/v1/api/account";
    return axios.put(URL_API, data);
}

const changePasswordApi = (currentPassword, newPassword) => {
    const URL_API = "/v1/api/account/password";
    return axios.put(URL_API, { currentPassword, newPassword });
}

export {
    createUserApi,
    loginApi,
    getUserApi,
    forgotPasswordApi,
    verifyResetCodeApi,
    resetPasswordApi,
    getAccountApi,
    updateAccountApi,
    changePasswordApi
}
