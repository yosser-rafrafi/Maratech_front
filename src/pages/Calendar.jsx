import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import './Calendar.css';

// Lighten hex color by mixing with white (percent: 0-1)
const lightenColor = (hex, percent = 0.6) => {
    if (!hex || typeof hex !== 'string') return '#f1f5f9';
    const c = hex.replace('#', '');
    if (c.length !== 6) return hex;
    const r = Math.min(255, Math.round(parseInt(c.slice(0, 2), 16) + (255 - parseInt(c.slice(0, 2), 16)) * percent));
    const g = Math.min(255, Math.round(parseInt(c.slice(2, 4), 16) + (255 - parseInt(c.slice(2, 4), 16)) * percent));
    const b = Math.min(255, Math.round(parseInt(c.slice(4, 6), 16) + (255 - parseInt(c.slice(4, 6), 16)) * percent));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const DEFAULT_COLOR = '#6366f1';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [sessions, setSessions] = useState([]);
    const [formations, setFormations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t, i18n } = useTranslation();

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
        const monthNames = i18n.language.startsWith('ar') || i18n.language === 'tn'
            ? ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
            : i18n.language === 'de'
                ? ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
                : i18n.language === 'zh'
                    ? ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
                    : i18n.language === 'en'
                        ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
                        : ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        return (
            <div className="calendar-header">
                <button onClick={prevMonth} className="btn-icon">❮</button>
                <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                <button onClick={nextMonth} className="btn-icon">❯</button>
            </div>
        );
    };

    const renderDays = () => {
        const days = i18n.language.startsWith('ar') || i18n.language === 'tn'
            ? ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"]
            : i18n.language === 'de'
                ? ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
                : i18n.language === 'zh'
                    ? ["日", "一", "二", "三", "四", "五", "六"]
                    : i18n.language === 'en'
                        ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                        : ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
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
                        {dayFormations.map(f => {
                            const color = f.color || DEFAULT_COLOR;
                            const bgLight = lightenColor(color, 0.5);
                            return (
                                <div
                                    key={`form-${f._id}`}
                                    className="session-tag formation-start"
                                    title={`${t('dashboards.start', { defaultValue: 'Start' })}: ${f.title}`}
                                    style={{ borderLeftColor: color, background: bgLight, color: '#1e293b' }}
                                >
                                    <span className="session-time">🏁 {t('dashboards.start', { defaultValue: 'START' })}</span>
                                    <span className="session-title">{f.title}</span>
                                </div>
                            );
                        })}
                        {daySessions.map(s => {
                            const color = s.formation?.color || DEFAULT_COLOR;
                            const bgLight = lightenColor(color, 0.7);
                            return (
                                <div
                                    key={`sess-${s._id}`}
                                    className="session-tag"
                                    title={`${s.startTime} - ${s.formation?.title}`}
                                    style={{ borderLeftColor: color, background: bgLight, color: '#1e293b' }}
                                >
                                    <span className="session-time">{s.startTime}</span>
                                    <span className="session-title">{s.formation?.title}</span>
                                </div>
                            );
                        })}
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
                        <h1>{t('sidebar.calendar')}</h1>
                        <p>{t('calendar.subtitle', { defaultValue: 'View all scheduled sessions for the month.' })}</p>
                    </div>
                </header>

                <div className="calendar-container animation-fade-in">
                    {renderHeader()}
                    {renderDays()}
                    {loading ? (
                        <div className="calendar-loading">{t('common.loading')}</div>
                    ) : (
                        renderCells()
                    )}
                </div>
            </main>
        </div>
    );
};

export default Calendar;
