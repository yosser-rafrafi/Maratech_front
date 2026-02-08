import { useState, useRef, useEffect } from 'react';
import { useColorBlindness, COLOR_BLINDNESS_TYPES } from '../context/ColorBlindnessContext';

const ColorBlindnessSelector = ({ direction = 'down' }) => {
    const { colorBlindnessMode, setColorBlindnessMode } = useColorBlindness();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleModeChange = (mode) => {
        setColorBlindnessMode(mode);
        setIsOpen(false);
    };

    const dropdownClasses = direction === 'up'
        ? "absolute left-0 bottom-full mb-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in origin-bottom-left"
        : "absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in origin-top-right";

    return (
        <>
            {/* SVG Filters for Color Blindness Simulation */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    {/* Protanopia (Red-Blind) Filter */}
                    <filter id="protanopia">
                        <feColorMatrix
                            type="matrix"
                            values="0.567, 0.433, 0,     0, 0
                                    0.558, 0.442, 0,     0, 0
                                    0,     0.242, 0.758, 0, 0
                                    0,     0,     0,     1, 0"
                        />
                    </filter>

                    {/* Deuteranopia (Green-Blind) Filter */}
                    <filter id="deuteranopia">
                        <feColorMatrix
                            type="matrix"
                            values="0.625, 0.375, 0,   0, 0
                                    0.7,   0.3,   0,   0, 0
                                    0,     0.3,   0.7, 0, 0
                                    0,     0,     0,   1, 0"
                        />
                    </filter>

                    {/* Tritanopia (Blue-Blind) Filter */}
                    <filter id="tritanopia">
                        <feColorMatrix
                            type="matrix"
                            values="0.95, 0.05,  0,     0, 0
                                    0,    0.433, 0.567, 0, 0
                                    0,    0.475, 0.525, 0, 0
                                    0,    0,     0,     1, 0"
                        />
                    </filter>
                </defs>
            </svg>

            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex w-full justify-between items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Color Blindness Accessibility"
                    aria-label="Toggle color blindness mode selector"
                >
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-600">
                            {colorBlindnessMode === 'normal' ? 'visibility' : 'accessibility'}
                        </span>
                        <span className="text-sm font-medium text-slate-700 hidden sm:inline">
                            {COLOR_BLINDNESS_TYPES[colorBlindnessMode].name}
                        </span>
                    </span>
                    <span className="material-symbols-outlined text-slate-400 text-sm">
                        {isOpen ? (direction === 'up' ? 'expand_more' : 'expand_less') : (direction === 'up' ? 'expand_less' : 'expand_more')}
                    </span>
                </button>

                {isOpen && (
                    <div className={dropdownClasses}>
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-blue-600">accessibility</span>
                                <h3 className="font-bold text-slate-800">Color Blindness Mode</h3>
                            </div>
                            <p className="text-xs text-slate-600">Select a vision mode to adjust colors</p>
                        </div>

                        <div className="p-2">
                            {Object.entries(COLOR_BLINDNESS_TYPES).map(([key, type]) => (
                                <button
                                    key={key}
                                    onClick={() => handleModeChange(key)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${colorBlindnessMode === key
                                        ? 'bg-blue-50 border-2 border-blue-500'
                                        : 'hover:bg-slate-50 border-2 border-transparent'
                                        }`}
                                >
                                    <span className="text-2xl">{type.icon}</span>
                                    <div className="flex-1 text-left">
                                        <div className="font-semibold text-slate-800 text-sm">
                                            {type.name}
                                        </div>
                                        {type.description && (
                                            <div className="text-xs text-slate-500">
                                                {type.description}
                                            </div>
                                        )}
                                    </div>
                                    {colorBlindnessMode === key && (
                                        <span className="material-symbols-outlined text-blue-600">
                                            check_circle
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="p-3 bg-slate-50 border-t border-slate-200">
                            <p className="text-xs text-slate-500 text-center">
                                💡 Your preference is saved automatically
                            </p>
                        </div>
                    </div>
                )}
            </div>


        </>
    );
};

export default ColorBlindnessSelector;
