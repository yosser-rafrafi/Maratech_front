import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import { StatCard, FormationDistributionChart, ProgressLineChart } from '../components/DashboardCharts';
import './Dashboard.css';

import FormationManagement from '../components/admin/FormationManagement';
import UserManagement from '../components/admin/UserManagement';
import CertificationPanel from '../components/admin/CertificationPanel';
import StudentDetails from '../components/admin/StudentDetails';

const ResponsableDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [stats, setStats] = useState({ formations: 0, students: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'formations', 'students', 'certifications'
    const [viewingStudent, setViewingStudent] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Fetch basic stats for dashboard overview
            const [fRes, uRes] = await Promise.all([
                api.get('/formations'),
                api.get('/admin/users')
            ]);

            const students = uRes.data.users.filter(u => u.role === 'student');
            setStats({
                formations: fRes.data.formations.length,
                students: students.length
            });
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="main-content">
                <header className="page-header">
                    <div>
                        <h1>{t('dashboards.resp_title')}</h1>
                        <p>{t('dashboards.resp_subtitle', { defaultValue: 'Gestion pédagogique et suivi des formations.' })}</p>
                    </div>

                    <div className="header-tabs">
                        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>{t('dashboards.overview')}</button>
                        <button className={`tab-btn ${activeTab === 'formations' ? 'active' : ''}`} onClick={() => setActiveTab('formations')}>{t('dashboards.formations')}</button>
                        <button className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>{t('dashboards.eleves')}</button>
                        <button className={`tab-btn ${activeTab === 'certifications' ? 'active' : ''}`} onClick={() => setActiveTab('certifications')}>{t('dashboards.certifications')}</button>
                    </div>
                </header>

                <div className="dashboard-grid">
                    {activeTab === 'overview' && (
                        <>
                            {/* Key Metrics Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <StatCard
                                    title={t('dashboards.stats.active_formations')}
                                    value={stats.formations}
                                    icon="school"
                                    color="#3b82f6"
                                />
                                <StatCard
                                    title={t('dashboards.stats.students_followed', { defaultValue: 'Élèves Suivis' })}
                                    value={stats.students}
                                    icon="group"
                                    color="#10b981"
                                />
                                <StatCard
                                    title={t('dashboards.stats.success_rate')}
                                    value="92%"
                                    icon="emoji_events"
                                    color="#f59e0b"
                                />
                                <StatCard
                                    title={t('dashboards.stats.total_hours', { defaultValue: 'Heures Totales' })}
                                    value="1,240"
                                    icon="schedule"
                                    color="#8b5cf6"
                                />
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-800 mb-6">Répartition des Élèves</h3>
                                    <div className="h-64">
                                        <FormationDistributionChart />
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-800 mb-6">Progression Générale</h3>
                                    <div className="h-64">
                                        <ProgressLineChart />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'formations' && <FormationManagement />}

                    {activeTab === 'students' && !viewingStudent && (
                        <UserManagement
                            allowedRoles={['student', 'formateur']}
                            canApprove={false}
                            title={t('dashboards.users_management', { defaultValue: 'Gestion des Utilisateurs' })}
                            showRoleFilter={true}
                            onViewDetails={setViewingStudent}
                        />
                    )}

                    {activeTab === 'students' && viewingStudent && (
                        <div className="animation-fade-in">
                            <button onClick={() => setViewingStudent(null)} className="mb-4 text-slate-500 hover:text-slate-800 flex items-center gap-2">
                                <span>←</span> {t('common.back_to_list', { defaultValue: 'Retour à la liste' })}
                            </button>
                            <StudentDetails student={viewingStudent} />
                        </div>
                    )}

                    {activeTab === 'certifications' && <CertificationPanel />}
                </div>
            </main>
        </div>
    );
};

export default ResponsableDashboard;
