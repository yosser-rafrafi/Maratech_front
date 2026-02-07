import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const FormateurDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [assignedFormations, setAssignedFormations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchSessions(), fetchAssignedFormations()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const fetchAssignedFormations = async () => {
        try {
            const response = await api.get('/formations/assigned');
            setAssignedFormations(response.data.formations);
        } catch (error) {
            console.error('Error fetching assigned formations:', error);
        }
    };

    const fetchSessions = async () => {
        try {
            const response = await api.get('/sessions');
            const mySessions = response.data.sessions.filter(
                s => s.formateur?._id === user.id
            );

            // Filter to show only this week's sessions
            const now = new Date();
            const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() + mondayOffset);
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            const thisWeekSessions = mySessions.filter(s => {
                const sessionDate = new Date(s.date);
                return sessionDate >= weekStart && sessionDate <= weekEnd;
            });

            setSessions(thisWeekSessions);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const filteredFormations = assignedFormations.filter(f =>
        f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSessions = sessions.filter(s =>
        s.formation?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats Calculation
    const dashboardStats = [
        { label: 'Formations', value: assignedFormations.length, icon: '📚', color: '#6366f1' },
        { label: 'Sessions Actives', value: sessions.length, icon: '📅', color: '#8b5cf6' },
        { label: 'Total Heures', value: assignedFormations.reduce((acc, curr) => acc + curr.duration, 0), icon: '⏱', color: '#ec4899' },
        { label: 'Taux Présence', value: '85%', icon: '📈', color: '#10b981' } // Mock/Summary Rate
    ];

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <main className="main-content">
                    <div className="empty-state">Chargement de votre espace...</div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="main-content">
                <header className="page-header">
                    <div>
                        <h1>Espace Formateur</h1>
                        <p>Bienvenue, {user.name}. Voici un résumé de votre activité.</p>
                    </div>
                </header>

                <div className="stats-grid">
                    {dashboardStats.map((stat, idx) => (
                        <div key={idx} className="stat-card">
                            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className="stat-info">
                                <h3>{stat.label}</h3>
                                <div className="stat-value">{stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Rechercher une formation ou une session..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <section className="dashboard-section">
                    <div className="section-header">
                        <h2>Mes Formations Assignées</h2>
                    </div>
                    {filteredFormations.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📂</span>
                            <p>{searchTerm ? 'Aucun résultat pour votre recherche.' : 'Aucune formation assignée pour le moment.'}</p>
                        </div>
                    ) : (
                        <div className="cards-grid">
                            {filteredFormations.map((formation) => (
                                <div key={formation._id} className="card">
                                    <h3>{formation.title}</h3>
                                    <p>{formation.description}</p>
                                    <div className="card-meta">
                                        <span>⏱ {formation.duration} heures</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="dashboard-section">
                    <div className="section-header">
                        <h2>Mes Sessions</h2>
                    </div>
                    {filteredSessions.length === 0 ? (
                        <div className="empty-state">
                            <p>{searchTerm ? 'Aucune session trouvée.' : 'Aucune session programmée.'}</p>
                        </div>
                    ) : (
                        <div className="cards-grid">
                            {filteredSessions.map((session) => (
                                <div key={session._id} className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3>{session.formation?.title}</h3>
                                        <span className="status-badge status-present">Actif</span>
                                    </div>
                                    <div className="card-meta">
                                        <span>📅 {new Date(session.date).toLocaleDateString()}</span>
                                        <span>⏰ {session.startTime} - {session.endTime}</span>
                                    </div>
                                    <p className="card-meta">Participants: <strong>{session.participants?.length}/{session.maxParticipants}</strong></p>
                                    <button
                                        onClick={() => navigate(`/attendance/${session._id}`)}
                                        className="btn-primary"
                                        style={{ marginTop: '16px', width: '100%' }}
                                    >
                                        📋 Gérer les présences
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default FormateurDashboard;
