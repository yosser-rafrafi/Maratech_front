import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import './Dashboard.css';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [formations, setFormations] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [showFormationForm, setShowFormationForm] = useState(false);
    const [showSessionForm, setShowSessionForm] = useState(false);
    const [formationData, setFormationData] = useState({ title: '', description: '', duration: '' });
    const [sessionData, setSessionData] = useState({
        formation: '', date: '', startTime: '', endTime: '', formateur: '', maxParticipants: 30
    });
    const [editingFormation, setEditingFormation] = useState(null);

    useEffect(() => {
        fetchFormations();
        fetchSessions();
    }, []);

    const fetchFormations = async () => {
        try {
            const response = await api.get('/formations');
            setFormations(response.data.formations);
        } catch (error) {
            console.error('Error fetching formations:', error);
        }
    };

    const fetchSessions = async () => {
        try {
            const response = await api.get('/sessions');
            setSessions(response.data.sessions);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const handleFormationSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingFormation) {
                await api.put(`/formations/${editingFormation}`, formationData);
            } else {
                await api.post('/formations', formationData);
            }
            setFormationData({ title: '', description: '', duration: '' });
            setShowFormationForm(false);
            setEditingFormation(null);
            fetchFormations();
        } catch (error) {
            alert(error.response?.data?.error || 'Error saving formation');
        }
    };

    const handleSessionSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/sessions', sessionData);
            setSessionData({ formation: '', date: '', startTime: '', endTime: '', formateur: '', maxParticipants: 30 });
            setShowSessionForm(false);
            fetchSessions();
        } catch (error) {
            alert(error.response?.data?.error || 'Error creating session');
        }
    };

    const deleteFormation = async (id) => {
        if (window.confirm('Are you sure you want to delete this formation?')) {
            try {
                await api.delete(`/formations/${id}`);
                fetchFormations();
            } catch (error) {
                alert(error.response?.data?.error || 'Error deleting formation');
            }
        }
    };

    const deleteSession = async (id) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            try {
                await api.delete(`/sessions/${id}`);
                fetchSessions();
            } catch (error) {
                alert(error.response?.data?.error || 'Error deleting session');
            }
        }
    };

    const editFormation = (formation) => {
        setFormationData({
            title: formation.title,
            description: formation.description,
            duration: formation.duration
        });
        setEditingFormation(formation._id);
        setShowFormationForm(true);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Welcome, {user?.name}</p>
                </div>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
            </header>

            <div className="dashboard-content">
                {/* Formations Section */}
                <section className="dashboard-section">
                    <div className="section-header">
                        <h2>Formations</h2>
                        <button onClick={() => setShowFormationForm(!showFormationForm)} className="btn-add">
                            {showFormationForm ? 'Cancel' : '+ Add Formation'}
                        </button>
                    </div>

                    {showFormationForm && (
                        <form onSubmit={handleFormationSubmit} className="form-card">
                            <input
                                type="text"
                                placeholder="Formation Title"
                                value={formationData.title}
                                onChange={(e) => setFormationData({ ...formationData, title: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={formationData.description}
                                onChange={(e) => setFormationData({ ...formationData, description: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Duration (hours)"
                                value={formationData.duration}
                                onChange={(e) => setFormationData({ ...formationData, duration: e.target.value })}
                                required
                                min="1"
                            />
                            <button type="submit" className="btn-submit">
                                {editingFormation ? 'Update Formation' : 'Create Formation'}
                            </button>
                        </form>
                    )}

                    <div className="cards-grid">
                        {formations.map((formation) => (
                            <div key={formation._id} className="card">
                                <h3>{formation.title}</h3>
                                <p>{formation.description}</p>
                                <p className="card-meta">Duration: {formation.duration} hours</p>
                                <p className="card-meta">Created by: {formation.createdBy?.name}</p>
                                <div className="card-actions">
                                    <button onClick={() => editFormation(formation)} className="btn-edit">Edit</button>
                                    <button onClick={() => deleteFormation(formation._id)} className="btn-delete">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Sessions Section */}
                <section className="dashboard-section">
                    <div className="section-header">
                        <h2>Sessions</h2>
                        <button onClick={() => setShowSessionForm(!showSessionForm)} className="btn-add">
                            {showSessionForm ? 'Cancel' : '+ Add Session'}
                        </button>
                    </div>

                    {showSessionForm && (
                        <form onSubmit={handleSessionSubmit} className="form-card">
                            <select
                                value={sessionData.formation}
                                onChange={(e) => setSessionData({ ...sessionData, formation: e.target.value })}
                                required
                            >
                                <option value="">Select Formation</option>
                                {formations.map((f) => (
                                    <option key={f._id} value={f._id}>{f.title}</option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={sessionData.date}
                                onChange={(e) => setSessionData({ ...sessionData, date: e.target.value })}
                                required
                            />
                            <input
                                type="time"
                                placeholder="Start Time"
                                value={sessionData.startTime}
                                onChange={(e) => setSessionData({ ...sessionData, startTime: e.target.value })}
                                required
                            />
                            <input
                                type="time"
                                placeholder="End Time"
                                value={sessionData.endTime}
                                onChange={(e) => setSessionData({ ...sessionData, endTime: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Formateur ID"
                                value={sessionData.formateur}
                                onChange={(e) => setSessionData({ ...sessionData, formateur: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Max Participants"
                                value={sessionData.maxParticipants}
                                onChange={(e) => setSessionData({ ...sessionData, maxParticipants: e.target.value })}
                                min="1"
                            />
                            <button type="submit" className="btn-submit">Create Session</button>
                        </form>
                    )}

                    <div className="cards-grid">
                        {sessions.map((session) => (
                            <div key={session._id} className="card">
                                <h3>{session.formation?.title}</h3>
                                <p className="card-meta">Date: {new Date(session.date).toLocaleDateString()}</p>
                                <p className="card-meta">Time: {session.startTime} - {session.endTime}</p>
                                <p className="card-meta">Formateur: {session.formateur?.name}</p>
                                <p className="card-meta">Participants: {session.participants?.length}/{session.maxParticipants}</p>
                                <div className="card-actions">
                                    <button onClick={() => deleteSession(session._id)} className="btn-delete">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
