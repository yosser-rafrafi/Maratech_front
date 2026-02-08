import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import { StatCard, AttendanceChart, FormationDistributionChart, ProgressLineChart } from '../components/DashboardCharts';
import './Dashboard.css';

import FormationManagement from '../components/admin/FormationManagement';
import UserManagement from '../components/admin/UserManagement';
import CertificationPanel from '../components/admin/CertificationPanel';
import StudentDetails from '../components/admin/StudentDetails';

const AdminDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [stats, setStats] = useState({ users: { total: 0, pending: 0 }, formations: 0, certificates: 0 });
    const [chartData, setChartData] = useState({ formationDistribution: null, platformActivity: null });
    const [viewingStudent, setViewingStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'formations', 'users', 'certifications'

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [statsRes, chartsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/stats/charts')
            ]);
            setStats(statsRes.data);
            setChartData(chartsRes.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="main-content">
                <header className="page-header">
                    <div>
                        <h1>{t('dashboards.admin_title')}</h1>
                        <p>{t('dashboards.admin_subtitle')}</p>
                    </div>

                    <div className="header-tabs">
                        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>{t('dashboards.overview')}</button>
                        <button className={`tab-btn ${activeTab === 'formations' ? 'active' : ''}`} onClick={() => setActiveTab('formations')}>{t('dashboards.formations')}</button>
                        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>{t('dashboards.users')}</button>
                        <button className={`tab-btn ${activeTab === 'certifications' ? 'active' : ''}`} onClick={() => setActiveTab('certifications')}>{t('dashboards.certifications')}</button>
                    </div>
                </header>

                <div className="dashboard-grid">
                    {activeTab === 'overview' && (
                        <>
                            {/* Key Metrics Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <StatCard
                                    title={t('dashboards.stats.total_users')}
                                    value={stats.users?.total || 0}
                                    icon="group"
                                    color="#3b82f6"
                                    trend={12}
                                />
                                <StatCard
                                    title={t('dashboards.stats.pending_users')}
                                    value={stats.users?.pending || 0}
                                    icon="person_alert"
                                    color="#f59e0b"
                                    trend={-5}
                                />
                                <StatCard
                                    title={t('dashboards.stats.active_formations')}
                                    value={stats.formations || 0}
                                    icon="school"
                                    color="#8b5cf6"
                                    trend={8}
                                />
                                <StatCard
                                    title={t('dashboards.stats.certificates')}
                                    value={stats.certificates || 0}
                                    icon="workspace_premium"
                                    color="#10b981"
                                    trend={24}
                                />
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-800 mb-6">{t('dashboards.formation_distribution')}</h3>
                                    <div className="h-64">
                                        <FormationDistributionChart data={chartData.formationDistribution} />
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-800 mb-6">{t('dashboards.platform_activity')}</h3>
                                    <div className="h-64">
                                        <ProgressLineChart data={chartData.platformActivity} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'formations' && <FormationManagement />}

                    {activeTab === 'users' && !viewingStudent && (
                        <UserManagement
                            allowedRoles={['student', 'Responsable', 'formateur']}
                            canApprove={true}
                            title={t('dashboards.users_management')}
                            onViewDetails={setViewingStudent}
                        />
                    )}

                    {activeTab === 'users' && viewingStudent && (
                        <div className="animation-fade-in">
                            <button onClick={() => setViewingStudent(null)} className="mb-4 text-slate-500 hover:text-slate-800 flex items-center gap-2">
                                <span>←</span> {t('common.back')}
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

export default AdminDashboard;
