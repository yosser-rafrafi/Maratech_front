import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Sidebar from '../components/Sidebar';
import './Dashboard.css'; // Re-use dashboard styles

const Profile = () => {
    const { user, setUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        profileImage: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                profileImage: user.profileImage || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 100000) { // 100KB limit
                return setMessage({ type: 'error', text: 'Image too large (max 100KB)' });
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profileImage: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const updateData = { ...formData };
            if (!updateData.password) delete updateData.password;

            const res = await api.put('/auth/me', updateData);

            // Update local user context
            const updatedUser = res.data.user;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            if (setUser) setUser(updatedUser); // Assuming setUser is exposed from context, need to check AuthContext

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <header className="page-header">
                    <div>
                        <h1>Mon Profil</h1>
                        <p>Gérez vos informations personnelles.</p>
                    </div>
                </header>

                <div className="dashboard-section" style={{ maxWidth: '600px' }}>

                    {message.text && (
                        <div className={`p-4 mb-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex justify-center mb-6">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200">
                            {formData.profileImage ? (
                                <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400">
                                    {formData.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="form-card">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Photo de Profil (Optionnel)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="text-xs text-slate-400 mt-1">Max 100KB.</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nom Complet</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nouveau Mot de Passe (Laisser vide pour conserver)</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg"
                                placeholder="******"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full justify-center"
                            disabled={loading}
                        >
                            {loading ? 'Mise à jour...' : 'Sauvegarder les modifications'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default Profile;
