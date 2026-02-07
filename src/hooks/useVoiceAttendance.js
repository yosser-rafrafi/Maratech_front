import { useState, useEffect, useRef, useCallback } from 'react';
import {
    parseVoiceCommand,
    fuzzyNameMatch,
    announceToScreenReader,
    getStatusLabel
} from '../utils/voiceUtils';

/**
 * Custom hook for voice-controlled attendance
 * Uses Web Speech API for continuous voice recognition
 * 
 * @param {Array} participants - List of participants
 * @param {Function} onStatusChange - Callback when attendance status should change
 * @param {Function} onSave - Callback for save command
 * @param {Function} onGoBack - Callback for navigation back
 * @returns {Object} Voice control state and methods
 */
const useVoiceAttendance = (participants, onStatusChange, onSave, onGoBack) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [lastCommand, setLastCommand] = useState(null);
    const [error, setError] = useState(null);
    const [commandHistory, setCommandHistory] = useState([]);

    const recognitionRef = useRef(null);
    const restartTimeoutRef = useRef(null);

    // Check browser support on mount
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition);

        if (!SpeechRecognition) {
            console.warn('Web Speech API not supported in this browser');
            return;
        }

        // Initialize speech recognition
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'fr-FR'; // French language
        recognition.maxAlternatives = 3;

        // Handle recognition results
        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const result = event.results[current];
            const transcriptText = result[0].transcript;

            setTranscript(transcriptText);

            // Only process final results
            if (result.isFinal) {
                const confidence = result[0].confidence;
                console.log(`Voice: "${transcriptText}" (confidence: ${confidence})`);

                // Only process if confidence is reasonable
                if (confidence > 0.6) {
                    processCommand(transcriptText);
                }
            }
        };

        // Handle errors
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);

            if (event.error === 'no-speech') {
                // Don't treat no-speech as an error, just continue
                return;
            }

            if (event.error === 'aborted') {
                // Intentional stop, don't show error
                return;
            }

            setError(`Erreur: ${event.error}`);

            // Auto-restart on certain errors
            if (['network', 'audio-capture'].includes(event.error)) {
                restartTimeoutRef.current = setTimeout(() => {
                    if (isListening) {
                        startListening();
                    }
                }, 1000);
            }
        };

        // Handle end event
        recognition.onend = () => {
            // Auto-restart if we're supposed to be listening
            if (isListening) {
                restartTimeoutRef.current = setTimeout(() => {
                    try {
                        recognition.start();
                    } catch (err) {
                        console.error('Failed to restart recognition:', err);
                    }
                }, 100);
            }
        };

        recognitionRef.current = recognition;

        // Cleanup
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current);
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /**
     * Process a voice command
     */
    const processCommand = useCallback((transcriptText) => {
        const command = parseVoiceCommand(transcriptText);

        if (!command.intent) {
            setError('Commande non reconnue');
            announceToScreenReader('Commande non reconnue', 'assertive');
            return;
        }

        setLastCommand(command);
        setError(null);

        // Add to history
        setCommandHistory(prev => [
            { command: transcriptText, intent: command.intent, timestamp: Date.now() },
            ...prev.slice(0, 4) // Keep last 5
        ]);

        // Execute command based on intent
        switch (command.intent) {
            case 'mark_present':
            case 'mark_absent':
            case 'mark_late': {
                const status = command.intent.replace('mark_', '');

                if (!command.params.name) {
                    announceToScreenReader('Nom du participant non détecté', 'assertive');
                    setError('Nom non détecté');
                    return;
                }

                const participant = fuzzyNameMatch(command.params.name, participants);

                if (!participant) {
                    const message = `Participant "${command.params.name}" non trouvé`;
                    announceToScreenReader(message, 'assertive');
                    setError(message);
                    return;
                }

                // Call the status change handler
                onStatusChange(participant._id, status);

                // Announce success
                const announcement = `${participant.name} marqué ${getStatusLabel(status)}`;
                announceToScreenReader(announcement, 'polite');
                console.log('Voice command executed:', announcement);
                break;
            }

            case 'mark_all_present': {
                if (!participants || participants.length === 0) {
                    announceToScreenReader('Aucun participant trouvé', 'assertive');
                    return;
                }

                // Mark all participants as present
                participants.forEach(participant => {
                    onStatusChange(participant._id, 'present');
                });

                const announcement = `Tous les participants marqués présents (${participants.length})`;
                announceToScreenReader(announcement, 'polite');
                console.log('Voice command executed:', announcement);
                break;
            }

            case 'save': {
                if (onSave) {
                    onSave();
                    announceToScreenReader('Enregistrement des présences', 'polite');
                }
                break;
            }

            case 'go_back': {
                if (onGoBack) {
                    onGoBack();
                    announceToScreenReader('Retour', 'polite');
                }
                break;
            }

            default:
                console.warn('Unknown intent:', command.intent);
        }
    }, [participants, onStatusChange, onSave, onGoBack]);

    /**
     * Start voice recognition
     */
    const startListening = useCallback(() => {
        if (!isSupported || !recognitionRef.current) {
            setError('Reconnaissance vocale non supportée');
            return;
        }

        try {
            setIsListening(true);
            setError(null);
            setTranscript('');
            recognitionRef.current.start();
            announceToScreenReader('Écoute activée', 'polite');
        } catch (err) {
            if (err.name !== 'InvalidStateError') {
                console.error('Error starting recognition:', err);
                setError('Erreur de démarrage');
            }
        }
    }, [isSupported]);

    /**
     * Stop voice recognition
     */
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            setIsListening(false);
            recognitionRef.current.stop();

            if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current);
            }

            announceToScreenReader('Écoute désactivée', 'polite');
        }
    }, []);

    /**
     * Toggle voice recognition
     */
    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    /**
     * Clear error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isListening,
        isSupported,
        transcript,
        lastCommand,
        error,
        commandHistory,
        startListening,
        stopListening,
        toggleListening,
        clearError
    };
};

export default useVoiceAttendance;
