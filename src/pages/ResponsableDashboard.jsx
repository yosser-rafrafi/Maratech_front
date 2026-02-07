import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

import FormationManagement from '../components/admin/FormationManagement';
import UserManagement from '../components/admin/UserManagement';
import CertificationPanel from '../components/admin/CertificationPanel';
import StudentDetails from '../components/admin/StudentDetails';

const ResponsableDashboard = () => {
    const { user } = useAuth();
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
                        <h1>Espace Responsable</h1>
                        <p>Gestion pédagogique et suivi des formations.</p>
                    </div>

                    <div className="header-tabs">
                        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Vue d'ensemble</button>
                        <button className={`tab-btn ${activeTab === 'formations' ? 'active' : ''}`} onClick={() => setActiveTab('formations')}>Formations</button>
                        <button className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>Étudiants</button>
                        <button className={`tab-btn ${activeTab === 'certifications' ? 'active' : ''}`} onClick={() => setActiveTab('certifications')}>Certifications</button>
                    </div>
                </header>

                <div className="dashboard-grid">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Formations Actives</h3>
                                <span className="text-4xl font-extrabold text-slate-900">{stats.formations}</span>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Étudiants Suivis</h3>
                                <span className="text-4xl font-extrabold text-slate-900">{stats.students}</span>
                            </div>
                        </div>
                    )}

                    {activeTab === 'formations' && <FormationManagement />}

                    {activeTab === 'students' && !viewingStudent && (
                        <UserManagement
                            allowedRoles={['student']}
                            canApprove={false}
                            title="Gestion des Étudiants"
                            showRoleFilter={false} // Only students
                            onViewDetails={setViewingStudent}
                        />
                    )}

                    {activeTab === 'students' && viewingStudent && (
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

export default ResponsableDashboard;
