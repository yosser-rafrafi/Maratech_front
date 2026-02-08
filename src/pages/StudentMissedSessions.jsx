import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';

const StudentMissedSessions = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar' || i18n.language === 'tn';
    const [loading, setLoading] = useState(true);
    const [missedSessions, setMissedSessions] = useState([]);

    useEffect(() => {
        const fetchMissedSessions = async () => {
            try {
                const response = await api.get('/student/dashboard');
                setMissedSessions(response.data.missedSessions || []);
            } catch (error) {
                console.error('Error fetching missed sessions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMissedSessions();
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
                <header className="mb-10">
                    <Link to="/student-dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-4">
                        <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_back</span>
                        {t('common.back_to_dashboard', 'Back to Dashboard')}
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-500 text-4xl">warning</span>
                        {t('student_dashboard.missed_sessions', 'Missed Sessions')}
                    </h1>
                </header>

                {missedSessions.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-5xl text-emerald-600 dark:text-emerald-400">celebration</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t('student_dashboard.all_sessions_attended', 'Great! No missed sessions 🎉')}</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md">
                            {t('student_dashboard.all_sessions_attended_desc', 'You have attended all your scheduled sessions. Keep up the great work!')}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {missedSessions.map(session => (
                            <div key={session.id} className="bg-white dark:bg-slate-800 rounded-xl border-inline-start-4 border-inline-start-red-500 border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-2xl">event_busy</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{session.title}</h3>
                                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-xs">calendar_today</span>
                                                {new Date(session.date).toLocaleDateString(i18n.language)}
                                            </span>
                                            {session.startTime && (
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs">schedule</span>
                                                    {session.startTime}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold uppercase rounded-full">
                                        {t('common.absent', 'Absent')}
                                    </span>
                                    <Link to={`/student-session/${session.id}`} className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                                        {t('common.view_details', 'View Details')}
                                        <span className="material-symbols-outlined text-xs rtl:rotate-180">arrow_forward</span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentMissedSessions;
