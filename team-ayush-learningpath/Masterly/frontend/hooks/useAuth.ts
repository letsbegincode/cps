"use client"

import { useContext } from 'react';
// --- This path is now corrected to be relative ---
import { AuthContext } from '../app/context/AuthContext';


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};