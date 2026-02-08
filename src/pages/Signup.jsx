import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import RobotMascot from '../components/RobotMascot';
import LanguageSelector from '../components/LanguageSelector';

const Signup = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError(t('auth.password_mismatch'));
        }

        setLoading(true);

        try {
            const { confirmPassword, ...signupData } = formData;
            const result = await signup(signupData);

            if (result && result.success === false) {
                setError(result.error);
            } else {
                // Success
                // Check if user is pending or approval is required (typically no token is returned or status is pending)
                if (result?.status === 'pending' || result?.user?.status === 'pending' || (result?.success && !result.token)) {
                    navigate('/pending-approval');
                } else {
                    navigate('/success');
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light min-h-screen flex items-center justify-center font-display overflow-hidden">
            {/* Language Selector - Top Right Corner */}
            <div className="fixed top-6 right-6 z-50">
                <LanguageSelector />
            </div>

            <div className="flex h-screen w-full overflow-hidden">
                {/* Left Panel - Hidden on mobile */}
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

                    <div className="absolute top-[15%] left-[15%] hologram-icon text-glow-blue opacity-60">
                        <span className="material-symbols-outlined !text-6xl">biotech</span>
                    </div>
                    <div className="absolute bottom-[20%] right-[15%] hologram-icon text-glow-blue opacity-60">
                        <span className="material-symbols-outlined !text-7xl">settings_suggest</span>
                    </div>
                    <div className="absolute top-[40%] right-[10%] hologram-icon text-glow-blue opacity-60">
                        <span className="material-symbols-outlined !text-5xl">matter</span>
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center w-full p-20 text-white">
                        <RobotMascot />

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

                {/* Right Panel - Signup Form */}
                <div className="w-full lg:w-2/5 flex flex-col bg-white p-4 md:p-12 lg:p-16 h-screen overflow-y-auto overflow-x-hidden">
                    <div className="w-full max-w-md mx-auto flex flex-col justify-center min-h-full my-auto lg:justify-center lg:min-h-0 py-8 lg:py-0">
                        <div className="flex items-center gap-3 lg:hidden mb-8 text-primary">
                            <span className="material-symbols-outlined text-4xl">rocket_launch</span>
                            <span className="text-3xl font-black tracking-tight text-slate-900">ASTBA</span>
                        </div>
                        <div className="mb-8">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">{t('auth.signup_title')}</h2>
                            <p className="text-base md:text-lg text-slate-500">{t('auth.signup_welcome')}</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                                <span className="material-symbols-outlined text-xl">error</span>
                                {error}
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">{t('common.name')}</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">person</span>
                                    <input
                                        type="text"
                                        name="name"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-900 placeholder:text-slate-400 transition-all text-base font-medium"
                                        placeholder={t('auth.name_placeholder')}
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">{t('common.email')}</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">mail</span>
                                    <input
                                        type="email"
                                        name="email"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-900 placeholder:text-slate-400 transition-all text-base font-medium"
                                        placeholder={t('auth.email_placeholder')}
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">{t('common.role')}</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">badge</span>
                                    <select
                                        name="role"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-900 appearance-none transition-all text-base font-medium cursor-pointer"
                                        value={formData.role}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">{t('auth.role_select')}</option>
                                        <option value="student">{t('auth.roles.student', { defaultValue: 'Student / Élève' })}</option>
                                        <option value="formateur">{t('auth.roles.formateur')}</option>
                                        <option value="Responsable">{t('auth.roles.responsable')}</option>
                                        <option value="admin">{t('auth.roles.admin')}</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">{t('common.password')}</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-900 placeholder:text-slate-400 transition-all text-base font-medium"
                                        placeholder={t('auth.password_placeholder')}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility' : 'visibility_off'}</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">{t('auth.confirm_password')}</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">lock_reset</span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-900 placeholder:text-slate-400 transition-all text-base font-medium"
                                        placeholder={t('auth.password_placeholder')}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-glow bg-primary hover:bg-accent-blue text-white font-extrabold py-4 rounded-xl transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                            >
                                {loading ? (
                                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        <span>{t('auth.register')}</span>
                                        <span className="material-symbols-outlined text-xl">person_add</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-slate-500">
                                {t('auth.has_account')}
                                <Link to="/login" className="text-primary font-extrabold hover:underline underline-offset-4 ml-1">{t('auth.login_btn')}</Link>
                            </p>
                        </div>

                        <div className="mt-auto lg:mt-12 pt-8 border-t border-slate-100 w-full">
                            <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-400 font-bold mb-4">
                                <a className="hover:text-primary transition-colors uppercase tracking-widest" href="#">{t('common.footer.support')}</a>
                                <a className="hover:text-primary transition-colors uppercase tracking-widest" href="#">{t('common.footer.policies')}</a>
                                <a className="hover:text-primary transition-colors uppercase tracking-widest" href="#">{t('common.footer.compliance')}</a>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 uppercase tracking-[0.2em] leading-relaxed font-bold">
                                {t('common.footer.copyright')}
                                <span className="block mt-1 text-slate-300">{t('common.footer.version')}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
