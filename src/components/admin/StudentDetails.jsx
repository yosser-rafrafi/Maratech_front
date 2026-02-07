import { useState, useEffect } from 'react';
import api from '../../config/api';

const StudentDetails = ({ student, onBack }) => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudentData();
    }, [student._id]);

    const fetchStudentData = async () => {
        try {
            // 1. Get all sessions user is enrolled in to find formations
            // Note: We don't have a direct "enrolled formations" endpoint, so we infer from sessions or use a new endpoint.
            // A better way: Get all formations, then check progress for each.
            // Or: Get sessions where participant is user.

            const sessionsRes = await api.get('/sessions'); // This returns ALL sessions. Inefficient.
            // Better: Filter sessions by participant in backend. We don't have that yet? 
            // We DO have `get /sessions` with query? No, `routes/sessions.js` only filters by formation.

            // Alternative: Fetch all formations, then for each, fetch progress.
            const formationsRes = await api.get('/formations');
            const formations = formationsRes.data.formations;

            const progressPromises = formations.map(f =>
                api.get(`/formations/progress/${f._id}/user/${student._id}`)
            );

            const progressResults = await Promise.all(progressPromises);

            // Filter only formations where student has ANY activity or is enrolled?
            // "Enrolled" means usually they exist in participants list of sessions.
            // The progress endpoint returns { totalSessions, attendedSessions }.
            // If totalSessions > 0, we can show it. 
            // But we only want to show formations they are "following".
            // Since we don't have a formal registration to formation, we assume they are "following" if they are in sessions?
            // Actually, `progress` endpoint just calculates attendance vs total sessions. 
            // It doesn't tell us if they are "registered".

            // Let's rely on the progress data. If they have attended > 0, show it?
            // Or just show ALL formations and their status.

            const statsData = progressResults.map((res, index) => ({
                formation: formations[index],
                data: res.data
            })).filter(stat => stat.data.totalSessions > 0 && (stat.data.attendedSessions > 0 || stat.data.missedSessions > 0));

            setStats(statsData);

        } catch (error) {
            console.error('Error fetching student details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Chargement du profil...</div>;

    return (
        <div className="dashboard-section animation-fade-in">
            <div className="section-header">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="btn-secondary">← Retour</button>
                    <div>
                        <h2>{student.name}</h2>
                        <p className="text-slate-500">{student.email} • {student.role}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.map(({ formation, data }) => (
                    <div key={formation._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-bold text-lg mb-2">{formation.title}</h3>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Progression</span>
                                    <span className="font-bold">{data.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full ${data.progress >= 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                                        style={{ width: `${data.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <span className="block text-slate-500 text-xs uppercase">Présences</span>
                                    <span className="text-xl font-bold text-green-600">{data.attendedSessions}</span>
                                    <span className="text-slate-400"> / {data.totalSessions}</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <span className="block text-slate-500 text-xs uppercase">Absences</span>
                                    <span className="text-xl font-bold text-red-500">{data.missedSessions}</span>
                                </div>
                            </div>

                            {data.progress >= 100 ? (
                                <div className="bg-green-50 border border-green-100 text-green-800 px-4 py-2 rounded-lg flex items-center gap-2">
                                    <span>🏆</span>
                                    <span className="font-medium">Formation Validée</span>
                                </div>
                            ) : (
                                <div className="bg-slate-50 border border-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm">
                                    En cours...
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentDetails;
