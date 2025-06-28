"use client"

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// Define the shape of the user object
interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'user' | 'admin';
}

// Define the shape of the context's value
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    logout: () => Promise<void>;
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A helper instance of Axios
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

// Create the provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkUserSession = async () => {
            console.log('Checking user session...');
            console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
            
            try {
                const response = await api.get('/auth/me');
                console.log('Auth check response:', response.data);
                if (response.data) {
                    setUser(response.data);
                }
            } catch (error) {
                console.error('Auth check error:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkUserSession();
    }, []);
    
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error("Logout API call failed, proceeding with client-side cleanup.", error);
        } finally {
            Cookies.remove('token');
            setUser(null);
            window.location.href = '/'; 
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Create a custom hook to easily use the context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
