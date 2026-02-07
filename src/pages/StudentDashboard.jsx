import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import StudentSidebar from '../components/StudentSidebar';
import { useTranslation } from 'react-i18next';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

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

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
            <StudentSidebar />

            <main className="flex-1 ml-72">
                <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-10 transition-colors">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white">Student Portal</h2>

                    <div className="flex items-center gap-6">
                        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <button onClick={() => i18n.changeLanguage('en')} className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${i18n.language === 'en' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400'}`}>EN</button>
                            <button onClick={() => i18n.changeLanguage('fr')} className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${i18n.language === 'fr' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400'}`}>FR</button>
                        </div>

                        <div className="flex items-center gap-3 pl-6 border-l border-slate-100 dark:border-slate-800">
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-800 dark:text-white leading-none">{user?.name}</p>
                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                                    {totalProgress >= 100 ? 'Certified Member' : `Level ${Math.floor(totalProgress / 25) + 1} Student`}
                                </span>
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-emerald-500 p-0.5 shadow-lg shadow-emerald-500/10">
                                <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`} className="w-full h-full rounded-full object-cover" alt="avatar" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-10 max-w-7xl mx-auto space-y-10">
                    <section>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                            {t('welcome_back', 'Ravi de vous revoir')}, {user?.name?.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-slate-400 dark:text-slate-500 font-medium text-lg">
                            {totalProgress === 100 ? "Félicitations ! Vous avez terminé toutes vos formations." : "Continuez votre excellent travail ! Vous faites des progrès remarquables."}
                        </p>
                    </section>

                    <section className="grid grid-cols-4 gap-6">
                        <SimpleStatCard icon="auto_stories" label="Mes Formations" value={data.stats.totalFormations} badge={data.stats.totalFormations > 0 ? "Active" : "Stable"} color="indigo" />
                        <SimpleStatCard icon="verified_user" label="Niveaux Validés" value={`${validatedCount} / ${totalLevels || 0}`} badge="Progressing" color="emerald" />
                        <SimpleStatCard icon="calendar_month" label="Absences" value={data.stats.totalMissedSessions} badge={data.stats.totalMissedSessions === 0 ? "Perfect" : "Caution"} color="amber" />
                        <SimpleStatCard icon="workspace_premium" label="Statut Certif" value={data.formations.some(f => f.progress === 100) ? "Unlocked" : "Locked"} badge="Available" color="indigo" />
                    </section>

                    <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-8 space-y-8">

                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-slate-50 dark:border-slate-800 relative overflow-hidden">
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">Ma Progression</h3>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="relative w-48 h-48">
                                        <Doughnut data={chartData} options={{ cutout: '80%', plugins: { legend: { display: false } } }} />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-slate-900 dark:text-white">{totalProgress}%</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Complété</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 ml-16 space-y-8">
                                        <div className="flex flex-col gap-4">
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-300">Niveau d'expertise <span className="float-right text-slate-300 italic font-medium">Intermédiaire</span></p>
                                            <div className="flex items-center gap-3">
                                                <LevelStep label="LVL 1" active={totalProgress >= 25} />
                                                <LevelStep label="LVL 2" active={totalProgress >= 50} pulse={totalProgress >= 25 && totalProgress < 75} />
                                                <LevelStep label="LVL 3" active={totalProgress >= 75} />
                                                <LevelStep label="LVL 4" active={totalProgress >= 100} />
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <MiniMetric icon="verified" value={validatedCount} label="Validés" sublabel="Modules" color="indigo" />
                                            <MiniMetric icon="pending_actions" value={inProgressCount} label="En cours" sublabel="Modules" color="amber" />
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
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Complété</p>
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
                                            <div className="flex -space-x-3">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">JD</div>
                                                ))}
                                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">+12</div>
                                            </div>
                                            <span className="text-xs font-bold text-slate-400">apprenants inscrits</span>
                                        </div>
                                        {featuredFormation.progress === 100 && (
                                            <button className="flex items-center gap-3 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95">
                                                <span className="material-symbols-outlined text-xl">download</span>
                                                Télécharger le Certificat
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <h3 className="text-2xl font-black text-slate-800 dark:text-white">Quick Actions</h3>
                            <div className="grid grid-cols-3 gap-6">
                                <Link to="/student-history" state={{ tab: 'attended' }}>
                                    <ActionCard icon="history_edu" label="Sessions Attended" color="indigo" />
                                </Link>
                                <Link to="/student-history" state={{ tab: 'missed' }}>
                                    <ActionCard icon="event_busy" label="Missed Sessions" color="amber" />
                                </Link>
                                <Link to="/student-formations">
                                    <ActionCard icon="military_tech" label="View Certificates" color="emerald" />
                                </Link>
                            </div>
                        </div>

                        <div className="col-span-4 space-y-8">
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-50 dark:border-slate-800">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8">Recent Activity</h3>
                                <div className="space-y-10 relative">
                                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800"></div>

                                    <TimelineItem
                                        icon={latestAttended ? "check" : "pending"}
                                        status="LAST ATTENDED"
                                        title={latestAttended?.title || "Aucune session"}
                                        time={latestAttended ? `${new Date(latestAttended.date).toLocaleDateString()} • ${latestAttended.formationTitle || ''}` : "Aucune donnée de présence."}
                                        color={latestAttended ? "emerald" : "slate"}
                                    />

                                    <TimelineItem
                                        icon={latestMissed ? "close" : "verified"}
                                        status="LAST MISSED"
                                        title={latestMissed?.title || "Félicitations"}
                                        subtitle={latestMissed ? new Date(latestMissed.date).toLocaleDateString() : "Aucune absence enregistrée."}
                                        color={latestMissed ? "amber" : "emerald"}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">Next Session</h3>
                                {nextSession ? (
                                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-xl border border-slate-50 dark:border-slate-800 relative group overflow-hidden">
                                        <div className="flex items-center gap-2 mb-6">
                                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-[10px] font-black text-indigo-600 rounded-lg uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50">{nextSession.level || 'Course'}</span>
                                            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-[10px] font-black text-amber-600 rounded-lg uppercase tracking-widest border border-amber-100 dark:border-amber-800/50">Live Session</span>
                                        </div>

                                        <h4 className="text-2xl font-black text-slate-800 dark:text-white leading-tight mb-4 pr-10">{nextSession.title}</h4>

                                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-8">
                                            <span className="material-symbols-outlined text-lg">calendar_today</span>
                                            {new Date(nextSession.date).toLocaleDateString()} • {nextSession.startTime}
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-8 border border-slate-100 dark:border-slate-800">
                                            <img src={`https://ui-avatars.com/api/?name=${nextSession.formateur || 'T'}&background=random`} className="w-10 h-10 rounded-xl object-cover" alt="trainer" />
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trainer</p>
                                                <p className="text-sm font-black text-slate-800 dark:text-white">{nextSession.formateur || 'Staff ASTBA'}</p>
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
                                                    <p className="text-xs text-slate-400 font-medium">{t('student_dashboard.date_time')}</p>
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
                                                    <p className="text-xs text-slate-400 font-medium">{t('student_dashboard.trainer')}</p>
                                                    <p className="text-sm font-semibold">{session.formateur}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button className="w-full py-2.5 rounded-xl bg-slate-50 text-slate-600 font-medium hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-200">
                                            <span>{t('student_dashboard.view_details')}</span>
                                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 text-center text-slate-400 italic border border-dashed border-slate-200 dark:border-slate-800">
                                        Pas de séance prévue prochainement.
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
            <div className="absolute top-6 right-6 px-3 py-1 bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-400 rounded-lg uppercase tracking-widest border border-slate-100 dark:border-slate-800 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors">
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
    <div className="flex-1 text-center group">
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
        <div className={`bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] shadow-sm border border-slate-50 dark:border-slate-800 flex flex-col items-center justify-center gap-4 transition-all group cursor-pointer hover:-translate-y-1 ${theme[color]}`}>
            <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">{icon}</span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-white tracking-tight">{label}</span>
        </div>
    );
};

export default StudentDashboard;
