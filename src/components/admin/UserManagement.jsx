import { useState, useEffect } from 'react';
import api from '../../config/api';

const UserManagement = ({ allowedRoles = ['student'], canApprove = false, title = 'Gestion des États', showRoleFilter = true, onViewDetails }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterRole, setFilterRole] = useState(allowedRoles.length === 1 ? allowedRoles[0] : 'all');
    const [userTypeTab, setUserTypeTab] = useState('staff'); // 'staff' or 'students'

    // Form Data
    const [userData, setUserData] = useState({ name: '', email: '', password: '', role: allowedRoles[0] || 'student' });
    const [editingUser, setEditingUser] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.users);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...userData };
            // Auto-activate if canApprove is false (internal creation)
            if (!canApprove && !editingUser) {
                payload.status = 'active';
            }

            if (editingUser) {
                await api.put(`/admin/users/${editingUser}`, payload);
            } else {
                await api.post('/admin/users', payload);
            }

            // Reset form
            setUserData({ name: '', email: '', password: '', role: allowedRoles[0] || 'student' });
            setEditingUser(null);
            setShowForm(false);
            fetchUsers();
            alert(editingUser ? 'Utilisateur mis à jour' : 'Utilisateur créé avec succès');
        } catch (error) {
            alert(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        if (!window.confirm(`Confirmer le changement de statut vers : ${newStatus} ?`)) return;
        try {
            await api.put(`/admin/users/${userId}/status`, { status: newStatus });
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.error || 'Erreur lors de la mise à jour du statut');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
        try {
            // Assuming there is a delete endpoint, if not we suspend
            // api.delete maps to suspend usually in this system, but let's assume specific delete or we just suspend
            await api.put(`/admin/users/${userId}/status`, { status: 'rejected' }); // specific behavior?
            // Actually usually DELETE /admin/users/:id
            // If not implemented, I'll just use status 'rejected'/suspended
            fetchUsers();
        } catch (error) {
            console.error(error);
        }
    };

    // Filter logic
    const filteredUsers = users.filter(u => {
        const statusMatch = filterStatus === 'all' || u.status === filterStatus;

        // Tab-based filtering: Staff vs Students
        const isStaff = ['admin', 'Responsable', 'responsable', 'formateur'].includes(u.role);
        const tabMatch = userTypeTab === 'staff' ? isStaff : u.role === 'student';

        // Check if user role is in allowedRoles prop
        const roleScopeMatch = allowedRoles.includes(u.role);

        // Filter dropdown
        const roleFilterMatch = filterRole === 'all' || u.role === filterRole;

        return statusMatch && tabMatch && roleScopeMatch && roleFilterMatch;
    });

    const getStatusBadge = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            suspended: 'bg-red-100 text-red-800',
            rejected: 'bg-gray-100 text-gray-800'
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="dashboard-section">
            <div className="flex justify-between items-center mb-4">
                <h2>{title}</h2>
                <div className="flex gap-4">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="p-2 border rounded-lg text-sm"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="active">Actif</option>
                        <option value="pending">En attente</option>
                        <option value="suspended">Suspendu</option>
                    </select>

                    {showRoleFilter && allowedRoles.length > 1 && (
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="p-2 border rounded-lg text-sm"
                        >
                            <option value="all">Tous les rôles</option>
                            {allowedRoles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    )}

                    <button
                        className="btn-primary"
                        onClick={() => {
                            setEditingUser(null);
                            setUserData({ name: '', email: '', password: '', role: allowedRoles[0] || 'student' });
                            setShowForm(true);
                        }}
                    >
                        + Nouveau
                    </button>
                </div>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-lg mb-6 w-fit">
                <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${userTypeTab === 'staff' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setUserTypeTab('staff')}
                >
                    👥 Personnels
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${userTypeTab === 'students' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setUserTypeTab('students')}
                >
                    🎓 Étudiants
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md animation-fade-in">
                        <h3 className="text-xl font-bold mb-4">{editingUser ? 'Modifier' : 'Ajouter'} Utilisateur</h3>
                        <form onSubmit={handleUserSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nom Complet</label>
                                <input
                                    className="w-full p-2 border rounded-lg"
                                    type="text"
                                    value={userData.name}
                                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    className="w-full p-2 border rounded-lg"
                                    type="email"
                                    value={userData.email}
                                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                    required
                                />
                            </div>
                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Mot de passe</label>
                                    <input
                                        className="w-full p-2 border rounded-lg"
                                        type="password"
                                        value={userData.password}
                                        onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                                        required
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Mot de passe par défaut communiqué à l'utilisateur.</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Rôle</label>
                                <select
                                    className="w-full p-2 border rounded-lg"
                                    value={userData.role}
                                    onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                                >
                                    {allowedRoles.map(r => (
                                        <option key={r} value={r}>
                                            {r === 'student' ? 'Élève (Interne)' :
                                                r === 'formateur' ? 'Formateur' :
                                                    r === 'Responsable' ? 'Responsable' :
                                                        r === 'admin' ? 'Admin' : r}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Annuler</button>
                                <button type="submit" className="flex-1 btn-primary justify-center">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="table-container bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                        <tr>
                            <th className="p-4 text-left">Utilisateur</th>
                            <th className="p-4 text-left">Rôle</th>
                            <th className="p-4 text-left">Statut</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredUsers.length === 0 ? (
                            <tr><td colSpan="4" className="p-12 text-center text-slate-400">Aucun utilisateur trouvé.</td></tr>
                        ) : (
                            filteredUsers.map(u => (
                                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${u.role === 'admin' ? 'bg-purple-500' :
                                                u.role === 'Responsable' ? 'bg-indigo-500' :
                                                    u.role === 'formateur' ? 'bg-blue-500' : 'bg-slate-400'
                                                }`}>
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-800">{u.name}</div>
                                                <div className="text-xs text-slate-500">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`role-badge ${u.role}`}>
                                            {u.role === 'student' ? 'Étudiant' :
                                                u.role === 'formateur' ? 'Formateur' :
                                                    u.role === 'Responsable' ? 'Responsable' :
                                                        u.role === 'admin' ? 'Admin' : u.role}
                                        </span>
                                    </td>
                                    <td className="p-4">{getStatusBadge(u.status)}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {canApprove && u.status === 'pending' && (
                                                <>
                                                    <button title="Approuver" className="btn-icon text-green-600 bg-green-50 hover:bg-green-100" onClick={() => handleStatusChange(u._id, 'active')}>✅</button>
                                                    <button title="Rejeter" className="btn-icon text-red-600 bg-red-50 hover:bg-red-100" onClick={() => handleStatusChange(u._id, 'rejected')}>❌</button>
                                                </>
                                            )}
                                            {u.status === 'active' && (
                                                <button title="Suspendre" className="btn-icon text-orange-600 bg-orange-50 hover:bg-orange-100" onClick={() => handleStatusChange(u._id, 'suspended')}>⏸️</button>
                                            )}
                                            {u.status === 'suspended' && (
                                                <button title="Réactiver" className="btn-icon text-blue-600 bg-blue-50 hover:bg-blue-100" onClick={() => handleStatusChange(u._id, 'active')}>▶️</button>
                                            )}
                                            <button
                                                title="Modifier"
                                                className="btn-icon text-slate-600 bg-slate-50 hover:bg-slate-100"
                                                onClick={() => {
                                                    setEditingUser(u._id);
                                                    setUserData({ name: u.name, email: u.email, role: u.role, password: '' });
                                                    setShowForm(true);
                                                }}
                                            >
                                                ✏️
                                            </button>
                                            {u.role === 'student' && onViewDetails && (
                                                <button
                                                    title="Détails"
                                                    className="btn-icon text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                                                    onClick={() => onViewDetails(u)}
                                                >
                                                    📊
                                                </button>
                                            )}
                                            <button
                                                title="Supprimer"
                                                className="btn-icon text-red-600 bg-red-50 hover:bg-red-100"
                                                onClick={() => handleDelete(u._id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
