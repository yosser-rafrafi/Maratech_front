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
        try {
            const res = await api.get('/admin/users');
            setFormateurs(res.data.users.filter(u => u.role === 'formateur'));
        } catch (err) { console.error(err); }
    };

    const fetchLevels = async (id) => {
        const res = await api.get(`/formations/${id}/levels`);
        setLevels(res.data.levels);
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
            await api.post('/sessions', { ...sessionData, formation: selectedFormation._id });
            setSessionData({ level: '', date: '', startTime: '', endTime: '', formateur: '', maxParticipants: 30 });
            alert('Session ajoutée au niveau !');
        } catch (error) { alert(error.response?.data?.error || 'Erreur lors de l\'ajout'); }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="main-content">
                <header className="page-header">
                    <div>
                        <h1>Responsable de Formation</h1>
                        <p>Structurez vos formations : 4 niveaux, 6 sessions par niveau.</p>
                    </div>
                </header>

                <div className="dashboard-grid">
                    <section className="dashboard-section">
                        <div className="section-header">
                            <h2>Créer une Formation</h2>
                        </div>
                        <form onSubmit={handleFormationSubmit} className="form-card">
                            <input
                                placeholder="Titre (ex: Sécurité Incendie)"
                                value={formationData.title}
                                onChange={(e) => setFormationData({ ...formationData, title: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Description du programme"
                                value={formationData.description}
                                onChange={(e) => setFormationData({ ...formationData, description: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Volume horaire"
                                value={formationData.duration}
                                onChange={(e) => setFormationData({ ...formationData, duration: e.target.value })}
                                required
                            />
                            <input
                                type="date"
                                title="Date de début"
                                value={formationData.startDate}
                                onChange={(e) => setFormationData({ ...formationData, startDate: e.target.value })}
                                required
                            />
                            <button type="submit" className="btn-primary">Créer & Initialiser Niveaux</button>
                        </form>
                    </section>

                    <section className="dashboard-section">
                        <h2>Vos Formations</h2>
                        <div className="formation-list">
                            {formations.map(f => (
                                <div key={f._id} className={`formation-item ${selectedFormation?._id === f._id ? 'active' : ''}`} onClick={() => {
                                    setSelectedFormation(f);
                                    fetchLevels(f._id);
                                }}>
                                    <h3>{f.title}</h3>
                                    <p>{f.description.substring(0, 50)}...</p>
                                    <span>📅 Début: {new Date(f.startDate).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {selectedFormation && (
                        <section className="dashboard-section full-width">
                            <div className="section-header">
                                <h2>Structure de : {selectedFormation.title}</h2>
                            </div>
                            <div className="builder-layout">
                                <form onSubmit={handleSessionSubmit} className="form-card session-builder">
                                    <h3>Ajouter une Session</h3>
                                    <select
                                        value={sessionData.level}
                                        onChange={(e) => setSessionData({ ...sessionData, level: e.target.value })}
                                        required
                                    >
                                        <option value="">Choisir un Niveau</option>
                                        {levels.map(l => <option key={l._id} value={l._id}>{l.title}</option>)}
                                    </select>
                                    <input type="date" value={sessionData.date} onChange={(e) => setSessionData({ ...sessionData, date: e.target.value })} required />
                                    <div className="time-row">
                                        <input type="time" title="Début" value={sessionData.startTime} onChange={(e) => setSessionData({ ...sessionData, startTime: e.target.value })} required />
                                        <input type="time" title="Fin" value={sessionData.endTime} onChange={(e) => setSessionData({ ...sessionData, endTime: e.target.value })} required />
                                    </div>
                                    <select
                                        value={sessionData.formateur}
                                        onChange={(e) => setSessionData({ ...sessionData, formateur: e.target.value })}
                                        required
                                    >
                                        <option value="">Assigner Formateur</option>
                                        {formateurs.map(form => <option key={form._id} value={form._id}>{form.name}</option>)}
                                    </select>
                                    <button type="submit" className="btn-primary">Ajouter Session au Niveau</button>
                                </form>

                                <div className="levels-overview">
                                    {levels.map(l => (
                                        <div key={l._id} className="level-box">
                                            <h4>{l.title}</h4>
                                            <div className="session-dots">
                                                {/* In a real implementation, we'd fetch sessions per level here */}
                                                <div className="dot filled" title="Session 1"></div>
                                                <div className="dot filled" title="Session 2"></div>
                                                <div className="dot" title="Session 3"></div>
                                                <div className="dot" title="Session 4"></div>
                                                <div className="dot" title="Session 5"></div>
                                                <div className="dot" title="Session 6"></div>
                                            </div>
                                        </div>
                                    ))}
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
