const VoiceTracker = require('../modules/voice-tracker/VoiceTracker.js');

module.exports = {
    name: 'voiceStateUpdate',
    execute(oldState, newState) {
        VoiceTracker.handleVoiceStateUpdate(oldState, newState);
    }
};
