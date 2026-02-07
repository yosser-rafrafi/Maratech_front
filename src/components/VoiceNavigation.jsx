
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import './VoiceNavigation.css';

const VoiceNavigation = ({ currentPage, onAction }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isSupported, setIsSupported] = useState(true);

    const navigateRouter = useNavigate();

    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);
    const isSpeakingRef = useRef(false);

    // Ref to access current props inside closure
    const currentPageRef = useRef(currentPage);

    useEffect(() => {
        currentPageRef.current = currentPage;
    }, [currentPage]);

    useEffect(() => {
        // Check if browser supports Web Speech API
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setIsSupported(false);
            return;
        }

        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'fr-FR'; // Primary: French
        recognition.maxAlternatives = 3; // Get multiple interpretations

        recognition.onstart = () => {
            console.log('🎤 Started listening');
            setIsListening(true);
            setTranscript('Je vous écoute...');
            isSpeakingRef.current = false;
        };

        recognition.onaudiostart = () => {
            console.log('🔊 Audio capturing started');
        };

        recognition.onsoundstart = () => {
            console.log('🔔 Sound detected');
        };

        recognition.onspeechstart = () => {
            console.log('🗣️ Speech detected');
        };

        recognition.onresult = async (event) => {
            const result = event.results[event.resultIndex];
            const userInput = result[0].transcript;
            const isFinal = result.isFinal;

            console.log('📝 Transcript (Interim):', userInput);
            setTranscript(userInput);

            if (!isFinal) return;

            // Final processing
            // Don't process if it's likely just the system speaking back
            if (isSpeakingRef.current) {
                console.log('🚫 System speaking, ignoring input');
                return;
            }

            // Get page context using current DOM
            const pageContext = getPageContext();

            try {
                console.log('🚀 Sending:', userInput);
                // Send to backend for processing
                const response = await api.post('/voice/command', {
                    pageContext,
                    focusedElement: document.activeElement?.id || null,
                    userInput
                });

                console.log('✅ Response:', response.data);
                const { action, target, value } = response.data;

                // Execute the action
                executeAction(action, target, value);

                // Provide feedback
                let feedbackMsg = '';
                if (action === 'ask_clarification') {
                    feedbackMsg = value || "Je n'ai pas compris";
                } else {
                    feedbackMsg = value || `Action: ${action.replace('_', ' ')}`;
                }

                setFeedback(feedbackMsg);
                speak(feedbackMsg);

            } catch (error) {
                console.error('❌ Error:', error);
                const errorMsg = "Désolé, une erreur est survenue.";
                setFeedback(errorMsg);
                speak(errorMsg);
            }
        };

        recognition.onerror = (event) => {
            console.error('❌ Error:', event.error);
            setIsListening(false);
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                setFeedback('Erreur: ' + event.error);
            } else if (event.error === 'no-speech') {
                setFeedback('Aucune parole détectée. Réessayez.');
            }
        };

        recognition.onend = () => {
            console.log('🛑 Stopped listening');
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
            // synthRef.current.cancel(); // No need to cancel here, speak handles it
        };
    }, []); // Only init once

    const getPageContext = () => {
        // Extract visible text, form fields, buttons from current page
        // Filter out hidden elements to avoid confusion
        const formFields = Array.from(document.querySelectorAll('input, textarea, select'))
            .filter(el => el.offsetParent !== null) // Visible only
            .map(el => ({
                id: el.id,
                name: el.name,
                type: el.type,
                placeholder: el.placeholder,
                label: el.labels?.[0]?.textContent || el.closest('label')?.textContent
            }));

        const buttons = Array.from(document.querySelectorAll('button, [role="button"]'))
            .filter(el => el.offsetParent !== null)
            .map(btn => ({
                id: btn.id,
                text: btn.textContent.trim(),
                type: btn.type
            }));

        // const links = Array.from(document.querySelectorAll('a'))
        //     .filter(el => el.offsetParent !== null)
        //     .map(link => ({
        //         text: link.textContent.trim(),
        //         href: link.href
        //     }));

        return {
            currentPage: currentPageRef.current, // Use Ref for fresh value
            pageTitle: document.title,
            formFields,
            buttons
            // links // Removed as per instruction
        };
    };

    const executeAction = (action, target, value) => {
        switch (action) {
            case 'read_page': readPage(); break;
            case 'fill_field': fillField(target, value); break;
            case 'click_button': clickButton(target); break;
            case 'navigate': navigate(target); break;
            // case 'move_focus': moveFocus(target); break; // Removed as per instruction
            case 'scroll': handleScroll(target); break;
            default: console.log('Unknown action:', action);
        }

        // Notify parent component
        if (onAction) onAction({ action, target, value });
    };

    const readPage = () => {
        // Try to find main content area, skip navigation and footer
        let contentArea = document.querySelector('main, .main-content, article, [role="main"]');

        if (!contentArea) {
            // Fallback: get body but exclude nav, header, footer
            contentArea = document.body;
        }

        // Get all visible text, excluding navigation, headers, footers
        const textNodes = [];
        const walker = document.createTreeWalker(
            contentArea,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    const parent = node.parentElement;

                    // Skip navigation, headers, footers, scripts
                    if (parent.closest('nav, header, footer, script, style, .voice-navigation')) {
                        return NodeFilter.FILTER_REJECT;
                    }

                    // Skip empty or whitespace-only nodes
                    if (!node.textContent.trim()) {
                        return NodeFilter.FILTER_REJECT;
                    }

                    // Skip if parent is not visible
                    if (parent.offsetParent === null) {
                        return NodeFilter.FILTER_REJECT;
                    }

                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node.textContent.trim());
        }

        // Join and clean up text
        let text = textNodes.join(' ')
            .replace(/\s+/g, ' ')  // Multiple spaces to single
            .trim();

        // Limit to 2000 characters for reasonable reading time (~3-4 minutes)
        if (text.length > 2000) {
            text = text.slice(0, 2000) + '... Pour continuer, dites "continuer la lecture".';
        }

        if (!text) {
            text = "Je ne trouve pas de contenu à lire sur cette page.";
        }

        speak(text);
    };

    const fillField = (targetId, value) => {
        let field = document.getElementById(targetId);

        if (!field) {
            field = document.querySelector(`[name="${targetId}"]`);
        }

        // Fallback: Try finding by partial ID match
        if (!field) {
            field = document.querySelector(`input[id*="${targetId}"], textarea[id*="${targetId}"]`);
        }

        if (field) {
            field.focus();

            // Determine correct prototype based on element type
            const prototype = field.tagName === 'TEXTAREA'
                ? window.HTMLTextAreaElement.prototype
                : window.HTMLInputElement.prototype;

            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

            if (nativeInputValueSetter) {
                nativeInputValueSetter.call(field, value);
            } else {
                field.value = value; // Fallback
            }

            // Dispatch events with a small delay to ensure React catches them
            setTimeout(() => {
                const inputEvent = new Event('input', { bubbles: true });
                field.dispatchEvent(inputEvent);
            }, 10);

            setTimeout(() => {
                const changeEvent = new Event('change', { bubbles: true });
                field.dispatchEvent(changeEvent);
            }, 20);

            speak(`Champ rempli.`);
        } else {
            speak(`Je ne trouve pas le champ ${targetId}`);
        }
    };

    const clickButton = (targetText) => {
        // Get all clickable elements
        const buttons = Array.from(document.querySelectorAll('button, a, input[type="submit"], [role="button"]'));

        const normalizedTarget = targetText.toLowerCase().trim();

        // Try exact match first
        let btn = buttons.find(b => b.innerText.toLowerCase().trim() === normalizedTarget);

        // Try contains match
        if (!btn) {
            btn = buttons.find(b => b.innerText.toLowerCase().includes(normalizedTarget));
        }

        // Try reverse contains (target contains button text)
        if (!btn) {
            btn = buttons.find(b => {
                const btnText = b.innerText.toLowerCase().trim();
                return btnText && normalizedTarget.includes(btnText);
            });
        }

        // Try fuzzy matching with word similarity
        if (!btn) {
            btn = buttons.find(b => {
                const btnText = b.innerText.toLowerCase().trim();
                return calculateSimilarity(normalizedTarget, btnText) > 0.6;
            });
        }

        // Try common translations/mappings
        const mappings = {
            'toronto login': 'return to login',
            'retour login': 'return to login',
            'retour connexion': 'return to login',
            'connexion': 'log in',
            'se connecter': 'log in',
            'login': 'log in',
            'inscrire': 'request access',
            'signup': 'request access',
            'valider': 'submit',
            'envoyer': 'submit',
            'submit': 'submit'
        };

        if (!btn && mappings[normalizedTarget]) {
            const mappedText = mappings[normalizedTarget];
            btn = buttons.find(b => b.innerText.toLowerCase().includes(mappedText));
        }

        if (btn) {
            btn.click();
            speak(`J'ai cliqué sur ${btn.innerText.trim()}`);
        } else {
            speak(`Je ne trouve pas le bouton ${targetText}. Essayez un autre nom.`);
        }
    };

    // Simple similarity function (Dice coefficient)
    const calculateSimilarity = (str1, str2) => {
        const bigrams1 = getBigrams(str1);
        const bigrams2 = getBigrams(str2);

        if (bigrams1.size === 0 || bigrams2.size === 0) return 0;

        const intersection = new Set([...bigrams1].filter(x => bigrams2.has(x)));
        return (2.0 * intersection.size) / (bigrams1.size + bigrams2.size);
    };

    const getBigrams = (str) => {
        const bigrams = new Set();
        for (let i = 0; i < str.length - 1; i++) {
            bigrams.add(str.substring(i, i + 2));
        }
        return bigrams;
    };

    const navigate = (target) => {
        // Ideally use React Router's useNavigate here if wrapped in context
        // But since we are inside Router in App.jsx, we can use window.location as fallback or props

        // Simple heuristic for now
        if (target.includes('login') || target.includes('connect')) navigateRouter('/login');
        else if (target.includes('accueil') || target.includes('home')) navigateRouter('/');
        else if (target.includes('admin')) navigateRouter('/admin');
        else if (target.includes('formateur')) navigateRouter('/formateur');
        else if (target.includes('participant')) navigateRouter('/participant');
        else {
            speak(`Navigation vers ${target} non supportée.`);
        }
    };

    const handleScroll = (direction) => {
        window.scrollBy({
            top: direction === 'down' ? 300 : -300,
            behavior: 'smooth'
        });
    };

    const speak = (text) => {
        if (!synthRef.current) return;

        synthRef.current.cancel();
        isSpeakingRef.current = true;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.rate = 1.0;

        utterance.onend = () => {
            isSpeakingRef.current = false;
        };

        synthRef.current.speak(utterance);
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            try {
                setTranscript('');
                setFeedback('');
                recognitionRef.current?.start();
            } catch (e) {
                console.error("Start error", e);
            }
        }
    };

    if (!isSupported) return null;

    return (
        <div className="voice-navigation">
            <button
                type="button"
                className={`voice-button ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
                title={isListening ? "Arrêter l'écoute" : "Activer la navigation vocale"}
            >
                <span className="material-symbols-outlined">
                    {isListening ? 'mic' : 'mic_off'}
                </span>
            </button>

            {(transcript || feedback) && (
                <div className="voice-feedback">
                    <div className="voice-status-dot"></div>
                    {transcript && (
                        <div className="voice-transcript">
                            <strong>Vous</strong>
                            {transcript}
                        </div>
                    )}
                    {feedback && (
                        <div className="voice-response">
                            <strong>Assistant</strong>
                            {feedback}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VoiceNavigation;
