import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const ResponsableDashboard = () => {
    const { user } = useAuth();
    const [formations, setFormations] = useState([]);
    const [selectedFormation, setSelectedFormation] = useState(null);
    const [levels, setLevels] = useState([]);
    const [formateurs, setFormateurs] = useState([]);
    const [sessions, setSessions] = useState([]);

    const [formationData, setFormationData] = useState({ title: '', description: '', duration: '', startDate: '' });
    const [sessionData, setSessionData] = useState({
        level: '', date: '', startTime: '', endTime: '', formateur: '', maxParticipants: 30
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFormations();
        fetchFormateurs();
    }, []);

    const fetchFormations = async () => {
        try {
            const res = await api.get('/formations');
            setFormations(res.data.formations);
            setLoading(false);
        } catch (err) { console.error(err); setLoading(false); }
    };

    const fetchFormateurs = async () => {
        console.log('Fetching formateurs...');
        try {
            const res = await api.get('/admin/formateurs');
            console.log('Formateurs response:', res.data);
            setFormateurs(res.data.users);
        } catch (err) {
            console.error('Error fetching formateurs:', err);
        }
    };

    const fetchLevels = async (id) => {
        console.log('Fetching levels for formation:', id);
        try {
            const res = await api.get(`/formations/${id}/levels`);
            console.log('Levels fetched:', res.data.levels);
            setLevels(res.data.levels);
            fetchSessions(id);
        } catch (err) {
            console.error('Error fetching levels:', err);
        }
    };

    const fetchSessions = async (id) => {
        const res = await api.get(`/sessions?formation=${id}`);
        setSessions(res.data.sessions);
    };

    const handleFormationSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/formations', formationData);
            setFormationData({ title: '', description: '', duration: '', startDate: '' });
            fetchFormations();
        } catch (error) { alert('Erreur lors de la création'); }
    };

    const handleSessionSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Session data being sent:', { ...sessionData, formation: selectedFormation._id });
            await api.post('/sessions', { ...sessionData, formation: selectedFormation._id });
            setSessionData({ level: '', date: '', startTime: '', endTime: '', formateur: '' });
            fetchSessions(selectedFormation._id);
            fetchLevels(selectedFormation._id);
            alert('Session créée avec succès !');
        } catch (error) {
            console.error('Session creation error:', error);
            console.error('Error response:', error.response?.data);
            const errorMsg = error.response?.data?.errors
                ? error.response.data.errors.map(e => e.msg).join(', ')
                : error.response?.data?.error || 'Erreur lors de la création de la session';
            alert(errorMsg);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="main-content">
                <header className="page-header">
                    <div>
                        <h1 style={{ background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '36px' }}>
                            Responsable de Formation
                        </h1>
                        <p>Pilotez l'excellence : Gérez vos programmes et suivez le déploiement des sessions.</p>
                    </div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: '#eef2ff', color: '#6366f1' }}>📚</div>
                        <div className="stat-info">
                            <h3>Total Formations</h3>
                            <div className="stat-value">{formations.length}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>📅</div>
                        <div className="stat-info">
                            <h3>Sessions Totales</h3>
                            <div className="stat-value">{sessions.length}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>🎓</div>
                        <div className="stat-info">
                            <h3>Niveaux Gérés</h3>
                            <div className="stat-value">{levels.length}</div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <section className="dashboard-section">
                        <div className="section-header">
                            <h2>✨ Nouvelle Formation</h2>
                        </div>
                        <form onSubmit={handleFormationSubmit} className="form-card">
                            <div style={{ display: 'grid', gap: '8px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Titre du programme</label>
                                <input
                                    placeholder="ex: Masterclass CyberSécurité"
                                    value={formationData.title}
                                    onChange={(e) => setFormationData({ ...formationData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Description pédagogique</label>
                                <textarea
                                    placeholder="Détaillez les objectifs de formation..."
                                    value={formationData.description}
                                    onChange={(e) => setFormationData({ ...formationData, description: e.target.value })}
                                    required
                                    rows={4}
                                />
                            </div>
                            <div className="time-row">
                                <div style={{ flex: 1, display: 'grid', gap: '8px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Heures totales</label>
                                    <input
                                        type="number"
                                        placeholder="ex: 40"
                                        value={formationData.duration}
                                        onChange={(e) => setFormationData({ ...formationData, duration: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ flex: 1, display: 'grid', gap: '8px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Date de lancement</label>
                                    <input
                                        type="date"
                                        value={formationData.startDate}
                                        onChange={(e) => setFormationData({ ...formationData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '14px' }}>
                                Initialiser le Programme
                            </button>
                        </form>
                    </section>

                    <section className="dashboard-section">
                        <div className="section-header">
                            <h2>📂 Catalogue Actif</h2>
                        </div>
                        <div className="formation-list">
                            {formations.length === 0 ? (
                                <div className="empty-state">Aucune formation encore créée.</div>
                            ) : (
                                formations.map(f => (
                                    <div
                                        key={f._id}
                                        className={`formation-item ${selectedFormation?._id === f._id ? 'active' : ''}`}
                                        onClick={() => {
                                            console.log('Formation clicked:', f);
                                            setSelectedFormation(f);
                                            fetchLevels(f._id);
                                        }}
                                    >
                                        <div className="formation-item-header">
                                            <div className="title-area">
                                                <h3>{f.title}</h3>
                                                <span className="status-badge-small">Actif</span>
                                            </div>
                                            <div className="formation-icon-circle">📚</div>
                                        </div>

                                        <p className="formation-desc">
                                            {f.description.length > 100
                                                ? f.description.substring(0, 100) + '...'
                                                : f.description}
                                        </p>

                                        <div className="formation-tags">
                                            <div className="tag">
                                                <span className="tag-icon">⏱️</span>
                                                <span className="tag-text">{f.duration}h</span>
                                            </div>
                                            <div className="tag">
                                                <span className="tag-icon">📅</span>
                                                <span className="tag-text">{new Date(f.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                            </div>
                                            <div className="tag">
                                                <span className="tag-icon">📊</span>
                                                <span className="tag-text">4 Niveaux</span>
                                            </div>
                                        </div>

                                        <div className="formation-action-hint">
                                            <span>Gérer la structure</span>
                                            <span className="arrow">→</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {selectedFormation && (
                        <section className="dashboard-section full-width" style={{ marginTop: '32px' }}>
                            <div className="section-header">
                                <h2>🛠️ Éditeur de Structure : <span style={{ color: 'var(--primary-color)' }}>{selectedFormation.title}</span></h2>
                            </div>
                            <div className="builder-layout">
                                <div className="form-card session-builder" style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px' }}>
                                    <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Ajouter une Session</h3>

                                    <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Niveau cible</label>
                                        <select
                                            value={sessionData.level}
                                            onChange={(e) => setSessionData({ ...sessionData, level: e.target.value })}
                                            required
                                        >
                                            <option value="">Sélectionner un niveau...</option>
                                            {levels.map(l => <option key={l._id} value={l._id}>{l.title}</option>)}
                                        </select>
                                    </div>

                                    <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Date de la session</label>
                                        <input type="date" value={sessionData.date} onChange={(e) => setSessionData({ ...sessionData, date: e.target.value })} required />
                                    </div>

                                    <div className="time-row" style={{ marginBottom: '16px' }}>
                                        <div style={{ flex: 1, display: 'grid', gap: '8px' }}>
                                            <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Début</label>
                                            <input type="time" value={sessionData.startTime} onChange={(e) => setSessionData({ ...sessionData, startTime: e.target.value })} required />
                                        </div>
                                        <div style={{ flex: 1, display: 'grid', gap: '8px' }}>
                                            <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Fin</label>
                                            <input type="time" value={sessionData.endTime} onChange={(e) => setSessionData({ ...sessionData, endTime: e.target.value })} required />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gap: '8px', marginBottom: '24px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Intervenant (Formateur)</label>
                                        <select
                                            value={sessionData.formateur}
                                            onChange={(e) => setSessionData({ ...sessionData, formateur: e.target.value })}
                                            required
                                        >
                                            <option value="">Assigner un expert...</option>
                                            {formateurs.map(form => <option key={form._id} value={form._id}>{form.name}</option>)}
                                        </select>
                                    </div>

                                    <button type="submit" onClick={handleSessionSubmit} className="btn-primary" style={{ width: '100%', padding: '14px' }}>
                                        Confirmer la Session
                                    </button>
                                </div>

                                <div className="levels-overview">
                                    {levels.map(l => {
                                        const levelSessions = sessions.filter(s => s.level?._id === l._id || s.level === l._id);
                                        return (
                                            <div key={l._id} className="level-box">
                                                <h4>{l.title}</h4>
                                                <div className="session-dots">
                                                    {[1, 2, 3, 4, 5, 6].map(num => {
                                                        const isFilled = levelSessions.length >= num;
                                                        return (
                                                            <div
                                                                key={num}
                                                                className={`dot ${isFilled ? 'filled' : ''}`}
                                                                title={isFilled ? `Session ${num} : ${new Date(levelSessions[num - 1].date).toLocaleDateString()}` : `Session ${num} (Libre)`}
                                                            ></div>
                                                        );
                                                    })}
                                                </div>
                                                <span className="level-status">
                                                    {levelSessions.length} / 6 Sessions
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ResponsableDashboard;
