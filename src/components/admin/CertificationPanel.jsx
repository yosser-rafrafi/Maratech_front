import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../config/api';
import { speakAndDo } from '../../utils/speakTunisian';
import AlertModal from '../AlertModal';
import ConfirmModal from '../ConfirmModal';

const CertificationPanel = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [formations, setFormations] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedFormation, setSelectedFormation] = useState('');
    const [loading, setLoading] = useState(false);
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', variant: 'success' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

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
        if (!selectedUser || !selectedFormation) {
            setAlertModal({ isOpen: true, title: t('certifications.attention'), message: t('certifications.select_both'), variant: 'error' });
            return;
        }

        setLoading(true);
        setGeneratedCert(null);
        try {
            const eligibleRes = await api.get(`/admin/certification/eligible/${selectedUser}/${selectedFormation}`);
            if (!eligibleRes.data.eligible) {
                setAlertModal({
                    isOpen: true,
                    title: t('certifications.not_eligible'),
                    message: t('certifications.not_eligible_reason', { reason: eligibleRes.data.reason }),
                    variant: 'error'
                });
                setLoading(false);
                return;
            }

            setConfirmModal({
                isOpen: true,
                title: t('certifications.generate_confirm_title'),
                message: t('certifications.generate_confirm_message'),
                onConfirm: async () => {
                    try {
                        const res = await api.post('/admin/certification/generate', { userId: selectedUser, formationId: selectedFormation });
                        setGeneratedCert(res.data.certificate);
                        setAlertModal({
                            isOpen: true,
                            title: t('certifications.success'),
                            message: t('certifications.certificate_generated'),
                            variant: 'success'
                        });
                    } catch (err) {
                        if (err.response?.data?.certificate) {
                            setGeneratedCert(err.response.data.certificate);
                            setAlertModal({
                                isOpen: true,
                                title: t('certifications.info'),
                                message: t('certifications.certificate_exists'),
                                variant: 'error'
                            });
                        } else {
                            setAlertModal({
                                isOpen: true,
                                title: t('certifications.error'),
                                message: err.response?.data?.error || t('certifications.generation_error'),
                                variant: 'error'
                            });
                        }
                    }
                }
            });
        } catch (error) {
            if (error.response?.data?.certificate) {
                setGeneratedCert(error.response.data.certificate);
                setAlertModal({
                    isOpen: true,
                    title: t('certifications.info'),
                    message: t('certifications.certificate_exists'),
                    variant: 'error'
                });
            } else {
            setAlertModal({
                isOpen: true,
                title: t('certifications.error'),
                message: error.response?.data?.error || t('certifications.generation_error'),
                variant: 'error'
            });
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
            setAlertModal({
                isOpen: true,
                title: t('certifications.error'),
                message: t('certifications.download_error'),
                variant: 'error'
            });
        }
    };

    return (
        <div className="dashboard-section animation-fade-in full-width">
            <div className="section-header">
                <h2>{t('certifications.title')}</h2>
                <p>{t('certifications.subtitle')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('certifications.select_student')}</label>
                        <select
                            className="w-full p-3 border rounded-lg"
                            value={selectedUser}
                            onChange={(e) => { setSelectedUser(e.target.value); setGeneratedCert(null); }}
                        >
                            <option value="">{t('certifications.select_option')}</option>
                            {users.map(u => (
                                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('certifications.select_formation')}</label>
                        <select
                            className="w-full p-3 border rounded-lg"
                            value={selectedFormation}
                            onChange={(e) => { setSelectedFormation(e.target.value); setGeneratedCert(null); }}
                        >
                            <option value="">{t('certifications.select_option')}</option>
                            {formations.map(f => (
                                <option key={f._id} value={f._id}>{f.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={() => speakAndDo('VERIFY_ELIGIBILITY', handleGenerate)}
                        disabled={loading || !selectedUser || !selectedFormation}
                        className={`btn-primary px-8 py-3 text-lg ${loading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {loading ? t('certifications.verifying') : `🎓 ${t('certifications.verify_and_generate')}`}
                    </button>
                </div>

                {generatedCert && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center animation-fade-in">
                        <div>
                            <h4 className="font-bold text-green-800 flex items-center gap-2">✅ {t('certifications.certificate_ready')}</h4>
                            <p className="text-sm text-green-700">ID: {generatedCert.certificateId}</p>
                            <p className="text-xs text-green-600">{t('certifications.issued_on')}: {new Date(generatedCert.issuedAt).toLocaleDateString()}</p>
                        </div>
                        <button
                            className="btn-primary bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                            onClick={() => handleDownload(generatedCert)}
                        >
                            📥 {t('certifications.download_pdf')}
                        </button>
                    </div>
                )}
            </div>

            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                title={alertModal.title}
                message={alertModal.message}
                variant={alertModal.variant}
                okLabel="OK"
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel={t('certifications.generate_btn')}
                cancelLabel={t('common.cancel')}
            />
        </div>
    );
};

export default CertificationPanel;
