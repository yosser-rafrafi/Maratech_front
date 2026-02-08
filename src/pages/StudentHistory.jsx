import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const StudentHistory = () => {
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar' || i18n.language === 'tn';
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'attended');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ attended: [], missed: [] });

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/student/dashboard');

                // Process Attended Sessions
                const attended = [];
                response.data.formations.forEach(f => {
                    if (f.sessions) {
                        f.sessions.forEach(s => {
                            if (s.attendanceStatus === 'present') {
                                attended.push({ ...s, formationTitle: f.title });
                            }
                        });
                    }
                });
                attended.sort((a, b) => new Date(b.date) - new Date(a.date));

                // Missed Sessions
                const missed = response.data.missedSessions || [];

                setData({ attended, missed });
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="dashboard-layout" dir={isRTL ? 'rtl' : 'ltr'}>
            <Sidebar />
            <main className="main-content">
                <header className="page-header">
                    <div>
                        <h1>{t('student_dashboard.session_history', 'Historique des Sessions')}</h1>
                        <p>{t('student_dashboard.view_attendance', 'Consultez vos présences et vos absences.')}</p>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit mb-8">
                    <button
                        onClick={() => setActiveTab('attended')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'attended'
                            ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        {t('student_dashboard.sessions_attended', 'Sessions Assistées')} ({data.attended.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('missed')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'missed'
                            ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600 dark:text-red-400'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        {t('student_dashboard.missed_sessions', 'Séances Manquées')} ({data.missed.length})
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {activeTab === 'attended' ? (
                        data.attended.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                                <p className="text-slate-500 dark:text-slate-400">{t('student_dashboard.no_attended_found', 'Aucune session assistée trouvée.')}</p>
                            </div>
                        ) : (
                            data.attended.map(session => (
                                <SessionCard key={session._id} session={session} type="attended" />
                            ))
                        )
                    ) : (
                        data.missed.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center flex flex-col items-center">
                                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-5xl text-emerald-600 dark:text-emerald-400">celebration</span>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t('student_dashboard.all_sessions_attended', 'Bravo ! Aucune séance manquée 🎉')}</h2>
                                <p className="text-slate-500 dark:text-slate-400 max-w-md">{t('student_dashboard.all_sessions_attended_desc', 'Vous avez assisté à toutes vos séances prévues.')}</p>
                            </div>
                        ) : (
                            data.missed.map(session => (
                                <SessionCard key={session.id} session={session} type="missed" />
                            ))
                        )
                    )}
                </div>
            </main>
        </div>
    );
};

const SessionCard = ({ session, type }) => {
    const { t } = useTranslation();
    const isAttended = type === 'attended';
    return (
        <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow ${!isAttended ? 'border-inline-start-4 border-inline-start-red-500' : ''
            }`}>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isAttended
                    ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400'
                    }`}>
                    <span className="material-symbols-outlined text-2xl">
                        {isAttended ? 'event_available' : 'event_busy'}
                    </span>
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{session.title || t('student_dashboard.no_session', 'Session')}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">{session.formationTitle}</span>
                        <span>•</span>
                        <span>{session.level?.title || t('common.level', 'Niveau')}</span>
                        <span>•</span>
                        <span>{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${isAttended
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {isAttended ? t('common.present', 'Présent') : t('common.absent', 'Absent')}
                </span>
                <Link to={`/student-session/${session._id || session.id}`} className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                    {t('common.details', 'Détails')}
                    <span className="material-symbols-outlined text-xs rtl:rotate-180">arrow_forward</span>
                </Link>
            </div>
        </div>
    );
};

export default StudentHistory;
