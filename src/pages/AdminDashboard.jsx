import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [formations, setFormations] = useState([]);
    const [userData, setUserData] = useState({ name: '', email: '', password: '', role: 'formateur' });
    const [editingUser, setEditingUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'certifications'

    useEffect(() => {
        fetchUsers();
        fetchFormations();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.users);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchFormations = async () => {
        try {
            const res = await api.get('/formations');
            setFormations(res.data.formations);
        } catch (err) { console.error(err); }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.put(`/admin/users/${editingUser}`, userData);
            } else {
                await api.post('/admin/users', userData);
            }
            setUserData({ name: '', email: '', password: '', role: 'formateur' });
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.error || 'Error saving user');
        }
    };

    const generateCertificate = async (userId, formationId) => {
        try {
            // Check eligibility first
            const eligibleRes = await api.get(`/admin/certification/eligible/${userId}/${formationId}`);
            if (!eligibleRes.data.eligible) {
                return alert(`Inéligible: ${eligibleRes.data.reason}`);
            }

            if (window.confirm('Générer le certificat pour cet utilisateur ?')) {
                await api.post('/admin/certification/generate', { userId, formationId });
                alert('Certificat généré avec succès !');
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Erreur lors de la génération');
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="main-content">
                <header className="page-header">
                    <div>
                        <h1>Espace Administratif</h1>
                        <p>Gestion des utilisateurs et certifications.</p>
                    </div>
                    <div className="header-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >Utilisateurs</button>
                        <button
                            className={`tab-btn ${activeTab === 'certifications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('certifications')}
                        >Certifications</button>
                    </div>
                </header>

                <div className="dashboard-grid">
                    {activeTab === 'users' ? (
                        <>
                            <section className="dashboard-section">
                                <div className="section-header">
                                    <h2>{editingUser ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}</h2>
                                </div>
                                <form onSubmit={handleUserSubmit} className="form-card">
                                    <input
                                        type="text"
                                        placeholder="Nom complet"
                                        value={userData.name}
                                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={userData.email}
                                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                        required
                                    />
                                    {!editingUser && (
                                        <input
                                            type="password"
                                            placeholder="Mot de passe"
                                            value={userData.password}
                                            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                                            required
                                        />
                                    )}
                                    <select
                                        value={userData.role}
                                        onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                                    >
                                        <option value="formateur">Formateur</option>
                                        <option value="Responsable">Responsable Formation</option>
                                        <option value="admin">Administratif</option>
                                    </select>
                                    <button type="submit" className="btn-primary">
                                        {editingUser ? 'Mettre à jour' : 'Créer Profil'}
                                    </button>
                                    {editingUser && (
                                        <button type="button" className="btn-secondary" onClick={() => {
                                            setEditingUser(null);
                                            setUserData({ name: '', email: '', password: '', role: 'formateur' });
                                        }}>Annuler</button>
                                    )}
                                </form>
                            </section>

                            <section className="dashboard-section">
                                <h2>Liste des Utilisateurs</h2>
                                <div className="table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Nom</th>
                                                <th>Email</th>
                                                <th>Rôle</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u._id}>
                                                    <td>{u.name}</td>
                                                    <td>{u.email}</td>
                                                    <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                                                    <td>
                                                        <button className="btn-icon" onClick={() => {
                                                            setEditingUser(u._id);
                                                            setUserData({ name: u.name, email: u.email, role: u.role });
                                                        }}>✏️</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </>
                    ) : (
                        <section className="dashboard-section full-width">
                            <h2>Éligibilité à la Certification</h2>
                            <p>Associez un utilisateur à une formation pour vérifier son éligibilité.</p>
                            <div className="certification-checker form-card">
                                <div className="checker-fields">
                                    <select id="cert-user">
                                        <option value="">Sélectionner Utilisateur</option>
                                        {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                                    </select>
                                    <select id="cert-formation">
                                        <option value="">Sélectionner Formation</option>
                                        {formations.map(f => <option key={f._id} value={f._id}>{f.title}</option>)}
                                    </select>
                                    <button className="btn-primary" onClick={() => {
                                        const userId = document.getElementById('cert-user').value;
                                        const formationId = document.getElementById('cert-formation').value;
                                        if (userId && formationId) generateCertificate(userId, formationId);
                                    }}>Vérifier & Générer</button>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
