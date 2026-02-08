import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../config/api';
import FormationDetails from './FormationDetails';
import { speakAndDo } from '../../utils/speakTunisian';

const FormationManagement = () => {
    const { t } = useTranslation();
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
        if (window.confirm(currentStatus ? t('formation_management.confirm_archive') : t('formation_management.confirm_activate'))) {
            try {
                await api.put(`/formations/${id}`, { active: !currentStatus });
                fetchFormations();
            } catch (error) {
                console.error('Error updating status:', error);
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('formation_management.confirm_delete'))) {
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

    if (loading) return <div>{t('common.loading')}</div>;

    if (selectedFormation) {
        return <FormationDetails formation={selectedFormation} onBack={() => { setSelectedFormation(null); fetchFormations(); }} />;
    }

    return (
        <div className="dashboard-section animation-fade-in">
            <div className="section-header">
                <div className="flex items-center gap-4">
                    <h2>{t('formation_management.title')}</h2>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${activeTab === 'active' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setActiveTab('active')}
                        >
                            {t('formation_management.active')}
                        </button>
                        <button
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${activeTab === 'archived' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setActiveTab('archived')}
                        >
                            {t('formation_management.archived')}
                        </button>
                    </div>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => speakAndDo('ADD_FORMATION', () => {
                        setEditingFormation(null);
                        setFormData({ title: '', description: '', duration: '', startDate: '', defaultFormateur: '' });
                        setShowModal(true);
                    })}
                >
                    + {t('formation_management.new_formation')}
                </button>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input
                        type="text"
                        placeholder={t('formation_management.search_placeholder')}
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
                        {activeTab === 'active' ? t('formation_management.no_active') : t('formation_management.no_archived')}
                    </h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        {activeTab === 'active'
                            ? t('formation_management.create_first')
                            : t('formation_management.archived_here')}
                    </p>
                    {activeTab === 'active' && (
                        <button
                            className="btn-primary"
                            onClick={() => speakAndDo('CREATE_FORMATION', () => {
                                setEditingFormation(null);
                                setFormData({ title: '', description: '', duration: '', startDate: '', defaultFormateur: '' });
                                setShowModal(true);
                            })}
                        >
                            + {t('formation_management.create_formation')}
                        </button>
                    )}
                </div>
            ) : (
                <div className="cards-grid">
                    {filteredFormations.map((formation) => {
                        const PALETTE = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b', '#0d9488', '#2563eb', '#7c3aed', '#be185d'];
                        const PATTERNS = ['dots', 'hatching', 'triangles', 'diamonds', 'stripes-h', 'stripes-v', 'circles', 'grid', 'chevrons', 'waves', 'zigzag', 'cross', 'bricks', 'hexagons'];
                        let hash = 0;
                        const str = String(formation._id || '');
                        for (let i = 0; i < str.length; i++) { hash = (hash << 5) - hash + str.charCodeAt(i); hash |= 0; }
                        const cardColor = formation.color || PALETTE[Math.abs(hash) % PALETTE.length];
                        const pattern = formation.pattern || PATTERNS[Math.abs(hash) % PATTERNS.length];

                        return (
                        <div key={formation._id} className={`card group hover:shadow-lg transition-all duration-300 ${!formation.active ? 'opacity-75 bg-slate-50 border-slate-200' : 'bg-white border-slate-200'}`}>
                            {/* Left band: color + geometric pattern (color-blind friendly) */}
                            <div
                                className={`formation-card-band ${!formation.active ? 'bg-slate-300' : ''}`}
                                style={formation.active ? { backgroundColor: cardColor } : {}}
                                title={formation.title}
                            >
                                <div className={`pattern-overlay formation-pattern-${pattern}`} style={{ opacity: formation.active ? 0.4 : 0.25 }} aria-hidden="true" />
                            </div>

                            <div className="formation-card-content">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-4xl text-slate-800 group-hover:text-indigo-600 transition-colors">
                                        {formation.title}
                                    </h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${formation.active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                        {formation.active ? t('formation_management.active_badge') : t('formation_management.archived_badge')}
                                    </span>
                                </div>

                                <p className="text-slate-600 text-sm mb-4 line-clamp-2 h-10">{formation.description}</p>

                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-1.5" title={t('formation_management.duration_title')}>
                                        <span>⏱</span>
                                        <span>{formation.duration}h</span>
                                    </div>
                                    <div className="flex items-center gap-1.5" title={t('formation_management.start_date_title')}>
                                        <span>📅</span>
                                        <span>{new Date(formation.startDate).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 text-sm">
                                    <button
                                        onClick={() => speakAndDo('MANAGE_FORMATION', () => setSelectedFormation(formation))}
                                        className="inline-flex items-center gap-1.5 py-2 px-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-all font-medium"
                                        title={t('formation_management.manage')}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>settings</span>
                                        {t('formation_management.manage')}
                                    </button>
                                    <button
                                        onClick={() => speakAndDo('EDIT_FORMATION', () => handleEdit(formation))}
                                        className="inline-flex items-center gap-1.5 py-2 px-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
                                        title={t('formation_management.edit')}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                        {t('formation_management.edit')}
                                    </button>
                                    <button
                                        onClick={() => speakAndDo(formation.active ? 'ARCHIVE_FORMATION' : 'ACTIVATE_FORMATION', () => handleArchive(formation._id, formation.active))}
                                        className={`inline-flex items-center gap-1.5 py-2 px-3 rounded-lg transition-all font-medium ${formation.active ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                                        title={formation.active ? t('formation_management.archive') : t('formation_management.activate')}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{formation.active ? 'archive' : 'unarchive'}</span>
                                        {formation.active ? t('formation_management.archive') : t('formation_management.activate')}
                                    </button>
                                    <button
                                        onClick={() => speakAndDo('DELETE_FORMATION', () => handleDelete(formation._id))}
                                        className="inline-flex items-center gap-1.5 py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-medium"
                                        title={t('formation_management.delete')}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                        {t('formation_management.delete')}
                                    </button>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md animation-fade-in">
                        <h2 className="text-xl font-bold mb-4">
                            {editingFormation ? t('formation_management.modal_edit') : t('formation_management.modal_new')}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('formation_management.title_label')}</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">{t('formation_management.description_label')}</label>
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
                                    <label className="block text-sm font-medium mb-1">{t('formation_management.duration_label')}</label>
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
                                    <label className="block text-sm font-medium mb-1">{t('formation_management.start_date_label')}</label>
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
                                <label className="block text-sm font-medium mb-1">{t('formation_management.default_trainer_label')}</label>
                                <select
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.defaultFormateur}
                                    onChange={(e) => setFormData({ ...formData, defaultFormateur: e.target.value })}
                                >
                                    <option value="">{t('formation_management.no_trainer')}</option>
                                    {formateurs.map(f => (
                                        <option key={f._id} value={f._id}>{f.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">{t('formation_management.trainer_hint')}</p>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary justify-center"
                                >
                                    {t('common.save')}
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
