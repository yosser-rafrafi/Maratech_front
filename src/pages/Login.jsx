import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Animation refs
    const mascotHeadRef = useRef(null);
    const eyeLeftRef = useRef(null);
    const eyeRightRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!mascotHeadRef.current) return;

            const x = e.clientX;
            const y = e.clientY;
            const centerX = window.innerWidth * 0.3;
            const centerY = window.innerHeight / 2;
            const deltaX = (x - centerX) / 30;
            const deltaY = (y - centerY) / 30;

            const rotX = Math.min(Math.max(-deltaY, -15), 15);
            const rotY = Math.min(Math.max(deltaX, -25), 25);

            mascotHeadRef.current.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(30px)`;

            const eyeX = Math.min(Math.max(deltaX / 1.5, -10), 10);
            const eyeY = Math.min(Math.max(deltaY / 1.5, -10), 10);

            if (eyeLeftRef.current) eyeLeftRef.current.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
            if (eyeRightRef.current) eyeRightRef.current.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
        };

        const handleMouseLeave = () => {
            if (mascotHeadRef.current) {
                mascotHeadRef.current.style.transform = `rotateX(0deg) rotateY(0deg) translateZ(0px)`;
            }
            if (eyeLeftRef.current) eyeLeftRef.current.style.transform = `translate(0px, 0px)`;
            if (eyeRightRef.current) eyeRightRef.current.style.transform = `translate(0px, 0px)`;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('Attempting login with:', email);
            const result = await login(email, password);
            console.log('Login result:', result);

            // Check success property or if result is a user object (which usually means success in this context)
            if (result && result.success === false) {
                console.log('Login failed, navigating to /unsuccessful');
                navigate('/unsuccessful');
            } else if (result && result.id) {
                // If result has an id, it's a user object (success)
                console.log('Login successful, navigating to /success');
                navigate('/success');
            } else {
                console.log('Unexpected result, navigating to /unsuccessful');
                navigate('/unsuccessful');
            }
        } catch (err) {
            console.error('Login error:', err);
            navigate('/unsuccessful');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light min-h-screen flex items-center justify-center font-display overflow-hidden">
            <style>{`
                .tech-bg {
                    background-color: #020617;
                    background-image: radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.15) 1px, transparent 0);
                    background-size: 40px 40px;
                }
                .grid-intersection {
                    background-image: radial-gradient(circle at 50% 50%, #3b82f6 1px, transparent 1px);
                    background-size: 40px 40px;
                    opacity: 0.4;
                }
                .circuit-trace {
                    stroke: #1e40af;
                    stroke-width: 1;
                    fill: none;
                    opacity: 0.3;
                }
                .hologram-icon {
                    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                .bemo-bot {
                    transform-style: preserve-3d;
                    transition: transform 0.1s ease-out;
                }
                .robot-body-textured {
                    background: linear-gradient(145deg, #ffffff 0%, #cbd5e1 100%);
                    box-shadow: 
                        inset -5px -5px 15px rgba(0,0,0,0.1),
                        inset 5px 5px 15px rgba(59, 130, 246, 0.2),
                        0 10px 40px rgba(0,0,0,0.3);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }
                .robot-face-glow {
                    background: #0f172a;
                    box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.3);
                    border: 2px solid rgba(59, 130, 246, 0.2);
                }
                .robot-eye-glow {
                    background: #60a5fa;
                    box-shadow: 0 0 20px #3b82f6, 0 0 40px rgba(59, 130, 246, 0.4), inset 0 0 5px #fff;
                }
                .login-btn-glow {
                    box-shadow: 0 0 20px rgba(19, 127, 236, 0.4);
                    transition: all 0.3s ease;
                }
                .login-btn-glow:hover {
                    box-shadow: 0 0 30px rgba(14, 165, 233, 0.6);
                }
                .data-stream {
                    width: 1px;
                    height: 100px;
                    background: linear-gradient(to bottom, transparent, #3b82f6, transparent);
                    position: absolute;
                    opacity: 0.2;
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
                        <circle cx="200" cy="100" fill="#3b82f6" r="3"></circle>
                        <circle cx="600" cy="350" fill="#3b82f6" r="3"></circle>
                        <circle cx="400" cy="550" fill="#3b82f6" r="3"></circle>
                    </svg>

                    <div className="data-stream" style={{ top: '10%', left: '20%' }}></div>
                    <div className="data-stream" style={{ top: '40%', left: '80%' }}></div>
                    <div className="data-stream" style={{ top: '70%', left: '15%' }}></div>
                    <div className="data-stream" style={{ top: '25%', left: '55%' }}></div>

                    <div className="absolute top-[15%] left-[15%] hologram-icon text-blue-400 opacity-60">
                        <span className="material-symbols-outlined !text-6xl">biotech</span>
                    </div>
                    <div className="absolute bottom-[20%] right-[15%] hologram-icon text-blue-400 opacity-60" style={{ animationDelay: '-2s' }}>
                        <span className="material-symbols-outlined !text-7xl">settings_suggest</span>
                    </div>
                    <div className="absolute top-[40%] right-[10%] hologram-icon text-blue-400 opacity-60" style={{ animationDelay: '-4s' }}>
                        <span className="material-symbols-outlined !text-5xl">matter</span>
                    </div>

                    {/* Robot Container */}
                    <div className="relative z-10 flex flex-col items-center justify-center w-full p-20 text-white">
                        <div className="character-container relative mb-12 flex flex-col items-center">
                            <div className="bemo-bot relative w-72 h-80 flex flex-col items-center" ref={mascotHeadRef}>
                                <div className="robot-body-textured w-64 h-56 rounded-[3.5rem] relative z-20 flex items-center justify-center transition-transform duration-75">
                                    <div className="robot-face-glow w-48 h-36 rounded-[2.5rem] flex items-center justify-center gap-8 relative overflow-hidden">
                                        <div className="flex gap-10">
                                            <div ref={eyeLeftRef} className="robot-eye-glow w-10 h-12 rounded-full transition-transform duration-75"></div>
                                            <div ref={eyeRightRef} className="robot-eye-glow w-10 h-12 rounded-full transition-transform duration-75"></div>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-400/10 to-transparent h-1/3 w-full animate-pulse"></div>
                                    </div>
                                    {/* Antennas */}
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-16">
                                        <div className="w-3 h-8 bg-slate-300 rounded-full border-b-4 border-blue-400"></div>
                                        <div className="w-3 h-8 bg-slate-300 rounded-full border-b-4 border-blue-400"></div>
                                    </div>
                                </div>
                                {/* Glow under head */}
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-8 bg-blue-500/20 rounded-full blur-2xl"></div>
                            </div>
                        </div>

                        <div className="text-center relative">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="bg-blue-600/20 p-3 rounded-2xl backdrop-blur-md border border-blue-400/30">
                                    <span className="material-symbols-outlined text-4xl text-blue-400">rocket_launch</span>
                                </div>
                                <h1 className="text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">ASTBA</h1>
                            </div>
                            <p className="text-xl font-medium max-w-md mx-auto leading-relaxed text-blue-100/80">
                                Advancing Science and Technology Business Administration.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="w-full lg:w-2/5 flex flex-col bg-white p-8 md:p-16 lg:p-20 justify-between h-screen overflow-hidden">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3 lg:hidden mb-12 text-primary">
                            <span className="material-symbols-outlined text-4xl">rocket_launch</span>
                            <span className="text-3xl font-black tracking-tight text-slate-900">ASTBA</span>
                        </div>
                        <div className="mb-12">
                            <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Portal Access</h2>
                            <p className="text-lg text-slate-500">Secure authentication for STEM professionals.</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Identification</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">account_circle</span>
                                    <input
                                        type="email"
                                        className="w-full pl-14 pr-5 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-900 placeholder:text-slate-400 transition-all text-lg font-medium"
                                        placeholder="Username or Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Access Key</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">key</span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full pl-14 pr-14 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-900 placeholder:text-slate-400 transition-all text-lg font-medium"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input className="w-6 h-6 rounded-lg text-primary focus:ring-primary/20 bg-slate-50 border-2 border-slate-200" type="checkbox" />
                                    <span className="text-base font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Secure Session</span>
                                </label>
                                <a className="text-base font-bold text-primary hover:text-accent-blue transition-colors" href="#">Recovery</a>
                            </div>
                            <button
                                type="submit"
                                className="w-full login-btn-glow bg-primary hover:bg-accent-blue text-white font-extrabold py-5 rounded-2xl transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 text-xl"
                            >
                                <span>Log In</span>
                                <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                            </button>
                        </form>

                        <div className="mt-10 text-center">
                            <p className="text-base text-slate-500">
                                Not a member yet?
                                <Link to="/signup" className="text-primary font-extrabold hover:underline underline-offset-4 ml-1">Request Access</Link>
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100">
                        <div className="flex flex-wrap gap-6 text-sm text-slate-400 font-bold mb-6">
                            <a className="hover:text-primary transition-colors uppercase tracking-widest" href="#">Support</a>
                            <a className="hover:text-primary transition-colors uppercase tracking-widest" href="#">Policies</a>
                            <a className="hover:text-primary transition-colors uppercase tracking-widest" href="#">Compliance</a>
                        </div>
                        <p className="text-[11px] text-slate-400 uppercase tracking-[0.2em] leading-relaxed font-bold">
                            © 2024 ASTBA. Science & Technology Business Association.
                            <span className="block mt-1 text-slate-300">Global Certification Standard v2.4.0</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
