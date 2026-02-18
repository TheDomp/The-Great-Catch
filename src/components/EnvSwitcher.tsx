import React, { useState, useEffect } from 'react';
import { toggleEnvironment } from '../firebase';

export const EnvSwitcher: React.FC = () => {
    const [isTest, setIsTest] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show switcher in development
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
            setIsVisible(true);
        }
        setIsTest(localStorage.getItem('app_env') === 'test');
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 bg-[#1a1a1a]/90 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-2xl">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isTest ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>
                {isTest ? 'TEST MILJÖ' : 'PRODUKTION'}
            </span>
            <button
                onClick={toggleEnvironment}
                className="bg-white/10 hover:bg-white/20 text-white text-[10px] px-3 py-1 rounded-full transition-all border border-white/5"
            >
                Växla
            </button>
        </div>
    );
};
