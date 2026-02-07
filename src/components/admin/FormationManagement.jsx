import { useState, useEffect } from 'react';
import api from '../../config/api';
import FormationDetails from './FormationDetails';

const FormationManagement = () => {
    const [formations, setFormations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedFormation, setSelectedFormation] = useState(null); // For Details View
    const [editingFormation, setEditingFormation] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '',
        startDate: '',
        defaultFormateur: ''
    });
    const [formateurs, setFormateurs] = useState([]);

    useEffect(() => {
        fetchFormations();
    }, []);

    const fetchFormations = async () => {
        try {
            const [formationsRes, usersRes] = await Promise.all([
                api.get('/formations'),
                api.get('/admin/users')
            ]);
            setFormations(formationsRes.data.formations);
            setFormateurs(usersRes.data.users.filter(u => u.role === 'formateur'));
        } catch (error) {
            console.error('Error fetching formations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingFormation) {
                await api.put(`/formations/${editingFormation._id}`, formData);
            } else {
                await api.post('/formations', formData);
            }
            setShowModal(false);
            setEditingFormation(null);
            setFormData({ title: '', description: '', duration: '', startDate: '', defaultFormateur: '' });
            fetchFormations();
        } catch (error) {
            alert(error.response?.data?.error || 'Error saving formation');
        }
    };

    const handleEdit = (formation) => {
        setEditingFormation(formation);
        setFormData({
            title: formation.title,
            description: formation.description,
            duration: formation.duration,
            startDate: formation.startDate.split('T')[0],
            defaultFormateur: formation.defaultFormateur?._id || ''
        });
        setShowModal(true);
    };

    const handleArchive = async (id, currentStatus) => {
        if (window.confirm(`Êtes-vous sûr de vouloir ${currentStatus ? 'archiver' : 'activer'} cette formation ?`)) {
            try {
                await api.put(`/formations/${id}`, { active: !currentStatus });
                fetchFormations();
            } catch (error) {
                console.error('Error updating status:', error);
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible.')) {
            try {
                await api.delete(`/formations/${id}`);
                fetchFormations();
            } catch (error) {
                console.error('Error deleting formation:', error);
            }
        }
    };

    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archived'
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFormations = formations.filter(f => {
        const tabMatch = activeTab === 'active' ? f.active : !f.active;
        const searchMatch = searchTerm === '' ||
            f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.description.toLowerCase().includes(searchTerm.toLowerCase());
        return tabMatch && searchMatch;
    });

    if (loading) return <div>Chargement...</div>;

    if (selectedFormation) {
        return <FormationDetails formation={selectedFormation} onBack={() => { setSelectedFormation(null); fetchFormations(); }} />;
    }

    return (
        <div className="dashboard-section animation-fade-in">
            <div className="section-header">
                <div className="flex items-center gap-4">
                    <h2>Gestion des Formations</h2>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${activeTab === 'active' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setActiveTab('active')}
                        >
                            Actives
                        </button>
                        <button
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${activeTab === 'archived' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setActiveTab('archived')}
                        >
                            Archives
                        </button>
                    </div>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setEditingFormation(null);
                        setFormData({ title: '', description: '', duration: '', startDate: '' });
                        setShowModal(true);
                    }}
                >
                    + Nouvelle Formation
                </button>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Rechercher une formation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
            </div>

            {filteredFormations.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                    <div className="text-4xl mb-4">{activeTab === 'active' ? '🎓' : '🗄️'}</div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">
                        {activeTab === 'active' ? 'Aucune formation active' : 'Aucune archive'}
                    </h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        {activeTab === 'active'
                            ? "Commencez par créer votre première formation pour gérer le programme et les inscriptions."
                            : "Les formations archivées apparaîtront ici."}
                    </p>
                    {activeTab === 'active' && (
                        <button
                            className="btn-primary"
                            onClick={() => {
                                setEditingFormation(null);
                                setFormData({ title: '', description: '', duration: '', startDate: '', defaultFormateur: '' });
                                setShowModal(true);
                            }}
                        >
                            + Créer une Formation
                        </button>
                    )}
                </div>
            ) : (
                <div className="cards-grid">
                    {filteredFormations.map((formation) => (
                        <div key={formation._id} className={`card group hover:shadow-lg transition-all duration-300 ${!formation.active ? 'opacity-75 bg-slate-50 border-slate-200' : 'bg-white border-slate-200'}`}>
                            <div className={`h-2 w-full rounded-t-xl mb-4 ${formation.active ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-slate-300'}`}></div>

                            <div className="px-5 pb-5">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">
                                        {formation.title}
                                    </h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${formation.active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                        {formation.active ? 'Active' : 'Archivée'}
                                    </span>
                                </div>

                                <p className="text-slate-600 text-sm mb-4 line-clamp-2 h-10">{formation.description}</p>

                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-1.5" title="Durée">
                                        <span>⏱</span>
                                        <span>{formation.duration}h</span>
                                    </div>
                                    <div className="flex items-center gap-1.5" title="Date de début">
                                        <span>📅</span>
                                        <span>{new Date(formation.startDate).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => setSelectedFormation(formation)}
                                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
                                    >
                                        <span>⚙️</span> Gérer Sessions & Inscrits
                                    </button>

                                    <div className="flex gap-2 text-sm">
                                        <button
                                            onClick={() => handleEdit(formation)}
                                            className="flex-1 py-2 px-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all font-medium"
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            onClick={() => handleArchive(formation._id, formation.active)}
                                            className={`flex-1 py-2 px-3 border rounded-lg transition-all font-medium ${formation.active ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                                        >
                                            {formation.active ? 'Archiver' : 'Activer'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(formation._id)}
                                            className="py-2 px-3 border border-red-100 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all"
                                            title="Supprimer définitivement"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md animation-fade-in">
                        <h2 className="text-xl font-bold mb-4">
                            {editingFormation ? 'Modifier la Formation' : 'Nouvelle Formation'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Titre</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full p-2 border rounded-lg"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Durée (h)</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded-lg"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        required
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date de début</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border rounded-lg"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Formateur par défaut (optionnel)</label>
                                <select
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.defaultFormateur}
                                    onChange={(e) => setFormData({ ...formData, defaultFormateur: e.target.value })}
                                >
                                    <option value="">Aucun (à définir par séance)</option>
                                    {formateurs.map(f => (
                                        <option key={f._id} value={f._id}>{f.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Ce formateur sera automatiquement assigné aux nouvelles séances.</p>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary justify-center"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormationManagement;
