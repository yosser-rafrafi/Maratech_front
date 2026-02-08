import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const StudentFormations = () => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar' || i18n.language === 'tn';
    const [loading, setLoading] = useState(true);
    const [formations, setFormations] = useState([]);

    useEffect(() => {
        const fetchFormations = async () => {
            try {
                // Reusing dashboard endpoint for now as it contains all necessary formation data
                // In a production app, we might want a dedicated list endpoint
                const response = await api.get('/student/dashboard');
                setFormations(response.data.formations || []);
            } catch (error) {
                console.error('Error fetching formations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFormations();
    }, []);

    const getValidatedLevelsCount = (formation) => {
        if (!formation.levelsDetails) return 0;
        return formation.levelsDetails.filter(lvl => lvl.status === 'validated').length;
    };

    const getTotalLevelsCount = (formation) => {
        return formation.levelsDetails ? formation.levelsDetails.length : 0;
    };

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
                        <h1>{t('student_dashboard.my_formations', 'Mes Formations')}</h1>
                        <p>{t('student_dashboard.track_progress', 'Suivez votre progression dans tous vos cours.')}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {formations.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl text-slate-400">school</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">{t('student_dashboard.no_formations_found', 'No Formations Found')}</h3>
                            <p className="text-slate-500">{t('student_dashboard.no_formations', 'You are not currently enrolled in any formations.')}</p>
                        </div>
                    ) : (
                        formations.map(formation => {
                            const validatedCount = getValidatedLevelsCount(formation);
                            const totalLevels = getTotalLevelsCount(formation);
                            const isCompleted = formation.progress >= 100;

                            return (
                                <div key={formation._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex flex-col md:flex-row items-center gap-6 transition-transform hover:translate-y-[-2px]">
                                    {/* Icon/Thumbnail */}
                                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-4xl text-indigo-600 dark:text-indigo-400">menu_book</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 w-full text-center md:text-start">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{formation.title}</h3>

                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm mb-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                                                <span className="font-medium">
                                                    {validatedCount} / {totalLevels} {t('student_dashboard.validated_levels', 'Levels Validated')}
                                                </span>
                                            </div>

                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isCompleted
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                                }`}>
                                                {isCompleted ? t('common.completed', 'Completed') : t('common.in_progress', 'In Progress')}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-2">
                                            <div
                                                className={`h-2.5 rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                                                    }`}
                                                style={{ width: `${formation.progress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-start rtl:text-end text-slate-500">{formation.progress}% {t('common.completed', 'Completed')}</p>
                                    </div>

                                    {/* Action Button */}
                                    <div className="shrink-0 w-full md:w-auto">
                                        <Link to={`/student-formation/${formation._id}`} className="w-full md:w-auto px-6 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                                            {t('student_dashboard.view_details', 'View Details')}
                                            <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
};

export default StudentFormations;
