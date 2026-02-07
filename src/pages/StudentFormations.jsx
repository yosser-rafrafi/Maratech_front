import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import StudentSidebar from '../components/StudentSidebar';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const StudentFormations = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
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
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
            <StudentSidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="mb-10 relative">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">
                            My Formations
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Track your progress across all enrolled courses.
                        </p>
                    </div>
                    {/* Glassmorphism Background Effect */}
                    <div className="absolute top-0 right-0 -z-0 opacity-10 dark:opacity-20 pointer-events-none">
                        <svg fill="none" height="150" viewBox="0 0 200 150" width="200" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="150" cy="50" fill="url(#paint0_radial)" r="80"></circle>
                            <defs>
                                <radialGradient cx="0" cy="0" gradientTransform="translate(150 50) rotate(90) scale(80)" gradientUnits="userSpaceOnUse" id="paint0_radial" r="1">
                                    <stop stopColor="#6366f1"></stop>
                                    <stop offset="1" stopColor="#6366f1" stopOpacity="0"></stop>
                                </radialGradient>
                            </defs>
                        </svg>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {formations.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl text-slate-400">school</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">No Formations Found</h3>
                            <p className="text-slate-500">You are not currently enrolled in any formations.</p>
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
                                    <div className="flex-1 w-full text-center md:text-left">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{formation.title}</h3>

                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm mb-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                                                <span className="font-medium">
                                                    {validatedCount} / {totalLevels} Levels Validated
                                                </span>
                                            </div>

                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isCompleted
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                                }`}>
                                                {isCompleted ? 'Completed' : 'In Progress'}
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
                                        <p className="text-xs text-right text-slate-500">{formation.progress}% Completed</p>
                                    </div>

                                    {/* Action Button */}
                                    <div className="shrink-0 w-full md:w-auto">
                                        <Link to={`/student-formation/${formation._id}`} className="w-full md:w-auto px-6 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                                            View Details
                                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
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
