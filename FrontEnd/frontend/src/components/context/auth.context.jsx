/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useState } from 'react';

const emptyAuth = {
    isAuthenticated: false,
    user: { email: '', name: '', phone: '', address: '', role: '' }
};

const readStoredUser = () => ({
    email: localStorage.getItem('user_email') || '',
    name: localStorage.getItem('user_name') || '',
    phone: localStorage.getItem('user_phone') || '',
    address: localStorage.getItem('user_address') || '',
    role: localStorage.getItem('user_role') || ''
});

export const persistUserSession = (user, accessToken) => {
    if (accessToken) {
        localStorage.setItem('access_token', accessToken);
    }
    localStorage.setItem('user_name', user?.name ?? '');
    localStorage.setItem('user_email', user?.email ?? '');
    localStorage.setItem('user_phone', user?.phone ?? '');
    localStorage.setItem('user_address', user?.address ?? '');
    localStorage.setItem('user_role', user?.role ?? '');
};

export const AuthContext = createContext({
    auth: emptyAuth,
    setAuth: () => { },
    logout: () => { },
    appLoading: true,
    setAppLoading: () => { }
});

export const AuthWrapper = (props) => {
    const [auth, setAuth] = useState(() => {
        const token = localStorage.getItem('access_token');
        const user = readStoredUser();

        return {
            isAuthenticated: Boolean(token),
            user
        };
    });
    const [appLoading, setAppLoading] = useState(false);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_phone');
        localStorage.removeItem('user_address');
        localStorage.removeItem('user_role');
        setAuth(emptyAuth);
    }, []);

    return (
        <AuthContext.Provider value={{ auth, setAuth, logout, appLoading, setAppLoading }}>
            {props.children}
        </AuthContext.Provider>
    );
};
