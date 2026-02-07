import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Successful = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();
    const mascotHeadRef = useRef(null);
    const eyeLeftRef = useRef(null);
    const eyeRightRef = useRef(null);
    const digitalSmileRef = useRef(null);

    useEffect(() => {
        // Redirect to dashboard after 3 seconds
        const timer = setTimeout(() => {
            navigate('/');
        }, 3000);

        const handleMouseMove = (e) => {
            if (!mascotHeadRef.current) return;

            const x = e.clientX;
            const y = e.clientY;

            // Get relative center
            const rect = mascotHeadRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = (x - centerX) / 30;
            const deltaY = (y - centerY) / 30;

            const rotX = Math.min(Math.max(-deltaY, -15), 15);
            const rotY = Math.min(Math.max(deltaX, -25), 25);

            mascotHeadRef.current.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(40px)`;

            const eyeX = Math.min(Math.max(deltaX / 1.5, -10), 10);
            const eyeY = Math.min(Math.max(deltaY / 1.5, -5), 5);

            if (eyeLeftRef.current) eyeLeftRef.current.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
            if (eyeRightRef.current) eyeRightRef.current.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
            if (digitalSmileRef.current) digitalSmileRef.current.style.transform = `translate(${eyeX * 0.8}px, ${eyeY * 0.8}px)`;
        };

        const handleMouseLeave = () => {
            if (mascotHeadRef.current) {
                mascotHeadRef.current.style.transform = `rotateX(0deg) rotateY(0deg) translateZ(0px)`;
            }
            if (eyeLeftRef.current) eyeLeftRef.current.style.transform = `translate(0px, 0px)`;
            if (eyeRightRef.current) eyeRightRef.current.style.transform = `translate(0px, 0px)`;
            if (digitalSmileRef.current) digitalSmileRef.current.style.transform = `translate(0px, 0px)`;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [navigate]);

    return (
        <div className="bg-background-light h-screen flex items-center justify-center font-display overflow-hidden">
            <style>{`
                .tech-bg {
                    background-color: #020617;
                    background-image: radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.1) 1px, transparent 0);
                    background-size: 40px 40px;
                }
                .grid-intersection {
                    background-image: radial-gradient(circle at 50% 50%, #3b82f6 1px, transparent 1px);
                    background-size: 40px 40px;
                    opacity: 0.2;
                }
                .circuit-trace {
                    stroke: #1e40af;
                    stroke-width: 1;
                    fill: none;
                    opacity: 0.2;
                }
                .hologram-icon {
                    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.4));
                }
                .bemo-head-container {
                    perspective: 1000px;
                }
                .bemo-bot-head {
                    transform-style: preserve-3d;
                    transition: transform 0.1s ease-out;
                }
                .robot-head-textured {
                    background: linear-gradient(145deg, #ffffff 0%, #cbd5e1 100%);
                    box-shadow: 
                        inset -5px -5px 15px rgba(0,0,0,0.1),
                        inset 5px 5px 15px rgba(34, 197, 94, 0.2),
                        0 20px 50px rgba(0,0,0,0.5);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                }
                .robot-face-glow {
                    background: #0f172a;
                    box-shadow: inset 0 0 25px rgba(34, 197, 94, 0.3);
                    border: 2px solid rgba(34, 197, 94, 0.4);
                }
                .robot-eye-glow-happy {
                    background: #4ade80;
                    box-shadow: 0 0 20px #22c55e, 0 0 40px rgba(34, 197, 94, 0.5), inset 0 0 5px #fff;
                    clip-path: ellipse(100% 60% at 50% 40%);
                }
                .robot-eye-wink {
                    width: 48px;
                    height: 4px;
                    background: #4ade80;
                    box-shadow: 0 0 15px #22c55e, 0 0 30px rgba(34, 197, 94, 0.4);
                    border-radius: 20px;
                    transform: translateY(10px) rotate(-2deg);
                }
                .robot-digital-smile {
                    width: 40px;
                    height: 12px;
                    border-bottom: 2px solid #4ade80;
                    border-radius: 50%;
                    filter: drop-shadow(0 0 5px #22c55e);
                    opacity: 0.9;
                }
                .speech-bubble {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(8px);
                    border: 2px solid #22c55e;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2), 0 0 15px rgba(34, 197, 94, 0.3);
                }
                .speech-bubble::after {
                    content: '';
                    position: absolute;
                    left: -12px;
                    top: 50%;
                    transform: translateY(-50%);
                    border-top: 10px solid transparent;
                    border-bottom: 10px solid transparent;
                    border-right: 12px solid #22c55e;
                }
                .data-stream {
                    width: 1px;
                    height: 100px;
                    background: linear-gradient(to bottom, transparent, #22c55e, transparent);
                    position: absolute;
                    opacity: 0.15;
                }
                .success-glow {
                    filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.4));
                }
            `}</style>

            <div className="flex h-screen w-full overflow-hidden">
                {/* Left Panel - Tech Design */}
                <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden tech-bg">
                    <div className="absolute inset-0 grid-intersection"></div>
                    <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                        <path className="circuit-trace" d="M0 100 H200 L250 150 V300 L300 350 H600"></path>
                        <path className="circuit-trace" d="M1000 800 H800 L750 750 V600 L700 550 H400"></path>
                        <path className="circuit-trace" d="M200 800 V600 L300 500 H500"></path>
                        <circle cx="200" cy="100" fill="#22c55e" r="3"></circle>
                        <circle cx="600" cy="350" fill="#22c55e" r="3"></circle>
                        <circle cx="400" cy="550" fill="#22c55e" r="3"></circle>
                    </svg>

                    {/* Data Streams */}
                    <div className="data-stream" style={{ top: '10%', left: '20%' }}></div>
                    <div className="data-stream" style={{ top: '40%', left: '80%' }}></div>
                    <div className="data-stream" style={{ top: '70%', left: '15%' }}></div>
                    <div className="data-stream" style={{ top: '25%', left: '55%' }}></div>

                    {/* Hologram Icons */}
                    <div className="absolute top-[15%] left-[15%] hologram-icon text-green-500 opacity-40">
                        <span className="material-symbols-outlined !text-6xl">biotech</span>
                    </div>
                    <div className="absolute bottom-[20%] right-[15%] hologram-icon text-green-500 opacity-40">
                        <span className="material-symbols-outlined !text-7xl">settings_suggest</span>
                    </div>

                    {/* Robot Container */}
                    <div className="relative z-10 flex flex-col items-center justify-center w-full p-20 text-white h-full">
                        <div className="bemo-head-container relative mb-16 flex items-center">
                            <div ref={mascotHeadRef} className="bemo-bot-head relative w-64 h-56">
                                <div className="robot-head-textured w-64 h-56 rounded-[3.5rem] relative z-20 flex items-center justify-center">
                                    <div className="robot-face-glow w-48 h-36 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                                        <div className="flex items-center gap-10 mt-2">
                                            <div ref={eyeLeftRef} className="robot-eye-glow-happy w-12 h-8 rounded-full"></div>
                                            <div ref={eyeRightRef} className="robot-eye-wink"></div>
                                        </div>
                                        <div ref={digitalSmileRef} className="robot-digital-smile mb-1"></div>
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400/10 to-transparent h-1/3 w-full opacity-50"></div>
                                    </div>

                                    {/* Antennas */}
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-16">
                                        <div className="w-3 h-8 bg-slate-300 rounded-full border-b-4 border-green-500"></div>
                                        <div className="w-3 h-8 bg-slate-300 rounded-full border-b-4 border-green-500"></div>
                                    </div>
                                </div>

                                {/* Glow under head */}
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-8 bg-green-500/20 rounded-full blur-2xl"></div>
                            </div>

                            {/* Speech Bubble */}
                            <div className="speech-bubble absolute left-[105%] top-1/2 -translate-y-1/2 px-6 py-4 rounded-2xl whitespace-nowrap">
                                <p className="text-slate-900 font-extrabold text-xl tracking-tight flex items-center gap-2">
                                    {t('successful.welcome_back', { defaultValue: 'Welcome back!' })}
                                    <span className="material-symbols-outlined text-green-500 fill-1">verified</span>
                                </p>
                            </div>
                        </div>

                        {/* Branding */}
                        <div className="text-center relative">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="bg-green-500/20 p-3 rounded-2xl backdrop-blur-md border border-green-500/30">
                                    <span className="material-symbols-outlined text-4xl text-green-500">rocket_launch</span>
                                </div>
                                <h1 className="text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-green-200">ASTBA</h1>
                            </div>
                            <p className="text-xl font-medium max-w-md mx-auto leading-relaxed text-green-100/80">
                                Advancing Science and Technology Business Administration.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Content */}
                <div className="w-full lg:w-2/5 flex flex-col bg-white p-8 md:p-16 lg:p-20 h-screen overflow-hidden">
                    <div className="flex flex-col flex-1 items-center justify-center text-center">
                        {/* Mobile Logo */}
                        <div className="flex items-center gap-3 lg:hidden mb-12 text-primary">
                            <span className="material-symbols-outlined text-4xl">rocket_launch</span>
                            <span className="text-3xl font-black tracking-tight text-slate-900">ASTBA</span>
                        </div>

                        <div className="success-glow mb-10">
                            <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                                <span className="material-symbols-outlined !text-7xl text-green-500 font-bold">check</span>
                            </div>
                        </div>

                        <div className="max-w-sm">
                            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">{t('successful.title', { defaultValue: 'Authentication Successful' })}</h2>
                            <p className="text-lg text-slate-500 leading-relaxed">
                                {t('successful.redirecting', { defaultValue: 'Redirecting to your dashboard...' })} <br />
                                <span className="font-bold text-green-500">{t('successful.session_established', { defaultValue: 'Secure session established.' })}</span>
                            </p>
                        </div>

                        {/* Loading Dots */}
                        <div className="mt-12 flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <div className="w-3 h-3 bg-green-500/60 rounded-full animate-pulse delay-75"></div>
                            <div className="w-3 h-3 bg-green-500/30 rounded-full animate-pulse delay-150"></div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-slate-100 w-full">
                        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400 font-bold mb-6">
                            <a className="hover:text-primary transition-colors uppercase tracking-widest" href="#">{t('common.footer.support')}</a>
                            <a className="hover:text-primary transition-colors uppercase tracking-widest" href="#">{t('common.footer.policies')}</a>
                            <a className="hover:text-primary transition-colors uppercase tracking-widest" href="#">{t('common.footer.compliance')}</a>
                        </div>
                        <p className="text-[11px] text-center text-slate-400 uppercase tracking-[0.2em] leading-relaxed font-bold">
                            {t('common.footer.copyright')}
                            <span className="block mt-1 text-slate-300">{t('common.footer.version')}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Successful;
