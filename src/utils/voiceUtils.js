/**
 * Voice Command Utility Functions
 * Handles voice command parsing, fuzzy matching, and text normalization
 */

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy name matching with voice input
 */
const levenshteinDistance = (str1, str2) => {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
};

/**
 * Normalize French text for better voice recognition
 * Removes accents, converts to lowercase, removes extra spaces
 */
export const normalizeTranscript = (text) => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^\w\s]/g, ' ') // Replace special chars with space
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .trim();
};

/**
 * Voice command patterns for French
 * Each pattern includes regex and intent
 */
export const getVoiceCommandPatterns = () => {
    return [
        {
            intent: 'mark_present',
            patterns: [
                /marqu(?:er|e)\s+(.+?)\s+pr(?:e|é)sent/i,
                /pr(?:e|é)sent\s+(.+)/i,
                /(.+?)\s+est\s+pr(?:e|é)sent/i,
                /(.+?)\s+pr(?:e|é)sent/i
            ]
        },
        {
            intent: 'mark_absent',
            patterns: [
                /marqu(?:er|e)\s+(.+?)\s+absent/i,
                /absent\s+(.+)/i,
                /(.+?)\s+est\s+absent/i,
                /(.+?)\s+absent/i
            ]
        },
        {
            intent: 'mark_late',
            patterns: [
                /marqu(?:er|e)\s+(.+?)\s+(?:en\s+)?retard/i,
                /retard\s+(.+)/i,
                /(.+?)\s+est\s+(?:en\s+)?retard/i,
                /(.+?)\s+retard/i
            ]
        },
        {
            intent: 'mark_all_present',
            patterns: [
                /marqu(?:er|e)\s+tous\s+pr(?:e|é)sents?/i,
                /tous\s+pr(?:e|é)sents?/i,
                /tout\s+le\s+monde\s+pr(?:e|é)sent/i
            ]
        },
        {
            intent: 'save',
            patterns: [
                /enregistr(?:er|e)/i,
                /sauvegarde(?:r|)/i,
                /valide(?:r|)/i
            ]
        },
        {
            intent: 'go_back',
            patterns: [
                /retour/i,
                /revenir/i,
                /pr(?:e|é)c(?:e|é)dent/i
            ]
        }
    ];
};

/**
 * Parse voice command to extract intent and parameters
 * @param {string} transcript - Raw voice transcript
 * @returns {Object} { intent, params, confidence }
 */
export const parseVoiceCommand = (transcript) => {
    if (!transcript || transcript.trim().length === 0) {
        return { intent: null, params: {}, confidence: 0 };
    }

    const normalized = normalizeTranscript(transcript);
    const patterns = getVoiceCommandPatterns();

    for (const { intent, patterns: regexList } of patterns) {
        for (const regex of regexList) {
            const match = normalized.match(regex);
            if (match) {
                const params = {};

                // Extract name if present (first capture group)
                if (match[1]) {
                    params.name = match[1].trim();
                }

                return {
                    intent,
                    params,
                    confidence: 0.9,
                    originalTranscript: transcript
                };
            }
        }
    }

    return { intent: null, params: {}, confidence: 0, originalTranscript: transcript };
};

/**
 * Find the best matching participant name using fuzzy matching
 * @param {string} spokenName - Name from voice recognition
 * @param {Array} participants - List of participant objects with name property
 * @param {number} threshold - Maximum distance to consider a match (default: 3)
 * @returns {Object|null} Best matching participant or null
 */
export const fuzzyNameMatch = (spokenName, participants, threshold = 3) => {
    if (!spokenName || !participants || participants.length === 0) {
        return null;
    }

    const normalizedSpoken = normalizeTranscript(spokenName);
    let bestMatch = null;
    let bestDistance = Infinity;

    participants.forEach(participant => {
        const normalizedName = normalizeTranscript(participant.name);

        // Check full name match
        let distance = levenshteinDistance(normalizedSpoken, normalizedName);

        // Also check if spoken name matches first or last name
        const nameParts = normalizedName.split(' ');
        nameParts.forEach(part => {
            const partDistance = levenshteinDistance(normalizedSpoken, part);
            distance = Math.min(distance, partDistance);
        });

        // Also check if the spoken name is contained in the full name
        if (normalizedName.includes(normalizedSpoken)) {
            distance = Math.min(distance, 1);
        }

        if (distance < bestDistance) {
            bestDistance = distance;
            bestMatch = participant;
        }
    });

    // Only return match if it's within threshold
    return bestDistance <= threshold ? bestMatch : null;
};

/**
 * Announce message to screen readers
 * Creates a temporary element with aria-live="assertive"
 */
export const announceToScreenReader = (message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement (screen readers capture it immediately)
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
};

/**
 * Get status label in French
 */
export const getStatusLabel = (status) => {
    const labels = {
        present: 'présent',
        absent: 'absent',
        late: 'en retard'
    };
    return labels[status] || status;
};
