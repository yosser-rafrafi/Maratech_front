import { useState, useEffect } from 'react';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import './Calendar.css';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [sessions, setSessions] = useState([]);
    const [formations, setFormations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCalendarData = async () => {
            setLoading(true);
            await Promise.all([fetchSessions(), fetchFormations()]);
            setLoading(false);
        };
        loadCalendarData();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await api.get('/sessions');
            setSessions(response.data.sessions);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const fetchFormations = async () => {
        try {
            const response = await api.get('/formations');
            setFormations(response.data.formations);
        } catch (error) {
            console.error('Error fetching formations:', error);
        }
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
    };

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderHeader = () => {
        const monthNames = [
            "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
        ];
        return (
            <div className="calendar-header">
                <button onClick={prevMonth} className="btn-icon">❮</button>
                <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                <button onClick={nextMonth} className="btn-icon">❯</button>
            </div>
        );
    };

    const renderDays = () => {
        const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
        return (
            <div className="calendar-days-header">
                {days.map(day => <div key={day} className="day-name">{day}</div>)}
            </div>
        );
    };

    const renderCells = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        const cells = [];

        // Empty cells for first week
        for (let i = 0; i < startDay; i++) {
            cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
        }

        // Real days
        for (let day = 1; day <= totalDays; day++) {
            const cellDate = new Date(year, month, day).toLocaleDateString('en-CA'); // YYYY-MM-DD
            const daySessions = sessions.filter(s => {
                const sessionDate = new Date(s.date).toLocaleDateString('en-CA');
                return sessionDate === cellDate;
            });

            const dayFormations = formations.filter(f => {
                if (!f.startDate) return false;
                const formDate = new Date(f.startDate).toLocaleDateString('en-CA');
                return formDate === cellDate;
            });

            const hasActivity = daySessions.length > 0 || dayFormations.length > 0;

            cells.push(
                <div key={day} className={`calendar-cell ${hasActivity ? 'has-session' : ''}`}>
                    <span className="day-number">{day}</span>
                    <div className="cell-sessions">
                        {dayFormations.map(f => (
                            <div key={`form-${f._id}`} className="session-tag formation-start" title={`Début: ${f.title}`}>
                                <span className="session-time">🏁 DÉBUT</span>
                                <span className="session-title">{f.title}</span>
                            </div>
                        ))}
                        {daySessions.map(s => (
                            <div key={`sess-${s._id}`} className="session-tag" title={`${s.startTime} - ${s.formation?.title}`}>
                                <span className="session-time">{s.startTime}</span>
                                <span className="session-title">{s.formation?.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return <div className="calendar-grid">{cells}</div>;
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <header className="page-header">
                    <div>
                        <h1>Calendrier des Formations</h1>
                        <p>Visualisez toutes les sessions programmées sur le mois.</p>
                    </div>
                </header>

                <div className="calendar-container animation-fade-in">
                    {renderHeader()}
                    {renderDays()}
                    {loading ? (
                        <div className="calendar-loading">Chargement...</div>
                    ) : (
                        renderCells()
                    )}
                </div>
            </main>
        </div>
    );
};

export default Calendar;
