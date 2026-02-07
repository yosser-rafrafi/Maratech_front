import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const FormateurDashboard = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [assignedFormations, setAssignedFormations] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [attendance, setAttendance] = useState([]);
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
            setSessions(mySessions);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const fetchAttendance = async (sessionId) => {
        try {
            const response = await api.get(`/attendance/session/${sessionId}`);
            setAttendance(response.data.attendance);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    const markAttendance = async (sessionId, participantId, status) => {
        try {
            await api.post('/attendance', {
                session: sessionId,
                participant: participantId,
                status
            });
            fetchAttendance(sessionId);
        } catch (error) {
            alert(error.response?.data?.error || 'Error marking attendance');
        }
    };

    const viewSessionDetails = (session) => {
        setSelectedSession(session);
        fetchAttendance(session._id);
        // Scroll to details
        setTimeout(() => {
            document.getElementById('attendance-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const filteredFormations = assignedFormations.filter(f =>
        f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSessions = sessions.filter(s =>
        s.formation?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats Calculation
    const stats = [
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
                    {stats.map((stat, idx) => (
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
                                        onClick={() => viewSessionDetails(session)}
                                        className="btn-primary"
                                        style={{ marginTop: '16px', width: '100%' }}
                                    >
                                        Gérer les présences
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {selectedSession && (
                    <section id="attendance-section" className="dashboard-section animation-fade-in">
                        <div className="section-header">
                            <div>
                                <h2 style={{ marginBottom: '4px' }}>Feuille de Présence</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Session : {selectedSession.formation?.title}</p>
                            </div>
                            <button className="btn-small" onClick={() => setSelectedSession(null)}>Fermer</button>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Participant</th>
                                        <th>Email</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedSession.participants?.map((participant) => {
                                        const attendanceRecord = attendance.find(
                                            a => a.participant?._id === participant._id
                                        );

                                        return (
                                            <tr key={participant._id}>
                                                <td>
                                                    <div className="participant-info-cell">
                                                        <strong>{participant.name}</strong>
                                                        <button
                                                            className="btn-link"
                                                            onClick={async () => {
                                                                try {
                                                                    const res = await api.get(`/formations/progress/${selectedSession.formation._id}/${participant._id}`);
                                                                    const p = res.data;
                                                                    alert(`Progression de ${participant.name}:\n- Complétées: ${p.attendedSessions}\n- Manquées: ${p.missedSessions}\n- Restantes: ${p.remainingSessions}\n- Score: ${p.progress}%`);
                                                                } catch (err) {
                                                                    alert('Erreur lors de la récupération de la progression');
                                                                }
                                                            }}
                                                        >📊 Voir Progrès</button>
                                                    </div>
                                                </td>
                                                <td>{participant.email}</td>
                                                <td>
                                                    <span className={`status-badge status-${attendanceRecord?.status || 'absent'}`}>
                                                        {attendanceRecord ? (
                                                            attendanceRecord.status === 'present' ? 'Présent' :
                                                                attendanceRecord.status === 'late' ? 'En retard' : 'Absent'
                                                        ) : 'Non marqué'}
                                                    </span>
                                                </td>
                                                <td className="action-buttons">
                                                    <button
                                                        onClick={() => markAttendance(selectedSession._id, participant._id, 'present')}
                                                        className="btn-small btn-success"
                                                    >Présent</button>
                                                    <button
                                                        onClick={() => markAttendance(selectedSession._id, participant._id, 'late')}
                                                        className="btn-small btn-warning"
                                                    >Retard</button>
                                                    <button
                                                        onClick={() => markAttendance(selectedSession._id, participant._id, 'absent')}
                                                        className="btn-small btn-danger"
                                                    >Absent</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default FormateurDashboard;
