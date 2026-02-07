import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import StudentSidebar from '../components/StudentSidebar';

const StudentAttendedSessions = () => {
    const [loading, setLoading] = useState(true);
    const [attendedSessions, setAttendedSessions] = useState([]);

    useEffect(() => {
        const fetchAttendedSessions = async () => {
            try {
                const response = await api.get('/student/dashboard');
                // Filter sessions where attendance is present
                // We need to look at all formations' sessions and filter by attendanceStatus
                const allSessions = [];
                response.data.formations.forEach(f => {
                    if (f.sessions) {
                        f.sessions.forEach(s => {
                            if (s.attendanceStatus === 'present') {
                                allSessions.push({
                                    ...s,
                                    formationTitle: f.title
                                });
                            }
                        });
                    }
                });

                // Sort by date descending (most recent first)
                allSessions.sort((a, b) => new Date(b.date) - new Date(a.date));
                setAttendedSessions(allSessions);
            } catch (error) {
                console.error('Error fetching attended sessions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendedSessions();
    }, []);

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
                <header className="mb-10">
                    <Link to="/student-dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-4">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-500 text-4xl">check_circle</span>
                        Attended Sessions
                    </h1>
                </header>

                {attendedSessions.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                        <p className="text-slate-500 dark:text-slate-400">
                            No attended sessions found yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {attendedSessions.map(session => (
                            <div key={session._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-2xl">event_available</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{session.title || 'Session'}</h3>
                                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            <span className="font-medium text-indigo-600 dark:text-indigo-400">{session.formationTitle}</span>
                                            <span>•</span>
                                            <span>{session.level?.title || 'Level'}</span>
                                            <span>•</span>
                                            <span>{new Date(session.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold uppercase rounded-full">
                                        Present
                                    </span>
                                    <Link to={`/student-session/${session._id}`} className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                                        View Details
                                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
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

export default StudentAttendedSessions;
