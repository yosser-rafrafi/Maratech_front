import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const StudentDashboard = () => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        stats: {
            totalFormations: 0,
            totalSessionsAttended: 0,
            totalMissedSessions: 0
        },
        formations: [],
        upcomingSessions: [],
        recentActivity: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/student/dashboard');
                const rawData = response.data;

                // Process Recent Activity (Combine attended and missed)
                const activity = [];
                if (rawData.missedSessions) {
                    rawData.missedSessions.forEach(s => activity.push({ ...s, type: 'missed' }));
                }
                rawData.formations.forEach(f => {
                    if (f.sessions) {
                        f.sessions.forEach(s => {
                            if (s.attendanceStatus === 'present') {
                                activity.push({ ...s, type: 'attended', formationTitle: f.title });
                            }
                        });
                    }
                });
                activity.sort((a, b) => new Date(b.date) - new Date(a.date));

                setData({
                    ...rawData,
                    recentActivity: activity.slice(0, 5)
                });
            } catch (error) {
                console.error('Error fetching student dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const handleDownloadCertificate = async (formationId, formationTitle) => {
        try {
            const response = await api.get(`/student/certificate/download/${formationId}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Certificat-${formationTitle.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading certificate:', error);
            alert(t('common.error_download', 'Erreur lors du téléchargement du certificat.'));
        }
    };

    // Derived Data for UI
    const totalProgress = data.formations.length > 0
        ? Math.round(data.formations.reduce((acc, f) => acc + f.progress, 0) / data.formations.length)
        : 0;

    const validatedCount = data.formations.reduce((acc, f) =>
        acc + (f.levelsDetails?.filter(l => l.status === 'validated').length || 0), 0);

    const inProgressCount = data.formations.reduce((acc, f) =>
        acc + (f.levelsDetails?.filter(l => l.status === 'in_progress').length || 0), 0);

    const totalLevels = data.formations.reduce((acc, f) => acc + (f.levelsDetails?.length || 0), 0);

    const latestAttended = data.recentActivity.find(a => a.type === 'attended');
    const latestMissed = data.recentActivity.find(a => a.type === 'missed');
    const nextSession = data.upcomingSessions[0];
    const featuredFormation = data.formations.find(f => f.progress < 100) || data.formations[0];

    const chartData = {
        datasets: [{
            data: [totalProgress, 100 - totalProgress],
            backgroundColor: ['#4f46e5', '#f1f5f9'],
            borderWidth: 0,
            circumference: 360,
            rotation: 0,
            cutout: '80%',
            borderRadius: 20,
        }]
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const isRTL = i18n.language === 'ar' || i18n.language === 'tn';

    return (
        <div className="dashboard-layout" dir={isRTL ? 'rtl' : 'ltr'}>
            <Sidebar />
            <main className="main-content">
                <header className="page-header">
                    <div className="text-start">
                        <h1>{t('welcome_back', 'Ravi de vous revoir')}, {user?.name?.split(' ')[0]}! 👋</h1>
                        <p>{totalProgress === 100 ? t('student_dashboard.completed_all', 'Félicitations ! Vous avez terminé toutes vos formations.') : t('student_dashboard.keep_going', 'Continuez votre excellent travail !')}</p>
                    </div>
                </header>

                <div className="animation-fade-in space-y-8">
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <SimpleStatCard icon="auto_stories" label={t('student_dashboard.my_formations', 'Mes Formations')} value={data.stats.totalFormations} badge={data.stats.totalFormations > 0 ? t('common.active', 'Active') : t('common.stable', 'Stable')} color="indigo" />
                        <SimpleStatCard icon="verified_user" label={t('student_dashboard.validated_levels', 'Niveaux Validés')} value={`${validatedCount} / ${totalLevels || 0}`} badge={t('common.progressing', 'Progressing')} color="emerald" />
                        <SimpleStatCard icon="calendar_month" label={t('student_dashboard.absences', 'Absences')} value={data.stats.totalMissedSessions} badge={data.stats.totalMissedSessions === 0 ? t('common.perfect', 'Perfect') : t('common.caution', 'Caution')} color="amber" />
                        <SimpleStatCard icon="workspace_premium" label={t('student_dashboard.cert_status', 'Statut Certif')} value={data.formations.some(f => f.progress === 100) ? t('common.unlocked', 'Unlocked') : t('common.locked', 'Locked')} badge={t('common.available', 'Available')} color="indigo" />
                    </div>

                    <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-8 space-y-8">

                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-slate-50 dark:border-slate-800 relative overflow-hidden">
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">{t('student_dashboard.my_progress', 'Ma Progression')}</h3>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="relative w-48 h-48">
                                        <Doughnut data={chartData} options={{ cutout: '80%', plugins: { legend: { display: false } } }} />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-slate-900 dark:text-white">{totalProgress}%</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{t('common.completed', 'Complété')}</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 ms-16 space-y-8">
                                        <div className="flex flex-col gap-4">
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-300">{t('student_dashboard.expertise_level', 'Niveau d\'expertise')} <span className="float-end text-slate-300 italic font-medium">{t('common.intermediate', 'Intermédiaire')}</span></p>
                                            <div className="flex items-center gap-3">
                                                <LevelStep label="LVL 1" active={totalProgress >= 25} />
                                                <LevelStep label="LVL 2" active={totalProgress >= 50} pulse={totalProgress >= 25 && totalProgress < 75} />
                                                <LevelStep label="LVL 3" active={totalProgress >= 75} />
                                                <LevelStep label="LVL 4" active={totalProgress >= 100} />
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <MiniMetric icon="verified" value={validatedCount} label={t('common.validated', 'Validés')} sublabel={t('common.modules', 'Modules')} color="indigo" />
                                            <MiniMetric icon="pending_actions" value={inProgressCount} label={t('common.in_progress', 'En cours')} sublabel={t('common.modules', 'Modules')} color="amber" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {featuredFormation && (
                                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined text-4xl">auto_stories</span>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-800 dark:text-white">{featuredFormation.title}</h3>
                                                <p className="text-sm font-bold text-slate-400 tracking-tight line-clamp-1">{featuredFormation.description || 'Formation active'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-5xl font-black text-indigo-600">{featuredFormation.progress}%</p>
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{t('common.completed', 'Complété')}</p>
                                        </div>
                                    </div>

                                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-10 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${featuredFormation.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                            style={{ width: `${featuredFormation.progress}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex -space-x-3 rtl:space-x-reverse">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">JD</div>
                                                ))}
                                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">+12</div>
                                            </div>
                                            <span className="text-xs font-bold text-slate-400">{t('student_dashboard.enrolled_learners', 'apprenants inscrits')}</span>
                                        </div>
                                        {featuredFormation.progress === 100 && (
                                            <button
                                                onClick={() => handleDownloadCertificate(featuredFormation._id, featuredFormation.title)}
                                                className="flex items-center gap-3 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
                                            >
                                                <span className="material-symbols-outlined text-xl">download</span>
                                                {t('student_dashboard.download_certificate', 'Télécharger le Certificat')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{t('student_dashboard.quick_actions', 'Quick Actions')}</h3>
                            <div className="grid grid-cols-3 gap-6">
                                <Link to="/student-history" state={{ tab: 'attended' }}>
                                    <ActionCard icon="history_edu" label={t('student_dashboard.sessions_attended', 'Sessions Attended')} color="indigo" />
                                </Link>
                                <Link to="/student-history" state={{ tab: 'missed' }}>
                                    <ActionCard icon="event_busy" label={t('student_dashboard.missed_sessions', 'Missed Sessions')} color="amber" />
                                </Link>
                                <Link to="/student-formations">
                                    <ActionCard icon="military_tech" label={t('student_dashboard.view_certificates', 'View Certificates')} color="emerald" />
                                </Link>
                            </div>
                        </div>

                        <div className="col-span-4 space-y-8">
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-50 dark:border-slate-800">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8">{t('student_dashboard.recent_activity', 'Recent Activity')}</h3>
                                <div className="space-y-10 relative">
                                    <div className="absolute start-4 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800"></div>

                                    <TimelineItem
                                        icon={latestAttended ? "check" : "pending"}
                                        status={t('student_dashboard.last_attended_status', 'LAST ATTENDED')}
                                        title={latestAttended?.title || t('student_dashboard.no_session', 'Aucune session')}
                                        time={latestAttended ? `${new Date(latestAttended.date).toLocaleDateString()} • ${latestAttended.formationTitle || ''}` : t('student_dashboard.no_attendance_data', 'Aucune donnée de présence.')}
                                        color={latestAttended ? "emerald" : "slate"}
                                    />

                                    <TimelineItem
                                        icon={latestMissed ? "close" : "verified"}
                                        status={t('student_dashboard.last_missed_status', 'LAST MISSED')}
                                        title={latestMissed?.title || t('student_dashboard.congratulations', 'Félicitations')}
                                        subtitle={latestMissed ? new Date(latestMissed.date).toLocaleDateString() : t('student_dashboard.no_missed_sessions_data', 'Aucune absence enregistrée.')}
                                        color={latestMissed ? "amber" : "emerald"}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">{t('student_dashboard.next_session', 'Next Session')}</h3>
                                {nextSession ? (
                                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-xl border border-slate-50 dark:border-slate-800 relative group overflow-hidden">
                                        <div className="flex items-center gap-2 mb-6">
                                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-[10px] font-black text-indigo-600 rounded-lg uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50">{nextSession.level || 'Course'}</span>
                                            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-[10px] font-black text-amber-600 rounded-lg uppercase tracking-widest border border-amber-100 dark:border-amber-800/50">Live Session</span>
                                        </div>

                                        <h4 className="text-2xl font-black text-slate-800 dark:text-white leading-tight mb-4 pe-10">{nextSession.title}</h4>

                                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-8">
                                            <span className="material-symbols-outlined text-lg">calendar_today</span>
                                            {new Date(nextSession.date).toLocaleDateString()} • {nextSession.startTime}
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-8 border border-slate-100 dark:border-slate-800">
                                            <img src={`https://ui-avatars.com/api/?name=${nextSession.formateur || 'T'}&background=random`} className="w-10 h-10 rounded-xl object-cover" alt="trainer" />
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('student_dashboard.trainer', 'Trainer')}</p>
                                                <p className="text-sm font-black text-slate-800 dark:text-white">{nextSession.formateur || t('common.staff_astba', 'Staff ASTBA')}</p>
                                            </div>
                                        </div>

                                        <h4 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                            {nextSession.title}
                                        </h4>
                                        <p className="text-slate-500 text-sm mb-6 line-clamp-2">
                                            {nextSession.description || t('student_dashboard.default_session_desc', 'Session de formation pratique et théorique.')}
                                        </p>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 font-medium">{t('student_dashboard.date_time')}</p>
                                                    <p className="text-sm font-semibold">
                                                        {new Date(nextSession.date).toLocaleDateString()} • {nextSession.startTime} - {nextSession.endTime}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-slate-600">
                                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                    <span className="material-symbols-outlined text-sm">person</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 font-medium">{t('student_dashboard.trainer')}</p>
                                                    <p className="text-sm font-semibold">{nextSession.formateur}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button className="w-full py-2.5 rounded-xl bg-slate-50 text-slate-600 font-medium hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-200">
                                            <span>{t('student_dashboard.view_details')}</span>
                                            <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 text-center text-slate-400 italic border border-dashed border-slate-200 dark:border-slate-800">
                                        {t('student_dashboard.no_upcoming_session', 'Pas de séance prévue prochainement.')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

/* Sub-Components */

const SimpleStatCard = ({ icon, label, value, badge, color }) => {
    const theme = {
        indigo: "bg-indigo-500",
        emerald: "bg-emerald-500",
        amber: "bg-amber-500"
    };
    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-50 dark:border-slate-800 relative overflow-hidden group hover:shadow-lg transition-all">
            <div className="absolute top-6 end-6 px-3 py-1 bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-400 rounded-lg uppercase tracking-widest border border-slate-100 dark:border-slate-800 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors">
                {badge}
            </div>
            <div className={`w-12 h-12 ${theme[color]} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{value}</p>
        </div>
    );
};

const LevelStep = ({ label, active, pulse }) => (
    <div className="flex-1 text-start group">
        <div className={`h-1.5 rounded-full mb-3 transition-all ${active ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-800'} ${pulse ? 'animate-pulse ring-4 ring-indigo-500/20' : ''}`}></div>
        <p className={`text-[10px] font-black tracking-widest ${active ? 'text-indigo-600' : 'text-slate-300'}`}>{label}</p>
    </div>
);

const MiniMetric = ({ icon, value, label, sublabel, color }) => (
    <div className={`${color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-amber-50 dark:bg-amber-900/20'} p-4 rounded-3xl flex items-center gap-4 flex-1 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color === 'indigo' ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white'}`}>
            <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <div>
            <div className="flex items-baseline gap-1 focus-within:ring-2 ring-indigo-500">
                <span className="text-xl font-black">{value}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{sublabel}</p>
        </div>
    </div>
);

const TimelineItem = ({ icon, status, title, time, subtitle, color }) => (
    <div className="flex gap-6 relative z-10">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-sm shrink-0 ${color === 'emerald' ? 'bg-emerald-50 text-emerald-500' : color === 'amber' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-300'}`}>
            <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
        <div className="pt-0.5">
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${color === 'emerald' ? 'text-emerald-500' : color === 'amber' ? 'text-red-500' : 'text-slate-400'}`}>{status}</p>
            <h4 className="font-black text-base text-slate-800 dark:text-white leading-none mb-1">{title}</h4>
            <p className="text-xs font-bold text-slate-400">{time || subtitle}</p>
        </div>
    </div>
);

const ActionCard = ({ icon, label, color }) => {
    const theme = {
        indigo: "text-indigo-600 bg-indigo-50/50 hover:bg-indigo-600 hover:text-white shadow-indigo-600/5",
        amber: "text-amber-600 bg-amber-50/50 hover:bg-amber-600 hover:text-white shadow-amber-600/5",
        emerald: "text-emerald-600 bg-emerald-50/50 hover:bg-emerald-600 hover:text-white shadow-emerald-600/5"
    };
    return (
        <div className={`bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] shadow-sm border border-slate-50 dark:border-slate-800 flex flex-col items-start justify-center gap-4 transition-all group cursor-pointer hover:-translate-y-1 ${theme[color]}`}>
            <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">{icon}</span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-white tracking-tight">{label}</span>
        </div>
    );
};

export default StudentDashboard;
