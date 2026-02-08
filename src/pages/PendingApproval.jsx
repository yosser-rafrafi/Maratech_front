import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PendingApproval = () => {
    const { t } = useTranslation();
    const mascotHeadRef = useRef(null);
    const eyeLeftRef = useRef(null);
    const eyeRightRef = useRef(null);
    const digitalSmileRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!mascotHeadRef.current) return;

            const x = e.clientX;
            const y = e.clientY;
            const centerX = window.innerWidth * 0.3;
            // Adjustment relative to the layout
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
            if (digitalSmileRef.current) digitalSmileRef.current.style.transform = `translate(${eyeX * 0.6}px, ${eyeY * 0.6}px)`;
        };

        const handleMouseLeave = () => {
            if (mascotHeadRef.current) {
                mascotHeadRef.current.style.transform = `rotateX(0deg) rotateY(0deg) translateZ(0px)`;
            }
            if (eyeLeftRef.current) eyeLeftRef.current.style.transform = `translate(0px, 0px)`;
            if (eyeRightRef.current) eyeRightRef.current.style.transform = `translate(0px, 0px)`;
            if (digitalSmileRef.current) digitalSmileRef.current.style.transform = `translate(0px, 0px)`;
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div className="bg-background-light min-h-screen flex items-center justify-center font-display overflow-hidden">
            <style>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
                .tech-bg {
                    background-color: #020617;
                    background-image: 
                        radial-gradient(circle at 2px 2px, rgba(14, 165, 233, 0.05) 1px, transparent 0);
                    background-size: 40px 40px;
                }
                .grid-intersection {
                    background-image: radial-gradient(circle at 50% 50%, #0ea5e9 1px, transparent 1px);
                    background-size: 40px 40px;
                    opacity: 0.1;
                }
                .circuit-trace {
                    stroke: #0c4a6e;
                    stroke-width: 1;
                    fill: none;
                    opacity: 0.2;
                }
                .hologram-icon {
                    filter: drop-shadow(0 0 8px rgba(14, 165, 233, 0.4));
                }
                .bemo-head-container {
                    perspective: 1000px;
                }
                .robot-head-textured {
                    background: linear-gradient(145deg, #ffffff 0%, #cbd5e1 100%);
                    box-shadow: 
                        inset -5px -5px 15px rgba(0,0,0,0.1),
                        inset 5px 5px 15px rgba(14, 165, 233, 0.1),
                        0 20px 50px rgba(0,0,0,0.5);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                }
                .robot-face-glow {
                    background: #0f172a;
                    box-shadow: inset 0 0 25px rgba(14, 165, 233, 0.2);
                    border: 2px solid rgba(14, 165, 233, 0.3);
                }
                .robot-eye-happy {
                    background: transparent;
                    border: 6px solid #38bdf8;
                    border-bottom: 0;
                    box-shadow: 0 -5px 15px rgba(14, 165, 233, 0.6);
                    height: 24px;
                    width: 44px;
                    border-radius: 40px 40px 0 0;
                }
                .robot-digital-smile {
                    width: 50px;
                    height: 20px;
                    border: 4px solid #38bdf8;
                    border-top: 0;
                    border-radius: 0 0 50px 50px;
                    box-shadow: 0 5px 12px rgba(14, 165, 233, 0.5);
                    opacity: 0.9;
                }
                .speech-bubble {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(8px);
                    border: 2px solid #0ea5e9;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2), 0 0 15px rgba(14, 165, 233, 0.3);
                }
                .speech-bubble::after {
                    content: '';
                    position: absolute;
                    left: -12px;
                    top: 50%;
                    transform: translateY(-50%);
                    border-top: 10px solid transparent;
                    border-bottom: 10px solid transparent;
                    border-right: 12px solid #0ea5e9;
                }
                .blue-pending-glow {
                    background: radial-gradient(circle at 30% 50%, rgba(14, 165, 233, 0.15) 0%, transparent 60%);
                }
            `}</style>

            <div className="flex h-screen w-full overflow-hidden">
                <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden tech-bg">
                    <div className="absolute inset-0 blue-pending-glow"></div>
                    <div className="absolute inset-0 grid-intersection"></div>
                    <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                        <path className="circuit-trace" d="M0 100 H200 L250 150 V300 L300 350 H600"></path>
                        <path className="circuit-trace" d="M1000 800 H800 L750 750 V600 L700 550 H400"></path>
                        <circle cx="200" cy="100" fill="#0ea5e9" opacity="0.3" r="3"></circle>
                        <circle cx="600" cy="350" fill="#0ea5e9" opacity="0.3" r="3"></circle>
                    </svg>
                    <div className="absolute top-[15%] left-[15%] hologram-icon text-accent-blue opacity-20">
                        <span className="material-symbols-outlined !text-6xl">biotech</span>
                    </div>
                    <div className="absolute bottom-[20%] right-[15%] hologram-icon text-accent-blue opacity-20">
                        <span className="material-symbols-outlined !text-7xl">security</span>
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center w-full p-20 text-white">
                        <div className="bemo-head-container relative mb-16 flex items-center">
                            <div className="bemo-bot-head relative w-64 h-56" ref={mascotHeadRef}>
                                <div className="robot-head-textured w-64 h-56 rounded-[3.5rem] relative z-20 flex items-center justify-center">
                                    <div className="robot-face-glow w-48 h-36 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                                        <div className="flex gap-6 mt-4">
                                            <div className="robot-eye-happy" ref={eyeLeftRef}></div>
                                            <div className="robot-eye-happy" ref={eyeRightRef}></div>
                                        </div>
                                        <div className="robot-digital-smile mb-2" ref={digitalSmileRef}></div>
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-blue/5 to-transparent h-1/3 w-full opacity-50"></div>
                                    </div>
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-16">
                                        <div className="w-3 h-8 bg-slate-300 rounded-full border-b-4 border-accent-blue/50"></div>
                                        <div className="w-3 h-8 bg-slate-300 rounded-full border-b-4 border-accent-blue/50"></div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-8 bg-accent-blue/10 rounded-full blur-2xl"></div>
                            </div>
                            <div className="speech-bubble absolute left-[105%] top-1/2 -translate-y-1/2 px-6 py-4 rounded-2xl w-[240px]">
                                <div className="flex flex-col">
                                    <p className="text-slate-900 font-extrabold text-xl tracking-tight leading-tight">
                                        {t('pending.speech_line1')}
                                    </p>
                                    <p className="text-slate-900 font-extrabold text-xl tracking-tight leading-tight">
                                        {t('pending.speech_line2')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="text-center relative">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="bg-accent-blue/10 p-3 rounded-2xl backdrop-blur-md border border-accent-blue/20">
                                    <span className="material-symbols-outlined text-4xl text-accent-blue">rocket_launch</span>
                                </div>
                                <h1 className="text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-sky-200">ASTBA</h1>
                            </div>
                            <p className="text-xl font-medium max-w-md mx-auto leading-relaxed text-sky-100/60">
                                Advancing Science and Technology Business Administration.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-2/5 flex flex-col bg-white p-8 md:p-16 lg:p-20 justify-between">
                    <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-3 lg:hidden mb-12 text-primary">
                            <span className="material-symbols-outlined text-4xl">rocket_launch</span>
                            <span className="text-3xl font-black tracking-tight text-slate-900">ASTBA</span>
                        </div>
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-3xl mb-6">
                                <span className="material-symbols-outlined text-5xl text-primary font-light">schedule</span>
                            </div>
                            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">{t('pending.title')}</h2>
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left">
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    {t('pending.message1')}
                                </p>
                                <p className="text-slate-600 leading-relaxed">
                                    {t('pending.message2')}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <Link to="/login" className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 group">
                                <span className="material-symbols-outlined text-xl transition-transform group-hover:-translate-x-1">arrow_back</span>
                                {t('pending.back_to_login')}
                            </Link>
                            <p className="text-center text-slate-500 text-sm mt-4">
                                {t('pending.need_help')} <a className="text-primary font-bold hover:underline" href="#">{t('common.footer.support')}</a>
                            </p>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-slate-100">
                        <div className="flex flex-wrap gap-6 text-sm text-slate-400 font-bold mb-6">
                            <a className="hover:text-primary transition-colors uppercase tracking-widest" href="#">{t('common.footer.support')}</a>
                            <a className="hover:text-primary transition-colors uppercase tracking-widest" href="#">{t('common.footer.policies')}</a>
                            <a className="hover:text-primary transition-colors uppercase tracking-widest" href="#">{t('common.footer.compliance')}</a>
                        </div>
                        <p className="text-[11px] text-slate-400 uppercase tracking-[0.2em] leading-relaxed font-bold">
                            {t('common.footer.copyright')}
                            <span className="block mt-1 text-slate-300">{t('common.footer.version')}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingApproval;
