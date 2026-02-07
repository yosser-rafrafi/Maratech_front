import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isAdmin = user?.role === 'admin';
    const isFormateur = user?.role === 'formateur';
    const isResponsable = user?.role === 'Responsable';

    const menuItems = [
        {
            title: isAdmin ? 'Administration' : isFormateur ? 'Mes Sessions' : 'Gestion Formations',
            path: isAdmin ? '/admin' : isFormateur ? '/formateur' : '/participant',
            icon: isAdmin ? '👥' : isFormateur ? '📅' : '🏗️'
        },
        {
            title: 'Calendrier Global',
            path: '/calendar',
            icon: '🗓️'
        }
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-brand">
                <span className="brand-logo">⚓</span>
                <h2>ASTBA</h2>
            </div>

            <div className="sidebar-user">
                <div className="avatar">
                    {user?.profileImage ? (
                        <img src={user.profileImage} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        user?.name?.charAt(0)
                    )}
                </div>
                <div className="user-info">
                    <p className="user-name">{user?.name}</p>
                    <p className="user-role">{user?.role}</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
                    <span className="nav-icon">👤</span>
                    Mon Profil
                </Link>
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {item.title}
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button onClick={logout} className="btn-sidebar-logout">
                    <span className="nav-icon">🚪</span> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
