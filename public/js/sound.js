/**
 * Sound System Module
 * Web Audio API-based sound system for game audio
 */

class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.initialized = false;
        this.musicPlaying = false;
        this.musicOscillators = [];
    }

    init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.3;

            this.musicGain = this.audioContext.createGain();
            this.musicGain.connect(this.masterGain);
            this.musicGain.gain.value = 0.15;

            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.connect(this.masterGain);
            this.sfxGain.gain.value = 0.5;

            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    playTone(frequency, duration, type = 'square', volume = 0.3) {
        if (!this.initialized) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.type = type;
        osc.frequency.value = frequency;

        gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        osc.start();
        osc.stop(this.audioContext.currentTime + duration);
    }

    playNoise(duration, volume = 0.2) {
        if (!this.initialized) return;

        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        noise.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.value = 3000;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        noise.start();
        noise.stop(this.audioContext.currentTime + duration);
    }

    playJump() {
        this.playTone(150, 0.1, 'square', 0.2);
        setTimeout(() => this.playTone(200, 0.1, 'square', 0.15), 50);
    }

    playShoot() {
        this.playNoise(0.1, 0.3);
        this.playTone(100, 0.05, 'sawtooth', 0.2);
    }

    playHit() {
        this.playTone(80, 0.1, 'square', 0.3);
        this.playNoise(0.05, 0.2);
    }

    playEnemyHit() {
        this.playTone(200, 0.1, 'square', 0.2);
        this.playTone(150, 0.1, 'sawtooth', 0.15);
    }

    playEnemyDeath() {
        this.playNoise(0.3, 0.3);
        this.playTone(100, 0.2, 'sawtooth', 0.2);
        setTimeout(() => this.playTone(50, 0.3, 'sawtooth', 0.15), 100);
    }

    playPlayerDeath() {
        this.playNoise(0.5, 0.4);
        this.playTone(200, 0.1, 'square', 0.3);
        setTimeout(() => this.playTone(150, 0.1, 'square', 0.25), 100);
        setTimeout(() => this.playTone(100, 0.2, 'square', 0.2), 200);
        setTimeout(() => this.playTone(50, 0.3, 'square', 0.15), 300);
    }

    playPickup() {
        this.playTone(400, 0.1, 'square', 0.2);
        setTimeout(() => this.playTone(600, 0.1, 'square', 0.2), 50);
        setTimeout(() => this.playTone(800, 0.15, 'square', 0.15), 100);
    }

    playLevelComplete() {
        const notes = [262, 330, 392, 523];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'square', 0.2), i * 100);
        });
    }

    playCoinPickup() {
        this.playTone(800, 0.05, 'square', 0.15);
        setTimeout(() => this.playTone(1200, 0.08, 'square', 0.12), 40);
    }

    playPurchaseSuccess() {
        this.playTone(523, 0.1, 'square', 0.25);
        setTimeout(() => this.playTone(659, 0.1, 'square', 0.2), 80);
        setTimeout(() => this.playTone(784, 0.1, 'square', 0.2), 160);
        setTimeout(() => this.playTone(1047, 0.2, 'square', 0.15), 240);
    }

    playPurchaseFail() {
        this.playTone(200, 0.15, 'sawtooth', 0.25);
        setTimeout(() => this.playTone(150, 0.2, 'sawtooth', 0.2), 120);
    }

    playEquipSkin() {
        this.playTone(440, 0.08, 'square', 0.2);
        setTimeout(() => this.playTone(660, 0.12, 'square', 0.18), 60);
    }

    playShopNavigate() {
        this.playTone(300, 0.04, 'square', 0.1);
    }

    startMusic() {
        if (!this.initialized || this.musicPlaying) return;

        this.musicPlaying = true;
        this.playMusicLoop();
    }

    stopMusic() {
        this.musicPlaying = false;
        this.musicOscillators.forEach(osc => {
            try { osc.stop(); } catch (e) {}
        });
        this.musicOscillators = [];
    }

    playMusicLoop() {
        if (!this.musicPlaying || !this.initialized) return;

        // Doom-inspired bass line
        const bassNotes = [55, 55, 73, 55, 82, 55, 73, 55];
        const noteDuration = 0.25;

        bassNotes.forEach((freq, i) => {
            setTimeout(() => {
                if (!this.musicPlaying) return;

                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.connect(gain);
                gain.connect(this.musicGain);

                osc.type = 'sawtooth';
                osc.frequency.value = freq;

                gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + noteDuration * 0.9);

                osc.start();
                osc.stop(this.audioContext.currentTime + noteDuration);
                this.musicOscillators.push(osc);
            }, i * noteDuration * 1000);
        });

        // Schedule next loop
        setTimeout(() => this.playMusicLoop(), bassNotes.length * noteDuration * 1000);
    }

    setMasterVolume(value) {
        if (this.masterGain) this.masterGain.gain.value = value;
    }

    setMusicVolume(value) {
        if (this.musicGain) this.musicGain.gain.value = value;
    }

    setSfxVolume(value) {
        if (this.sfxGain) this.sfxGain.gain.value = value;
    }
}
