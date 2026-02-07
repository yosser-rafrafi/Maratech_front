import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const ParticipantDashboard = () => {
    const { user } = useAuth();
    const [availableSessions, setAvailableSessions] = useState([]);
    const [mySessions, setMySessions] = useState([]);
    const [missedSessions, setMissedSessions] = useState([]);
    const [progressData, setProgressData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            await fetchSessions();
            await fetchMissedSessions();
            setLoading(false);
        };
        loadDashboard();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await api.get('/sessions');
            const allSessions = response.data.sessions;

            const enrolled = allSessions.filter(s =>
                s.participants?.some(p => p._id === user.id)
            );
            const available = allSessions.filter(s =>
                !s.participants?.some(p => p._id === user.id)
            );

            setMySessions(enrolled);
            setAvailableSessions(available);

            // Fetch progress for unique formations enrolled
            const uniqueFormationIds = [...new Set(enrolled.map(s => s.formation?._id))].filter(Boolean);
            uniqueFormationIds.forEach(id => fetchProgress(id));
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const fetchMissedSessions = async () => {
        try {
            const response = await api.get('/sessions/missed');
            setMissedSessions(response.data.sessions);
        } catch (error) {
            console.error('Error fetching missed sessions:', error);
        }
    };

    const fetchProgress = async (formationId) => {
        try {
            const response = await api.get(`/formations/progress/${formationId}`);
            setProgressData(prev => ({
                ...prev,
                [formationId]: response.data
            }));
        } catch (error) {
            console.error(`Error fetching progress for ${formationId}:`, error);
        }
    };

    const enrollInSession = async (sessionId) => {
        try {
            await api.post(`/sessions/${sessionId}/enroll`);
            fetchSessions();
        } catch (error) {
            alert(error.response?.data?.error || 'Error enrolling');
        }
    };

    const unenrollFromSession = async (sessionId) => {
        try {
            await api.post(`/sessions/${sessionId}/unenroll`);
            fetchSessions();
        } catch (error) {
            alert(error.response?.data?.error || 'Error unenrolling');
        }
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <main className="main-content">
                    <div className="empty-state">Chargement de votre parcours...</div>
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
                        <h1>Espace Responsable Formation</h1>
                        <p>Inscrivez-vous aux sessions et suivez votre progression en temps réel.</p>
                    </div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0ea5e9' }}>📚</div>
                        <div className="stat-info">
                            <h3>Inscriptions</h3>
                            <div className="stat-value">{mySessions.length}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>⚠️</div>
                        <div className="stat-info">
                            <h3>Séances Manquées</h3>
                            <div className="stat-value">{missedSessions.length}</div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <section className="dashboard-section">
                        <div className="section-header">
                            <h2>Progression par Formation</h2>
                        </div>
                        {mySessions.length === 0 ? (
                            <div className="empty-state">
                                <p>Inscrivez-vous à une session pour voir votre progression.</p>
                            </div>
                        ) : (
                            <div className="progress-list">
                                {[...new Set(mySessions.map(s => s.formation?._id))].filter(Boolean).map(formationId => {
                                    const formation = mySessions.find(s => s.formation?._id === formationId)?.formation;
                                    const progress = progressData[formationId];

                                    return (
                                        <div key={formationId} className="progress-card">
                                            <div className="progress-info">
                                                <h3>{formation?.title}</h3>
                                                <span>{progress ? `${progress.progress}%` : '...'}</span>
                                            </div>
                                            <div className="progress-bar-bg">
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{ width: `${progress?.progress || 0}%` }}
                                                ></div>
                                            </div>
                                            <div className="progress-meta">
                                                {progress && (
                                                    <span>{progress.attendedSessions} / {progress.totalSessions} séances complétées</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <section className="dashboard-section">
                        <div className="section-header">
                            <h2>Séances Manquées</h2>
                        </div>
                        {missedSessions.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">✅</span>
                                <p>Félicitations ! Vous n'avez manqué aucune séance.</p>
                            </div>
                        ) : (
                            <div className="missed-list">
                                {missedSessions.map((session) => (
                                    <div key={session._id} className="missed-item">
                                        <div className="missed-info">
                                            <strong>{session.formation?.title}</strong>
                                            <span>{new Date(session.date).toLocaleDateString()}</span>
                                        </div>
                                        <span className="status-badge status-absent">Absent</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <section className="dashboard-section">
                    <div className="section-header">
                        <h2>Sessions Disponibles</h2>
                    </div>
                    {availableSessions.length === 0 ? (
                        <p className="empty-state">Aucune nouvelle session disponible.</p>
                    ) : (
                        <div className="cards-grid">
                            {availableSessions.map((session) => (
                                <div key={session._id} className="card">
                                    <h3>{session.formation?.title}</h3>
                                    <p>{session.formation?.description}</p>
                                    <div className="card-meta">
                                        <span>📅 {new Date(session.date).toLocaleDateString()}</span>
                                        <span>👥 {session.participants?.length}/{session.maxParticipants}</span>
                                    </div>
                                    <button
                                        onClick={() => enrollInSession(session._id)}
                                        className="btn-primary"
                                        style={{ width: '100%', marginTop: '16px' }}
                                        disabled={session.participants?.length >= session.maxParticipants}
                                    >
                                        S'inscrire
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

export default ParticipantDashboard;
