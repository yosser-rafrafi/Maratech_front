import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

const AccessibilityWidget = () => {
    const { zoomLevel, increaseZoom, decreaseZoom, resetZoom, voiceEnabled, toggleVoice } = useAccessibility();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
            {/* Control Menu */}
            {isOpen && (
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-2xl flex flex-col gap-2 pointer-events-auto transform transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="px-3 py-1 mb-1 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zoom Level</span>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{zoomLevel}%</span>
                    </div>

                    <div className="flex items-center gap-2 px-1 py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="material-symbols-outlined text-slate-500" style={{ fontSize: '18px' }}>record_voice_over</span>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex-1">Voice (تونسي)</span>
                        <button
                            onClick={toggleVoice}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${voiceEnabled ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}
                        >
                            {voiceEnabled ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={decreaseZoom}
                            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition-all active:scale-90 flex items-center justify-center shadow-sm"
                            title="Decrease Text Size"
                        >
                            <span className="material-symbols-outlined text-lg">zoom_out</span>
                        </button>

                        <button
                            onClick={resetZoom}
                            className="flex-1 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-sm"
                        >
                            Reset
                        </button>

                        <button
                            onClick={increaseZoom}
                            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition-all active:scale-90 flex items-center justify-center shadow-sm"
                            title="Increase Text Size"
                        >
                            <span className="material-symbols-outlined text-lg">zoom_in</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Main Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl hover:shadow-indigo-500/40 active:scale-90 group ${isOpen
                        ? 'bg-slate-800 text-white dark:bg-slate-700'
                        : 'bg-indigo-600 text-white shadow-indigo-500/20'
                    }`}
            >
                <span className={`material-symbols-outlined text-2xl transition-transform duration-500 ${isOpen ? 'rotate-180' : 'group-hover:scale-110'}`}>
                    {isOpen ? 'close' : 'accessibility_new'}
                </span>
            </button>
        </div>
    );
};

export default AccessibilityWidget;
