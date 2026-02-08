import { createContext, useContext, useState, useEffect } from 'react';

const ColorBlindnessContext = createContext(null);

export const useColorBlindness = () => {
    const context = useContext(ColorBlindnessContext);
    if (!context) {
        throw new Error('useColorBlindness must be used within ColorBlindnessProvider');
    }
    return context;
};

// Color blindness filter configurations
export const COLOR_BLINDNESS_TYPES = {
    normal: {
        name: 'Normal Vision',
        filter: 'none',
        icon: '👁️'
    },
    protanopia: {
        name: 'Protanopia',
        description: 'Red-Blind',
        filter: 'url(#protanopia)',
        icon: '🔴'
    },
    deuteranopia: {
        name: 'Deuteranopia',
        description: 'Green-Blind',
        filter: 'url(#deuteranopia)',
        icon: '🟢'
    },
    tritanopia: {
        name: 'Tritanopia',
        description: 'Blue-Blind',
        filter: 'url(#tritanopia)',
        icon: '🔵'
    },
    achromatopsia: {
        name: 'Achromatopsia',
        description: 'Total Color Blindness',
        filter: 'grayscale(100%)',
        icon: '⚫'
    }
};

export const ColorBlindnessProvider = ({ children }) => {
    const [colorBlindnessMode, setColorBlindnessMode] = useState('normal');

    useEffect(() => {
        // Load saved preference from localStorage
        const savedMode = localStorage.getItem('colorBlindnessMode');
        if (savedMode && COLOR_BLINDNESS_TYPES[savedMode]) {
            setColorBlindnessMode(savedMode);
        }
    }, []);

    useEffect(() => {
        // Apply filter to root element
        const root = document.documentElement;
        const filter = COLOR_BLINDNESS_TYPES[colorBlindnessMode]?.filter || 'none';

        if (filter === 'none') {
            root.style.filter = 'none';
        } else {
            root.style.filter = filter;
        }

        // Save to localStorage
        localStorage.setItem('colorBlindnessMode', colorBlindnessMode);
    }, [colorBlindnessMode]);

    const value = {
        colorBlindnessMode,
        setColorBlindnessMode,
        currentType: COLOR_BLINDNESS_TYPES[colorBlindnessMode]
    };

    return (
        <ColorBlindnessContext.Provider value={value}>
            {children}
        </ColorBlindnessContext.Provider>
    );
};
