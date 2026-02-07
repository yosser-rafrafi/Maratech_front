import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RobotMascot from '../components/RobotMascot';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user.role === 'admin') {
                navigate('/admin');
            } else if (user.role === 'formateur') {
                navigate('/formateur');
            } else {
                navigate('/participant');
            }
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="bg-background-light h-screen flex items-center justify-center font-display overflow-hidden">
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
                @keyframes wave {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-10deg); }
                    75% { transform: rotate(10deg); }
                }
                .animate-wave {
                    animation: wave 2s infinite ease-in-out;
                    transform-origin: 70% 70%;
                    display: inline-block;
                }
            `}</style>

            <div className="flex h-screen w-full overflow-hidden">
                {/* Left Panel: Tech Background with Robot */}
                <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden tech-bg">
                    {/* Grid Intersection Overlay */}
                    <div className="absolute inset-0 grid-intersection"></div>

                    {/* Circuit Traces */}
                    <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                        <path className="circuit-trace" d="M0 100 H200 L250 150 V300 L300 350 H600"></path>
                        <path className="circuit-trace" d="M1000 800 H800 L750 750 V600 L700 550 H400"></path>
                        <path className="circuit-trace" d="M200 800 V600 L300 500 H500"></path>
                        <circle cx="200" cy="100" fill="#3b82f6" r="3"></circle>
                        <circle cx="600" cy="350" fill="#3b82f6" r="3"></circle>
                        <circle cx="400" cy="550" fill="#3b82f6" r="3"></circle>
                    </svg>

                    {/* Data Streams */}
                    <div className="data-stream" style={{ top: '10%', left: '20%' }}></div>
                    <div className="data-stream" style={{ top: '40%', left: '80%' }}></div>
                    <div className="data-stream" style={{ top: '70%', left: '15%' }}></div>
                    <div className="data-stream" style={{ top: '25%', left: '55%' }}></div>

                    {/* Hologram Icons */}
                    <div className="absolute top-[15%] left-[15%] hologram-icon text-glow-blue opacity-60">
                        <span className="material-symbols-outlined !text-6xl">biotech</span>
                    </div>
                    <div className="absolute bottom-[20%] right-[15%] hologram-icon text-glow-blue opacity-60" style={{ animationDelay: '-2s' }}>
                        <span className="material-symbols-outlined !text-7xl">settings_suggest</span>
                    </div>
                    <div className="absolute top-[40%] right-[10%] hologram-icon text-glow-blue opacity-60" style={{ animationDelay: '-4s' }}>
                        <span className="material-symbols-outlined !text-5xl">matter</span>
                    </div>

                    {/* Main Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
                        {/* Robot Mascot */}
                        <RobotMascot />

                        {/* Title Section */}
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

                {/* Right Panel: Login Form */}
                <div className="w-full lg:w-2/5 flex flex-col bg-white p-6 sm:p-8 md:p-10 lg:p-12 h-screen overflow-hidden">
                    <div className="flex flex-col flex-1 justify-center max-w-md mx-auto w-full">
                        {/* Mobile Logo */}
                        <div className="flex items-center gap-2 sm:gap-3 lg:hidden mb-8 sm:mb-12 text-primary">
                            <span className="material-symbols-outlined text-3xl sm:text-4xl">rocket_launch</span>
                            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">ASTBA</span>
                        </div>

                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="text-3xl sm:text-4xl lg:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Hello ! <span className="wave">👋</span></h2>
                            <p className="text-sm sm:text-base text-slate-500">Welcome back to the ASTBA Portal.</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email/Identification Field */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Identification</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl sm:text-2xl">account_circle</span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-12 sm:pl-14 pr-4 sm:pr-5 py-4 sm:py-5 bg-slate-50 border-2 border-slate-100 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-900 placeholder:text-slate-400 transition-all text-base sm:text-lg font-medium"
                                        placeholder="Username or Email"
                                    />
                                </div>
                            </div>

                            {/* Password/Access Key Field */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Access Key</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl sm:text-2xl">key</span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-4 sm:py-5 bg-slate-50 border-2 border-slate-100 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-900 placeholder:text-slate-400 transition-all text-base sm:text-lg font-medium"
                                        placeholder="Password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl sm:text-2xl">{showPassword ? 'visibility' : 'visibility_off'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Recovery */}
                            <div className="flex items-center justify-between py-2">
                                <label className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
                                    <input className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg text-primary focus:ring-primary/20 bg-slate-50 border-2 border-slate-200" type="checkbox" />
                                    <span className="text-sm sm:text-base font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
                                </label>
                                <a className="text-sm sm:text-base font-bold text-primary hover:text-accent-blue transition-colors" href="#">Forgot password?</a>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full login-btn-glow bg-primary hover:bg-accent-blue text-white font-extrabold py-4 sm:py-5 rounded-xl sm:rounded-2xl transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <span>{loading ? 'Authenticating...' : 'Log In'}</span>
                                <span className="material-symbols-outlined text-xl sm:text-2xl">arrow_forward</span>
                            </button>
                        </form>

                        {/* Register Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm sm:text-base text-slate-500">
                                Not a member yet?
                                <Link to="/signup" className="text-primary font-extrabold hover:underline underline-offset-4 ml-1">Request Access</Link>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                        <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-400 font-bold mb-3">
                            <a className="hover:text-primary transition-colors uppercase tracking-widest" href="#">Support</a>
                            <a className="hover:text-primary transition-colors uppercase tracking-widest" href="#">Policies</a>
                            <a className="hover:text-primary transition-colors uppercase tracking-widest" href="#">Compliance</a>
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] leading-tight font-bold text-center">
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
