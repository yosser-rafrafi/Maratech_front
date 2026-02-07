import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import AlertModal from '../components/AlertModal';
import api from '../config/api';
import './Dashboard.css'; // Reuse dashboard styles

const Profile = () => {
    const { user, setUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: ''
    });
    const [alertModal, setAlertModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        variant: 'success'
    });

    if (!user) return <div>Chargement...</div>;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { name: formData.name, email: formData.email };
            if (formData.password) {
                payload.password = formData.password;
            }

            const res = await api.put('/auth/profile', payload);
            setUser(res.data.user);
            setIsEditing(false);
            setFormData({ ...formData, password: '' });
            setAlertModal({
                isOpen: true,
                title: 'Succès',
                message: 'Profil mis à jour avec succès.',
                variant: 'success'
            });
        } catch (error) {
            setAlertModal({
                isOpen: true,
                title: 'Erreur',
                message: error.response?.data?.error || 'Erreur lors de la mise à jour.',
                variant: 'error'
            });
        }
    };

    const handleCancel = () => {
        setFormData({ name: user.name, email: user.email, password: '' });
        setIsEditing(false);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <header className="page-header">
                    <div>
                        <h1>Mon Profil</h1>
                        <p>Consultez et modifiez vos informations personnelles.</p>
                    </div>
                </header>

                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 animation-fade-in">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
                                    <span className={`role-badge ${user.role} mt-2 inline-block`}>
                                        {user.role === 'student' ? 'Étudiant' :
                                            user.role === 'formateur' ? 'Formateur' :
                                                user.role === 'Responsable' ? 'Responsable' : 'Administrateur'}
                                    </span>
                                </div>
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="btn-primary"
                                >
                                    ✏️ Modifier
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="grid gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom Complet</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Adresse Email</label>
                                    <input
                                        type="email"
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nouveau Mot de Passe (optionnel)</label>
                                    <input
                                        type="password"
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Laissez vide pour ne pas changer"
                                    />
                                </div>

                                <div className="flex gap-3 mt-4">
                                    <button type="button" onClick={handleCancel} className="flex-1 btn-secondary">
                                        Annuler
                                    </button>
                                    <button type="submit" className="flex-1 btn-primary justify-center">
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 mb-1">Nom Complet</label>
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                                        {user.name}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-500 mb-1">Adresse Email</label>
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                                        {user.email}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-500 mb-1">Statut du Compte</label>
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
                                        <span className={`w-2.5 h-2.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        <span className="font-medium capitalize">{user.status}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                title={alertModal.title}
                message={alertModal.message}
                variant={alertModal.variant}
                okLabel="OK"
            />
        </div>
    );
};

export default Profile;
