import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const StudentSidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const { t } = useTranslation();

    const menuItems = [
        { path: '/student-dashboard', icon: 'dashboard', label: 'Dashboard' },
        { path: '/student-formations', icon: 'menu_book', label: 'My Courses' },
        { path: '/calendar', icon: 'calendar_month', label: 'Schedule' },
    ];

    const accountItems = [
        { path: '/profile', icon: 'person', label: 'Profile Settings' },
        { path: '/student-history', icon: 'workspace_premium', label: 'My Certificates' },
    ];

    return (
        <aside className="w-72 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col fixed h-full z-20 shadow-sm">
            {/* Logo Section */}
            <div className="p-8 mb-2 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <span className="material-symbols-outlined text-2xl font-bold">menu_book</span>
                </div>
                <span className="font-black text-2xl tracking-tighter text-slate-800 dark:text-white">ASTBA</span>
            </div>

            {/* Navigation Sections */}
            <div className="flex-1 px-6 space-y-8 overflow-y-auto pt-2">

                {/* Main Menu */}
                <nav>
                    <p className="px-4 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Main Menu</p>
                    <div className="space-y-1.5">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${location.pathname === item.path
                                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/25 ring-4 ring-indigo-500/10'
                                        : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-[22px] ${location.pathname === item.path ? 'text-white' : 'group-hover:scale-110 transition-transform'
                                    }`}>
                                    {item.icon}
                                </span>
                                <span className="font-bold text-[15px]">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* Account Section */}
                <nav>
                    <p className="px-4 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Account</p>
                    <div className="space-y-1.5">
                        {accountItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${location.pathname === item.path
                                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/25'
                                        : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                                <span className="font-bold text-[15px]">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </nav>
            </div>

            {/* Logout Footer */}
            <div className="p-6 border-t border-slate-50 dark:border-slate-800">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl font-black text-sm transition-all hover:bg-red-100 dark:hover:bg-red-900/20 active:scale-95 group"
                >
                    <span className="material-symbols-outlined text-[22px] group-hover:rotate-12 transition-transform">logout</span>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default StudentSidebar;
