"use client"

import { useContext } from 'react';
// --- Updated to use the correct AuthContext ---
import { AuthContext } from '../lib/auth-context';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};