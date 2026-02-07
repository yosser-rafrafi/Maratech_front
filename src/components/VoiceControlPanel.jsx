import React from 'react';
import PropTypes from 'prop-types';

/**
 * Voice Control Panel Component
 * Provides UI for voice command controls and status display
 */
const VoiceControlPanel = ({
    isListening,
    isSupported,
    transcript,
    lastCommand,
    error,
    commandHistory,
    onToggleListening,
    onClearError
}) => {
    if (!isSupported) {
        return (
            <div style={{
                background: '#fef2f2',
                border: '2px solid #fca5a5',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>⚠️</span>
                    <div>
                        <div style={{ fontWeight: '600', color: '#991b1b' }}>
                            Reconnaissance vocale non supportée
                        </div>
                        <div style={{ fontSize: '14px', color: '#7f1d1d', marginTop: '4px' }}>
                            Veuillez utiliser Chrome, Edge ou Safari pour activer les commandes vocales.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="voice-panel"
            style={{
                background: 'white',
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px'
            }}
            role="region"
            aria-label="Panneau de contrôle vocal"
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🎤</span>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                        Commandes vocales
                    </h3>
                </div>

                {/* Status Badge */}
                <div
                    className={`voice-status-indicator voice-status-${isListening ? 'listening' : error ? 'error' : 'idle'}`}
                    role="status"
                    aria-live="polite"
                >
                    <span style={{ fontSize: '12px' }}>
                        {isListening ? '🔴' : '⚪'}
                    </span>
                    <span>
                        {isListening ? 'En écoute...' : error ? 'Erreur' : 'Inactif'}
                    </span>
                </div>
            </div>

            {/* Main Controls */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                {/* Microphone Button */}
                <button
                    onClick={onToggleListening}
                    className={isListening ? 'voice-listening-pulse' : ''}
                    style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        border: isListening ? '3px solid #6366f1' : '2px solid #cbd5e1',
                        background: isListening ? '#6366f1' : 'white',
                        color: isListening ? 'white' : '#64748b',
                        fontSize: '32px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s',
                        boxShadow: isListening ? '0 4px 20px rgba(99, 102, 241, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                        position: 'relative'
                    }}
                    aria-label={isListening ? 'Arrêter l\'écoute vocale' : 'Démarrer l\'écoute vocale'}
                    aria-pressed={isListening}
                >
                    {isListening && <div className="voice-active-ripple" style={{ position: 'absolute', inset: 0, borderRadius: '50%' }} />}
                    🎤
                </button>

                {/* Right Content */}
                <div style={{ flex: 1 }}>
                    {/* Current Transcript */}
                    {isListening && transcript && (
                        <div style={{
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '12px'
                        }}>
                            <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '4px', fontWeight: '600' }}>
                                En cours:
                            </div>
                            <div style={{ color: '#0c4a6e', fontSize: '14px' }}>
                                "{transcript}"
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div
                            style={{
                                background: '#fee2e2',
                                border: '1px solid #fca5a5',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                            role="alert"
                        >
                            <div style={{ color: '#991b1b', fontSize: '14px' }}>
                                ⚠️ {error}
                            </div>
                            <button
                                onClick={onClearError}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#991b1b',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    fontSize: '18px'
                                }}
                                aria-label="Effacer l'erreur"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Command Suggestions */}
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                        <div style={{ fontWeight: '600', marginBottom: '8px' }}>Exemples de commandes:</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div>• "Marquer [Nom] présent"</div>
                            <div>• "Marquer [Nom] absent"</div>
                            <div>• "Marquer [Nom] en retard"</div>
                            <div>• "Marquer tous présents"</div>
                            <div>• "Enregistrer"</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Command History */}
            {commandHistory.length > 0 && (
                <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e2e8f0'
                }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>
                        Dernières commandes:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {commandHistory.slice(0, 3).map((cmd, idx) => (
                            <div
                                key={idx}
                                style={{
                                    fontSize: '12px',
                                    color: '#475569',
                                    padding: '6px 10px',
                                    background: '#f8fafc',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <span>"{cmd.command}"</span>
                                <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                                    {new Date(cmd.timestamp).toLocaleTimeString('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

VoiceControlPanel.propTypes = {
    isListening: PropTypes.bool.isRequired,
    isSupported: PropTypes.bool.isRequired,
    transcript: PropTypes.string,
    lastCommand: PropTypes.object,
    error: PropTypes.string,
    commandHistory: PropTypes.array,
    onToggleListening: PropTypes.func.isRequired,
    onClearError: PropTypes.func.isRequired
};

VoiceControlPanel.defaultProps = {
    transcript: '',
    lastCommand: null,
    error: null,
    commandHistory: []
};

export default VoiceControlPanel;
