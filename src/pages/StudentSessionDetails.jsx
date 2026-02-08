import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';

const StudentSessionDetails = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar' || i18n.language === 'tn';
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);

    useEffect(() => {
        const fetchSessionDetails = async () => {
            try {
                // Fetching all dashboard data to find the specific session
                const response = await api.get('/student/dashboard');
                let foundSession = null;
                let formationTitle = '';

                // Search in formations (past/current sessions)
                for (const f of response.data.formations) {
                    if (f.sessions) {
                        const s = f.sessions.find(ses => ses._id === id);
                        if (s) {
                            foundSession = s;
                            formationTitle = f.title;
                            break;
                        }
                    }
                }

                // Also check upcoming sessions if not found
                if (!foundSession && response.data.upcomingSessions) {
                    foundSession = response.data.upcomingSessions.find(s => s.id === id);
                    if (foundSession) {
                        // Normalize structure if coming from upcomingSessions
                        foundSession = { ...foundSession, _id: foundSession.id };
                    }
                }

                if (foundSession) {
                    setSession({ ...foundSession, formationTitle });
                }
            } catch (error) {
                console.error('Error fetching session details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessionDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500">
                {t('common.not_found', 'Session not found.')}
            </div>
        );
    }

    const isPresent = session.attendanceStatus === 'present';
    const isAbsent = session.attendanceStatus === 'absent';
    const isUpcoming = !isPresent && !isAbsent;

    return (
        <div className="dashboard-layout" dir={isRTL ? 'rtl' : 'ltr'}>
            <Sidebar />

            <main className="main-content">
                <header className="mb-10">
                    <Link to="/student-dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-4">
                        <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_back</span>
                        {t('common.back_to_dashboard', 'Back to Dashboard')}
                    </Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1 block">
                                {t('common.session_details', 'session details')}
                            </span>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">
                                {session.title}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg">
                                {session.formationTitle} • {session.level?.title || t('common.level', 'Level')}
                            </p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide flex items-center gap-2 ${isPresent
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : isAbsent
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                            }`}>
                            <span className="material-symbols-outlined text-lg">
                                {isPresent ? 'check_circle' : isAbsent ? 'cancel' : 'event'}
                            </span>
                            {isPresent ? t('common.present', 'Present') : isAbsent ? t('common.absent', 'Absent') : t('common.upcoming', 'Upcoming')}
                        </span>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400">info</span>
                                {t('common.session_info', 'Session Information')}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('common.date', 'Date')}</p>
                                    <p className="text-lg font-semibold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-indigo-500">calendar_today</span>
                                        {new Date(session.date).toLocaleDateString(i18n.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('common.time_duration', 'Time & Duration')}</p>
                                    <p className="text-lg font-semibold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-indigo-500">schedule</span>
                                        {session.startTime} - {session.endTime}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('common.description', 'Description')}</p>
                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                        {session.description || t('common.no_description', "No description provided for this session.")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bonus: Simple Timeline */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400">timeline</span>
                                {t('common.session_timeline', 'Session Timeline')}
                            </h2>

                            <div className="relative ps-8 border-inline-start-2 border-slate-100 dark:border-slate-700 space-y-8">
                                <div className="relative">
                                    <div className="absolute -inline-start-[41px] w-5 h-5 rounded-full bg-indigo-100 border-4 border-white dark:border-slate-800 dark:bg-indigo-900"></div>
                                    <p className="font-bold text-slate-800 dark:text-white">{t('common.start', 'Start')}</p>
                                    <p className="text-sm text-slate-500">{session.startTime}</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -inline-start-[41px] w-5 h-5 rounded-full bg-slate-100 border-4 border-white dark:border-slate-800 dark:bg-slate-700"></div>
                                    <p className="font-bold text-slate-800 dark:text-white">{t('common.core_content', 'Core Content')}</p>
                                    <p className="text-sm text-slate-500">{t('common.lecture_practice', 'Lecture & Practice')}</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -inline-start-[41px] w-5 h-5 rounded-full bg-slate-100 border-4 border-white dark:border-slate-800 dark:bg-slate-700"></div>
                                    <p className="font-bold text-slate-800 dark:text-white">{t('common.end', 'End')}</p>
                                    <p className="text-sm text-slate-500">{session.endTime}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Side Info */}
                    <div className="space-y-6">
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/20 p-6 text-center">
                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-indigo-600 dark:text-indigo-400">
                                <span className="material-symbols-outlined text-3xl">school</span>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">{t('common.instructor', 'Instructor')}</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                {session.formateur?.name || session.formateur || "TBA"}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentSessionDetails;
