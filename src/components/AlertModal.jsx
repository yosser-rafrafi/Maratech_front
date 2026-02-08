import { useEffect } from 'react';

const AlertModal = ({
    isOpen,
    onClose,
    title,
    message,
    variant = 'success', // 'success' | 'error'
    okLabel = 'OK'
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
        success: 'bg-green-100 text-green-600',
        error: 'bg-red-100 text-red-600'
    };

    const iconStyles = {
        success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        error: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="alert-modal-title"
        >
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 animation-fade-in">
                <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${variantStyles[variant]}`}>
                        <span className="material-symbols-outlined text-2xl">
                            {variant === 'success' ? 'check_circle' : 'error'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 id="alert-modal-title" className="text-lg font-semibold text-slate-900">
                            {title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>
                <div className="flex justify-end mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${iconStyles[variant]}`}
                    >
                        {okLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
