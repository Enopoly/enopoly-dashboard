import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (username: string, password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return localStorage.getItem('isAuthenticated') === 'true';
    });

    const login = (username: string, password: string): boolean => {
        // Multi-user credentials
        // Multi-user credentials
        const USERS = {
            'sales@enopolydistribution.com': 'Manifest101$',
            'admin': 'Kinglife101$$$'
        };

        const normalizedUsername = username.toLowerCase();

        if (USERS[normalizedUsername as keyof typeof USERS] === password) {
            setIsAuthenticated(true);
            localStorage.setItem('isAuthenticated', 'true');
            // Ideally we store the username too for personalization, but sticking to existing pattern for now
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
