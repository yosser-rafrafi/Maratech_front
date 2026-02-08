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

    useEffect(() => {
        localStorage.setItem('zoomLevel', zoomLevel.toString());
        // Apply zoom to document root
        document.documentElement.style.fontSize = `${zoomLevel}%`;
    }, [zoomLevel]);

    const increaseZoom = () => {
        setZoomLevel(prev => Math.min(prev + 10, 200));
    };

    const decreaseZoom = () => {
        setZoomLevel(prev => Math.max(prev - 10, 80));
    };

    const resetZoom = () => {
        setZoomLevel(100);
    };

    return (
        <AccessibilityContext.Provider value={{ zoomLevel, increaseZoom, decreaseZoom, resetZoom }}>
            {children}
        </AccessibilityContext.Provider>
    );
};
