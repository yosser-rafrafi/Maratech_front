import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Unsuccessful = () => {
    const navigate = useNavigate();
    const mascotHeadRef = useRef(null);
    const eyeLeftRef = useRef(null);
    const eyeRightRef = useRef(null);
    const digitalMouthRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!mascotHeadRef.current) return;

            const x = e.clientX;
            const y = e.clientY;

            // Get relative center (approximate)
            const centerX = window.innerWidth * 0.3;
            const centerY = window.innerHeight / 2 - 100;

            const deltaX = (x - centerX) / 40;
            const deltaY = (y - centerY) / 40;

            const rotX = Math.min(Math.max(-deltaY, -10), 10);
            const rotY = Math.min(Math.max(deltaX, -15), 15);

            mascotHeadRef.current.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(30px)`;

            const eyeX = Math.min(Math.max(deltaX / 2, -8), 8);
            const eyeY = Math.min(Math.max(deltaY / 2, -4), 4);

            if (eyeLeftRef.current) eyeLeftRef.current.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
            if (eyeRightRef.current) eyeRightRef.current.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
            if (digitalMouthRef.current) digitalMouthRef.current.style.transform = `translate(${eyeX * 0.6}px, ${eyeY * 0.6}px)`;
        };

        const handleMouseLeave = () => {
            if (mascotHeadRef.current) {
                mascotHeadRef.current.style.transform = `rotateX(0deg) rotateY(0deg) translateZ(0px)`;
            }
            if (eyeLeftRef.current) eyeLeftRef.current.style.transform = `translate(0px, 0px)`;
            if (eyeRightRef.current) eyeRightRef.current.style.transform = `translate(0px, 0px)`;
            if (digitalMouthRef.current) digitalMouthRef.current.style.transform = `translate(0px, 0px)`;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div className="bg-background-light h-screen flex items-center justify-center font-display overflow-hidden">
            <style>{`
                .tech-bg {
                    background-color: #020617;
                    background-image: radial-gradient(circle at 2px 2px, rgba(239, 68, 68, 0.05) 1px, transparent 0);
                    background-size: 40px 40px;
                }
                .grid-intersection {
                    background-image: radial-gradient(circle at 50% 50%, #ef4444 1px, transparent 1px);
                    background-size: 40px 40px;
                    opacity: 0.1;
                }
                .circuit-trace {
                    stroke: #450a0a;
                    stroke-width: 1;
                    fill: none;
                    opacity: 0.2;
                }
                .hologram-icon {
                    filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.4));
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
                        inset 5px 5px 15px rgba(239, 68, 68, 0.1),
                        0 20px 50px rgba(0,0,0,0.5);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                }
                .robot-face-glow {
                    background: #0f172a;
                    box-shadow: inset 0 0 25px rgba(239, 68, 68, 0.2);
                    border: 2px solid rgba(239, 68, 68, 0.3);
                }
                .robot-eye-sad {
                    background: #f87171;
                    box-shadow: 0 0 15px #ef4444, 0 0 30px rgba(239, 68, 68, 0.4);
                    clip-path: polygon(0% 100%, 100% 100%, 100% 40%, 0% 0%);
                    transform: rotate(5deg);
                }
                .robot-eye-sad-right {
                    background: #f87171;
                    box-shadow: 0 0 15px #ef4444, 0 0 30px rgba(239, 68, 68, 0.4);
                    clip-path: polygon(0% 100%, 100% 100%, 100% 0%, 0% 40%);
                    transform: rotate(-5deg);
                }
                .robot-digital-flat-mouth {
                    width: 24px;
                    height: 2px;
                    background: #ef4444;
                    box-shadow: 0 0 8px #ef4444;
                    opacity: 0.9;
                }
                .speech-bubble {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(8px);
                    border: 2px solid #ef4444;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2), 0 0 15px rgba(239, 68, 68, 0.3);
                }
                .speech-bubble::after {
                    content: '';
                    position: absolute;
                    left: -12px;
                    top: 50%;
                    transform: translateY(-50%);
                    border-top: 10px solid transparent;
                    border-bottom: 10px solid transparent;
                    border-right: 12px solid #ef4444;
                }
                .red-error-glow {
                    background: radial-gradient(circle at 30% 50%, rgba(239, 68, 68, 0.15) 0%, transparent 60%);
                }
            `}</style>

            <div className="flex h-screen w-full overflow-hidden">
                {/* Left Panel - Tech Design */}
                <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden tech-bg">
                    <div className="absolute inset-0 red-error-glow"></div>
                    <div className="absolute inset-0 grid-intersection"></div>
                    <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                        <path className="circuit-trace" d="M0 100 H200 L250 150 V300 L300 350 H600"></path>
                        <path className="circuit-trace" d="M1000 800 H800 L750 750 V600 L700 550 H400"></path>
                        <circle cx="200" cy="100" fill="#ef4444" opacity="0.3" r="3"></circle>
                        <circle cx="600" cy="350" fill="#ef4444" opacity="0.3" r="3"></circle>
                    </svg>

                    {/* Hologram Icons */}
                    <div className="absolute top-[15%] left-[15%] hologram-icon text-red-500 opacity-20">
                        <span className="material-symbols-outlined !text-6xl">biotech</span>
                    </div>
                    <div className="absolute bottom-[20%] right-[15%] hologram-icon text-red-500 opacity-20">
                        <span className="material-symbols-outlined !text-7xl">security</span>
                    </div>

                    {/* Robot Container */}
                    <div className="relative z-10 flex flex-col items-center justify-center w-full p-20 text-white h-full">
                        <div className="bemo-head-container relative mb-16 flex items-center">
                            <div ref={mascotHeadRef} className="bemo-bot-head relative w-64 h-56">
                                <div className="robot-head-textured w-64 h-56 rounded-[3.5rem] relative z-20 flex items-center justify-center">
                                    <div className="robot-face-glow w-48 h-36 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 relative overflow-hidden">
                                        <div className="flex gap-10 mt-2">
                                            <div ref={eyeLeftRef} className="robot-eye-sad w-12 h-8 rounded-sm"></div>
                                            <div ref={eyeRightRef} className="robot-eye-sad-right w-12 h-8 rounded-sm"></div>
                                        </div>
                                        <div ref={digitalMouthRef} className="robot-digital-flat-mouth mb-1"></div>
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-400/5 to-transparent h-1/3 w-full opacity-50"></div>
                                    </div>

                                    {/* Antennas */}
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-16">
                                        <div className="w-3 h-8 bg-slate-300 rounded-full border-b-4 border-red-500/50"></div>
                                        <div className="w-3 h-8 bg-slate-300 rounded-full border-b-4 border-red-500/50"></div>
                                    </div>
                                </div>

                                {/* Glow under head */}
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-8 bg-red-500/10 rounded-full blur-2xl"></div>
                            </div>

                            {/* Speech Bubble */}
                            <div className="speech-bubble absolute left-[105%] top-1/2 -translate-y-1/2 px-6 py-4 rounded-2xl w-[240px]">
                                <div className="flex flex-col gap-1">
                                    <p className="text-slate-900 font-extrabold text-xl tracking-tight leading-tight">
                                        Access Denied.
                                    </p>
                                    <p className="text-slate-900 font-extrabold text-xl tracking-tight leading-tight flex items-center gap-2">
                                        Let's try that again!
                                        <span className="material-symbols-outlined text-red-500 text-xl">warning</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Branding */}
                        <div className="text-center relative">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="bg-red-500/10 p-3 rounded-2xl backdrop-blur-md border border-red-500/20">
                                    <span className="material-symbols-outlined text-4xl text-red-500">rocket_launch</span>
                                </div>
                                <h1 className="text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-red-200">ASTBA</h1>
                            </div>
                            <p className="text-xl font-medium max-w-md mx-auto leading-relaxed text-red-100/60">
                                Advancing Science and Technology Business Administration.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Content */}
                <div className="w-full lg:w-2/5 flex flex-col bg-white p-8 md:p-16 lg:p-20 h-screen overflow-hidden">
                    <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center">
                        {/* Mobile Logo */}
                        <div className="flex items-center gap-3 lg:hidden mb-12 text-red-500">
                            <span className="material-symbols-outlined text-4xl">rocket_launch</span>
                            <span className="text-3xl font-black tracking-tight text-slate-900">ASTBA</span>
                        </div>

                        <div className="mb-8 flex items-center gap-3 bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 animate-in fade-in slide-in-from-top-4 duration-300">
                            <span className="material-symbols-outlined">error</span>
                            <span className="font-bold text-sm">Authentication Failed</span>
                        </div>

                        <div className="mb-10">
                            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Login Failed</h2>
                            <p className="text-slate-500">The credentials you provided were incorrect. Please try again.</p>
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-200 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            Return to Login
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-slate-100 w-full">
                        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400 font-bold mb-6">
                            <a className="hover:text-primary transition-colors uppercase tracking-widest" href="#">Support</a>
                            <a className="hover:text-primary transition-colors uppercase tracking-widest" href="#">Policies</a>
                            <a className="hover:text-primary transition-colors uppercase tracking-widest" href="#">Compliance</a>
                        </div>
                        <p className="text-[11px] text-center text-slate-400 uppercase tracking-[0.2em] leading-relaxed font-bold">
                            © 2024 ASTBA. Science & Technology Business Association.
                            <span className="block mt-1 text-slate-300">Global Certification Standard v2.4.0</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Unsuccessful;
