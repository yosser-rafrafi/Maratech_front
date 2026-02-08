import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import ColorBlindnessSelector from './ColorBlindnessSelector';
import LanguageSelector from './LanguageSelector';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const { t, i18n } = useTranslation();



    // Handle RTL direction based on language
    useEffect(() => {
        const dir = (i18n.language === 'ar' || i18n.language === 'tn') ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    const isAdmin = user?.role === 'admin';
    const isFormateur = user?.role === 'formateur';
    const isResponsable = user?.role === 'Responsable';
    const isStudent = user?.role === 'student' || user?.role === 'élève';

    const getRoleLabel = (role) => {
        const roleKey = role === 'student' || role === 'élève' ? 'student' : role.toLowerCase();
        return t(`sidebar.${roleKey}`, { defaultValue: role });
    };

    const navGroups = [
        {
            label: t('sidebar.principal'),
            items: [
                {
                    title: t('sidebar.dashboard'),
                    path: isAdmin ? '/admin' : isFormateur ? '/formateur' : isResponsable ? '/participant' : isStudent ? '/student-dashboard' : '/participant',
                    icon: 'dashboard'
                },
                {
                    title: t('sidebar.calendar'),
                    path: '/calendar',
                    icon: 'calendar_today'
                }
            ]
        },
        {
            label: t('sidebar.personnel'),
            items: [
                {
                    title: t('sidebar.profile'),
                    path: '/profile',
                    icon: 'person'
                }
            ]
        }
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-logo">
                    <span className="material-symbols-outlined">anchor</span>
                </div>
                <h2>ASTBA</h2>
            </div>

            <div className="sidebar-user-card">
                <div className="avatar-wrapper">
                    {user?.profileImage ? (
                        <img src={user.profileImage} alt="Avatar" className="avatar-img" />
                    ) : (
                        <div className="avatar-placeholder">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="user-meta">
                    <p className="user-name">{user?.name}</p>
                    <span className={`role-tag ${user?.role}`}>
                        {getRoleLabel(user?.role)}
                    </span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navGroups.map((group, gIdx) => (
                    <div key={gIdx} className="nav-group">
                        <span className="nav-group-label">{group.label}</span>
                        {group.items.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                <span className="material-symbols-outlined nav-symbol">
                                    {item.icon}
                                </span>
                                <span className="nav-text">{item.title}</span>
                                {location.pathname === item.path && (
                                    <div className="active-indicator" />
                                )}
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>
            <div className="sidebar-footer">
                <div className="language-switcher">
                    <LanguageSelector direction="up" />
                </div>

                {/* Color Blindness Accessibility */}
                <div className="accessibility-section">
                    <ColorBlindnessSelector direction="up" />
                </div>

                <button onClick={logout} className="logout-btn">
                    <span className="material-symbols-outlined">logout</span>
                    <span>{t('sidebar.logout')}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
