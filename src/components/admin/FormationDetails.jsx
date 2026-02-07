import { useState, useEffect } from 'react';
import api from '../../config/api';

const FormationDetails = ({ formation, onBack }) => {
    const [levels, setLevels] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [formateurs, setFormateurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [activeTab, setActiveTab] = useState('programme'); // 'programme', 'participants'
    const [studentsStats, setStudentsStats] = useState([]);

    const [sessionData, setSessionData] = useState({
        date: '',
        startTime: '',
        duration: '2', // Duration in hours
        formateur: '',
        maxParticipants: 30
    });

    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [enrollUserId, setEnrollUserId] = useState('');
    const [availableStudents, setAvailableStudents] = useState([]);

    useEffect(() => {
        if (showEnrollModal) {
            fetchStudents();
        }
    }, [showEnrollModal]);

    useEffect(() => {
        fetchData();
    }, [formation._id]);

    const fetchData = async () => {
        try {
            const [levelsRes, sessionsRes, usersRes] = await Promise.all([
                api.get(`/formations/${formation._id}/levels`),
                api.get(`/sessions?formation=${formation._id}`),
                api.get('/admin/users') // To get formateurs
            ]);

            setLevels(levelsRes.data.levels);
            setSessions(sessionsRes.data.sessions);
            setFormateurs(usersRes.data.users.filter(u => u.role === 'formateur'));

            // Fetch stats if active tab is participants? Or just fetch all.
            // Let's lazy load stats or fetch now.
            const statsRes = await api.get(`/formations/${formation._id}/stats`);
            setStudentsStats(statsRes.data.students);
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSessionSubmit = async (e) => {
        e.preventDefault();
        try {
            // Calculate endTime from startTime + duration
            const [hours, minutes] = sessionData.startTime.split(':');
            const startDate = new Date();
            startDate.setHours(parseInt(hours), parseInt(minutes), 0);
            startDate.setHours(startDate.getHours() + parseFloat(sessionData.duration));
            const endTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;

            const payload = {
                date: sessionData.date,
                startTime: sessionData.startTime,
                endTime: endTime,
                formateur: sessionData.formateur,
                maxParticipants: sessionData.maxParticipants,
                formation: formation._id,
                level: selectedLevel._id
            };

            if (editingSession) {
                await api.put(`/sessions/${editingSession._id}`, payload);
            } else {
                await api.post('/sessions', payload);
            }

            setShowSessionModal(false);
            setEditingSession(null);
            setSessionData({ date: '', startTime: '', duration: '2', formateur: '', maxParticipants: 30 });
            fetchData(); // Refresh list
        } catch (error) {
            alert(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
        }
    };

    const handleDeleteSession = async (sessionId) => {
        if (window.confirm('Supprimer cette séance ?')) {
            try {
                await api.delete(`/sessions/${sessionId}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting session:', error);
            }
        }
    };

    const openSessionModal = (level, session = null) => {
        setSelectedLevel(level);
        if (session) {
            setEditingSession(session);
            // Calculate duration from start and end times
            const [startH, startM] = session.startTime.split(':').map(Number);
            const [endH, endM] = session.endTime.split(':').map(Number);
            const durationHours = (endH * 60 + endM - startH * 60 - startM) / 60;

            setSessionData({
                date: session.date.split('T')[0],
                startTime: session.startTime,
                duration: String(durationHours),
                formateur: session.formateur?._id || '',
                maxParticipants: session.maxParticipants
            });
        } else {
            setEditingSession(null);
            setSessionData({ date: '', startTime: '', duration: '2', formateur: '', maxParticipants: 30 });
        }
        setShowSessionModal(true);
    };

    const getSessionsForLevel = (levelId) => {
        return sessions.filter(s => s.level === levelId);
    };

    if (loading) return <div>Chargement des détails...</div>;

    const fetchStudents = async () => {
        try {
            const res = await api.get('/admin/users');
            // Filter out admins/formateurs if desired, or just show all
            const students = res.data.users.filter(u => u.role !== 'admin' && u.role !== 'formateur' && u.role !== 'Responsable');
            setAvailableStudents(students);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleEnrollUser = async (e) => {
        e.preventDefault();
        if (!enrollUserId) return;

        try {
            await api.post(`/formations/${formation._id}/enroll`, { userId: enrollUserId });
            setShowEnrollModal(false);
            setEnrollUserId('');
            fetchData(); // Refresh stats
            alert('Utilisateur inscrit avec succès à toutes les séances.');
        } catch (error) {
            alert(error.response?.data?.error || 'Erreur lors de l\'inscription');
        }
    };

    return (
        <div className="dashboard-section animation-fade-in">
            <div className="section-header">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="btn-secondary">← Retour</button>
                    <div>
                        <h2>{formation.title}</h2>
                        <p className="text-slate-500">Gestion des Niveaux et Séances</p>
                    </div>
                </div>
                <div className="flex border-b border-slate-200 mt-4">
                    <button
                        onClick={() => setActiveTab('programme')}
                        className={`py-2 px-4 text-sm font-medium ${activeTab === 'programme' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Programme
                    </button>
                    <button
                        onClick={() => setActiveTab('participants')}
                        className={`py-2 px-4 text-sm font-medium ${activeTab === 'participants' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Participants
                    </button>
                </div>
            </div>

            {activeTab === 'programme' ? (
                <div className="space-y-6">
                    {levels.map((level) => (
                        <div key={level._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="font-semibold text-lg text-slate-800">{level.title}</h3>
                                <button
                                    onClick={() => openSessionModal(level)}
                                    className="btn-small btn-primary"
                                >
                                    + Ajouter Séance
                                </button>
                            </div>

                            <div className="p-4">
                                {getSessionsForLevel(level._id).length === 0 ? (
                                    <p className="text-slate-400 italic text-sm">Aucune séance programmée pour ce niveau.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-slate-500 border-b">
                                                    <th className="pb-2">Date</th>
                                                    <th className="pb-2">Horaire</th>
                                                    <th className="pb-2">Formateur</th>
                                                    <th className="pb-2">Inscrits</th>
                                                    <th className="pb-2 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getSessionsForLevel(level._id).map(session => (
                                                    <tr key={session._id} className="border-b last:border-0 hover:bg-slate-50">
                                                        <td className="py-3">{new Date(session.date).toLocaleDateString()}</td>
                                                        <td className="py-3">{session.startTime} - {session.endTime}</td>
                                                        <td className="py-3">
                                                            {session.formateur ? (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs">
                                                                        {session.formateur.name.charAt(0)}
                                                                    </span>
                                                                    {session.formateur.name}
                                                                </div>
                                                            ) : <span className="text-red-500">Non assigné</span>}
                                                        </td>
                                                        <td className="py-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${session.participants.length >= session.maxParticipants ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                                {session.participants.length} / {session.maxParticipants}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            <button
                                                                onClick={() => openSessionModal(level, session)}
                                                                className="text-slate-600 hover:text-indigo-600 mr-2"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSession(session._id)}
                                                                className="text-slate-600 hover:text-red-600"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Suivi des Participants</h3>
                        <button
                            onClick={() => setShowEnrollModal(true)}
                            className="btn-primary"
                        >
                            + Inscrire un participant
                        </button>
                    </div>

                    {studentsStats.length === 0 ? (
                        <p className="text-slate-500">Aucune donnée de présence disponible.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-slate-500 border-b">
                                        <th className="pb-3">Étudiant</th>
                                        <th className="pb-3">Présences</th>
                                        <th className="pb-3">Progression</th>
                                        <th className="pb-3">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentsStats.map((stat, idx) => (
                                        <tr key={idx} className="border-b last:border-0 hover:bg-slate-50">
                                            <td className="py-3 font-medium">{stat.user.name} <span className="text-slate-400 font-normal">({stat.user.email})</span></td>
                                            <td className="py-3">{stat.attended} / {stat.total}</td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 bg-slate-100 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${stat.progress >= 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                                                            style={{ width: `${stat.progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-bold">{stat.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                {stat.progress >= 100 ? (
                                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Validé</span>
                                                ) : (
                                                    <span className="bg-blue-50 text-blue-800 px-2 py-1 rounded-full text-xs">En cours</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {showSessionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md animation-fade-in">
                        <h2 className="text-xl font-bold mb-4">
                            {editingSession ? 'Modifier la Séance' : 'Nouvelle Séance'}
                        </h2>
                        <p className="text-sm text-slate-500 mb-4">
                            {formation.title} - {selectedLevel?.title}
                        </p>

                        <form onSubmit={handleSessionSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full p-2 border rounded-lg"
                                    value={sessionData.date}
                                    onChange={(e) => setSessionData({ ...sessionData, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Début</label>
                                    <input
                                        type="time"
                                        className="w-full p-2 border rounded-lg"
                                        value={sessionData.startTime}
                                        onChange={(e) => setSessionData({ ...sessionData, startTime: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Durée</label>
                                    <select
                                        className="w-full p-2 border rounded-lg"
                                        value={sessionData.duration}
                                        onChange={(e) => setSessionData({ ...sessionData, duration: e.target.value })}
                                        required
                                    >
                                        <option value="1">1 heure</option>
                                        <option value="1.5">1h30</option>
                                        <option value="2">2 heures</option>
                                        <option value="2.5">2h30</option>
                                        <option value="3">3 heures</option>
                                        <option value="3.5">3h30</option>
                                        <option value="4">4 heures</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Formateur</label>
                                <select
                                    className="w-full p-2 border rounded-lg"
                                    value={sessionData.formateur}
                                    onChange={(e) => setSessionData({ ...sessionData, formateur: e.target.value })}
                                    required
                                >
                                    <option value="">Sélectionner un formateur</option>
                                    {formateurs.map(f => (
                                        <option key={f._id} value={f._id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Places Max</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-lg"
                                    value={sessionData.maxParticipants}
                                    onChange={(e) => setSessionData({ ...sessionData, maxParticipants: e.target.value })}
                                    required
                                    min="1"
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowSessionModal(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary justify-center"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEnrollModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md animation-fade-in">
                        <h2 className="text-xl font-bold mb-4">Inscrire un participant</h2>
                        <p className="text-sm text-slate-500 mb-4">
                            L'utilisateur sera inscrit à <strong>toutes</strong> les séances de cette formation.
                        </p>

                        <form onSubmit={handleEnrollUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Sélectionner un utilisateur</label>
                                <select
                                    className="w-full p-2 border rounded-lg"
                                    value={enrollUserId}
                                    onChange={(e) => setEnrollUserId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Choisir --</option>
                                    {availableStudents.map(student => (
                                        <option key={student._id} value={student._id}>
                                            {student.name} ({student.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowEnrollModal(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary justify-center"
                                    disabled={!enrollUserId}
                                >
                                    Inscrire
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FormationDetails;
