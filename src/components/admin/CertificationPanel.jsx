import { useState, useEffect } from 'react';
import api from '../../config/api';

const CertificationPanel = () => {
    const [users, setUsers] = useState([]);
    const [formations, setFormations] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedFormation, setSelectedFormation] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [u, f] = await Promise.all([
                    api.get('/admin/users'), // Filter students?
                    api.get('/formations')
                ]);
                setUsers(u.data.users); // Admin can certify anyone, or filter?
                setFormations(f.data.formations);
            } catch (error) {
                console.error(error);
            }
        };
        load();
    }, []);

    const [generatedCert, setGeneratedCert] = useState(null);

    const handleGenerate = async () => {
        if (!selectedUser || !selectedFormation) return alert('Sélectionnez un utilisateur et une formation');

        setLoading(true);
        setGeneratedCert(null);
        try {
            // Check eligibility first (Frontend check via API)
            const eligibleRes = await api.get(`/admin/certification/eligible/${selectedUser}/${selectedFormation}`);
            if (!eligibleRes.data.eligible) {
                alert(`L'utilisateur n'est pas éligible : ${eligibleRes.data.reason}`);
                setLoading(false);
                return;
            }

            // Generate
            if (window.confirm('Générer le certificat ? Cela validera officiellement la formation pour cet étudiant.')) {
                const res = await api.post('/admin/certification/generate', { userId: selectedUser, formationId: selectedFormation });
                setGeneratedCert(res.data.certificate);
                alert('Certificat généré avec succès !');
            }
        } catch (error) {
            if (error.response?.data?.certificate) {
                setGeneratedCert(error.response.data.certificate);
                alert('Un certificat existe déjà pour cet utilisateur et cette formation.');
            } else {
                alert(error.response?.data?.error || 'Erreur lors de la génération');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (cert) => {
        try {
            const response = await api.get(`/admin/certification/download/${cert._id}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Certificat-${cert.certificateId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Erreur lors du téléchargement du PDF');
        }
    };

    return (
        <div className="dashboard-section animation-fade-in full-width">
            <div className="section-header">
                <h2>Génération de Certificats</h2>
                <p>Vérifiez l'éligibilité et délivrez les certificats de fin de formation.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Choisir l'Étudiant</label>
                        <select
                            className="w-full p-3 border rounded-lg"
                            value={selectedUser}
                            onChange={(e) => { setSelectedUser(e.target.value); setGeneratedCert(null); }}
                        >
                            <option value="">-- Sélectionner --</option>
                            {users.map(u => (
                                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Choisir la Formation</label>
                        <select
                            className="w-full p-3 border rounded-lg"
                            value={selectedFormation}
                            onChange={(e) => { setSelectedFormation(e.target.value); setGeneratedCert(null); }}
                        >
                            <option value="">-- Sélectionner --</option>
                            {formations.map(f => (
                                <option key={f._id} value={f._id}>{f.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !selectedUser || !selectedFormation}
                        className={`btn-primary px-8 py-3 text-lg ${loading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {loading ? 'Vérification...' : '🎓 Vérifier Éligibilité et Générer'}
                    </button>
                </div>

                {generatedCert && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center animation-fade-in">
                        <div>
                            <h4 className="font-bold text-green-800 flex items-center gap-2">✅ Certificat Prêt</h4>
                            <p className="text-sm text-green-700">ID: {generatedCert.certificateId}</p>
                            <p className="text-xs text-green-600">Délivré le: {new Date(generatedCert.issuedAt).toLocaleDateString()}</p>
                        </div>
                        <button
                            className="btn-primary bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                            onClick={() => handleDownload(generatedCert)}
                        >
                            📥 Télécharger PDF
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CertificationPanel;
