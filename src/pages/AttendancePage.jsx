import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';
import api from '../config/api';
import './Dashboard.css';

const AttendancePage = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [session, setSession] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [localChanges, setLocalChanges] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSessionData();
    }, [sessionId]);

    const fetchSessionData = async () => {
        try {
            const [sessionRes, attendanceRes] = await Promise.all([
                api.get(`/sessions/${sessionId}`),
                api.get(`/attendance/session/${sessionId}`)
            ]);
            setSession(sessionRes.data.session);
            setAttendance(attendanceRes.data.attendance);
        } catch (error) {
            console.error('Error fetching session data:', error);
            alert(t('attendance.error_loading', { defaultValue: 'Erreur lors du chargement des données' }));
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (participantId, status) => {
        setLocalChanges(prev => ({
            ...prev,
            [participantId]: status
        }));
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            const updates = Object.entries(localChanges).map(([participantId, status]) =>
                api.post('/attendance', {
                    session: sessionId,
                    participant: participantId,
                    status
                })
            );

            await Promise.all(updates);
            alert(t('attendance.save_success'));
            setLocalChanges({});
            navigate('/formateur');
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert(t('attendance.save_error'));
        } finally {
            setSaving(false);
        }
    };

    const getParticipantStatus = (participantId) => {
        if (localChanges[participantId]) {
            return localChanges[participantId];
        }
        const record = attendance.find(a => a.participant?._id === participantId);
        return record?.status || null;
    };

    if (loading) return <div className="dashboard-layout"><Sidebar /><main className="main-content">{t('common.loading')}</main></div>;
    if (!session) return <div className="dashboard-layout"><Sidebar /><main className="main-content">{t('attendance.not_found')}</main></div>;

    const hasChanges = Object.keys(localChanges).length > 0;
    const presentCount = session.participants?.filter(p => {
        const status = getParticipantStatus(p._id);
        return status === 'present';
    }).length || 0;

    const absentCount = session.participants?.filter(p => {
        const status = getParticipantStatus(p._id);
        return status === 'absent';
    }).length || 0;

    const filteredParticipants = session.participants?.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content" style={{ backgroundColor: '#f8f9fa' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '32px' }}>
                        <button
                            onClick={() => navigate('/formateur')}
                            className="btn-secondary"
                            style={{ marginBottom: '16px' }}
                        >
                            ← {t('common.back')}
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ fontSize: '24px' }}>📋</div>
                            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
                                {t('attendance.title')}
                            </h1>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                            📚 {session.formation?.title} • {new Date(session.date).toLocaleDateString('fr-FR')} à {session.startTime}
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            border: '2px solid #e2e8f0',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <span>👥</span> PARTICIPANTS
                            </div>
                            <div style={{ fontSize: '48px', fontWeight: '700', color: '#1e293b' }}>
                                {session.participants?.length || 0}
                            </div>
                        </div>

                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            border: '2px solid #86efac',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '4px',
                                background: '#22c55e',
                                borderRadius: '16px 0 0 16px'
                            }} />
                            <div style={{ fontSize: '14px', color: '#16a34a', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <span style={{
                                    background: '#22c55e',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px'
                                }}>✓</span> PRÉSENTS
                            </div>
                            <div style={{ fontSize: '48px', fontWeight: '700', color: '#16a34a' }}>
                                {presentCount}
                            </div>
                        </div>

                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            border: '2px solid #fca5a5',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '4px',
                                background: '#ef4444',
                                borderRadius: '16px 0 0 16px'
                            }} />
                            <div style={{ fontSize: '14px', color: '#dc2626', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <span style={{
                                    background: '#ef4444',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px'
                                }}>✗</span> ABSENTS
                            </div>
                            <div style={{ fontSize: '48px', fontWeight: '700', color: '#dc2626' }}>
                                {absentCount}
                            </div>
                        </div>
                    </div>

                    {/* Search and Save Button */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                🔍
                            </span>
                            <input
                                type="text"
                                placeholder={t('attendance.search_student')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px 14px 48px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>
                        <button
                            onClick={handleSaveAll}
                            disabled={!hasChanges || saving}
                            style={{
                                padding: '14px 32px',
                                background: hasChanges ? '#6366f1' : '#cbd5e1',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: hasChanges ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                boxShadow: hasChanges ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                            }}
                        >
                            <span>💾</span> {saving ? t('common.saving', { defaultValue: 'Enregistrement...' }) : t('common.save_all')}
                        </button>
                    </div>

                    {/* Participants List */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '2px solid #e2e8f0' }}>
                        <div style={{ marginBottom: '16px', color: '#64748b', fontSize: '13px' }}>
                            {t('attendance.total_validated')} : {Object.keys(localChanges).length} / {session.participants?.length || 0} {t('sidebar.student').toLowerCase()}s
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {filteredParticipants.map(participant => {
                                const currentStatus = getParticipantStatus(participant._id);
                                const isModified = localChanges[participant._id] !== undefined;

                                return (
                                    <div
                                        key={participant._id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '16px',
                                            background: isModified ? '#f0f9ff' : '#fafafa',
                                            borderRadius: '12px',
                                            border: isModified ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '18px',
                                                fontWeight: '600',
                                                position: 'relative'
                                            }}>
                                                {participant.name.charAt(0).toUpperCase()}
                                                {currentStatus === 'present' && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '-2px',
                                                        right: '-2px',
                                                        width: '16px',
                                                        height: '16px',
                                                        background: '#22c55e',
                                                        borderRadius: '50%',
                                                        border: '2px solid white'
                                                    }} />
                                                )}
                                                {currentStatus === 'absent' && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '-2px',
                                                        right: '-2px',
                                                        width: '16px',
                                                        height: '16px',
                                                        background: '#ef4444',
                                                        borderRadius: '50%',
                                                        border: '2px solid white'
                                                    }} />
                                                )}
                                                {currentStatus === 'late' && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '-2px',
                                                        right: '-2px',
                                                        width: '16px',
                                                        height: '16px',
                                                        background: '#f59e0b',
                                                        borderRadius: '50%',
                                                        border: '2px solid white'
                                                    }} />
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '15px' }}>
                                                    {participant.name}
                                                </div>
                                                <div style={{ color: '#64748b', fontSize: '13px' }}>
                                                    {participant.email}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleStatusChange(participant._id, 'present')}
                                                style={{
                                                    padding: '10px 20px',
                                                    borderRadius: '10px',
                                                    border: currentStatus === 'present' ? 'none' : '1.5px solid #e5e7eb',
                                                    background: currentStatus === 'present' ? '#22c55e' : 'white',
                                                    color: currentStatus === 'present' ? 'white' : '#64748b',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    boxShadow: currentStatus === 'present' ? '0 4px 12px rgba(34, 197, 94, 0.3)' : 'none'
                                                }}
                                            >
                                                <span>{currentStatus === 'present' ? '✓' : '○'}</span> {t('attendance.present')}
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(participant._id, 'late')}
                                                style={{
                                                    padding: '10px 20px',
                                                    borderRadius: '10px',
                                                    border: currentStatus === 'late' ? 'none' : '1.5px solid #e5e7eb',
                                                    background: currentStatus === 'late' ? '#f59e0b' : 'white',
                                                    color: currentStatus === 'late' ? 'white' : '#64748b',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    boxShadow: currentStatus === 'late' ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none'
                                                }}
                                            >
                                                <span>{currentStatus === 'late' ? '⏰' : '○'}</span> {t('attendance.late')}
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(participant._id, 'absent')}
                                                style={{
                                                    padding: '10px 20px',
                                                    borderRadius: '10px',
                                                    border: currentStatus === 'absent' ? 'none' : '1.5px solid #e5e7eb',
                                                    background: currentStatus === 'absent' ? '#ef4444' : 'white',
                                                    color: currentStatus === 'absent' ? 'white' : '#64748b',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    boxShadow: currentStatus === 'absent' ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none'
                                                }}
                                            >
                                                <span>{currentStatus === 'absent' ? '✗' : '○'}</span> {t('attendance.absent')}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AttendancePage;
