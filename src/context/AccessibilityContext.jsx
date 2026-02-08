import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
};

export const AccessibilityProvider = ({ children }) => {
    const [zoomLevel, setZoomLevel] = useState(() => {
        const saved = localStorage.getItem('zoomLevel');
        return saved ? parseInt(saved) : 100;
    });

    const [voiceEnabled, setVoiceEnabled] = useState(() => {
        try {
            const v = localStorage.getItem('astba_voice_enabled');
            return v !== 'false'; // default ON
        } catch (_) {
            return true;
        }
    });

    useEffect(() => {
        localStorage.setItem('zoomLevel', zoomLevel.toString());
        document.documentElement.style.fontSize = `${zoomLevel}%`;
    }, [zoomLevel]);

    useEffect(() => {
        localStorage.setItem('astba_voice_enabled', voiceEnabled ? 'true' : 'false');
    }, [voiceEnabled]);

    const increaseZoom = () => {
        setZoomLevel(prev => Math.min(prev + 10, 200));
    };

    const decreaseZoom = () => {
        setZoomLevel(prev => Math.max(prev - 10, 80));
    };

    const resetZoom = () => {
        setZoomLevel(100);
    };

    const toggleVoice = () => {
        setVoiceEnabled(prev => !prev);
    };

    return (
        <AccessibilityContext.Provider value={{ zoomLevel, increaseZoom, decreaseZoom, resetZoom, voiceEnabled, toggleVoice }}>
            {children}
        </AccessibilityContext.Provider>
    );
};
