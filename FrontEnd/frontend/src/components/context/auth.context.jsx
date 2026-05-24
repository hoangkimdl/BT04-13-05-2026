/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useState } from 'react';

const emptyAuth = {
    isAuthenticated: false,
    user: { email: '', name: '' }
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
        const userName = localStorage.getItem('user_name');
        const userEmail = localStorage.getItem('user_email');

        return {
            isAuthenticated: Boolean(token),
            user: { email: userEmail || '', name: userName || '' }
        };
    });
    const [appLoading, setAppLoading] = useState(false);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        setAuth(emptyAuth);
    }, []);

    return (
        <AuthContext.Provider value={{ auth, setAuth, logout, appLoading, setAppLoading }}>
            {props.children}
        </AuthContext.Provider>
    );
};
