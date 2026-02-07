import { useEffect } from 'react';

const STATUS_LABELS = {
    active: 'Actif',
    suspended: 'Suspendu',
    pending: 'En attente',
    rejected: 'Rejeté'
};

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    variant = 'primary' // 'primary' | 'danger' | 'warning'
}) => {
    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const variantStyles = {
        primary: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        warning: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 animation-fade-in">
                <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        variant === 'danger' ? 'bg-red-100 text-red-600' :
                        variant === 'warning' ? 'bg-amber-100 text-amber-600' :
                        'bg-indigo-100 text-indigo-600'
                    }`}>
                        <span className="material-symbols-outlined text-2xl">
                            {variant === 'danger' ? 'warning' : 'help'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 id="modal-title" className="text-lg font-semibold text-slate-900">
                            {title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantStyles[variant]}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
export { STATUS_LABELS };
