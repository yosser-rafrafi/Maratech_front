/**
 * Tunisian Arabic Text-to-Speech Utility
 * Uses Web Speech API - SpeechSynthesis (no external API required)
 * Speaks text in Arabic with slow, clear rate for accessibility.
 */

import { VOICE_ACTIONS } from './voiceActions';

let currentUtterance = null;

/**
 * Stop any ongoing speech immediately.
 * Called when a new action is triggered - voice must not overlap.
 */
export const stopSpeaking = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
};

/**
 * Check if voice accessibility is enabled.
 */
export const isVoiceEnabled = () => {
  try {
    const v = localStorage.getItem('astba_voice_enabled');
    return v !== 'false'; // default ON
  } catch (_) {
    return true;
  }
};

/**
 * Speak text in Tunisian Arabic using browser's native TTS.
 * @param {string} text - Text to speak (Tunisian Arabic)
 * @param {Object} options - Optional settings
 * @param {boolean} options.force - If true, speaks even when voice is disabled (for testing)
 */
export const speakTunisian = (text, options = {}) => {
  if (!text || typeof text !== 'string') return;

  if (!options.force && !isVoiceEnabled()) return;

  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }

  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-TN';
  utterance.rate = 0.85;
  utterance.pitch = 1;
  utterance.volume = 1;

  // Voices may load asynchronously - some browsers need this
  const pickVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find((v) => v.lang.startsWith('ar'));
    if (arabicVoice) utterance.voice = arabicVoice;
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length) {
    pickVoice();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      pickVoice();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }

  currentUtterance = utterance;
};

/**
 * Wrapper: speak action by key, then run callback.
 * Voice plays immediately (non-blocking), action runs right after.
 * @param {string} actionKey - Key from VOICE_ACTIONS
 * @param {Function} [callback] - Optional callback (button action)
 */
export const speakAndDo = (actionKey, callback) => {
  const phrase = VOICE_ACTIONS[actionKey];
  if (phrase) speakTunisian(phrase);
  if (typeof callback === 'function') callback();
};

export default speakTunisian;
