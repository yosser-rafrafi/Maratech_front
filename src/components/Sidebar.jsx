import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isAdmin = user?.role === 'admin';
    const isFormateur = user?.role === 'formateur';
    const isResponsable = user?.role === 'Responsable';
    const isStudent = user?.role === 'student' || user?.role === 'élève';

    const getRoleLabel = (role) => {
        const roles = {
            admin: 'Administrateur',
            formateur: 'Formateur',
            Responsable: 'Responsable',
            student: 'Élève',
            'élève': 'Élève'
        };
        return roles[role] || role;
    };

    const navGroups = [
        {
            label: 'Principal',
            items: [
                {
                    title: 'Tableau de bord',
                    path: isAdmin ? '/admin' : isFormateur ? '/formateur' : isResponsable ? '/responsable' : '/participant',
                    icon: 'dashboard'
                },
                {
                    title: 'Calendrier Global',
                    path: '/calendar',
                    icon: 'calendar_today'
                }
            ]
        },
        {
            label: 'Personnel',
            items: [
                {
                    title: 'Mon Profil',
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
                <button onClick={logout} className="logout-btn">
                    <span className="material-symbols-outlined">logout</span>
                    <span>Déconnexion</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
