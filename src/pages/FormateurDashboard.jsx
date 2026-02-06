import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import './Dashboard.css';

const FormateurDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [attendance, setAttendance] = useState([]);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await api.get('/sessions');
            // Filter sessions where current user is the formateur
            const mySessions = response.data.sessions.filter(
                s => s.formateur?._id === user.id
            );
            setSessions(mySessions);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const fetchAttendance = async (sessionId) => {
        try {
            const response = await api.get(`/attendance/session/${sessionId}`);
            setAttendance(response.data.attendance);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    const markAttendance = async (sessionId, participantId, status) => {
        try {
            await api.post('/attendance', {
                session: sessionId,
                participant: participantId,
                status
            });
            fetchAttendance(sessionId);
        } catch (error) {
            alert(error.response?.data?.error || 'Error marking attendance');
        }
    };

    const viewSessionDetails = (session) => {
        setSelectedSession(session);
        fetchAttendance(session._id);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>Formateur Dashboard</h1>
                    <p>Welcome, {user?.name}</p>
                </div>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
            </header>

            <div className="dashboard-content">
                <section className="dashboard-section">
                    <h2>My Sessions</h2>

                    {sessions.length === 0 ? (
                        <p className="empty-state">No sessions assigned yet.</p>
                    ) : (
                        <div className="cards-grid">
                            {sessions.map((session) => (
                                <div key={session._id} className="card">
                                    <h3>{session.formation?.title}</h3>
                                    <p className="card-meta">Date: {new Date(session.date).toLocaleDateString()}</p>
                                    <p className="card-meta">Time: {session.startTime} - {session.endTime}</p>
                                    <p className="card-meta">Participants: {session.participants?.length}/{session.maxParticipants}</p>
                                    <button
                                        onClick={() => viewSessionDetails(session)}
                                        className="btn-primary"
                                    >
                                        Manage Attendance
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {selectedSession && (
                    <section className="dashboard-section">
                        <h2>Attendance for {selectedSession.formation?.title}</h2>
                        <p className="card-meta">
                            {new Date(selectedSession.date).toLocaleDateString()} | {selectedSession.startTime} - {selectedSession.endTime}
                        </p>

                        <div className="attendance-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Participant</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedSession.participants?.map((participant) => {
                                        const attendanceRecord = attendance.find(
                                            a => a.participant?._id === participant._id
                                        );

                                        return (
                                            <tr key={participant._id}>
                                                <td>{participant.name}</td>
                                                <td>{participant.email}</td>
                                                <td>
                                                    <span className={`status-badge status-${attendanceRecord?.status || 'absent'}`}>
                                                        {attendanceRecord?.status || 'Not Marked'}
                                                    </span>
                                                </td>
                                                <td className="action-buttons">
                                                    <button
                                                        onClick={() => markAttendance(selectedSession._id, participant._id, 'present')}
                                                        className="btn-small btn-success"
                                                    >
                                                        Present
                                                    </button>
                                                    <button
                                                        onClick={() => markAttendance(selectedSession._id, participant._id, 'late')}
                                                        className="btn-small btn-warning"
                                                    >
                                                        Late
                                                    </button>
                                                    <button
                                                        onClick={() => markAttendance(selectedSession._id, participant._id, 'absent')}
                                                        className="btn-small btn-danger"
                                                    >
                                                        Absent
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default FormateurDashboard;
