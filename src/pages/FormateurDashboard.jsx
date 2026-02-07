import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import { StatCard, AttendanceChart } from '../components/DashboardCharts';
import './Dashboard.css';

const FormateurDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [allSessions, setAllSessions] = useState([]); // Store all sessions for formation details
    const [assignedFormations, setAssignedFormations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [viewingFormation, setViewingFormation] = useState(null); // For detailed view

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const mySessions = await fetchSessions();
            await fetchAssignedFormations(mySessions);
            setLoading(false);
        };
        loadData();
    }, []);

    const fetchAssignedFormations = async (sessionsData = []) => {
        try {
            const response = await api.get('/formations/assigned');
            let formations = response.data.formations || [];

            // Fallback: If sessions exist but no formations are returned, extract from sessions
            if (formations.length === 0 && sessionsData.length > 0) {
                console.log('Falling back to extracting formations from sessions...');
                const seenIds = new Set();
                sessionsData.forEach(s => {
                    if (s.formation && !seenIds.has(s.formation._id)) {
                        seenIds.add(s.formation._id);
                        formations.push(s.formation);
                    }
                });
            }

            setAssignedFormations(formations);
        } catch (error) {
            console.error('Error fetching assigned formations:', error);
            // Fallback on error too
            if (sessionsData.length > 0) {
                const seenIds = new Set();
                const formations = [];
                sessionsData.forEach(s => {
                    if (s.formation && !seenIds.has(s.formation._id)) {
                        seenIds.add(s.formation._id);
                        formations.push(s.formation);
                    }
                });
                setAssignedFormations(formations);
            }
        }
    };

    const fetchSessions = async () => {
        try {
            const response = await api.get('/sessions');
            const mySessions = response.data.sessions.filter(
                s => s.formateur?._id === user.id
            );

            // Store all sessions for formation details
            setAllSessions(mySessions);

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
            return mySessions; // Return for loadData
        } catch (error) {
            console.error('Error fetching sessions:', error);
            return [];
        }
    };

    const filteredFormations = assignedFormations.filter(f =>
        (f.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (f.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const filteredSessions = sessions.filter(s =>
        (s.formation?.title?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
                        <p>Bienvenue, {user.name}. Suivi pédagogique et présences.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
                    {dashboardStats.map((stat, idx) => (
                        <StatCard
                            key={idx}
                            title={stat.label}
                            value={stat.value}
                            icon={stat.icon} // You might need to map icons to Material Symbols names or pass components
                            color={stat.color}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Taux de Présence Hebdomadaire</h3>
                        <div className="h-64">
                            <AttendanceChart />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Prochaines Sessions</h3>
                        {/* Compact list of sessions could go here */}
                        <div className="text-sm text-slate-500 italic">Voir la liste complète ci-dessous</div>
                    </div>
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

                {!viewingFormation ? (
                    /* Initial View: List of assigned formations AND all upcoming sessions */
                    <>
                        <section className="dashboard-section">
                            <div className="section-header">
                                <h2 className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-600">school</span>
                                    Mes Formations Assignées
                                </h2>
                            </div>

                            {filteredFormations.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">📂</span>
                                    <p>{searchTerm ? 'Aucun résultat pour votre recherche.' : 'Aucune formation assignée pour le moment.'}</p>
                                </div>
                            ) : (
                                <div className="cards-grid">
                                    {filteredFormations.map((formation) => (
                                        <div
                                            key={formation._id}
                                            className="card cursor-pointer hover:shadow-lg transition-all duration-300"
                                            onClick={() => setViewingFormation(formation)}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-xl font-bold text-slate-800 m-0">{formation.title}</h3>
                                                <span className="material-symbols-outlined text-indigo-400">arrow_forward</span>
                                            </div>
                                            <p className="text-slate-600 line-clamp-2 mb-4">
                                                {formation.description || 'Pas de description disponible.'}
                                            </p>
                                            <div className="card-meta">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>schedule</span>
                                                    {formation.duration}h
                                                </span>
                                                <span className="flex items-center gap-1 text-indigo-600 font-medium">
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_month</span>
                                                    {allSessions.filter(s => s.formation?._id === formation._id).length} séances
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="dashboard-section mt-8">
                            <div className="section-header">
                                <h2 className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-600">event_available</span>
                                    Mes Sessions de la Semaine
                                </h2>
                            </div>

                            {filteredSessions.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">📅</span>
                                    <p>{searchTerm ? 'Aucune session trouvée pour ce terme.' : 'Aucune session programmée cette semaine.'}</p>
                                </div>
                            ) : (
                                <div className="cards-grid">
                                    {filteredSessions.map((session) => (
                                        <div key={session._id} className="card border-l-4 border-l-purple-500">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <h3 className="font-bold text-slate-800">{session.formation?.title || 'Formation inconnue'}</h3>
                                                <span className="status-badge status-present">Planifié</span>
                                            </div>
                                            <div className="card-meta mt-4">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_today</span>
                                                    {new Date(session.date).toLocaleDateString('fr-FR')}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>schedule</span>
                                                    {session.startTime} - {session.endTime}
                                                </span>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between">
                                                <p className="text-sm font-medium m-0">
                                                    Participants: <span className="text-indigo-600">{session.participants?.length || 0}/{session.maxParticipants || 30}</span>
                                                </p>
                                                <button
                                                    onClick={() => navigate(`/attendance/${session._id}`)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>fact_check</span>
                                                    Présences
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                ) : (
                    /* Detailed Formation View */
                    <section className="dashboard-section animate-fade-in">
                        <button
                            onClick={() => setViewingFormation(null)}
                            className="mb-8 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold transition-all hover:gap-3"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                            Retour à la liste des formations
                        </button>

                        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-10 transition-all">
                            <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-10 text-white relative">
                                <div className="relative z-10">
                                    <h2 className="text-4xl font-black mb-4 tracking-tight">{viewingFormation.title}</h2>
                                    <p className="text-indigo-100 text-xl max-w-2xl leading-relaxed">
                                        {viewingFormation.description || 'Cette formation ne contient pas de description détaillée.'}
                                    </p>
                                </div>
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <span className="material-symbols-outlined" style={{ fontSize: '120px' }}>school</span>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                    <div className="flex items-center gap-4 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                                        <div className="p-3 bg-white rounded-xl shadow-sm">
                                            <span className="material-symbols-outlined text-indigo-600 text-3xl">timer</span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-indigo-900/40 uppercase tracking-wider">Durée Totale</div>
                                            <div className="text-2xl font-black text-indigo-900">{viewingFormation.duration}h</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                                        <div className="p-3 bg-white rounded-xl shadow-sm">
                                            <span className="material-symbols-outlined text-purple-600 text-3xl">event_repeat</span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-purple-900/40 uppercase tracking-wider">Total Séances</div>
                                            <div className="text-2xl font-black text-purple-900">
                                                {allSessions.filter(s => s.formation?._id === viewingFormation._id).length}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <div className="p-3 bg-white rounded-xl shadow-sm">
                                            <span className="material-symbols-outlined text-emerald-600 text-3xl">group</span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-emerald-900/40 uppercase tracking-wider">Participants</div>
                                            <div className="text-2xl font-black text-emerald-900">
                                                {allSessions
                                                    .filter(s => s.formation?._id === viewingFormation._id)
                                                    .reduce((sum, s) => sum + (s.participants?.length || 0), 0)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                        <span className="material-symbols-outlined text-indigo-600">calendar_month</span>
                                        Déroulement des séances
                                    </h3>
                                </div>

                                {allSessions.filter(s => s.formation?._id === viewingFormation._id).length === 0 ? (
                                    <div className="empty-state p-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                        <span className="empty-icon text-6xl mb-4">📅</span>
                                        <p className="text-lg font-bold text-slate-400">Aucune séance n'est encore programmée pour cette formation.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {allSessions
                                            .filter(s => s.formation?._id === viewingFormation._id)
                                            .sort((a, b) => new Date(a.date) - new Date(b.date))
                                            .map((session, index) => (
                                                <div
                                                    key={session._id}
                                                    className="group flex items-center justify-between p-6 bg-white hover:bg-slate-50 rounded-2xl transition-all border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1"
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-indigo-200">
                                                            <div className="text-xs font-black uppercase opacity-80">
                                                                {new Date(session.date).toLocaleDateString('fr-FR', { month: 'short' })}
                                                            </div>
                                                            <div className="text-3xl font-black">
                                                                {new Date(session.date).getDate()}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
                                                                Séance {index + 1}
                                                            </div>
                                                            <div className="text-xl font-bold text-slate-800 mb-2">
                                                                {new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                            </div>
                                                            <div className="flex items-center gap-5">
                                                                <span className="flex items-center gap-2 text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>schedule</span>
                                                                    {session.startTime} - {session.endTime}
                                                                </span>
                                                                <span className="flex items-center gap-2 text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span>
                                                                    {session.participants?.length || 0} / {session.maxParticipants || 30}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`/attendance/${session._id}`)}
                                                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-md hover:shadow-xl hover:translate-x-1"
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>fact_check</span>
                                                        Appel / Présences
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default FormateurDashboard;
