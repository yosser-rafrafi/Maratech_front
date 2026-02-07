import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';

const StudentDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        stats: {
            totalFormations: 0,
            totalSessionsAttended: 0,
            totalMissedSessions: 0
        },
        formations: [],
        upcomingSessions: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/student/dashboard');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching student dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="main-content">
                <header className="page-header mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {t('welcome_back', 'Welcome back')}, {user?.name?.split(' ')[0]}!
                        </h1>
                        <p className="text-slate-500">
                            {t('student_dashboard_subtitle', 'Here is your learning progress overview.')}
                        </p>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">school</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Formations (Courses)</p>
                            <h3 className="text-2xl font-bold text-slate-900">{data.stats.totalFormations}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">check_circle</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Sessions Attended</p>
                            <h3 className="text-2xl font-bold text-slate-900">{data.stats.totalSessionsAttended}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">warning</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Missed Sessions</p>
                            <h3 className="text-2xl font-bold text-slate-900">{data.stats.totalMissedSessions}</h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* My Formations List */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-slate-800">My Formations</h2>

                        {data.formations.length === 0 ? (
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-500">
                                You are not enrolled in any formations yet.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {data.formations.map(formation => (
                                    <div key={formation._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900">{formation.title}</h3>
                                                <div className="flex gap-2 mt-1">
                                                    {formation.levels.map((lvl, idx) => (
                                                        <span key={idx} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-md font-medium border border-blue-100">
                                                            {lvl}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-blue-600">{formation.progress}%</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                                style={{ width: `${formation.progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>{formation.attendedSessions} attended</span>
                                            <span>{formation.totalSessions} total sessions</span>
                                        </div>

                                        {formation.missedSessions > 0 && (
                                            <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                                                <span className="material-symbols-outlined text-base">warning</span>
                                                You have missed {formation.missedSessions} session(s).
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upcoming Sessions */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800">Upcoming Sessions</h2>
                        {data.upcomingSessions.length === 0 ? (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-500">
                                No upcoming sessions.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {data.upcomingSessions.map(session => (
                                    <div key={session.id} className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-600"></div>

                                        <div className="flex justify-between items-start mb-4">
                                            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                                {session.level}
                                            </div>
                                            <div className="text-slate-400">
                                                <span className="material-symbols-outlined text-sm">event</span>
                                            </div>
                                        </div>

                                        <h4 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                            {session.title}
                                        </h4>
                                        <p className="text-slate-500 text-sm mb-6 line-clamp-2">
                                            {session.description || 'Session de formation pratique et théorique.'}
                                        </p>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 font-medium">Date & Heure</p>
                                                    <p className="text-sm font-semibold">
                                                        {new Date(session.date).toLocaleDateString()} • {session.startTime} - {session.endTime}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-slate-600">
                                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                    <span className="material-symbols-outlined text-sm">person</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 font-medium">Formateur</p>
                                                    <p className="text-sm font-semibold">{session.formateur}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button className="w-full py-2.5 rounded-xl bg-slate-50 text-slate-600 font-medium hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-200">
                                            <span>Voir détails</span>
                                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
