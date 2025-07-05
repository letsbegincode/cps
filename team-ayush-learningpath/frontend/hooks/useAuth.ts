"use client"

import { useContext } from 'react';
// --- Updated to use the correct AuthContext ---
import { AuthContext } from '../app/context/AuthContext';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};