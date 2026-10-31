/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as loginRequest, register as registerRequest } from '../api/auth.api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'apextrade_token';
const USER_KEY = 'apextrade_user';

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    });
    const [loading] = useState(false);

    useEffect(() => {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(USER_KEY);
        }
    }, [user]);

    const login = async (email, password) => {
        try {
            const response = await loginRequest({ email, password });
            const authToken = response?.token || response?.data?.token || null;
            const authUser = response?.user || response?.data?.user || null;

            if (authToken) {
                setToken(authToken);
                setUser(authUser || { email });
                return true;
            }

            return false;
        } catch {
            return false;
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await registerRequest({ name, email, password });
            const authToken = response?.token || response?.data?.token || null;
            const authUser = response?.user || response?.data?.user || null;

            if (authToken) {
                setToken(authToken);
                setUser(authUser || { name, email });
                return true;
            }

            return false;
        } catch {
            return false;
        }
    };

    const logout = () => {
        setToken('');
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    };

    const value = useMemo(
        () => ({ token, user, loading, login, register, logout }),
        [token, user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
