import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';

const StudentFormationDetails = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar' || i18n.language === 'tn';
    const [loading, setLoading] = useState(true);
    const [formation, setFormation] = useState(null);

    useEffect(() => {
        const fetchFormationDetails = async () => {
            try {
                const response = await api.get('/student/dashboard');
                const foundFormation = response.data.formations.find(f => f._id === id);
                setFormation(foundFormation);
            } catch (error) {
                console.error('Error fetching formation details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFormationDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!formation) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500">
                {t('common.not_found', 'Formation not found.')}
            </div>
        );
    }

    return (
        <div className="dashboard-layout" dir={isRTL ? 'rtl' : 'ltr'}>
            <Sidebar />

            <main className="main-content">
                <header className="mb-10">
                    <Link to="/student-formations" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-4">
                        <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_back</span>
                        {t('common.back_to_formations', 'Back to My Formations')}
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        {formation.title}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {t('student_dashboard.track_progress', 'Detailed progress and level status.')}
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {/* Level List */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t('student_dashboard.validated_levels', 'Course Levels')}</h2>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {formation.levelsDetails && formation.levelsDetails.map((lvl, idx) => (
                                <div key={idx} className={`p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${lvl.status === 'locked' || lvl.status === 'pending'
                                    ? 'opacity-40 grayscale bg-slate-50/50 dark:bg-slate-900/10'
                                    : ''
                                    }`}>
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${lvl.status === 'validated'
                                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/10 dark:text-emerald-400'
                                            : lvl.status === 'in_progress'
                                                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/10 dark:text-indigo-400'
                                                : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                                            }`}>
                                            <span className="material-symbols-outlined">
                                                {lvl.status === 'validated' ? 'check' : lvl.status === 'locked' ? 'lock' : lvl.status === 'pending' ? 'lock_open' : 'schedule'}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{lvl.title}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {lvl.attended} / {lvl.total} {t('common.sessions_completed', 'sessions completed')}
                                            </p>
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${lvl.status === 'validated'
                                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10 dark:text-emerald-400'
                                                : lvl.status === 'in_progress'
                                                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/10 dark:text-indigo-400'
                                                    : 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                                                }`}>
                                                {lvl.status === 'in_progress' ? t('common.in_progress', 'En Cours') : lvl.status === 'validated' ? t('common.validated', 'Validé') : t('common.locked', 'Bloqué')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Link
                                            disabled={lvl.status === 'locked' || lvl.status === 'pending'}
                                            to={`/student-formation/${id}`}
                                            className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {t('common.view_sessions', 'View Sessions')}
                                        </Link>
                                        <Link
                                            to="/student-history"
                                            state={{ tab: 'missed' }}
                                            className={`px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-sm font-bold rounded-lg transition-colors ${lvl.status === 'locked' || lvl.status === 'pending' ? 'pointer-events-none opacity-50' : ''
                                                }`}
                                        >
                                            {t('student_dashboard.missed_sessions', 'Missed Sessions')}
                                        </Link>
                                        <Link
                                            to="/student-history"
                                            state={{ tab: 'attended' }}
                                            className={`px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-sm font-bold rounded-lg transition-colors ${lvl.status === 'locked' || lvl.status === 'pending' ? 'pointer-events-none opacity-50' : ''
                                                }`}
                                        >
                                            {t('student_dashboard.sessions_attended', 'Sessions Attended')}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentFormationDetails;
