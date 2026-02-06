import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import './Dashboard.css';

const ParticipantDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [sessions, setSessions] = useState([]);
    const [enrolledSessions, setEnrolledSessions] = useState([]);
    const [myAttendance, setMyAttendance] = useState([]);

    useEffect(() => {
        fetchSessions();
        fetchMyAttendance();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await api.get('/sessions');
            const allSessions = response.data.sessions;

            // Separate enrolled and available sessions
            const enrolled = allSessions.filter(s =>
                s.participants?.some(p => p._id === user.id)
            );
            const available = allSessions.filter(s =>
                !s.participants?.some(p => p._id === user.id)
            );

            setEnrolledSessions(enrolled);
            setSessions(available);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const fetchMyAttendance = async () => {
        try {
            const response = await api.get(`/attendance/participant/${user.id}`);
            setMyAttendance(response.data.attendance);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    const enrollInSession = async (sessionId) => {
        try {
            await api.post(`/sessions/${sessionId}/enroll`);
            fetchSessions();
        } catch (error) {
            alert(error.response?.data?.error || 'Error enrolling in session');
        }
    };

    const unenrollFromSession = async (sessionId) => {
        if (window.confirm('Are you sure you want to unenroll from this session?')) {
            try {
                await api.post(`/sessions/${sessionId}/unenroll`);
                fetchSessions();
            } catch (error) {
                alert(error.response?.data?.error || 'Error unenrolling from session');
            }
        }
    };

    const getAttendanceStatus = (sessionId) => {
        const record = myAttendance.find(a => a.session?._id === sessionId);
        return record?.status || 'Not marked';
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>Participant Dashboard</h1>
                    <p>Welcome, {user?.name}</p>
                </div>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
            </header>

            <div className="dashboard-content">
                {/* Enrolled Sessions */}
                <section className="dashboard-section">
                    <h2>My Enrolled Sessions</h2>

                    {enrolledSessions.length === 0 ? (
                        <p className="empty-state">You haven't enrolled in any sessions yet.</p>
                    ) : (
                        <div className="cards-grid">
                            {enrolledSessions.map((session) => (
                                <div key={session._id} className="card">
                                    <h3>{session.formation?.title}</h3>
                                    <p>{session.formation?.description}</p>
                                    <p className="card-meta">Date: {new Date(session.date).toLocaleDateString()}</p>
                                    <p className="card-meta">Time: {session.startTime} - {session.endTime}</p>
                                    <p className="card-meta">Formateur: {session.formateur?.name}</p>
                                    <p className="card-meta">
                                        Attendance:
                                        <span className={`status-badge status-${getAttendanceStatus(session._id)}`}>
                                            {getAttendanceStatus(session._id)}
                                        </span>
                                    </p>
                                    <button
                                        onClick={() => unenrollFromSession(session._id)}
                                        className="btn-delete"
                                    >
                                        Unenroll
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Available Sessions */}
                <section className="dashboard-section">
                    <h2>Available Sessions</h2>

                    {sessions.length === 0 ? (
                        <p className="empty-state">No available sessions at the moment.</p>
                    ) : (
                        <div className="cards-grid">
                            {sessions.map((session) => {
                                const isFull = session.participants?.length >= session.maxParticipants;

                                return (
                                    <div key={session._id} className="card">
                                        <h3>{session.formation?.title}</h3>
                                        <p>{session.formation?.description}</p>
                                        <p className="card-meta">Date: {new Date(session.date).toLocaleDateString()}</p>
                                        <p className="card-meta">Time: {session.startTime} - {session.endTime}</p>
                                        <p className="card-meta">Formateur: {session.formateur?.name}</p>
                                        <p className="card-meta">
                                            Spots: {session.participants?.length}/{session.maxParticipants}
                                            {isFull && <span className="status-badge status-absent"> FULL</span>}
                                        </p>
                                        <button
                                            onClick={() => enrollInSession(session._id)}
                                            className="btn-primary"
                                            disabled={isFull}
                                        >
                                            {isFull ? 'Session Full' : 'Enroll'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ParticipantDashboard;
