import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

import FormationManagement from '../components/admin/FormationManagement';
import UserManagement from '../components/admin/UserManagement';
import CertificationPanel from '../components/admin/CertificationPanel';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ users: { total: 0, pending: 0 }, formations: 0, certificates: 0 });
    const [viewingStudent, setViewingStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'formations', 'users', 'certifications'

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="main-content">
                <header className="page-header">
                    <div>
                        <h1>Espace Administratif</h1>
                        <p>Gestion globale de la plateforme.</p>
                    </div>

                    <div className="header-tabs">
                        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Vue d'ensemble</button>
                        <button className={`tab-btn ${activeTab === 'formations' ? 'active' : ''}`} onClick={() => setActiveTab('formations')}>Formations</button>
                        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Utilisateurs</button>
                        <button className={`tab-btn ${activeTab === 'certifications' ? 'active' : ''}`} onClick={() => setActiveTab('certifications')}>Certifications</button>
                    </div>
                </header>

                <div className="dashboard-grid">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Utilisateurs</h3>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-extrabold text-slate-900">{stats.users?.total || 0}</span>
                                    {stats.users?.pending > 0 && (
                                        <span className="text-sm text-yellow-600 font-bold mb-1 bg-yellow-50 px-2 py-0.5 rounded-full">{stats.users.pending} en attente</span>
                                    )}
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Formations</h3>
                                <span className="text-4xl font-extrabold text-slate-900">{stats.formations || 0}</span>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Certificats Délivrés</h3>
                                <span className="text-4xl font-extrabold text-slate-900">{stats.certificates || 0}</span>
                            </div>
                        </div>
                    )}

                    {activeTab === 'formations' && <FormationManagement />}

                    {activeTab === 'users' && !viewingStudent && (
                        <UserManagement
                            allowedRoles={['admin', 'responsable', 'formateur', 'student']}
                            canApprove={true}
                            title="Gestion des Utilisateurs"
                            onViewDetails={setViewingStudent}
                        />
                    )}

                    {activeTab === 'users' && viewingStudent && (
                        <div className="animation-fade-in">
                            <button onClick={() => setViewingStudent(null)} className="mb-4 text-slate-500 hover:text-slate-800 flex items-center gap-2">
                                <span>←</span> Retour à la liste
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
