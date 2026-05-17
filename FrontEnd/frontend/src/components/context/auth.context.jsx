/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from 'react';

export const AuthContext = createContext({
    auth: { isAuthenticated: false, user: { email: '', name: '' } },
    setAuth: () => { },
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

    return (
        <AuthContext.Provider value={{ auth, setAuth, appLoading, setAppLoading }}>
            {props.children}
        </AuthContext.Provider>
    );
};
