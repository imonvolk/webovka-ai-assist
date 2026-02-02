/**
 * DOOM Platformer - Main Game Engine
 * A 2D side-scrolling platformer with Doom aesthetic
 */

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// Tile constants
const TILE_SIZE = 32;

// Tile types
const TILES = {
    EMPTY: 0,
    SOLID: 1,
    PLATFORM: 2,      // One-way platform (can jump through from below)
    SPIKES: 3,
    BACKGROUND: 4,    // Decorative, no collision
    EXIT: 5           // Level exit
};

// Physics constants
const PHYSICS = {
    gravity: 1500,
    maxFallSpeed: 800,
    friction: 0.85
};

// Timing variables
let lastTime = 0;
let deltaTime = 0;
let frameCount = 0;
let fps = 0;
let fpsUpdateTime = 0;
const FPS_UPDATE_INTERVAL = 500;

// Game state
const gameState = {
    running: true,
    paused: false,
    started: false,
    currentLevel: 0,
    transitioning: false,
    transitionAlpha: 0,
    score: 0,
    gameOver: false,
    showMenu: true,
    difficulty: 'normal', // 'easy', 'normal', 'hard'
    showSettings: false,
    showLevelEditor: false,
    showShop: false
};

// Difficulty settings
const DIFFICULTY_SETTINGS = {
    easy: {
        playerDamageMultiplier: 0.5,
        enemyHealthMultiplier: 0.7,
        enemyDamageMultiplier: 0.5,
        enemySpeedMultiplier: 0.8,
        scoreMultiplier: 0.5
    },
    normal: {
        playerDamageMultiplier: 1.0,
        enemyHealthMultiplier: 1.0,
        enemyDamageMultiplier: 1.0,
        enemySpeedMultiplier: 1.0,
        scoreMultiplier: 1.0
    },
    hard: {
        playerDamageMultiplier: 1.5,
        enemyHealthMultiplier: 1.5,
        enemyDamageMultiplier: 1.5,
        enemySpeedMultiplier: 1.3,
        scoreMultiplier: 2.0
    }
};

function getDifficulty() {
    return DIFFICULTY_SETTINGS[gameState.difficulty] || DIFFICULTY_SETTINGS.normal;
}

// ============================================================================
// SKIN DEFINITIONS
// ============================================================================

const SKIN_DEFINITIONS = [
    {
        id: 'classic',
        name: 'Classic Doomguy',
        description: 'Red armor, green visor',
        price: 0,
        rarity: 'common',
        colors: {
            legs: '#251515', bodyDark: '#3a1a1a', bodyMid: '#5a2a2a',
            chest: '#6a2a2a', armorHighlight: '#8a3a3a', belt: '#3a2a1a',
            arms: '#3a1a1a', helmet: '#3a1a1a',
            visorGlow: '#00ff00', visorDefault: '#00aa00',
            visorJump: '#00ff88', visorFall: '#88ff00', visorWalk: '#00dd00',
            jetColor: 'rgba(255, 100, 0, 0.6)'
        },
        special: null
    },
    {
        id: 'blue_marine',
        name: 'Blue Marine',
        description: 'Blue armor variant',
        price: 50,
        rarity: 'common',
        colors: {
            legs: '#151525', bodyDark: '#1a1a3a', bodyMid: '#2a2a5a',
            chest: '#2a2a5a', armorHighlight: '#3a3a7a', belt: '#1a2a3a',
            arms: '#1a1a3a', helmet: '#1a1a3a',
            visorGlow: '#4488ff', visorDefault: '#2266cc',
            visorJump: '#44aaff', visorFall: '#6688ff', visorWalk: '#3388dd',
            jetColor: 'rgba(100, 150, 255, 0.6)'
        },
        special: null
    },
    {
        id: 'cyber_soldier',
        name: 'Cyber Soldier',
        description: 'Metallic silver with LED accents',
        price: 150,
        rarity: 'rare',
        colors: {
            legs: '#2a2a2a', bodyDark: '#3a3a3a', bodyMid: '#5a5a5a',
            chest: '#6a6a6a', armorHighlight: '#8a8a8a', belt: '#333333',
            arms: '#3a3a3a', helmet: '#4a4a4a',
            visorGlow: '#00ffff', visorDefault: '#00aaaa',
            visorJump: '#00ffdd', visorFall: '#88ffff', visorWalk: '#00dddd',
            jetColor: 'rgba(0, 255, 255, 0.6)'
        },
        special: 'led'
    },
    {
        id: 'shadow_operative',
        name: 'Shadow Operative',
        description: 'Black stealth suit',
        price: 300,
        rarity: 'epic',
        colors: {
            legs: '#0a0a0a', bodyDark: '#111111', bodyMid: '#1a1a1a',
            chest: '#222222', armorHighlight: '#333333', belt: '#151515',
            arms: '#111111', helmet: '#0f0f0f',
            visorGlow: '#ff0044', visorDefault: '#aa0033',
            visorJump: '#ff2266', visorFall: '#ff4488', visorWalk: '#dd0044',
            jetColor: 'rgba(255, 0, 68, 0.4)'
        },
        special: null
    },
    {
        id: 'golden_hero',
        name: 'Golden Hero',
        description: 'Shiny gold armor - Prestige skin',
        price: 500,
        rarity: 'legendary',
        colors: {
            legs: '#3a2a00', bodyDark: '#5a4a00', bodyMid: '#8a7a00',
            chest: '#aa9a00', armorHighlight: '#ddcc00', belt: '#4a3a00',
            arms: '#5a4a00', helmet: '#6a5a00',
            visorGlow: '#ffff00', visorDefault: '#ccaa00',
            visorJump: '#ffee44', visorFall: '#ffdd22', visorWalk: '#ffcc00',
            jetColor: 'rgba(255, 220, 0, 0.6)'
        },
        special: 'shimmer'
    },
    {
        id: 'retro_pixel',
        name: 'Retro Pixel',
        description: '8-bit style sprite',
        price: 250,
        rarity: 'rare',
        colors: {
            legs: '#2a0a2a', bodyDark: '#4a1a4a', bodyMid: '#6a2a6a',
            chest: '#7a3a7a', armorHighlight: '#aa5aaa', belt: '#3a1a2a',
            arms: '#4a1a4a', helmet: '#5a2a5a',
            visorGlow: '#ff88ff', visorDefault: '#cc55cc',
            visorJump: '#ff99ff', visorFall: '#ffaaff', visorWalk: '#dd66dd',
            jetColor: 'rgba(255, 100, 255, 0.6)'
        },
        special: 'retro'
    },
    {
        id: 'neon_runner',
        name: 'Neon Runner',
        description: 'Cyberpunk neon outlines',
        price: 400,
        rarity: 'epic',
        colors: {
            legs: '#0a1a0a', bodyDark: '#0a0a1a', bodyMid: '#151530',
            chest: '#1a1a40', armorHighlight: '#2a2a60', belt: '#0a1520',
            arms: '#0a0a1a', helmet: '#101030',
            visorGlow: '#ff00ff', visorDefault: '#aa00ff',
            visorJump: '#ff44ff', visorFall: '#cc22ff', visorWalk: '#dd00ff',
            jetColor: 'rgba(255, 0, 255, 0.6)'
        },
        special: 'neon'
    }
];

const RARITY_COLORS = {
    common: '#aaaaaa',
    rare: '#4488ff',
    epic: '#aa44ff',
    legendary: '#ffaa00'
};

const COIN_REWARDS = {
    patrol: 5,
    shooter: 10,
    flying: 15,
    boss: 50
};

// ============================================================================
// SOUND SYSTEM (Web Audio API)
// ============================================================================

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

// ============================================================================
// SCREEN SHAKE SYSTEM
// ============================================================================

class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.duration = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    shake(intensity, duration) {
        this.intensity = Math.max(this.intensity, intensity);
        this.duration = Math.max(this.duration, duration);
    }

    update(dt) {
        if (this.duration > 0) {
            this.duration -= dt;
            const decay = this.duration > 0 ? 1 : 0;
            this.offsetX = (Math.random() - 0.5) * this.intensity * 2 * decay;
            this.offsetY = (Math.random() - 0.5) * this.intensity * 2 * decay;
        } else {
            this.offsetX = 0;
            this.offsetY = 0;
            this.intensity = 0;
        }
    }

    apply(ctx) {
        ctx.translate(this.offsetX, this.offsetY);
    }
}

// ============================================================================
// HIGH SCORE SYSTEM
// ============================================================================

class HighScoreSystem {
    constructor() {
        this.storageKey = 'doomPlatformerHighScores';
    }

    getScores() {
        try {
            const scores = localStorage.getItem(this.storageKey);
            return scores ? JSON.parse(scores) : [];
        } catch (e) {
            return [];
        }
    }

    addScore(score, level) {
        const scores = this.getScores();
        scores.push({ score, level, date: Date.now() });
        scores.sort((a, b) => b.score - a.score);
        scores.splice(10); // Keep top 10
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(scores));
        } catch (e) {}
    }

    getHighScore() {
        const scores = this.getScores();
        return scores.length > 0 ? scores[0].score : 0;
    }
}

// ============================================================================
// ACHIEVEMENT SYSTEM
// ============================================================================

const ACHIEVEMENTS = {
    firstBlood: { id: 'firstBlood', name: 'First Blood', description: 'Kill your first enemy', icon: '🩸' },
    massacre: { id: 'massacre', name: 'Massacre', description: 'Kill 50 enemies', icon: '💀' },
    survivor: { id: 'survivor', name: 'Survivor', description: 'Complete a level without dying', icon: '🛡️' },
    speedrunner: { id: 'speedrunner', name: 'Speed Demon', description: 'Complete level 1 in under 60 seconds', icon: '⚡' },
    collector: { id: 'collector', name: 'Collector', description: 'Collect 20 pickups', icon: '📦' },
    skinCollector: { id: 'skinCollector', name: 'Skin Collector', description: 'Own all character skins', icon: '👕' },
    bossSlayer: { id: 'bossSlayer', name: 'Boss Slayer', description: 'Defeat a boss', icon: '👹' },
    perfectionist: { id: 'perfectionist', name: 'Perfectionist', description: 'Complete a level with full health', icon: '❤️' },
    weaponMaster: { id: 'weaponMaster', name: 'Weapon Master', description: 'Unlock all weapons', icon: '🔫' },
    hardMode: { id: 'hardMode', name: 'Hardcore', description: 'Complete level 1 on hard difficulty', icon: '🔥' },
    untouchable: { id: 'untouchable', name: 'Untouchable', description: 'Kill 10 enemies without taking damage', icon: '✨' }
};

class AchievementSystem {
    constructor() {
        this.storageKey = 'doomPlatformerAchievements';
        this.unlocked = this.loadAchievements();
        this.notifications = [];
        this.killStreak = 0;
        this.levelStartTime = 0;
        this.levelDeaths = 0;
    }

    loadAchievements() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    }

    saveAchievements() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.unlocked));
        } catch (e) {}
    }

    unlock(achievementId) {
        if (this.unlocked[achievementId]) return false;

        const achievement = ACHIEVEMENTS[achievementId];
        if (!achievement) return false;

        this.unlocked[achievementId] = { unlockedAt: Date.now() };
        this.saveAchievements();

        this.notifications.push({
            achievement,
            timer: 3.0
        });

        if (soundSystem) {
            soundSystem.playTone(523, 0.1, 'square', 0.3);
            soundSystem.playTone(659, 0.1, 'square', 0.25);
            soundSystem.playTone(784, 0.2, 'square', 0.2);
        }

        return true;
    }

    isUnlocked(achievementId) {
        return !!this.unlocked[achievementId];
    }

    check(player) {
        // First Blood
        if (player.stats.enemiesKilled >= 1) this.unlock('firstBlood');

        // Massacre
        if (player.stats.enemiesKilled >= 50) this.unlock('massacre');

        // Collector
        if (player.stats.pickupsCollected >= 20) this.unlock('collector');

        // Weapon Master
        const allWeapons = Object.values(player.weapons).every(v => v);
        if (allWeapons) this.unlock('weaponMaster');

        // Untouchable
        if (this.killStreak >= 10) this.unlock('untouchable');
    }

    onEnemyKilled(player) {
        this.killStreak++;
        player.stats.enemiesKilled++;
        this.check(player);
    }

    onPlayerDamaged() {
        this.killStreak = 0;
    }

    onLevelStart() {
        this.levelStartTime = Date.now();
        this.levelDeaths = 0;
    }

    onLevelComplete(levelIndex, player) {
        const timeElapsed = (Date.now() - this.levelStartTime) / 1000;

        // Survivor
        if (this.levelDeaths === 0) this.unlock('survivor');

        // Perfectionist
        if (player.health >= player.maxHealth) this.unlock('perfectionist');

        // Speedrunner (level 1 under 60s)
        if (levelIndex === 0 && timeElapsed < 60) this.unlock('speedrunner');

        // Hard mode
        if (levelIndex === 0 && gameState.difficulty === 'hard') this.unlock('hardMode');

        player.stats.levelsCompleted++;
    }

    onBossKilled() {
        this.unlock('bossSlayer');
    }

    onPlayerDeath() {
        this.levelDeaths++;
        this.killStreak = 0;
    }

    update(dt) {
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            this.notifications[i].timer -= dt;
            if (this.notifications[i].timer <= 0) {
                this.notifications.splice(i, 1);
            }
        }
    }

    render(ctx) {
        const startY = 150;
        for (let i = 0; i < this.notifications.length; i++) {
            const notif = this.notifications[i];
            const alpha = Math.min(1, notif.timer);
            const y = startY + i * 60;

            ctx.save();
            ctx.globalAlpha = alpha;

            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(CANVAS_WIDTH - 220, y, 210, 50);

            // Border
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 2;
            ctx.strokeRect(CANVAS_WIDTH - 220, y, 210, 50);

            // Icon and text
            ctx.font = '24px Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'left';
            ctx.fillText(notif.achievement.icon, CANVAS_WIDTH - 210, y + 32);

            ctx.font = 'bold 12px Impact';
            ctx.fillStyle = '#ffaa00';
            ctx.fillText('ACHIEVEMENT UNLOCKED', CANVAS_WIDTH - 180, y + 18);

            ctx.font = '11px Arial';
            ctx.fillStyle = '#fff';
            ctx.fillText(notif.achievement.name, CANVAS_WIDTH - 180, y + 35);

            ctx.restore();
        }
    }

    getUnlockedCount() {
        return Object.keys(this.unlocked).length;
    }

    getTotalCount() {
        return Object.keys(ACHIEVEMENTS).length;
    }
}

// ============================================================================
// COIN SYSTEM
// ============================================================================

class CoinSystem {
    constructor() {
        this.balance = 0;
        this.totalEarned = 0;
        this.chainCount = 0;
        this.chainTimer = 0;
        this.levelDamageTaken = 0;
        this.pendingPopups = [];
        this.notification = null;
        this.load();
    }

    load() {
        try {
            const data = localStorage.getItem('doomPlatformerCoins');
            if (data) {
                const parsed = JSON.parse(data);
                this.balance = parsed.balance || 0;
                this.totalEarned = parsed.totalEarned || 0;
            }
        } catch (e) {}
    }

    save() {
        try {
            localStorage.setItem('doomPlatformerCoins', JSON.stringify({
                balance: this.balance,
                totalEarned: this.totalEarned
            }));
        } catch (e) {}
    }

    earn(amount, x, y) {
        this.balance += amount;
        this.totalEarned += amount;
        this.pendingPopups.push({ amount, x, y, timer: 1.2, offsetY: 0 });
        this.save();
        this.checkSkinNotification();
    }

    spend(amount) {
        if (this.balance >= amount) {
            this.balance -= amount;
            this.save();
            return true;
        }
        return false;
    }

    getChainMultiplier() {
        if (this.chainCount >= 5) return 5;
        if (this.chainCount >= 3) return 3;
        if (this.chainCount >= 2) return 2;
        return 1;
    }

    onEnemyKill(enemyType, x, y) {
        const base = COIN_REWARDS[enemyType] || 5;
        this.chainCount++;
        this.chainTimer = 3.0;
        const multiplier = this.getChainMultiplier();
        const total = base * multiplier;
        this.earn(total, x, y);
        if (soundSystem) soundSystem.playCoinPickup();
        return total;
    }

    onLevelComplete() {
        const perfect = this.levelDamageTaken === 0;
        let bonus = 50;
        if (perfect) bonus += 25;
        this.earn(bonus, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
        this.levelDamageTaken = 0;
        return { bonus, perfect };
    }

    onCoinPickup(x, y) {
        this.earn(10, x, y);
        if (soundSystem) soundSystem.playCoinPickup();
    }

    resetLevelDamage() {
        this.levelDamageTaken = 0;
    }

    onDamageTaken(amount) {
        this.levelDamageTaken += amount;
    }

    checkSkinNotification() {
        if (!skinManager) return;
        for (const skin of SKIN_DEFINITIONS) {
            if (!skinManager.isOwned(skin.id) && skin.price > 0 && this.balance >= skin.price) {
                this.notification = { message: 'New skin available in Shop!', timer: 3.0 };
                return;
            }
        }
    }

    update(dt) {
        if (this.chainTimer > 0) {
            this.chainTimer -= dt;
            if (this.chainTimer <= 0) this.chainCount = 0;
        }
        for (const p of this.pendingPopups) {
            p.timer -= dt;
            p.offsetY -= 50 * dt;
        }
        this.pendingPopups = this.pendingPopups.filter(p => p.timer > 0);
        if (this.notification) {
            this.notification.timer -= dt;
            if (this.notification.timer <= 0) this.notification = null;
        }
    }

    renderPopups(ctx, camera) {
        for (const p of this.pendingPopups) {
            const alpha = Math.min(1, p.timer);
            const sx = p.x - (camera ? camera.x : 0);
            const sy = p.y + p.offsetY - (camera ? camera.y : 0);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = 'bold 14px Impact';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeText(`+${p.amount}`, sx, sy);
            ctx.fillStyle = '#ffdd00';
            ctx.fillText(`+${p.amount}`, sx, sy);
            // Coin icon
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.arc(sx + ctx.measureText(`+${p.amount}`).width / 2 + 10, sy - 4, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffdd00';
            ctx.font = 'bold 7px Impact';
            ctx.fillText('C', sx + ctx.measureText(`+${p.amount}`).width / 2 + 10, sy - 1);
            ctx.restore();
        }
        // Chain multiplier display
        if (this.chainCount >= 2 && this.chainTimer > 0) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, this.chainTimer);
            ctx.font = 'bold 18px Impact';
            ctx.textAlign = 'center';
            ctx.fillStyle = this.chainCount >= 5 ? '#ff4444' : this.chainCount >= 3 ? '#ffaa00' : '#ffdd00';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            const text = `${this.getChainMultiplier()}x CHAIN!`;
            ctx.strokeText(text, CANVAS_WIDTH / 2, 120);
            ctx.fillText(text, CANVAS_WIDTH / 2, 120);
            ctx.restore();
        }
    }

    renderNotification(ctx) {
        if (!this.notification) return;
        const alpha = Math.min(1, this.notification.timer, (3.0 - (3.0 - this.notification.timer)) > 2.5 ? (3.0 - (3.0 - this.notification.timer) - 2.5) * 2 : 1);
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.notification.timer);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(CANVAS_WIDTH / 2 - 130, 55, 260, 28);
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 1;
        ctx.strokeRect(CANVAS_WIDTH / 2 - 130, 55, 260, 28);
        ctx.font = 'bold 12px Impact';
        ctx.fillStyle = '#ffdd00';
        ctx.textAlign = 'center';
        ctx.fillText(this.notification.message, CANVAS_WIDTH / 2, 74);
        ctx.restore();
    }
}

// ============================================================================
// SKIN MANAGER
// ============================================================================

class SkinManager {
    constructor() {
        this.skins = SKIN_DEFINITIONS;
        this.ownedSkins = ['classic'];
        this.equippedSkin = 'classic';
        this.load();
    }

    load() {
        try {
            const data = localStorage.getItem('doomPlatformerSkins');
            if (data) {
                const parsed = JSON.parse(data);
                this.ownedSkins = parsed.owned || ['classic'];
                this.equippedSkin = parsed.equipped || 'classic';
            }
        } catch (e) {}
    }

    save() {
        try {
            localStorage.setItem('doomPlatformerSkins', JSON.stringify({
                owned: this.ownedSkins,
                equipped: this.equippedSkin
            }));
        } catch (e) {}
    }

    getSkin(id) {
        return this.skins.find(s => s.id === id);
    }

    getEquippedSkin() {
        return this.getSkin(this.equippedSkin) || this.skins[0];
    }

    isOwned(id) {
        return this.ownedSkins.includes(id);
    }

    isEquipped(id) {
        return this.equippedSkin === id;
    }

    buy(id) {
        const skin = this.getSkin(id);
        if (!skin || this.isOwned(id)) return false;
        if (coinSystem && coinSystem.spend(skin.price)) {
            this.ownedSkins.push(id);
            this.save();
            // Check for skin collector achievement
            if (achievementSystem && this.ownedSkins.length === SKIN_DEFINITIONS.length) {
                achievementSystem.unlock('skinCollector');
            }
            return true;
        }
        return false;
    }

    equip(id) {
        if (this.isOwned(id)) {
            this.equippedSkin = id;
            this.save();
            return true;
        }
        return false;
    }

    getOwnershipCount() {
        return this.ownedSkins.length;
    }
}

// ============================================================================
// SHOP UI
// ============================================================================

class ShopUI {
    constructor() {
        this.selectedIndex = 0;
        this.sortMode = 'default';
        this.sortModes = ['default', 'price', 'rarity', 'owned'];
        this.animTimer = 0;
        this.purchaseAnim = null;
        this.previewMode = false;
        this.previewTimer = 0;
        this.tryBeforeBuyTimer = 0;
        this.tryBeforeBuySkinId = null;
        this.prevEquippedSkin = null;
        this.scrollY = 0;
        this.targetScrollY = 0;
    }

    open() {
        gameState.showShop = true;
        this.selectedIndex = 0;
        this.purchaseAnim = null;
        this.previewMode = false;
    }

    close() {
        gameState.showShop = false;
        if (this.tryBeforeBuySkinId && this.prevEquippedSkin) {
            skinManager.equip(this.prevEquippedSkin);
            this.tryBeforeBuySkinId = null;
            this.prevEquippedSkin = null;
        }
        this.previewMode = false;
    }

    getSortedSkins() {
        let skins = [...SKIN_DEFINITIONS];
        switch (this.sortMode) {
            case 'price':
                skins.sort((a, b) => a.price - b.price);
                break;
            case 'rarity': {
                const order = { common: 0, rare: 1, epic: 2, legendary: 3 };
                skins.sort((a, b) => order[a.rarity] - order[b.rarity]);
                break;
            }
            case 'owned':
                skins.sort((a, b) => {
                    const ao = skinManager.isOwned(a.id) ? 0 : 1;
                    const bo = skinManager.isOwned(b.id) ? 0 : 1;
                    return ao - bo;
                });
                break;
        }
        return skins;
    }

    handleInput(input) {
        if (!gameState.showShop) return;

        const skins = this.getSortedSkins();
        const cols = 4;

        if (input.shopLeft) {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            if (soundSystem) soundSystem.playShopNavigate();
        }
        if (input.shopRight) {
            this.selectedIndex = Math.min(skins.length - 1, this.selectedIndex + 1);
            if (soundSystem) soundSystem.playShopNavigate();
        }
        if (input.shopUp) {
            this.selectedIndex = Math.max(0, this.selectedIndex - cols);
            if (soundSystem) soundSystem.playShopNavigate();
        }
        if (input.shopDown) {
            this.selectedIndex = Math.min(skins.length - 1, this.selectedIndex + cols);
            if (soundSystem) soundSystem.playShopNavigate();
        }

        // Ensure scroll follows selection
        const row = Math.floor(this.selectedIndex / cols);
        const rowY = 130 + row * 140;
        if (rowY + 140 > this.scrollY + 400) {
            this.targetScrollY = rowY + 140 - 400;
        }
        if (rowY < this.scrollY + 130) {
            this.targetScrollY = Math.max(0, rowY - 130);
        }

        if (input.shopConfirm) {
            const skin = skins[this.selectedIndex];
            if (skinManager.isOwned(skin.id)) {
                if (!skinManager.isEquipped(skin.id)) {
                    skinManager.equip(skin.id);
                    if (soundSystem) soundSystem.playEquipSkin();
                    this.purchaseAnim = { timer: 1.0, text: 'EQUIPPED!', color: '#00ff00' };
                }
            } else {
                if (coinSystem && coinSystem.balance >= skin.price) {
                    if (skinManager.buy(skin.id)) {
                        skinManager.equip(skin.id);
                        if (soundSystem) soundSystem.playPurchaseSuccess();
                        this.purchaseAnim = { timer: 1.5, text: 'PURCHASED!', color: '#ffdd00' };
                    }
                } else {
                    if (soundSystem) soundSystem.playPurchaseFail();
                    this.purchaseAnim = { timer: 1.0, text: 'NOT ENOUGH COINS!', color: '#ff4444' };
                }
            }
        }

        // T for try before buy
        if (input.shopTry) {
            const skin = skins[this.selectedIndex];
            if (!skinManager.isOwned(skin.id)) {
                this.prevEquippedSkin = skinManager.equippedSkin;
                this.tryBeforeBuySkinId = skin.id;
                this.tryBeforeBuyTimer = 30.0;
                skinManager.equippedSkin = skin.id;
            }
        }

        // Tab to cycle sort
        if (input.shopSort) {
            const idx = this.sortModes.indexOf(this.sortMode);
            this.sortMode = this.sortModes[(idx + 1) % this.sortModes.length];
            this.selectedIndex = 0;
        }

        if (input.shopBack) {
            this.close();
        }

        // Clear consumed inputs
        input.shopLeft = false;
        input.shopRight = false;
        input.shopUp = false;
        input.shopDown = false;
        input.shopConfirm = false;
        input.shopBack = false;
        input.shopSort = false;
        input.shopTry = false;
    }

    update(dt) {
        this.animTimer += dt;
        this.scrollY += (this.targetScrollY - this.scrollY) * Math.min(1, dt * 10);

        if (this.purchaseAnim) {
            this.purchaseAnim.timer -= dt;
            if (this.purchaseAnim.timer <= 0) this.purchaseAnim = null;
        }

        if (this.tryBeforeBuyTimer > 0) {
            this.tryBeforeBuyTimer -= dt;
            if (this.tryBeforeBuyTimer <= 0 && this.prevEquippedSkin) {
                skinManager.equip(this.prevEquippedSkin);
                this.tryBeforeBuySkinId = null;
                this.prevEquippedSkin = null;
            }
        }
    }

    render(ctx) {
        if (!gameState.showShop) return;

        const skins = this.getSortedSkins();
        const cols = 4;
        const cellW = 185;
        const cellH = 130;
        const startX = (CANVAS_WIDTH - cols * cellW) / 2;
        const startY = 130;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Title
        ctx.font = 'bold 36px Impact, Arial Black, sans-serif';
        ctx.fillStyle = '#8b0000';
        ctx.textAlign = 'center';
        ctx.fillText('SKIN SHOP', CANVAS_WIDTH / 2, 40);

        // Coin balance
        ctx.font = 'bold 18px Impact';
        ctx.fillStyle = '#ffdd00';
        ctx.textAlign = 'right';
        const bal = coinSystem ? coinSystem.balance : 0;
        ctx.fillText(`${bal}`, CANVAS_WIDTH - 30, 35);
        // Coin icon
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH - 40 - ctx.measureText(`${bal}`).width, 30, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffdd00';
        ctx.font = 'bold 10px Impact';
        ctx.textAlign = 'center';
        ctx.fillText('C', CANVAS_WIDTH - 40 - ctx.measureText(`${bal}`).width, 34);

        // Lifetime stats
        ctx.font = '11px Impact';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'left';
        ctx.fillText(`Total earned: ${coinSystem ? coinSystem.totalEarned : 0}`, 15, 35);
        ctx.fillText(`Skins owned: ${skinManager ? skinManager.getOwnershipCount() : 1}/${SKIN_DEFINITIONS.length}`, 15, 50);

        // Sort mode
        ctx.font = 'bold 12px Impact';
        ctx.fillStyle = '#888';
        ctx.textAlign = 'center';
        ctx.fillText(`Sort: ${this.sortMode.toUpperCase()} [TAB to change]`, CANVAS_WIDTH / 2, 65);

        // Try before buy timer
        if (this.tryBeforeBuyTimer > 0) {
            ctx.font = 'bold 14px Impact';
            ctx.fillStyle = '#44aaff';
            ctx.fillText(`TRIAL: ${Math.ceil(this.tryBeforeBuyTimer)}s remaining`, CANVAS_WIDTH / 2, 85);
        }

        // Skin grid
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 95, CANVAS_WIDTH, CANVAS_HEIGHT - 140);
        ctx.clip();

        for (let i = 0; i < skins.length; i++) {
            const skin = skins[i];
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * cellW;
            const y = startY + row * (cellH + 10) - this.scrollY;

            if (y + cellH < 95 || y > CANVAS_HEIGHT - 45) continue;

            const isSelected = i === this.selectedIndex;
            const isOwned = skinManager.isOwned(skin.id);
            const isEquipped = skinManager.isEquipped(skin.id);

            // Cell background
            ctx.fillStyle = isSelected ? 'rgba(60, 60, 80, 0.9)' : 'rgba(30, 30, 40, 0.8)';
            ctx.fillRect(x, y, cellW - 8, cellH);

            // Selection border
            if (isSelected) {
                ctx.strokeStyle = '#ffaa00';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, cellW - 8, cellH);
            }

            // Rarity border
            ctx.strokeStyle = RARITY_COLORS[skin.rarity];
            ctx.lineWidth = isSelected ? 0 : 1;
            if (!isSelected) ctx.strokeRect(x, y, cellW - 8, cellH);

            // Lock icon for unpurchased
            if (!isOwned) {
                ctx.font = '20px Arial';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.textAlign = 'center';
                ctx.fillText('\u{1F512}', x + cellW / 2 - 4, y + 25);
            }

            // Mini character preview
            ctx.save();
            ctx.translate(x + 28, y + 15);
            ctx.scale(0.7, 0.7);
            this.drawMiniCharacter(ctx, skin, this.animTimer);
            ctx.restore();

            // Skin name
            ctx.font = 'bold 11px Impact';
            ctx.fillStyle = RARITY_COLORS[skin.rarity];
            ctx.textAlign = 'left';
            ctx.fillText(skin.name, x + 62, y + 22);

            // Description
            ctx.font = '9px Arial';
            ctx.fillStyle = '#888';
            ctx.fillText(skin.description, x + 62, y + 36);

            // Rarity
            ctx.font = 'bold 9px Impact';
            ctx.fillStyle = RARITY_COLORS[skin.rarity];
            ctx.fillText(skin.rarity.toUpperCase(), x + 62, y + 50);

            // Price or status
            if (isEquipped) {
                ctx.font = 'bold 12px Impact';
                ctx.fillStyle = '#00ff00';
                ctx.fillText('EQUIPPED', x + 62, y + 75);
            } else if (isOwned) {
                ctx.font = 'bold 12px Impact';
                ctx.fillStyle = '#4488ff';
                ctx.fillText('OWNED', x + 62, y + 75);
            } else {
                ctx.font = 'bold 12px Impact';
                ctx.fillStyle = (coinSystem && coinSystem.balance >= skin.price) ? '#ffdd00' : '#ff4444';
                ctx.fillText(`${skin.price}`, x + 76, y + 75);
                // Mini coin
                ctx.fillStyle = '#ffaa00';
                ctx.beginPath();
                ctx.arc(x + 67, y + 72, 5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Button hint for selected
            if (isSelected) {
                ctx.font = '9px Impact';
                ctx.fillStyle = '#aaa';
                ctx.textAlign = 'left';
                if (isEquipped) {
                    ctx.fillText('Currently active', x + 62, y + 95);
                } else if (isOwned) {
                    ctx.fillText('[ENTER] Equip', x + 62, y + 95);
                } else {
                    ctx.fillText('[ENTER] Buy  [T] Try 30s', x + 62, y + 95);
                }
            }

            // Equipped checkmark
            if (isEquipped) {
                ctx.font = 'bold 16px Arial';
                ctx.fillStyle = '#00ff00';
                ctx.textAlign = 'right';
                ctx.fillText('\u2713', x + cellW - 16, y + 22);
            }
        }
        ctx.restore();

        // Purchase animation
        if (this.purchaseAnim) {
            const a = Math.min(1, this.purchaseAnim.timer);
            ctx.save();
            ctx.globalAlpha = a;
            ctx.font = 'bold 28px Impact';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;
            ctx.strokeText(this.purchaseAnim.text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20 - (1 - a) * 30);
            ctx.fillStyle = this.purchaseAnim.color;
            ctx.fillText(this.purchaseAnim.text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20 - (1 - a) * 30);
            ctx.restore();
        }

        // Controls hint
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, CANVAS_HEIGHT - 35, CANVAS_WIDTH, 35);
        ctx.font = '11px Impact';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('ARROWS: Navigate | ENTER: Buy/Equip | T: Try Skin | TAB: Sort | ESC: Back', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 14);
    }

    drawMiniCharacter(ctx, skin, time) {
        const c = skin.colors;
        const w = 28;
        const h = 56;
        const bobOffset = Math.sin(time * 8 * Math.PI * 2) * 2;
        const armOffset = Math.sin(time * 8 * Math.PI * 2) * 4;

        // Legs
        ctx.fillStyle = c.legs;
        ctx.fillRect(3, h - 18 + bobOffset, 9, 18 - bobOffset);
        ctx.fillRect(w - 12, h - 18 - bobOffset, 9, 18 + bobOffset);

        // Body
        const bodyGrad = ctx.createLinearGradient(0, 0, w, 0);
        bodyGrad.addColorStop(0, c.bodyDark);
        bodyGrad.addColorStop(0.5, c.bodyMid);
        bodyGrad.addColorStop(1, c.bodyDark);
        ctx.fillStyle = bodyGrad;
        ctx.fillRect(2, 14, w - 4, h - 32);

        // Chest
        ctx.fillStyle = c.chest;
        ctx.fillRect(5, 18, w - 10, 16);
        ctx.fillStyle = c.armorHighlight;
        ctx.fillRect(7, 20, w - 14, 3);

        // Belt
        ctx.fillStyle = c.belt;
        ctx.fillRect(3, h - 22, w - 6, 5);

        // Arms
        ctx.fillStyle = c.arms;
        ctx.fillRect(-1, 16 - armOffset, 6, 20);
        ctx.fillRect(w - 5, 16 + armOffset, 6, 20);

        // Helmet
        ctx.fillStyle = c.helmet;
        ctx.fillRect(3, 0, w - 6, 16);

        // Visor
        ctx.shadowColor = c.visorGlow;
        ctx.shadowBlur = 10;
        ctx.fillStyle = c.visorWalk;
        ctx.fillRect(6, 4, w - 12, 7);
        ctx.shadowBlur = 0;

        // Visor reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(7, 5, 5, 2);

        // Special effects
        if (skin.special === 'neon') {
            ctx.strokeStyle = c.visorGlow;
            ctx.lineWidth = 1;
            ctx.shadowColor = c.visorGlow;
            ctx.shadowBlur = 6;
            ctx.strokeRect(2, 14, w - 4, h - 32);
            ctx.strokeRect(3, 0, w - 6, 16);
            ctx.shadowBlur = 0;
        }
        if (skin.special === 'shimmer') {
            const shimmer = Math.sin(time * 4) * 0.15 + 0.15;
            ctx.fillStyle = `rgba(255, 255, 200, ${shimmer})`;
            ctx.fillRect(2, 14, w - 4, h - 32);
        }
        if (skin.special === 'led') {
            const ledBright = Math.sin(time * 6) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(0, 255, 255, ${ledBright * 0.4})`;
            ctx.fillRect(5, 34, w - 10, 2);
            ctx.fillRect(5, 24, 2, 10);
            ctx.fillRect(w - 7, 24, 2, 10);
        }
        if (skin.special === 'retro') {
            // Pixelated overlay effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            for (let py = 0; py < h; py += 4) {
                ctx.fillRect(0, py, w, 1);
            }
        }
    }
}

// ============================================================================
// OBJECT POOL SYSTEM
// ============================================================================

class ObjectPool {
    constructor(createFn, resetFn, initialSize = 50) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = [];

        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }

    get() {
        let obj;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.createFn();
        }
        this.active.push(obj);
        return obj;
    }

    release(obj) {
        const index = this.active.indexOf(obj);
        if (index !== -1) {
            this.active.splice(index, 1);
            this.resetFn(obj);
            this.pool.push(obj);
        }
    }

    releaseAll() {
        while (this.active.length > 0) {
            const obj = this.active.pop();
            this.resetFn(obj);
            this.pool.push(obj);
        }
    }

    update(dt, ...args) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const obj = this.active[i];
            obj.update(dt, ...args);
            if (obj.isDead && obj.isDead()) {
                this.release(obj);
            }
        }
    }
}

// ============================================================================
// SPATIAL HASH GRID - Optimized collision detection
// ============================================================================

class SpatialHashGrid {
    constructor(cellSize = 64) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }

    clear() {
        this.grid.clear();
    }

    getKey(x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
    }

    insert(entity) {
        const bounds = entity.getBounds();
        const minCellX = Math.floor(bounds.x / this.cellSize);
        const maxCellX = Math.floor((bounds.x + bounds.width) / this.cellSize);
        const minCellY = Math.floor(bounds.y / this.cellSize);
        const maxCellY = Math.floor((bounds.y + bounds.height) / this.cellSize);

        for (let x = minCellX; x <= maxCellX; x++) {
            for (let y = minCellY; y <= maxCellY; y++) {
                const key = `${x},${y}`;
                if (!this.grid.has(key)) {
                    this.grid.set(key, []);
                }
                this.grid.get(key).push(entity);
            }
        }
    }

    query(bounds) {
        const results = new Set();
        const minCellX = Math.floor(bounds.x / this.cellSize);
        const maxCellX = Math.floor((bounds.x + bounds.width) / this.cellSize);
        const minCellY = Math.floor(bounds.y / this.cellSize);
        const maxCellY = Math.floor((bounds.y + bounds.height) / this.cellSize);

        for (let x = minCellX; x <= maxCellX; x++) {
            for (let y = minCellY; y <= maxCellY; y++) {
                const key = `${x},${y}`;
                const cell = this.grid.get(key);
                if (cell) {
                    cell.forEach(entity => results.add(entity));
                }
            }
        }

        return Array.from(results);
    }
}

// ============================================================================
// SAVE/LOAD SYSTEM
// ============================================================================

class SaveSystem {
    constructor() {
        this.storageKey = 'doomPlatformerSave';
    }

    save(player, levelIndex) {
        const saveData = {
            version: 1,
            timestamp: Date.now(),
            level: levelIndex,
            score: gameState.score,
            difficulty: gameState.difficulty,
            player: {
                health: player.health,
                armor: player.armor,
                weapons: player.weapons,
                ammo: player.ammo,
                currentWeapon: player.currentWeapon,
                stats: player.stats
            }
        };

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error('Failed to save game:', e);
            return false;
        }
    }

    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return null;
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to load game:', e);
            return null;
        }
    }

    hasSave() {
        return localStorage.getItem(this.storageKey) !== null;
    }

    deleteSave() {
        localStorage.removeItem(this.storageKey);
    }

    applySave(saveData, player) {
        if (!saveData || saveData.version !== 1) return false;

        gameState.score = saveData.score || 0;
        gameState.difficulty = saveData.difficulty || 'normal';

        player.health = saveData.player.health;
        player.armor = saveData.player.armor || 0;
        player.weapons = saveData.player.weapons;
        player.ammo = saveData.player.ammo;
        player.currentWeapon = saveData.player.currentWeapon;
        player.stats = saveData.player.stats || player.stats;

        return saveData.level;
    }
}

// ============================================================================
// FULLSCREEN MANAGER
// ============================================================================

class FullscreenManager {
    constructor(element) {
        this.element = element;
        this.isFullscreen = false;

        document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
    }

    toggle() {
        if (this.isFullscreen) {
            this.exit();
        } else {
            this.enter();
        }
    }

    enter() {
        const el = this.element;
        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
        }
    }

    exit() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    onFullscreenChange() {
        this.isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
    }
}

// ============================================================================
// LEVEL EDITOR
// ============================================================================

class LevelEditor {
    constructor() {
        this.active = false;
        this.selectedTile = TILES.SOLID;
        this.gridWidth = 40;
        this.gridHeight = 15;
        this.tiles = [];
        this.enemies = [];
        this.pickups = [];
        this.checkpointsList = [];
        this.playerStart = { x: 2, y: 11 };
        this.cameraX = 0;
        this.selectedTool = 'tile'; // 'tile', 'enemy', 'pickup', 'checkpoint', 'player', 'erase'
        this.selectedEnemy = 'patrol';
        this.selectedPickup = 'health';

        this.initGrid();
    }

    initGrid() {
        this.tiles = [];
        for (let y = 0; y < this.gridHeight; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                // Default borders
                if (y === 0 || y === this.gridHeight - 1 || x === 0 || x === this.gridWidth - 1) {
                    this.tiles[y][x] = TILES.SOLID;
                } else {
                    this.tiles[y][x] = TILES.EMPTY;
                }
            }
        }
    }

    toggle() {
        this.active = !this.active;
        if (this.active) {
            gameState.paused = true;
        }
    }

    handleClick(mouseX, mouseY) {
        if (!this.active) return;

        const gridX = Math.floor((mouseX + this.cameraX) / TILE_SIZE);
        const gridY = Math.floor(mouseY / TILE_SIZE);

        if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) return;

        switch (this.selectedTool) {
            case 'tile':
                this.tiles[gridY][gridX] = this.selectedTile;
                break;
            case 'enemy':
                this.enemies.push({ type: this.selectedEnemy, x: gridX, y: gridY });
                break;
            case 'pickup':
                this.pickups.push({ type: this.selectedPickup, x: gridX, y: gridY });
                break;
            case 'checkpoint':
                this.checkpointsList.push({ x: gridX, y: gridY });
                break;
            case 'player':
                this.playerStart = { x: gridX, y: gridY };
                break;
            case 'erase':
                this.tiles[gridY][gridX] = TILES.EMPTY;
                this.enemies = this.enemies.filter(e => e.x !== gridX || e.y !== gridY);
                this.pickups = this.pickups.filter(p => p.x !== gridX || p.y !== gridY);
                this.checkpointsList = this.checkpointsList.filter(c => c.x !== gridX || c.y !== gridY);
                break;
        }
    }

    scroll(direction) {
        this.cameraX += direction * TILE_SIZE * 2;
        this.cameraX = Math.max(0, Math.min(this.cameraX, (this.gridWidth - 25) * TILE_SIZE));
    }

    exportLevel() {
        const levelData = {
            name: "CUSTOM LEVEL",
            playerStart: this.playerStart,
            width: this.gridWidth,
            height: this.gridHeight,
            enemies: this.enemies,
            pickups: this.pickups,
            checkpoints: this.checkpointsList,
            data: this.tiles.map(row => row.join(''))
        };
        return JSON.stringify(levelData);
    }

    importLevel(jsonString) {
        try {
            const levelData = JSON.parse(jsonString);
            this.gridWidth = levelData.width;
            this.gridHeight = levelData.height;
            this.playerStart = levelData.playerStart;
            this.enemies = levelData.enemies || [];
            this.pickups = levelData.pickups || [];
            this.checkpointsList = levelData.checkpoints || [];
            this.tiles = levelData.data.map(row => row.split('').map(Number));
            return true;
        } catch (e) {
            console.error('Failed to import level:', e);
            return false;
        }
    }

    testLevel() {
        // Create temporary level and load it
        const tempLevel = {
            name: "CUSTOM LEVEL",
            playerStart: this.playerStart,
            width: this.gridWidth,
            height: this.gridHeight,
            enemies: this.enemies,
            pickups: this.pickups,
            checkpoints: this.checkpointsList,
            data: this.tiles.map(row => row.join(''))
        };

        // Add to LEVELS temporarily
        LEVELS.push(tempLevel);
        levelManager.loadLevel(LEVELS.length - 1);
        this.active = false;
        gameState.paused = false;
    }

    render(ctx) {
        if (!this.active) return;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Grid
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const screenX = x * TILE_SIZE - this.cameraX;
                const screenY = y * TILE_SIZE;

                if (screenX < -TILE_SIZE || screenX > CANVAS_WIDTH) continue;

                // Tile
                const tile = this.tiles[y][x];
                switch (tile) {
                    case TILES.SOLID:
                        ctx.fillStyle = '#442222';
                        break;
                    case TILES.PLATFORM:
                        ctx.fillStyle = '#444466';
                        break;
                    case TILES.SPIKES:
                        ctx.fillStyle = '#882222';
                        break;
                    case TILES.EXIT:
                        ctx.fillStyle = '#226622';
                        break;
                    default:
                        ctx.fillStyle = '#111';
                }
                ctx.fillRect(screenX, screenY, TILE_SIZE - 1, TILE_SIZE - 1);

                // Grid lines
                ctx.strokeStyle = '#333';
                ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            }
        }

        // Enemies
        ctx.fillStyle = '#ff4444';
        for (const enemy of this.enemies) {
            const screenX = enemy.x * TILE_SIZE - this.cameraX + 8;
            const screenY = enemy.y * TILE_SIZE + 8;
            ctx.fillRect(screenX, screenY, 16, 16);
            ctx.font = '10px Arial';
            ctx.fillStyle = '#fff';
            ctx.fillText(enemy.type[0].toUpperCase(), screenX + 4, screenY + 12);
            ctx.fillStyle = '#ff4444';
        }

        // Pickups
        ctx.fillStyle = '#44ff44';
        for (const pickup of this.pickups) {
            const screenX = pickup.x * TILE_SIZE - this.cameraX + 8;
            const screenY = pickup.y * TILE_SIZE + 8;
            ctx.beginPath();
            ctx.arc(screenX + 8, screenY + 8, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Checkpoints
        ctx.fillStyle = '#ffff44';
        for (const cp of this.checkpointsList) {
            const screenX = cp.x * TILE_SIZE - this.cameraX + 12;
            const screenY = cp.y * TILE_SIZE;
            ctx.fillRect(screenX, screenY, 8, 32);
        }

        // Player start
        ctx.fillStyle = '#4444ff';
        const psx = this.playerStart.x * TILE_SIZE - this.cameraX + 4;
        const psy = this.playerStart.y * TILE_SIZE + 4;
        ctx.fillRect(psx, psy, 24, 24);

        // UI
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Impact';
        ctx.textAlign = 'left';
        ctx.fillText('LEVEL EDITOR', 10, 25);

        ctx.font = '12px Arial';
        ctx.fillText(`Tool: ${this.selectedTool.toUpperCase()}`, 10, 45);
        ctx.fillText(`Tile: ${Object.keys(TILES)[this.selectedTile]}`, 10, 60);
        ctx.fillText('1-5: Tiles | E: Enemy | P: Pickup | C: Checkpoint | S: Player | X: Erase', 10, CANVAS_HEIGHT - 40);
        ctx.fillText('Arrow Keys: Scroll | T: Test | ESC: Exit | Ctrl+S: Export', 10, CANVAS_HEIGHT - 20);
    }

    handleKey(key) {
        if (!this.active) return false;

        switch (key) {
            case '1': this.selectedTile = TILES.EMPTY; this.selectedTool = 'tile'; break;
            case '2': this.selectedTile = TILES.SOLID; this.selectedTool = 'tile'; break;
            case '3': this.selectedTile = TILES.PLATFORM; this.selectedTool = 'tile'; break;
            case '4': this.selectedTile = TILES.SPIKES; this.selectedTool = 'tile'; break;
            case '5': this.selectedTile = TILES.EXIT; this.selectedTool = 'tile'; break;
            case 'e': this.selectedTool = 'enemy'; break;
            case 'p': this.selectedTool = 'pickup'; break;
            case 'c': this.selectedTool = 'checkpoint'; break;
            case 's': this.selectedTool = 'player'; break;
            case 'x': this.selectedTool = 'erase'; break;
            case 't': this.testLevel(); break;
            case 'ArrowLeft': this.scroll(-1); break;
            case 'ArrowRight': this.scroll(1); break;
            case 'Escape': this.toggle(); return true;
            default: return false;
        }
        return true;
    }
}

// ============================================================================
// WEAPON DEFINITIONS
// ============================================================================

const WEAPONS = {
    pistol: {
        name: 'PISTOL',
        damage: 25,
        fireRate: 0.25,
        projectileSpeed: 500,
        ammo: Infinity,
        maxAmmo: Infinity,
        spread: 0,
        projectileCount: 1,
        color: '#88ff88',
        projectileType: 'bullet',
        piercing: false,
        explosive: false
    },
    shotgun: {
        name: 'SHOTGUN',
        damage: 15,
        fireRate: 0.8,
        projectileSpeed: 450,
        ammo: 20,
        maxAmmo: 50,
        spread: 0.3,
        projectileCount: 5,
        color: '#ffaa44',
        projectileType: 'pellet',
        piercing: false,
        explosive: false,
        knockback: 300
    },
    machinegun: {
        name: 'MACHINE GUN',
        damage: 12,
        fireRate: 0.1,
        projectileSpeed: 550,
        ammo: 100,
        maxAmmo: 200,
        spread: 0.1,
        projectileCount: 1,
        color: '#ffff44',
        projectileType: 'bullet',
        piercing: true,
        explosive: false
    },
    plasma: {
        name: 'PLASMA GUN',
        damage: 40,
        fireRate: 0.4,
        projectileSpeed: 400,
        ammo: 50,
        maxAmmo: 100,
        spread: 0,
        projectileCount: 1,
        color: '#44aaff',
        projectileType: 'plasma',
        piercing: false,
        explosive: true,
        explosionRadius: 50
    },
    rocket: {
        name: 'ROCKET LAUNCHER',
        damage: 80,
        fireRate: 1.2,
        projectileSpeed: 300,
        ammo: 20,
        maxAmmo: 40,
        spread: 0,
        projectileCount: 1,
        color: '#ff4444',
        projectileType: 'rocket',
        piercing: false,
        explosive: true,
        explosionRadius: 80
    },
    laser: {
        name: 'LASER RIFLE',
        damage: 35,
        fireRate: 0.05,
        projectileSpeed: 1000,
        ammo: 150,
        maxAmmo: 300,
        spread: 0,
        projectileCount: 1,
        color: '#ff00ff',
        projectileType: 'laser',
        piercing: true,
        explosive: false,
        hitscan: true
    }
};

// ============================================================================
// PICKUP CLASS
// ============================================================================

class Pickup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.type = type; // 'health', 'ammo', 'armor', 'invincibility', 'coin', 'shotgun', 'machinegun', 'plasma', 'rocket', 'laser'
        this.collected = false;
        this.animationTime = 0;
        this.bobOffset = Math.random() * Math.PI * 2;
    }

    update(dt) {
        this.animationTime += dt;
    }

    render(ctx, camera) {
        if (this.collected) return;

        const bob = Math.sin(this.animationTime * 4 + this.bobOffset) * 4;
        const screenPos = camera.worldToScreen(this.x, this.y + bob);

        ctx.save();

        // Glow effect
        const glowColor = this.getGlowColor();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15 + Math.sin(this.animationTime * 6) * 5;

        // Draw pickup based on type
        this.drawPickup(ctx, screenPos.x, screenPos.y);

        ctx.restore();
    }

    getGlowColor() {
        switch (this.type) {
            case 'health': return '#00ff00';
            case 'ammo': return '#ffaa00';
            case 'armor': return '#4444ff';
            case 'invincibility': return '#ffff00';
            case 'coin': return '#ffdd00';
            case 'shotgun': return '#ff6600';
            case 'machinegun': return '#ffff00';
            case 'plasma': return '#00aaff';
            case 'rocket': return '#ff4444';
            case 'laser': return '#ff00ff';
            default: return '#ffffff';
        }
    }

    drawPickup(ctx, x, y) {
        const cx = x + this.width / 2;
        const cy = y + this.height / 2;

        switch (this.type) {
            case 'health':
                // Health cross
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(cx - 3, cy - 10, 6, 20);
                ctx.fillRect(cx - 10, cy - 3, 20, 6);
                break;

            case 'ammo':
                // Ammo box
                ctx.fillStyle = '#ffaa00';
                ctx.fillRect(x + 2, y + 4, 20, 16);
                ctx.fillStyle = '#cc8800';
                ctx.fillRect(x + 4, y + 8, 4, 8);
                ctx.fillRect(x + 10, y + 8, 4, 8);
                ctx.fillRect(x + 16, y + 8, 4, 8);
                break;

            case 'armor':
                // Armor shield
                ctx.fillStyle = '#4444ff';
                ctx.beginPath();
                ctx.moveTo(cx, y + 2);
                ctx.lineTo(x + 20, y + 6);
                ctx.lineTo(x + 20, y + 14);
                ctx.lineTo(cx, y + 22);
                ctx.lineTo(x + 4, y + 14);
                ctx.lineTo(x + 4, y + 6);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#6666ff';
                ctx.fillRect(cx - 2, y + 8, 4, 8);
                break;

            case 'invincibility':
                // Golden star
                ctx.fillStyle = '#ffff00';
                const spikes = 5;
                const outerRadius = 10;
                const innerRadius = 4;
                ctx.beginPath();
                for (let i = 0; i < spikes * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (i * Math.PI / spikes) - Math.PI / 2;
                    const px = cx + Math.cos(angle) * radius;
                    const py = cy + Math.sin(angle) * radius;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                break;

            case 'coin':
                // Spinning coin
                const coinScaleX = Math.abs(Math.cos(this.animationTime * 4));
                ctx.fillStyle = '#ffaa00';
                ctx.beginPath();
                ctx.ellipse(cx, cy, 8 * coinScaleX, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffdd00';
                ctx.beginPath();
                ctx.ellipse(cx, cy, 6 * coinScaleX, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                if (coinScaleX > 0.3) {
                    ctx.fillStyle = '#ffaa00';
                    ctx.font = 'bold 10px Impact';
                    ctx.textAlign = 'center';
                    ctx.fillText('C', cx, cy + 4);
                }
                break;

            case 'shotgun':
            case 'machinegun':
            case 'plasma':
            case 'rocket':
            case 'laser':
                // Weapon pickup
                const color = WEAPONS[this.type]?.color || '#ffffff';
                ctx.fillStyle = color;
                ctx.fillRect(x + 2, cy - 3, 20, 6);
                ctx.fillStyle = '#333';
                ctx.fillRect(x + 4, cy - 1, 4, 2);
                break;
        }
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    collect(player, soundSystem) {
        if (this.collected) return false;

        switch (this.type) {
            case 'health':
                if (player.health >= player.maxHealth) return false;
                player.health = Math.min(player.maxHealth, player.health + 25);
                break;

            case 'ammo':
                if (player.currentWeapon === 'pistol') return false;
                const weapon = WEAPONS[player.currentWeapon];
                if (player.ammo[player.currentWeapon] >= weapon.maxAmmo) return false;
                player.ammo[player.currentWeapon] = Math.min(weapon.maxAmmo, player.ammo[player.currentWeapon] + 20);
                break;

            case 'armor':
                if (player.armor >= player.maxArmor) return false;
                player.armor = Math.min(player.maxArmor, player.armor + 50);
                break;

            case 'invincibility':
                player.invincibilityPowerup = 10.0; // 10 seconds of invincibility
                break;

            case 'coin':
                if (coinSystem) coinSystem.onCoinPickup(this.x + this.width / 2, this.y);
                this.collected = true;
                return true;

            case 'shotgun':
            case 'machinegun':
            case 'plasma':
            case 'rocket':
            case 'laser':
                player.weapons[this.type] = true;
                player.currentWeapon = this.type;
                player.ammo[this.type] = WEAPONS[this.type].ammo;
                break;
        }

        this.collected = true;
        if (soundSystem) soundSystem.playPickup();
        gameState.score += Math.floor(50 * getDifficulty().scoreMultiplier);
        return true;
    }
}

// FPS Counter element
const fpsCounter = document.getElementById('fps-counter');

// ============================================================================
// LEVEL DATA
// ============================================================================

const LEVELS = [
    // Level 1 - ENTRANCE TO HELL - Tutorial level with safe learning
    {
        name: "ENTRANCE TO HELL",
        playerStart: { x: 2, y: 11 },
        width: 50,
        height: 15,
        enemies: [
            { type: 'patrol', x: 10, y: 11 },
            { type: 'patrol', x: 22, y: 9 },
            { type: 'patrol', x: 35, y: 7 },
            { type: 'patrol', x: 45, y: 5 }
        ],
        pickups: [
            { type: 'health', x: 8, y: 11 },
            { type: 'shotgun', x: 18, y: 9 },
            { type: 'ammo', x: 28, y: 7 },
            { type: 'health', x: 38, y: 5 },
            { type: 'coin', x: 6, y: 11 },
            { type: 'coin', x: 14, y: 10 },
            { type: 'coin', x: 25, y: 8 },
            { type: 'coin', x: 32, y: 7 },
            { type: 'coin', x: 42, y: 5 }
        ],
        checkpoints: [
            { x: 15, y: 9 },
            { x: 30, y: 7 }
        ],
        data: [
            "11111111111111111111111111111111111111111111111111",
            "10000000000000000000000000000000000000000000000001",
            "10000000000000000000000000000000000000000000000001",
            "10000000000000000000000000000000000000000000000001",
            "10000000000000000000000000000000000000000000000051",
            "10000000000000000000000000000000000000000000011111",
            "10000000000000000000000000000000000000000011100001",
            "10000000000000000000000000000000000000011100000001",
            "10000000000000000000000000000000000011000000000001",
            "10000000000000000000000000000000110000000000000001",
            "10000000000000000000000001110000000000000000000001",
            "10000000000000000001111000000000000000000000000001",
            "10000000000001111000000000000000000000000000000001",
            "11111111111111111111111111111111111111111111111111",
            "11111111111111111111111111111111111111111111111111"
        ]
    },
    // Level 2 - THE BLOOD PITS - Multi-path with verticality
    {
        name: "THE BLOOD PITS",
        playerStart: { x: 2, y: 11 },
        width: 60,
        height: 15,
        enemies: [
            { type: 'patrol', x: 12, y: 11 },
            { type: 'shooter', x: 20, y: 7 },
            { type: 'patrol', x: 28, y: 9 },
            { type: 'flying', x: 35, y: 5 },
            { type: 'shooter', x: 42, y: 3 },
            { type: 'patrol', x: 50, y: 8 },
            { type: 'flying', x: 55, y: 6 }
        ],
        pickups: [
            { type: 'health', x: 10, y: 11 },
            { type: 'ammo', x: 18, y: 9 },
            { type: 'machinegun', x: 25, y: 7 },
            { type: 'health', x: 33, y: 5 },
            { type: 'armor', x: 40, y: 3 },
            { type: 'ammo', x: 48, y: 8 },
            { type: 'health', x: 55, y: 3 },
            { type: 'coin', x: 8, y: 11 },
            { type: 'coin', x: 16, y: 9 },
            { type: 'coin', x: 24, y: 7 },
            { type: 'coin', x: 32, y: 5 },
            { type: 'coin', x: 44, y: 6 },
            { type: 'coin', x: 52, y: 8 }
        ],
        checkpoints: [
            { x: 15, y: 9 },
            { x: 30, y: 5 },
            { x: 47, y: 8 }
        ],
        data: [
            "111111111111111111111111111111111111111111111111111111111111",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000000000000000000000000000000000000000000000000000051",
            "100000000000000000000000000000000000000000000000000000011111",
            "100000000000000000000000000000000000000000000000000011100001",
            "100000000000000000000000000000000000000000000000011100000001",
            "100000000000000000000000000000000000000000000111000000000001",
            "100000000000000000000000000000000000000011110000000000000001",
            "100000000000000000000000000000000111100000000000000000000001",
            "100000000000000000000000001111000000000000000000000000000001",
            "100000000000000011111000000000000000000000000000000000000001",
            "100000000011111000000000000000000000000000000000000000000001",
            "111111133311111133311111133311111133311111133311111133311111",
            "111111111111111111111111111111111111111111111111111111111111"
        ]
    },
    // Level 3 - DEMON'S LAIR - Complex multi-tier platforming
    {
        name: "DEMON'S LAIR",
        playerStart: { x: 2, y: 11 },
        width: 70,
        height: 15,
        enemies: [
            { type: 'patrol', x: 10, y: 11 },
            { type: 'flying', x: 18, y: 8 },
            { type: 'shooter', x: 25, y: 6 },
            { type: 'patrol', x: 32, y: 9 },
            { type: 'flying', x: 40, y: 5 },
            { type: 'shooter', x: 48, y: 3 },
            { type: 'patrol', x: 55, y: 7 },
            { type: 'flying', x: 62, y: 4 },
            { type: 'shooter', x: 67, y: 2 }
        ],
        pickups: [
            { type: 'health', x: 8, y: 11 },
            { type: 'ammo', x: 15, y: 9 },
            { type: 'armor', x: 22, y: 6 },
            { type: 'plasma', x: 30, y: 9 },
            { type: 'health', x: 38, y: 5 },
            { type: 'ammo', x: 46, y: 3 },
            { type: 'rocket', x: 53, y: 7 },
            { type: 'health', x: 60, y: 4 },
            { type: 'invincibility', x: 35, y: 2 },
            { type: 'coin', x: 7, y: 11 },
            { type: 'coin', x: 14, y: 9 },
            { type: 'coin', x: 21, y: 6 },
            { type: 'coin', x: 29, y: 9 },
            { type: 'coin', x: 37, y: 5 },
            { type: 'coin', x: 45, y: 3 },
            { type: 'coin', x: 52, y: 7 },
            { type: 'coin', x: 59, y: 4 },
            { type: 'coin', x: 66, y: 2 }
        ],
        checkpoints: [
            { x: 12, y: 11 },
            { x: 27, y: 6 },
            { x: 42, y: 5 },
            { x: 58, y: 7 }
        ],
        data: [
            "1111111111111111111111111111111111111111111111111111111111111111111111",
            "1000000000000000000000000000000000000000000000000000000000000000000001",
            "1000000000000000000000000000000000000000000000000000000000000000000051",
            "1000000000000000000000000000000000000000000000000000000000000000011111",
            "1000000000000000000000000000000000000000000000000000000000000011100001",
            "1000000000000000000000000000000000000000000000000000000000011100000001",
            "1000000000000000000000000000000000000000000000000000000011000000000001",
            "1000000000000000000000000000000000000000000000000011000000000000000001",
            "1000000000000000000000000000000000000000000000111000000000000000000001",
            "1000000000000000000000000000000000000000011100000000000000000000000001",
            "1000000000000000000000000000000000001110000000000000000000000000000001",
            "1000000000000000000000000000001111000000000000000000000000000000000001",
            "1000000000000000000001111100000000000000000000000000000000000000000001",
            "1111111133311111133311111133311111133311111133311111133311111133311111",
            "1111111111111111111111111111111111111111111111111111111111111111111111"
        ]
    },
    // Level 4 - THE CYBERDEMON'S THRONE - Boss arena with escape routes
    {
        name: "THE CYBERDEMON'S THRONE",
        playerStart: { x: 3, y: 11 },
        width: 60,
        height: 15,
        enemies: [
            { type: 'boss', x: 45, y: 6 }
        ],
        pickups: [
            { type: 'health', x: 5, y: 11 },
            { type: 'armor', x: 8, y: 11 },
            { type: 'health', x: 12, y: 9 },
            { type: 'ammo', x: 16, y: 9 },
            { type: 'rocket', x: 20, y: 7 },
            { type: 'plasma', x: 24, y: 7 },
            { type: 'health', x: 28, y: 5 },
            { type: 'armor', x: 32, y: 5 },
            { type: 'invincibility', x: 30, y: 2 },
            { type: 'ammo', x: 40, y: 7 },
            { type: 'health', x: 48, y: 9 },
            { type: 'armor', x: 52, y: 9 },
            { type: 'health', x: 55, y: 11 },
            { type: 'coin', x: 10, y: 11 },
            { type: 'coin', x: 15, y: 9 },
            { type: 'coin', x: 22, y: 7 },
            { type: 'coin', x: 30, y: 5 },
            { type: 'coin', x: 38, y: 7 },
            { type: 'coin', x: 45, y: 9 },
            { type: 'coin', x: 50, y: 9 }
        ],
        checkpoints: [
            { x: 10, y: 11 },
            { x: 25, y: 7 },
            { x: 50, y: 9 }
        ],
        data: [
            "111111111111111111111111111111111111111111111111111111111111",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000002220000000000022200000000000002220000000000022200001",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000000000022200000000000000000000000002220000000000001",
            "100000000000220000000000000000000000000000000000220000000001",
            "100000002200000000000000000000000000000000000000002200000001",
            "100000000000000000000000000000000000000000000000000000000001",
            "111111111111111111111111111111111111111111111111111111111111",
            "111111111111111111111111111111111111111111111111111111111111"
        ]
    }
];

// ============================================================================
// INPUT HANDLER CLASS
// ============================================================================

class InputHandler {
    constructor() {
        this.keys = {
            left: false,
            right: false,
            jump: false,
            shoot: false
        };
        this.jumpPressed = false;
        this.shootPressed = false;
        this.pausePressed = false;
        this.weaponSwitch = 0;
        this.enterPressed = false;

        // Shop input state
        this.shopLeft = false;
        this.shopRight = false;
        this.shopUp = false;
        this.shopDown = false;
        this.shopConfirm = false;
        this.shopBack = false;
        this.shopSort = false;
        this.shopTry = false;
        this.shopOpen = false;

        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(e) {
        // Handle shop input when shop is open
        if (gameState.showShop) {
            switch (e.code) {
                case 'ArrowLeft': case 'KeyA': this.shopLeft = true; break;
                case 'ArrowRight': case 'KeyD': this.shopRight = true; break;
                case 'ArrowUp': case 'KeyW': this.shopUp = true; break;
                case 'ArrowDown': case 'KeyS': this.shopDown = true; break;
                case 'Enter': case 'Space': this.shopConfirm = true; break;
                case 'Escape': this.shopBack = true; break;
                case 'Tab': this.shopSort = true; e.preventDefault(); break;
                case 'KeyT': this.shopTry = true; break;
            }
            e.preventDefault();
            return;
        }

        // Handle menu/start states
        if (gameState.showMenu) {
            if (e.code === 'Enter' || e.code === 'Space') {
                this.enterPressed = true;
                e.preventDefault();
            }
            // Difficulty selection
            if (e.code === 'Digit1') gameState.difficulty = 'easy';
            if (e.code === 'Digit2') gameState.difficulty = 'normal';
            if (e.code === 'Digit3') gameState.difficulty = 'hard';
            // Open shop from menu
            if (e.code === 'KeyB') this.shopOpen = true;
            return;
        }

        if (gameState.gameOver) {
            if (e.code === 'Enter' || e.code === 'Space') {
                this.enterPressed = true;
                e.preventDefault();
            }
            return;
        }

        if (!gameState.started) {
            gameState.started = true;
            if (soundSystem) {
                soundSystem.init();
                soundSystem.resume();
                soundSystem.startMusic();
            }
        }

        switch (e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = true;
                break;
            case 'ArrowUp':
            case 'KeyW':
            case 'Space':
                if (!this.keys.jump) {
                    this.jumpPressed = true;
                }
                this.keys.jump = true;
                e.preventDefault();
                break;
            case 'KeyJ':
            case 'KeyZ':
            case 'ControlLeft':
            case 'ControlRight':
                if (!this.keys.shoot) {
                    this.shootPressed = true;
                }
                this.keys.shoot = true;
                break;
            case 'Escape':
            case 'KeyP':
                this.pausePressed = true;
                break;
            case 'KeyB':
                if (gameState.paused) this.shopOpen = true;
                break;
            case 'Digit1':
                this.weaponSwitch = 1;
                break;
            case 'Digit2':
                this.weaponSwitch = 2;
                break;
            case 'Digit3':
                this.weaponSwitch = 3;
                break;
            case 'Digit4':
                this.weaponSwitch = 4;
                break;
            case 'KeyQ':
                this.weaponSwitch = -1; // Previous weapon
                break;
            case 'Digit5':
                this.weaponSwitch = 5;
                break;
            case 'Digit6':
                this.weaponSwitch = 6;
                break;
            case 'KeyF':
                // Fullscreen toggle
                if (fullscreenManager) fullscreenManager.toggle();
                break;
            case 'KeyL':
                // Level editor toggle
                if (levelEditor) levelEditor.toggle();
                break;
            case 'F5':
                // Quick save
                if (saveSystem && player && !gameState.showMenu) {
                    saveSystem.save(player, gameState.currentLevel);
                    console.log('Game saved!');
                }
                e.preventDefault();
                break;
            case 'F9':
                // Quick load
                if (saveSystem && player) {
                    const saveData = saveSystem.load();
                    if (saveData) {
                        const levelIndex = saveSystem.applySave(saveData, player);
                        levelManager.loadLevel(levelIndex);
                        gameState.showMenu = false;
                        gameState.started = true;
                        console.log('Game loaded!');
                    }
                }
                e.preventDefault();
                break;
        }

        // Handle level editor keys
        if (levelEditor && levelEditor.active) {
            levelEditor.handleKey(e.key);
        }
    }

    handleKeyUp(e) {
        switch (e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = false;
                break;
            case 'ArrowUp':
            case 'KeyW':
            case 'Space':
                this.keys.jump = false;
                break;
            case 'KeyJ':
            case 'KeyZ':
            case 'ControlLeft':
            case 'ControlRight':
                this.keys.shoot = false;
                break;
        }
    }

    consumeShoot() {
        const pressed = this.shootPressed;
        this.shootPressed = false;
        return pressed;
    }

    consumeJump() {
        const pressed = this.jumpPressed;
        this.jumpPressed = false;
        return pressed;
    }

    consumePause() {
        const pressed = this.pausePressed;
        this.pausePressed = false;
        return pressed;
    }

    consumeWeaponSwitch() {
        const weapon = this.weaponSwitch;
        this.weaponSwitch = 0;
        return weapon;
    }

    consumeEnter() {
        const pressed = this.enterPressed;
        this.enterPressed = false;
        return pressed;
    }
}

// ============================================================================
// CAMERA CLASS
// ============================================================================

class Camera {
    constructor(width, height) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.targetX = 0;
        this.targetY = 0;
        this.smoothing = 5; // Camera lerp speed

        // Level bounds
        this.minX = 0;
        this.minY = 0;
        this.maxX = 0;
        this.maxY = 0;

        // Look-ahead
        this.lookAheadX = 0;
        this.lookAheadY = 0;
        this.lookAheadDistance = 50;
        this.lookAheadSmoothing = 3;

        // Velocity tracking for look-ahead
        this.lastTargetX = 0;
        this.lastTargetY = 0;
    }

    setBounds(levelWidth, levelHeight) {
        this.minX = 0;
        this.minY = 0;
        this.maxX = Math.max(0, levelWidth - this.width);
        this.maxY = Math.max(0, levelHeight - this.height);
    }

    follow(target, dt) {
        // Calculate target velocity for look-ahead
        const targetCenterX = target.x + target.width / 2;
        const targetCenterY = target.y + target.height / 2;

        // Smooth look-ahead based on target movement direction
        const lookAheadTargetX = target.facingRight ? this.lookAheadDistance : -this.lookAheadDistance;
        const lookAheadTargetY = target.velocityY > 100 ? 30 : (target.velocityY < -100 ? -20 : 0);

        this.lookAheadX += (lookAheadTargetX - this.lookAheadX) * this.lookAheadSmoothing * dt;
        this.lookAheadY += (lookAheadTargetY - this.lookAheadY) * this.lookAheadSmoothing * dt;

        // Center camera on target with look-ahead
        this.targetX = targetCenterX - this.width / 2 + this.lookAheadX;
        this.targetY = targetCenterY - this.height / 2 + this.lookAheadY;

        // Smooth camera movement using exponential ease-out
        const smoothFactor = 1 - Math.pow(0.001, dt * this.smoothing);
        this.x += (this.targetX - this.x) * smoothFactor;
        this.y += (this.targetY - this.y) * smoothFactor;

        // Clamp to bounds
        this.x = Math.max(this.minX, Math.min(this.maxX, this.x));
        this.y = Math.max(this.minY, Math.min(this.maxY, this.y));

        this.lastTargetX = targetCenterX;
        this.lastTargetY = targetCenterY;
    }

    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }
}

// ============================================================================
// PARTICLE CLASS
// ============================================================================

class Particle {
    constructor(x, y, vx, vy, color, size, lifetime) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.gravity = 400;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += this.gravity * dt;
        this.lifetime -= dt;
    }

    render(ctx, camera) {
        const alpha = Math.max(0, this.lifetime / this.maxLifetime);
        const screenPos = camera.worldToScreen(this.x, this.y);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(
            screenPos.x - this.size / 2,
            screenPos.y - this.size / 2,
            this.size * alpha,
            this.size * alpha
        );
        ctx.globalAlpha = 1;
    }

    isDead() {
        return this.lifetime <= 0;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, count, options = {}) {
        const {
            color = '#ff6600',
            minSpeed = 50,
            maxSpeed = 200,
            minSize = 2,
            maxSize = 6,
            lifetime = 0.5,
            spread = Math.PI * 2
        } = options;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * spread - spread / 2 - Math.PI / 2;
            const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
            const size = minSize + Math.random() * (maxSize - minSize);

            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                size,
                lifetime + Math.random() * 0.2
            ));
        }
    }

    emitExplosion(x, y, color = '#ff4400') {
        this.emit(x, y, 15, {
            color: color,
            minSpeed: 100,
            maxSpeed: 300,
            minSize: 3,
            maxSize: 8,
            lifetime: 0.6
        });
        // Add some sparks
        this.emit(x, y, 8, {
            color: '#ffff00',
            minSpeed: 150,
            maxSpeed: 350,
            minSize: 2,
            maxSize: 4,
            lifetime: 0.4
        });
    }

    emitBlood(x, y) {
        this.emit(x, y, 10, {
            color: '#8b0000',
            minSpeed: 50,
            maxSpeed: 150,
            minSize: 2,
            maxSize: 5,
            lifetime: 0.5
        });
        this.emit(x, y, 5, {
            color: '#cc0000',
            minSpeed: 30,
            maxSpeed: 100,
            minSize: 3,
            maxSize: 6,
            lifetime: 0.4
        });
    }

    emitHit(x, y) {
        this.emit(x, y, 6, {
            color: '#ffaa00',
            minSpeed: 80,
            maxSpeed: 180,
            minSize: 2,
            maxSize: 4,
            lifetime: 0.3
        });
    }

    emitDust(x, y) {
        // Landing dust particles
        this.emit(x, y, 8, {
            color: '#886644',
            minSpeed: 30,
            maxSpeed: 80,
            minSize: 2,
            maxSize: 5,
            lifetime: 0.4,
            spread: Math.PI
        });
        this.emit(x, y, 4, {
            color: '#664422',
            minSpeed: 20,
            maxSpeed: 60,
            minSize: 3,
            maxSize: 6,
            lifetime: 0.3,
            spread: Math.PI
        });
    }

    emitMuzzleFlash(x, y, direction) {
        // Muzzle flash effect
        const angle = direction > 0 ? 0 : Math.PI;
        for (let i = 0; i < 6; i++) {
            const spread = (Math.random() - 0.5) * 0.5;
            const speed = 150 + Math.random() * 100;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle + spread) * speed,
                Math.sin(angle + spread) * speed - 20,
                '#ffff00',
                2 + Math.random() * 3,
                0.1 + Math.random() * 0.1
            ));
        }
        // Core flash
        this.particles.push(new Particle(
            x, y,
            Math.cos(angle) * 50,
            0,
            '#ffffff',
            8,
            0.05
        ));
    }

    emitWallSpark(x, y) {
        this.emit(x, y, 4, {
            color: '#ffcc00',
            minSpeed: 50,
            maxSpeed: 120,
            minSize: 1,
            maxSize: 3,
            lifetime: 0.2
        });
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx, camera) {
        for (const particle of this.particles) {
            particle.render(ctx, camera);
        }
    }

    clear() {
        this.particles = [];
    }
}

// ============================================================================
// PROJECTILE CLASS
// ============================================================================

class Projectile {
    constructor(x, y, vx, vy, isPlayerProjectile = true, weaponType = 'pistol') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.isPlayerProjectile = isPlayerProjectile;
        this.weaponType = weaponType;
        this.damage = isPlayerProjectile ? 25 : 10;
        this.lifetime = 3.0;
        this.dead = false;
        this.hitCount = 0;

        // Set properties based on weapon type
        const weapon = WEAPONS[weaponType];
        if (weapon) {
            this.piercing = weapon.piercing || false;
            this.explosive = weapon.explosive || false;
            this.explosionRadius = weapon.explosionRadius || 0;
            this.color = weapon.color || '#88ff88';
            this.projectileType = weapon.projectileType || 'bullet';
        } else {
            this.piercing = false;
            this.explosive = false;
            this.explosionRadius = 0;
            this.color = isPlayerProjectile ? '#88ff88' : '#ff8888';
            this.projectileType = 'bullet';
        }

        // Size based on projectile type
        switch (this.projectileType) {
            case 'rocket':
                this.width = 16;
                this.height = 8;
                break;
            case 'plasma':
                this.width = 12;
                this.height = 12;
                break;
            case 'laser':
                this.width = 20;
                this.height = 2;
                break;
            case 'pellet':
                this.width = 4;
                this.height = 4;
                this.lifetime = 0.5;
                break;
            default:
                this.width = 8;
                this.height = 4;
        }
    }

    update(dt, tileMap) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.lifetime -= dt;

        // Rocket has slight gravity
        if (this.projectileType === 'rocket') {
            this.vy += 50 * dt;
        }

        // Check wall collision
        const gridX = Math.floor((this.x + this.width / 2) / TILE_SIZE);
        const gridY = Math.floor((this.y + this.height / 2) / TILE_SIZE);

        if (tileMap.isSolid(gridX, gridY)) {
            this.dead = true;
            if (this.explosive && particleSystem) {
                this.explode();
            }
        }

        if (this.lifetime <= 0) {
            this.dead = true;
        }
    }

    explode() {
        if (!particleSystem) return;

        // Create explosion particles
        particleSystem.emitExplosion(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.color
        );

        // Screen shake
        if (screenShake) {
            screenShake.shake(this.explosionRadius / 10, 0.2);
        }

        // Sound
        if (soundSystem) {
            soundSystem.playTone(60, 0.3, 'sawtooth', 0.4);
            soundSystem.playNoise(0.2, 0.3);
        }

        // Damage nearby enemies
        if (this.isPlayerProjectile) {
            for (const enemy of enemies) {
                if (enemy.isDead) continue;
                const dx = (enemy.x + enemy.width / 2) - (this.x + this.width / 2);
                const dy = (enemy.y + enemy.height / 2) - (this.y + this.height / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.explosionRadius) {
                    const damageFalloff = 1 - (dist / this.explosionRadius);
                    enemy.takeDamage(this.damage * damageFalloff, particleSystem);
                }
            }
        } else {
            // Enemy explosive projectile damages player
            if (player && !player.isDead) {
                const dx = (player.x + player.width / 2) - (this.x + this.width / 2);
                const dy = (player.y + player.height / 2) - (this.y + this.height / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.explosionRadius) {
                    const damageFalloff = 1 - (dist / this.explosionRadius);
                    player.takeDamage(this.damage * damageFalloff, particleSystem);
                }
            }
        }
    }

    onHit() {
        this.hitCount++;
        if (!this.piercing || this.hitCount >= 3) {
            this.dead = true;
            if (this.explosive) {
                this.explode();
            }
        }
    }

    render(ctx, camera) {
        const screenPos = camera.worldToScreen(this.x, this.y);

        ctx.save();

        // Projectile glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;

        switch (this.projectileType) {
            case 'rocket':
                // Rocket body
                ctx.fillStyle = '#444';
                ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height);
                // Rocket tip
                ctx.fillStyle = '#ff4444';
                ctx.beginPath();
                const tipX = this.vx > 0 ? screenPos.x + this.width : screenPos.x;
                ctx.moveTo(tipX, screenPos.y);
                ctx.lineTo(tipX + (this.vx > 0 ? 6 : -6), screenPos.y + this.height / 2);
                ctx.lineTo(tipX, screenPos.y + this.height);
                ctx.fill();
                // Flame trail
                ctx.fillStyle = '#ff6600';
                const flameX = this.vx > 0 ? screenPos.x - 8 : screenPos.x + this.width;
                ctx.fillRect(flameX, screenPos.y + 2, 8, this.height - 4);
                break;

            case 'plasma':
                // Glowing plasma ball
                const gradient = ctx.createRadialGradient(
                    screenPos.x + this.width / 2, screenPos.y + this.height / 2, 0,
                    screenPos.x + this.width / 2, screenPos.y + this.height / 2, this.width / 2
                );
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(0.5, this.color);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(screenPos.x + this.width / 2, screenPos.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'laser':
                // Laser beam
                ctx.fillStyle = this.color;
                ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(screenPos.x, screenPos.y, this.width, 1);
                break;

            case 'pellet':
                // Small pellet
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(screenPos.x + 2, screenPos.y + 2, 2, 0, Math.PI * 2);
                ctx.fill();
                break;

            default:
                // Standard bullet
                ctx.fillStyle = this.color;
                ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(screenPos.x + 2, screenPos.y + 1, this.width - 4, this.height - 2);
        }

        ctx.restore();
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    isDead() {
        return this.dead;
    }
}

// ============================================================================
// TILEMAP CLASS
// ============================================================================

class TileMap {
    constructor(levelData) {
        this.width = levelData.width;
        this.height = levelData.height;
        this.name = levelData.name;
        this.playerStart = levelData.playerStart;
        this.tiles = this.parseLevelData(levelData.data);
        this.pixelWidth = this.width * TILE_SIZE;
        this.pixelHeight = this.height * TILE_SIZE;
    }

    parseLevelData(data) {
        const tiles = [];
        for (let y = 0; y < data.length; y++) {
            tiles[y] = [];
            for (let x = 0; x < data[y].length; x++) {
                tiles[y][x] = parseInt(data[y][x]);
            }
        }
        return tiles;
    }

    getTile(gridX, gridY) {
        if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) {
            return TILES.SOLID; // Out of bounds = solid
        }
        return this.tiles[gridY][gridX];
    }

    getTileAtPixel(pixelX, pixelY) {
        const gridX = Math.floor(pixelX / TILE_SIZE);
        const gridY = Math.floor(pixelY / TILE_SIZE);
        return this.getTile(gridX, gridY);
    }

    isSolid(gridX, gridY) {
        const tile = this.getTile(gridX, gridY);
        return tile === TILES.SOLID;
    }

    isPlatform(gridX, gridY) {
        const tile = this.getTile(gridX, gridY);
        return tile === TILES.PLATFORM;
    }

    isSpike(gridX, gridY) {
        const tile = this.getTile(gridX, gridY);
        return tile === TILES.SPIKES;
    }

    isExit(gridX, gridY) {
        const tile = this.getTile(gridX, gridY);
        return tile === TILES.EXIT;
    }

    render(ctx, camera) {
        // Calculate visible tile range
        const startCol = Math.floor(camera.x / TILE_SIZE);
        const endCol = Math.ceil((camera.x + camera.width) / TILE_SIZE);
        const startRow = Math.floor(camera.y / TILE_SIZE);
        const endRow = Math.ceil((camera.y + camera.height) / TILE_SIZE);

        // Render background first
        this.renderBackground(ctx, camera);

        // Render tiles
        for (let y = startRow; y <= endRow; y++) {
            for (let x = startCol; x <= endCol; x++) {
                if (x < 0 || x >= this.width || y < 0 || y >= this.height) continue;

                const tile = this.tiles[y][x];
                const screenPos = camera.worldToScreen(x * TILE_SIZE, y * TILE_SIZE);

                this.renderTile(ctx, tile, screenPos.x, screenPos.y, x, y);
            }
        }
    }

    renderBackground(ctx, camera) {
        // Dark hellish gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#1a0a0a');
        gradient.addColorStop(0.5, '#0d0505');
        gradient.addColorStop(1, '#0a0000');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Scanlines
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
            ctx.fillRect(0, y, CANVAS_WIDTH, 2);
        }
    }

    renderTile(ctx, tile, screenX, screenY, gridX, gridY) {
        if (tile === TILES.EMPTY) return;

        const x = screenX;
        const y = screenY;
        const size = TILE_SIZE;

        switch (tile) {
            case TILES.SOLID:
                this.renderSolidTile(ctx, x, y, size, gridX, gridY);
                break;
            case TILES.PLATFORM:
                this.renderPlatformTile(ctx, x, y, size);
                break;
            case TILES.SPIKES:
                this.renderSpikeTile(ctx, x, y, size);
                break;
            case TILES.BACKGROUND:
                this.renderBackgroundTile(ctx, x, y, size);
                break;
            case TILES.EXIT:
                this.renderExitTile(ctx, x, y, size);
                break;
        }
    }

    renderSolidTile(ctx, x, y, size, gridX, gridY) {
        // Vary color based on position for visual interest
        const colorVar = ((gridX + gridY) % 3) * 5;

        // Main tile body
        const gradient = ctx.createLinearGradient(x, y, x, y + size);
        gradient.addColorStop(0, `rgb(${50 + colorVar}, ${35 + colorVar}, ${35 + colorVar})`);
        gradient.addColorStop(1, `rgb(${35 + colorVar}, ${25 + colorVar}, ${25 + colorVar})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, size, size);

        // Border/edge highlights
        ctx.strokeStyle = '#4a3030';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);

        // Inner shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x + size - 4, y, 4, size);
        ctx.fillRect(x, y + size - 4, size, 4);

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(x, y, size, 2);
        ctx.fillRect(x, y, 2, size);

        // Random texture details
        if ((gridX * 7 + gridY * 13) % 5 === 0) {
            ctx.fillStyle = 'rgba(139, 0, 0, 0.2)';
            ctx.fillRect(x + 8, y + 8, 4, 4);
        }
    }

    renderPlatformTile(ctx, x, y, size) {
        // Metal grate platform
        const gradient = ctx.createLinearGradient(x, y, x, y + 8);
        gradient.addColorStop(0, '#5a4a4a');
        gradient.addColorStop(1, '#3a2a2a');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, size, 8);

        // Grate lines
        ctx.strokeStyle = '#2a1a1a';
        ctx.lineWidth = 2;
        for (let i = 4; i < size; i += 8) {
            ctx.beginPath();
            ctx.moveTo(x + i, y);
            ctx.lineTo(x + i, y + 8);
            ctx.stroke();
        }

        // Top highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x, y, size, 2);

        // Rivets
        ctx.fillStyle = '#6a5a5a';
        ctx.beginPath();
        ctx.arc(x + 4, y + 4, 2, 0, Math.PI * 2);
        ctx.arc(x + size - 4, y + 4, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    renderSpikeTile(ctx, x, y, size) {
        // Blood red spikes
        const spikeCount = 4;
        const spikeWidth = size / spikeCount;

        for (let i = 0; i < spikeCount; i++) {
            const spikeX = x + i * spikeWidth;

            // Spike gradient
            const gradient = ctx.createLinearGradient(spikeX, y + size, spikeX, y);
            gradient.addColorStop(0, '#4a0000');
            gradient.addColorStop(0.5, '#8b0000');
            gradient.addColorStop(1, '#cc2020');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(spikeX, y + size);
            ctx.lineTo(spikeX + spikeWidth / 2, y + 4);
            ctx.lineTo(spikeX + spikeWidth, y + size);
            ctx.closePath();
            ctx.fill();

            // Spike highlight
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(spikeX + 2, y + size - 2);
            ctx.lineTo(spikeX + spikeWidth / 2, y + 6);
            ctx.stroke();
        }

        // Base
        ctx.fillStyle = '#2a0000';
        ctx.fillRect(x, y + size - 4, size, 4);
    }

    renderBackgroundTile(ctx, x, y, size) {
        // Darker background tile for decoration
        ctx.fillStyle = 'rgba(20, 10, 10, 0.5)';
        ctx.fillRect(x, y, size, size);

        // Subtle brick pattern
        ctx.strokeStyle = 'rgba(40, 20, 20, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
    }

    renderExitTile(ctx, x, y, size) {
        // Glowing portal/exit
        const time = Date.now() / 1000;
        const pulse = Math.sin(time * 3) * 0.3 + 0.7;

        // Outer glow
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 20 * pulse;

        // Portal frame
        ctx.fillStyle = '#1a3a1a';
        ctx.fillRect(x, y, size, size);

        // Inner portal
        const gradient = ctx.createRadialGradient(
            x + size / 2, y + size / 2, 0,
            x + size / 2, y + size / 2, size / 2
        );
        gradient.addColorStop(0, `rgba(0, 255, 0, ${0.8 * pulse})`);
        gradient.addColorStop(0.5, `rgba(0, 200, 0, ${0.5 * pulse})`);
        gradient.addColorStop(1, 'rgba(0, 100, 0, 0.3)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 4, y + 4, size - 8, size - 8);

        ctx.shadowBlur = 0;

        // Arrow indicator
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(x + size / 2, y + 8);
        ctx.lineTo(x + size - 8, y + size / 2);
        ctx.lineTo(x + size / 2, y + size - 8);
        ctx.closePath();
        ctx.fill();
    }
}

// ============================================================================
// PLAYER CLASS
// ============================================================================

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 28;  // Slightly smaller for better tile fitting
        this.height = 56;

        this.velocityX = 0;
        this.velocityY = 0;

        this.speed = 350;
        this.acceleration = 2000;
        this.jumpPower = 520;

        this.isGrounded = false;
        this.wasGrounded = false;
        this.jumpCooldown = 0;
        this.jumpCooldownTime = 0.1;
        this.coyoteTime = 0;
        this.coyoteTimeMax = 0.1;
        this.jumpBufferTime = 0;
        this.jumpBufferMax = 0.1;

        this.state = 'idle';
        this.facingRight = true;
        this.animationTime = 0;
        this.walkCycleSpeed = 8;

        this.landingSquash = 0;
        this.jumpStretch = 0;

        // Death/respawn
        this.isDead = false;
        this.respawnTimer = 0;

        // Health system
        this.health = 100;
        this.maxHealth = 100;
        this.invulnerableTime = 0;
        this.invulnerableDuration = 1.0;

        // Armor system
        this.armor = 0;
        this.maxArmor = 100;

        // Invincibility powerup
        this.invincibilityPowerup = 0;

        // Checkpoint system
        this.checkpointX = 0;
        this.checkpointY = 0;
        this.hasCheckpoint = false;

        // Weapon system
        this.currentWeapon = 'pistol';
        this.weapons = {
            pistol: true,
            shotgun: false,
            machinegun: false,
            plasma: false,
            rocket: false,
            laser: false
        };
        this.ammo = {
            pistol: Infinity,
            shotgun: 0,
            machinegun: 0,
            plasma: 0,
            rocket: 0,
            laser: 0
        };
        this.shootCooldown = 0;

        // Stats tracking for achievements
        this.stats = {
            enemiesKilled: 0,
            damageDealt: 0,
            damageTaken: 0,
            pickupsCollected: 0,
            levelsCompleted: 0,
            deaths: 0,
            shotsFired: 0
        };
    }

    reset(x, y) {
        // Use checkpoint if available
        if (this.hasCheckpoint) {
            this.x = this.checkpointX;
            this.y = this.checkpointY;
        } else {
            this.x = x;
            this.y = y;
        }
        this.velocityX = 0;
        this.velocityY = 0;
        this.isGrounded = false;
        this.isDead = false;
        this.respawnTimer = 0;
        this.state = 'idle';
        this.health = this.maxHealth;
        this.invulnerableTime = 0;
        this.invincibilityPowerup = 0;
        this.shootCooldown = 0;
        // Keep weapons on respawn, just reset to pistol if out of ammo
        if (this.ammo[this.currentWeapon] <= 0 && this.currentWeapon !== 'pistol') {
            this.currentWeapon = 'pistol';
        }
        this.stats.deaths++;
    }

    setCheckpoint(x, y) {
        this.checkpointX = x;
        this.checkpointY = y;
        this.hasCheckpoint = true;
    }

    clearCheckpoint() {
        this.hasCheckpoint = false;
    }

    fullReset() {
        // Complete reset for new game
        this.currentWeapon = 'pistol';
        this.weapons = {
            pistol: true,
            shotgun: false,
            machinegun: false,
            plasma: false,
            rocket: false,
            laser: false
        };
        this.ammo = {
            pistol: Infinity,
            shotgun: 0,
            machinegun: 0,
            plasma: 0,
            rocket: 0,
            laser: 0
        };
        this.armor = 0;
        this.invincibilityPowerup = 0;
        this.hasCheckpoint = false;
        this.stats = {
            enemiesKilled: 0,
            damageDealt: 0,
            damageTaken: 0,
            pickupsCollected: 0,
            levelsCompleted: 0,
            deaths: 0,
            shotsFired: 0
        };
    }

    switchWeapon(weaponNum) {
        const weaponList = ['pistol', 'shotgun', 'machinegun', 'plasma', 'rocket', 'laser'];
        const numWeapons = weaponList.length;

        if (weaponNum === -1) {
            // Previous weapon
            let currentIdx = weaponList.indexOf(this.currentWeapon);
            for (let i = 1; i <= numWeapons; i++) {
                const idx = (currentIdx - i + numWeapons) % numWeapons;
                if (this.weapons[weaponList[idx]] && (this.ammo[weaponList[idx]] > 0 || weaponList[idx] === 'pistol')) {
                    this.currentWeapon = weaponList[idx];
                    return;
                }
            }
        } else if (weaponNum === -2) {
            // Next weapon
            let currentIdx = weaponList.indexOf(this.currentWeapon);
            for (let i = 1; i <= numWeapons; i++) {
                const idx = (currentIdx + i) % numWeapons;
                if (this.weapons[weaponList[idx]] && (this.ammo[weaponList[idx]] > 0 || weaponList[idx] === 'pistol')) {
                    this.currentWeapon = weaponList[idx];
                    return;
                }
            }
        } else if (weaponNum >= 1 && weaponNum <= numWeapons) {
            const weapon = weaponList[weaponNum - 1];
            if (this.weapons[weapon] && (this.ammo[weapon] > 0 || weapon === 'pistol')) {
                this.currentWeapon = weapon;
            }
        }
    }

    update(dt, input, tileMap, projectiles, particleSystem) {
        if (this.isDead) {
            this.respawnTimer -= dt;
            if (this.respawnTimer <= 0) {
                this.reset(
                    tileMap.playerStart.x * TILE_SIZE,
                    tileMap.playerStart.y * TILE_SIZE
                );
            }
            return;
        }

        // Update timers
        if (this.jumpCooldown > 0) this.jumpCooldown -= dt;
        if (this.jumpBufferTime > 0) this.jumpBufferTime -= dt;
        if (this.invulnerableTime > 0) this.invulnerableTime -= dt;
        if (this.shootCooldown > 0) this.shootCooldown -= dt;
        if (this.invincibilityPowerup > 0) this.invincibilityPowerup -= dt;

        this.wasGrounded = this.isGrounded;

        // Decay visual effects
        this.landingSquash *= Math.pow(0.001, dt);
        this.jumpStretch *= Math.pow(0.001, dt);

        // Handle movement
        this.handleMovement(dt, input);
        this.handleJump(dt, input, particleSystem);
        this.handleShooting(input, projectiles, particleSystem);
        this.applyGravity(dt);

        // Apply horizontal velocity with collision
        this.moveX(this.velocityX * dt, tileMap);

        // Apply vertical velocity with collision
        this.moveY(this.velocityY * dt, tileMap);

        // Check for hazards and exit
        this.checkHazards(tileMap);
        this.checkExit(tileMap);

        // Update coyote time
        if (this.wasGrounded && !this.isGrounded) {
            this.coyoteTime = this.coyoteTimeMax;
        }
        if (!this.isGrounded && this.coyoteTime > 0) {
            this.coyoteTime -= dt;
        }

        // Landing detection for squash effect
        if (!this.wasGrounded && this.isGrounded && this.velocityY >= 0) {
            this.landingSquash = Math.min(Math.abs(this.velocityY) / 400, 1);
        }

        this.updateAnimationState(dt);
    }

    handleMovement(dt, input) {
        let targetVelocityX = 0;

        if (input.keys.left) {
            targetVelocityX = -this.speed;
            this.facingRight = false;
        }
        if (input.keys.right) {
            targetVelocityX = this.speed;
            this.facingRight = true;
        }

        if (targetVelocityX !== 0) {
            const direction = targetVelocityX > this.velocityX ? 1 : -1;
            this.velocityX += direction * this.acceleration * dt;

            if (direction > 0 && this.velocityX > targetVelocityX) {
                this.velocityX = targetVelocityX;
            } else if (direction < 0 && this.velocityX < targetVelocityX) {
                this.velocityX = targetVelocityX;
            }
        } else {
            if (this.isGrounded) {
                this.velocityX *= Math.pow(PHYSICS.friction, dt * 60);
            } else {
                this.velocityX *= Math.pow(0.95, dt * 60);
            }

            if (Math.abs(this.velocityX) < 10) {
                this.velocityX = 0;
            }
        }
    }

    handleJump(dt, input, particleSystem) {
        if (input.consumeJump()) {
            this.jumpBufferTime = this.jumpBufferMax;
        }

        const canJump = (this.isGrounded || this.coyoteTime > 0) &&
                        this.jumpCooldown <= 0 &&
                        this.jumpBufferTime > 0;

        if (canJump) {
            this.velocityY = -this.jumpPower;
            this.isGrounded = false;
            this.jumpCooldown = this.jumpCooldownTime;
            this.coyoteTime = 0;
            this.jumpBufferTime = 0;
            this.jumpStretch = 1;

            // Jump sound
            if (soundSystem) {
                soundSystem.playJump();
            }

            // Dust particles
            if (particleSystem) {
                particleSystem.emitDust(this.x + this.width / 2, this.y + this.height);
            }
        }

        if (!input.keys.jump && this.velocityY < -100) {
            this.velocityY *= 0.5;
        }
    }

    applyGravity(dt) {
        this.velocityY += PHYSICS.gravity * dt;

        if (this.velocityY > PHYSICS.maxFallSpeed) {
            this.velocityY = PHYSICS.maxFallSpeed;
        }
    }

    moveX(amount, tileMap) {
        this.x += amount;

        // Check collision on the side we're moving towards
        if (amount > 0) {
            // Moving right
            if (this.collidesWithSolid(tileMap, 1, 0)) {
                // Align to tile grid
                this.x = Math.floor((this.x + this.width) / TILE_SIZE) * TILE_SIZE - this.width;
                this.velocityX = 0;
            }
        } else if (amount < 0) {
            // Moving left
            if (this.collidesWithSolid(tileMap, -1, 0)) {
                this.x = Math.ceil(this.x / TILE_SIZE) * TILE_SIZE;
                this.velocityX = 0;
            }
        }

        // Level boundaries
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = 0;
        }
        if (this.x + this.width > tileMap.pixelWidth) {
            this.x = tileMap.pixelWidth - this.width;
            this.velocityX = 0;
        }
    }

    moveY(amount, tileMap) {
        this.isGrounded = false;
        this.y += amount;

        if (amount > 0) {
            // Moving down - check solid and platform collision
            if (this.collidesWithSolid(tileMap, 0, 1) || this.collidesWithPlatform(tileMap, amount)) {
                this.y = Math.floor((this.y + this.height) / TILE_SIZE) * TILE_SIZE - this.height;
                this.velocityY = 0;
                this.isGrounded = true;
            }
        } else if (amount < 0) {
            // Moving up - only solid collision (can pass through platforms)
            if (this.collidesWithSolid(tileMap, 0, -1)) {
                this.y = Math.ceil(this.y / TILE_SIZE) * TILE_SIZE;
                this.velocityY = 0;
            }
        }

        // Bottom boundary (death pit)
        if (this.y > tileMap.pixelHeight) {
            this.die();
        }
    }

    collidesWithSolid(tileMap, dirX, dirY) {
        // Check corners and edges based on direction
        const left = this.x + 2;
        const right = this.x + this.width - 2;
        const top = this.y + 2;
        const bottom = this.y + this.height - 2;

        // Check multiple points for better collision
        const points = [];

        if (dirX > 0) {
            // Right side
            points.push({ x: right, y: top });
            points.push({ x: right, y: bottom });
            points.push({ x: right, y: (top + bottom) / 2 });
        } else if (dirX < 0) {
            // Left side
            points.push({ x: left, y: top });
            points.push({ x: left, y: bottom });
            points.push({ x: left, y: (top + bottom) / 2 });
        }

        if (dirY > 0) {
            // Bottom side
            points.push({ x: left, y: bottom });
            points.push({ x: right, y: bottom });
            points.push({ x: (left + right) / 2, y: bottom });
        } else if (dirY < 0) {
            // Top side
            points.push({ x: left, y: top });
            points.push({ x: right, y: top });
            points.push({ x: (left + right) / 2, y: top });
        }

        for (const point of points) {
            const gridX = Math.floor(point.x / TILE_SIZE);
            const gridY = Math.floor(point.y / TILE_SIZE);
            if (tileMap.isSolid(gridX, gridY)) {
                return true;
            }
        }

        return false;
    }

    collidesWithPlatform(tileMap, fallAmount) {
        // Only collide with platforms when falling and feet are near platform top
        if (this.velocityY <= 0) return false;

        const left = this.x + 4;
        const right = this.x + this.width - 4;
        const bottom = this.y + this.height;
        const prevBottom = bottom - fallAmount;

        // Check points along bottom edge
        const checkPoints = [left, (left + right) / 2, right];

        for (const px of checkPoints) {
            const gridX = Math.floor(px / TILE_SIZE);
            const gridY = Math.floor(bottom / TILE_SIZE);
            const prevGridY = Math.floor(prevBottom / TILE_SIZE);

            if (tileMap.isPlatform(gridX, gridY)) {
                // Only collide if we crossed the platform's top edge
                const platformTop = gridY * TILE_SIZE;
                if (prevBottom <= platformTop && bottom >= platformTop) {
                    return true;
                }
            }
        }

        return false;
    }

    checkHazards(tileMap) {
        // Check if player center is on spikes
        const centerX = this.x + this.width / 2;
        const bottom = this.y + this.height - 4;

        const gridX = Math.floor(centerX / TILE_SIZE);
        const gridY = Math.floor(bottom / TILE_SIZE);

        if (tileMap.isSpike(gridX, gridY)) {
            this.die();
        }
    }

    checkExit(tileMap) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        const gridX = Math.floor(centerX / TILE_SIZE);
        const gridY = Math.floor(centerY / TILE_SIZE);

        if (tileMap.isExit(gridX, gridY)) {
            levelManager.nextLevel();
        }
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        this.respawnTimer = 1.0; // Respawn delay
        this.velocityX = 0;
        this.velocityY = 0;

        // Death sound and screen shake
        if (soundSystem) {
            soundSystem.playPlayerDeath();
        }
        if (screenShake) {
            screenShake.shake(10, 0.3);
        }

        // Trigger game over check
        gameState.gameOver = true;
    }

    handleShooting(input, projectiles, particleSystem) {
        // Handle weapon switching
        const weaponSwitch = input.consumeWeaponSwitch();
        if (weaponSwitch !== 0) {
            this.switchWeapon(weaponSwitch);
        }

        const weapon = WEAPONS[this.currentWeapon];

        // Auto-switch to pistol if out of ammo
        if (this.ammo[this.currentWeapon] <= 0 && this.currentWeapon !== 'pistol') {
            this.currentWeapon = 'pistol';
        }

        if (input.consumeShoot() && this.shootCooldown <= 0) {
            if (this.ammo[this.currentWeapon] > 0 || this.currentWeapon === 'pistol') {
                this.shoot(projectiles, particleSystem);
                this.shootCooldown = weapon.fireRate;
                if (this.currentWeapon !== 'pistol') {
                    this.ammo[this.currentWeapon]--;
                }
            }
        }
    }

    shoot(projectiles, particleSystem) {
        const weapon = WEAPONS[this.currentWeapon];
        const startX = this.x + (this.facingRight ? this.width : 0);
        const startY = this.y + this.height / 2 - 4;
        const direction = this.facingRight ? 1 : -1;

        // Muzzle flash
        if (particleSystem) {
            particleSystem.emitMuzzleFlash(startX, startY, direction);
        }

        // Sound based on weapon type
        if (soundSystem) {
            switch (this.currentWeapon) {
                case 'rocket':
                    soundSystem.playTone(80, 0.2, 'sawtooth', 0.3);
                    break;
                case 'laser':
                    soundSystem.playTone(800, 0.1, 'sine', 0.2);
                    soundSystem.playTone(1200, 0.1, 'sine', 0.1);
                    break;
                case 'plasma':
                    soundSystem.playTone(200, 0.15, 'square', 0.25);
                    break;
                default:
                    soundSystem.playShoot();
            }
        }

        // Screen shake for powerful weapons
        if (screenShake) {
            if (this.currentWeapon === 'rocket') {
                screenShake.shake(6, 0.15);
            } else if (this.currentWeapon === 'shotgun' || this.currentWeapon === 'plasma') {
                screenShake.shake(3, 0.1);
            }
        }

        // Fire projectiles
        for (let i = 0; i < weapon.projectileCount; i++) {
            const spread = (Math.random() - 0.5) * weapon.spread;
            const angle = spread;
            const vx = Math.cos(angle) * weapon.projectileSpeed * direction;
            const vy = Math.sin(angle) * weapon.projectileSpeed;

            const projectile = new Projectile(startX, startY, vx, vy, true, this.currentWeapon);
            projectile.damage = weapon.damage;
            projectiles.push(projectile);
        }

        this.stats.shotsFired++;
    }

    takeDamage(amount, particleSystem) {
        if (this.isDead || this.invulnerableTime > 0) return;

        // Invincibility powerup makes player immune
        if (this.invincibilityPowerup > 0) {
            // Still show visual feedback but no damage
            if (particleSystem) {
                particleSystem.emit(this.x + this.width / 2, this.y + this.height / 2, 5, {
                    color: '#ffff00',
                    minSpeed: 50,
                    maxSpeed: 100,
                    lifetime: 0.3
                });
            }
            return;
        }

        // Apply difficulty modifier
        amount *= getDifficulty().playerDamageMultiplier;

        // Armor absorbs damage first (50% to armor, 50% to health)
        if (this.armor > 0) {
            const armorDamage = Math.min(this.armor, amount * 0.5);
            this.armor -= armorDamage;
            amount -= armorDamage;
        }

        this.health -= amount;
        this.stats.damageTaken += amount;
        this.invulnerableTime = this.invulnerableDuration;

        // Track damage for perfect level bonus
        if (coinSystem) coinSystem.onDamageTaken(amount);

        if (particleSystem) {
            particleSystem.emitBlood(
                this.x + this.width / 2,
                this.y + this.height / 2
            );
        }

        // Sound and screen shake
        if (soundSystem) {
            soundSystem.playHit();
        }
        if (screenShake) {
            screenShake.shake(5, 0.15);
        }

        if (this.health <= 0) {
            this.die();
        }
    }

    updateAnimationState(dt) {
        this.animationTime += dt;

        if (this.isDead) {
            this.state = 'dead';
        } else if (!this.isGrounded) {
            if (this.velocityY < 0) {
                this.state = 'jumping';
            } else {
                this.state = 'falling';
            }
        } else if (Math.abs(this.velocityX) > 20) {
            this.state = 'walking';
        } else {
            this.state = 'idle';
        }
    }

    render(ctx, camera) {
        if (this.isDead) {
            // Death effect
            const alpha = this.respawnTimer;
            ctx.globalAlpha = alpha;
        } else if (this.invincibilityPowerup > 0) {
            // Invincibility powerup - golden glow effect
            ctx.globalAlpha = 1;
            const screenPos = camera.worldToScreen(this.x, this.y);
            ctx.save();
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 20 + Math.sin(Date.now() / 100) * 10;
            ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.fillRect(screenPos.x - 5, screenPos.y - 5, this.width + 10, this.height + 10);
            ctx.restore();
        } else if (this.invulnerableTime > 0) {
            // Invulnerability flashing
            ctx.globalAlpha = Math.sin(this.invulnerableTime * 20) > 0 ? 1 : 0.3;
        }

        const screenPos = camera.worldToScreen(this.x, this.y);

        ctx.save();

        // Calculate squash and stretch
        let scaleX = 1;
        let scaleY = 1;

        if (this.landingSquash > 0.1) {
            scaleX = 1 + this.landingSquash * 0.3;
            scaleY = 1 - this.landingSquash * 0.2;
        } else if (this.jumpStretch > 0.1) {
            scaleX = 1 - this.jumpStretch * 0.15;
            scaleY = 1 + this.jumpStretch * 0.2;
        }

        const centerX = screenPos.x + this.width / 2;
        const bottomY = screenPos.y + this.height;

        ctx.translate(centerX, bottomY);
        ctx.scale(this.facingRight ? scaleX : -scaleX, scaleY);
        ctx.translate(-this.width / 2, -this.height);

        this.drawDoomMarine(ctx);

        ctx.restore();
        ctx.globalAlpha = 1;
    }

    drawDoomMarine(ctx) {
        const skin = skinManager ? skinManager.getEquippedSkin() : SKIN_DEFINITIONS[0];
        const c = skin.colors;
        const w = this.width;
        const h = this.height;

        let bobOffset = 0;
        let armOffset = 0;
        if (this.state === 'walking') {
            bobOffset = Math.sin(this.animationTime * this.walkCycleSpeed * Math.PI * 2) * 2;
            armOffset = Math.sin(this.animationTime * this.walkCycleSpeed * Math.PI * 2) * 4;
        }

        // Legs
        ctx.fillStyle = c.legs;
        ctx.fillRect(3, h - 18 + bobOffset, 9, 18 - bobOffset);
        ctx.fillRect(w - 12, h - 18 - bobOffset, 9, 18 + bobOffset);

        // Body
        const bodyGradient = ctx.createLinearGradient(0, 0, w, 0);
        bodyGradient.addColorStop(0, c.bodyDark);
        bodyGradient.addColorStop(0.5, c.bodyMid);
        bodyGradient.addColorStop(1, c.bodyDark);
        ctx.fillStyle = bodyGradient;
        ctx.fillRect(2, 14, w - 4, h - 32);

        // Chest armor
        ctx.fillStyle = c.chest;
        ctx.fillRect(5, 18, w - 10, 16);

        // Armor highlight
        ctx.fillStyle = c.armorHighlight;
        ctx.fillRect(7, 20, w - 14, 3);

        // Belt
        ctx.fillStyle = c.belt;
        ctx.fillRect(3, h - 22, w - 6, 5);

        // Arms
        ctx.fillStyle = c.arms;
        ctx.fillRect(-1, 16 - armOffset, 6, 20);
        ctx.fillRect(w - 5, 16 + armOffset, 6, 20);

        // Helmet
        ctx.fillStyle = c.helmet;
        ctx.fillRect(3, 0, w - 6, 16);

        // Visor
        ctx.shadowColor = c.visorGlow;
        ctx.shadowBlur = this.state === 'idle' ? 10 : 15;
        ctx.fillStyle = this.getVisorColor();
        ctx.fillRect(6, 4, w - 12, 7);
        ctx.shadowBlur = 0;

        // Visor reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(7, 5, 5, 2);

        // Special skin effects
        if (skin.special === 'neon') {
            ctx.strokeStyle = c.visorGlow;
            ctx.lineWidth = 1;
            ctx.shadowColor = c.visorGlow;
            ctx.shadowBlur = 8;
            ctx.strokeRect(2, 14, w - 4, h - 32);
            ctx.strokeRect(3, 0, w - 6, 16);
            ctx.shadowBlur = 0;
        }
        if (skin.special === 'shimmer') {
            const shimmer = Math.sin(this.animationTime * 4) * 0.15 + 0.15;
            ctx.fillStyle = `rgba(255, 255, 200, ${shimmer})`;
            ctx.fillRect(2, 14, w - 4, h - 32);
        }
        if (skin.special === 'led') {
            const ledBright = Math.sin(this.animationTime * 6) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(0, 255, 255, ${ledBright * 0.4})`;
            ctx.fillRect(5, 34, w - 10, 2);
            ctx.fillRect(5, 24, 2, 10);
            ctx.fillRect(w - 7, 24, 2, 10);
        }
        if (skin.special === 'retro') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            for (let py = 0; py < h; py += 4) {
                ctx.fillRect(0, py, w, 1);
            }
        }

        // Jet effect when jumping
        if (this.state === 'jumping' && this.velocityY < -200) {
            ctx.fillStyle = c.jetColor;
            ctx.beginPath();
            ctx.moveTo(8, h);
            ctx.lineTo(11, h + 8);
            ctx.lineTo(4, h);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(w - 8, h);
            ctx.lineTo(w - 11, h + 8);
            ctx.lineTo(w - 4, h);
            ctx.fill();
        }
    }

    getVisorColor() {
        const skin = skinManager ? skinManager.getEquippedSkin() : SKIN_DEFINITIONS[0];
        const c = skin.colors;
        if (this.isDead) return '#ff0000';
        switch (this.state) {
            case 'jumping': return c.visorJump;
            case 'falling': return c.visorFall;
            case 'walking': return c.visorWalk;
            default:
                return c.visorDefault;
        }
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

// ============================================================================
// ENEMY BASE CLASS
// ============================================================================

class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 28;
        this.height = 40;

        this.velocityX = 0;
        this.velocityY = 0;

        this.health = 50;
        this.maxHealth = 50;
        this.damage = 10;
        this.isDead = false;
        this.deathTimer = 0;
        this.deathDuration = 0.5;

        // AI states
        this.state = 'patrol'; // patrol, chase, attack
        this.detectionRange = 200;
        this.attackRange = 150;
        this.attackCooldown = 0;
        this.attackCooldownMax = 1.5;

        this.facingRight = true;
        this.animationTime = 0;

        // Damage flash
        this.damageFlash = 0;

        // Spawn position for respawning
        this.spawnX = x;
        this.spawnY = y;
    }

    update(dt, tileMap, player, projectiles) {
        if (this.isDead) {
            this.deathTimer -= dt;
            return;
        }

        this.animationTime += dt;
        if (this.damageFlash > 0) this.damageFlash -= dt;
        if (this.attackCooldown > 0) this.attackCooldown -= dt;

        // AI behavior
        this.updateAI(dt, player, projectiles);

        // Apply physics
        this.applyGravity(dt);
        this.moveX(this.velocityX * dt, tileMap);
        this.moveY(this.velocityY * dt, tileMap);
    }

    updateAI(dt, player, projectiles) {
        // Override in subclasses
    }

    getDistanceToPlayer(player) {
        const dx = (player.x + player.width / 2) - (this.x + this.width / 2);
        const dy = (player.y + player.height / 2) - (this.y + this.height / 2);
        return Math.sqrt(dx * dx + dy * dy);
    }

    canSeePlayer(player) {
        return this.getDistanceToPlayer(player) < this.detectionRange;
    }

    facePlayer(player) {
        this.facingRight = player.x > this.x;
    }

    applyGravity(dt) {
        this.velocityY += PHYSICS.gravity * dt;
        if (this.velocityY > PHYSICS.maxFallSpeed) {
            this.velocityY = PHYSICS.maxFallSpeed;
        }
    }

    moveX(amount, tileMap) {
        this.x += amount;

        if (amount > 0) {
            if (this.collidesWithSolid(tileMap, 1, 0)) {
                this.x = Math.floor((this.x + this.width) / TILE_SIZE) * TILE_SIZE - this.width;
                this.velocityX = 0;
                return true; // Hit wall
            }
        } else if (amount < 0) {
            if (this.collidesWithSolid(tileMap, -1, 0)) {
                this.x = Math.ceil(this.x / TILE_SIZE) * TILE_SIZE;
                this.velocityX = 0;
                return true; // Hit wall
            }
        }
        return false;
    }

    moveY(amount, tileMap) {
        this.y += amount;

        if (amount > 0) {
            if (this.collidesWithSolid(tileMap, 0, 1)) {
                this.y = Math.floor((this.y + this.height) / TILE_SIZE) * TILE_SIZE - this.height;
                this.velocityY = 0;
                return true;
            }
        } else if (amount < 0) {
            if (this.collidesWithSolid(tileMap, 0, -1)) {
                this.y = Math.ceil(this.y / TILE_SIZE) * TILE_SIZE;
                this.velocityY = 0;
                return true;
            }
        }
        return false;
    }

    collidesWithSolid(tileMap, dirX, dirY) {
        const left = this.x + 2;
        const right = this.x + this.width - 2;
        const top = this.y + 2;
        const bottom = this.y + this.height - 2;

        const points = [];

        if (dirX > 0) {
            points.push({ x: right, y: top });
            points.push({ x: right, y: bottom });
            points.push({ x: right, y: (top + bottom) / 2 });
        } else if (dirX < 0) {
            points.push({ x: left, y: top });
            points.push({ x: left, y: bottom });
            points.push({ x: left, y: (top + bottom) / 2 });
        }

        if (dirY > 0) {
            points.push({ x: left, y: bottom });
            points.push({ x: right, y: bottom });
            points.push({ x: (left + right) / 2, y: bottom });
        } else if (dirY < 0) {
            points.push({ x: left, y: top });
            points.push({ x: right, y: top });
            points.push({ x: (left + right) / 2, y: top });
        }

        for (const point of points) {
            const gridX = Math.floor(point.x / TILE_SIZE);
            const gridY = Math.floor(point.y / TILE_SIZE);
            if (tileMap.isSolid(gridX, gridY)) {
                return true;
            }
        }

        return false;
    }

    takeDamage(amount, particleSystem) {
        if (this.isDead) return;

        this.health -= amount;
        this.damageFlash = 0.1;

        if (particleSystem) {
            particleSystem.emitBlood(
                this.x + this.width / 2,
                this.y + this.height / 2
            );
        }

        if (this.health <= 0) {
            this.die(particleSystem);
        }
    }

    die(particleSystem) {
        this.isDead = true;
        this.deathTimer = this.deathDuration;
        if (particleSystem) {
            particleSystem.emitExplosion(
                this.x + this.width / 2,
                this.y + this.height / 2,
                '#8b0000'
            );
        }
    }

    render(ctx, camera) {
        if (this.isDead && this.deathTimer <= 0) return;

        const screenPos = camera.worldToScreen(this.x, this.y);

        ctx.save();

        // Death fade
        if (this.isDead) {
            ctx.globalAlpha = this.deathTimer / this.deathDuration;
        }

        // Damage flash
        if (this.damageFlash > 0) {
            ctx.filter = 'brightness(2)';
        }

        const centerX = screenPos.x + this.width / 2;
        const bottomY = screenPos.y + this.height;

        ctx.translate(centerX, bottomY);
        ctx.scale(this.facingRight ? 1 : -1, 1);
        ctx.translate(-this.width / 2, -this.height);

        this.drawEnemy(ctx);

        ctx.restore();

        // Health bar
        if (!this.isDead && this.health < this.maxHealth) {
            this.drawHealthBar(ctx, screenPos);
        }
    }

    drawEnemy(ctx) {
        // Override in subclasses
    }

    drawHealthBar(ctx, screenPos) {
        const barWidth = this.width;
        const barHeight = 4;
        const x = screenPos.x;
        const y = screenPos.y - 8;

        // Background
        ctx.fillStyle = '#330000';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Health
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00aa00' : healthPercent > 0.25 ? '#aaaa00' : '#aa0000';
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);

        // Border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    isFullyDead() {
        return this.isDead && this.deathTimer <= 0;
    }

    checkEdge(tileMap, direction) {
        // Check if there's ground ahead
        const checkX = direction > 0 ? this.x + this.width + 4 : this.x - 4;
        const checkY = this.y + this.height + 4;
        const gridX = Math.floor(checkX / TILE_SIZE);
        const gridY = Math.floor(checkY / TILE_SIZE);
        return !tileMap.isSolid(gridX, gridY);
    }
}

// ============================================================================
// GROUND PATROL ENEMY - Walks back and forth, chases player
// ============================================================================

class GroundPatrolEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, 'patrol');
        this.health = 50;
        this.maxHealth = 50;
        this.speed = 80;
        this.chaseSpeed = 150;
        this.patrolDirection = 1;
        this.patrolTimer = 0;
        this.patrolDuration = 2.0;
        this.detectionRange = 180;
    }

    updateAI(dt, player, projectiles) {
        if (player.isDead) {
            this.state = 'patrol';
        }

        const distToPlayer = this.getDistanceToPlayer(player);

        // State transitions
        if (distToPlayer < this.detectionRange && !player.isDead) {
            this.state = 'chase';
        } else {
            this.state = 'patrol';
        }

        // Execute state behavior
        switch (this.state) {
            case 'patrol':
                this.patrol(dt);
                break;
            case 'chase':
                this.chase(dt, player);
                break;
        }
    }

    patrol(dt) {
        this.patrolTimer += dt;

        if (this.patrolTimer >= this.patrolDuration) {
            this.patrolTimer = 0;
            this.patrolDirection *= -1;
        }

        this.velocityX = this.speed * this.patrolDirection;
        this.facingRight = this.patrolDirection > 0;
    }

    chase(dt, player) {
        this.facePlayer(player);
        const direction = player.x > this.x ? 1 : -1;
        this.velocityX = this.chaseSpeed * direction;
    }

    drawEnemy(ctx) {
        const w = this.width;
        const h = this.height;

        // Legs (animated)
        const walkOffset = Math.sin(this.animationTime * 8) * 3;
        ctx.fillStyle = '#3a1a1a';
        ctx.fillRect(4, h - 12 + walkOffset, 8, 12 - walkOffset);
        ctx.fillRect(w - 12, h - 12 - walkOffset, 8, 12 + walkOffset);

        // Body
        const bodyGradient = ctx.createLinearGradient(0, 0, w, 0);
        bodyGradient.addColorStop(0, '#5a2a2a');
        bodyGradient.addColorStop(0.5, '#7a3a3a');
        bodyGradient.addColorStop(1, '#5a2a2a');
        ctx.fillStyle = bodyGradient;
        ctx.fillRect(2, 10, w - 4, h - 22);

        // Armor plates
        ctx.fillStyle = '#4a2020';
        ctx.fillRect(4, 14, w - 8, 8);

        // Arms
        ctx.fillStyle = '#5a2a2a';
        ctx.fillRect(-2, 12 - walkOffset, 6, 14);
        ctx.fillRect(w - 4, 12 + walkOffset, 6, 14);

        // Head
        ctx.fillStyle = '#4a2020';
        ctx.fillRect(4, 0, w - 8, 12);

        // Eyes (red glow)
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(7, 3, 4, 4);
        ctx.fillRect(w - 11, 3, 4, 4);
        ctx.shadowBlur = 0;

        // Horns
        ctx.fillStyle = '#3a1a1a';
        ctx.beginPath();
        ctx.moveTo(2, 4);
        ctx.lineTo(6, 0);
        ctx.lineTo(8, 4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w - 8, 4);
        ctx.lineTo(w - 6, 0);
        ctx.lineTo(w - 2, 4);
        ctx.fill();
    }
}

// ============================================================================
// STATIONARY SHOOTER ENEMY - Stays in place, shoots at player
// ============================================================================

class StationaryShooterEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, 'shooter');
        this.health = 40;
        this.maxHealth = 40;
        this.height = 48;
        this.detectionRange = 300;
        this.attackCooldownMax = 2.0;
        this.projectileSpeed = 250;
    }

    applyGravity(dt) {
        // Still affected by gravity
        super.applyGravity(dt);
    }

    updateAI(dt, player, projectiles) {
        if (player.isDead) {
            this.state = 'idle';
            return;
        }

        const distToPlayer = this.getDistanceToPlayer(player);

        if (distToPlayer < this.detectionRange) {
            this.state = 'attack';
            this.facePlayer(player);

            // Shoot at player
            if (this.attackCooldown <= 0) {
                this.shoot(player, projectiles);
                this.attackCooldown = this.attackCooldownMax;
            }
        } else {
            this.state = 'idle';
        }

        // No horizontal movement
        this.velocityX = 0;
    }

    shoot(player, projectiles) {
        const startX = this.x + (this.facingRight ? this.width : 0);
        const startY = this.y + this.height / 2;

        // Aim at player
        const dx = (player.x + player.width / 2) - startX;
        const dy = (player.y + player.height / 2) - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const vx = (dx / dist) * this.projectileSpeed;
        const vy = (dy / dist) * this.projectileSpeed;

        projectiles.push(new Projectile(startX, startY - 2, vx, vy, false));
    }

    drawEnemy(ctx) {
        const w = this.width;
        const h = this.height;

        // Base/legs (stationary tripod-like)
        ctx.fillStyle = '#2a2a3a';
        ctx.beginPath();
        ctx.moveTo(w / 2, h);
        ctx.lineTo(0, h);
        ctx.lineTo(4, h - 16);
        ctx.lineTo(w - 4, h - 16);
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();

        // Body (turret-like)
        const bodyGradient = ctx.createLinearGradient(0, 8, 0, h - 16);
        bodyGradient.addColorStop(0, '#4a4a5a');
        bodyGradient.addColorStop(1, '#2a2a3a');
        ctx.fillStyle = bodyGradient;
        ctx.fillRect(2, 8, w - 4, h - 24);

        // Armor plating
        ctx.fillStyle = '#3a3a4a';
        ctx.fillRect(4, 12, w - 8, 6);
        ctx.fillRect(4, 22, w - 8, 6);

        // Head/sensor
        ctx.fillStyle = '#3a3a4a';
        ctx.fillRect(4, 0, w - 8, 10);

        // Eye/sensor (red, pulsing)
        const pulse = Math.sin(this.animationTime * 4) * 0.3 + 0.7;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 12 * pulse;
        ctx.fillStyle = `rgba(255, 50, 50, ${pulse})`;
        ctx.beginPath();
        ctx.arc(w / 2, 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Gun barrel
        ctx.fillStyle = '#1a1a2a';
        const gunY = h / 2 - 4;
        ctx.fillRect(this.facingRight ? w - 2 : -8, gunY, 10, 6);

        // Muzzle glow when ready to fire
        if (this.attackCooldown < 0.3) {
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#ff8800';
            ctx.fillRect(this.facingRight ? w + 4 : -10, gunY + 1, 4, 4);
            ctx.shadowBlur = 0;
        }
    }
}

// ============================================================================
// FLYING ENEMY - Moves in sine wave pattern
// ============================================================================

class FlyingEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, 'flying');
        this.health = 30;
        this.maxHealth = 30;
        this.width = 32;
        this.height = 24;
        this.speed = 100;
        this.detectionRange = 250;
        this.chaseSpeed = 120;

        // Sine wave movement
        this.baseY = y;
        this.sineAmplitude = 40;
        this.sineFrequency = 2;
        this.sineOffset = Math.random() * Math.PI * 2;

        // Flight direction
        this.flyDirection = Math.random() > 0.5 ? 1 : -1;
    }

    applyGravity(dt) {
        // Flying enemies don't fall
    }

    updateAI(dt, player, projectiles) {
        if (player.isDead) {
            this.state = 'patrol';
        }

        const distToPlayer = this.getDistanceToPlayer(player);

        if (distToPlayer < this.detectionRange && !player.isDead) {
            this.state = 'chase';
            this.facePlayer(player);

            // Move towards player
            const dx = (player.x + player.width / 2) - (this.x + this.width / 2);
            const dy = (player.y + player.height / 2) - (this.y + this.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);

            this.velocityX = (dx / dist) * this.chaseSpeed;
            this.velocityY = (dy / dist) * this.chaseSpeed;
        } else {
            this.state = 'patrol';

            // Sine wave patrol
            this.velocityX = this.speed * this.flyDirection;
            this.y = this.baseY + Math.sin(this.animationTime * this.sineFrequency + this.sineOffset) * this.sineAmplitude;
            this.velocityY = 0;

            this.facingRight = this.flyDirection > 0;
        }
    }

    moveX(amount, tileMap) {
        this.x += amount;

        // Bounce off walls
        if (amount > 0) {
            if (this.collidesWithSolid(tileMap, 1, 0)) {
                this.x = Math.floor((this.x + this.width) / TILE_SIZE) * TILE_SIZE - this.width;
                this.flyDirection = -1;
                this.velocityX = 0;
            }
        } else if (amount < 0) {
            if (this.collidesWithSolid(tileMap, -1, 0)) {
                this.x = Math.ceil(this.x / TILE_SIZE) * TILE_SIZE;
                this.flyDirection = 1;
                this.velocityX = 0;
            }
        }
    }

    moveY(amount, tileMap) {
        this.y += amount;

        // Bounce off ceiling/floor
        if (this.collidesWithSolid(tileMap, 0, amount > 0 ? 1 : -1)) {
            if (amount > 0) {
                this.y = Math.floor((this.y + this.height) / TILE_SIZE) * TILE_SIZE - this.height;
            } else {
                this.y = Math.ceil(this.y / TILE_SIZE) * TILE_SIZE;
            }
            this.velocityY = 0;
        }
    }

    drawEnemy(ctx) {
        const w = this.width;
        const h = this.height;

        // Wing flap animation
        const wingOffset = Math.sin(this.animationTime * 15) * 4;

        // Wings
        ctx.fillStyle = '#6a2a2a';
        // Left wing
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(-8, h / 2 - 8 + wingOffset);
        ctx.lineTo(-4, h / 2 + 4);
        ctx.closePath();
        ctx.fill();
        // Right wing
        ctx.beginPath();
        ctx.moveTo(w, h / 2);
        ctx.lineTo(w + 8, h / 2 - 8 - wingOffset);
        ctx.lineTo(w + 4, h / 2 + 4);
        ctx.closePath();
        ctx.fill();

        // Body
        const bodyGradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        bodyGradient.addColorStop(0, '#8a3a3a');
        bodyGradient.addColorStop(1, '#5a2020');
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(w / 2 + 4, h / 2 - 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Pupil
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(w / 2 + 5, h / 2 - 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Teeth/mandibles
        ctx.fillStyle = '#ddcccc';
        ctx.beginPath();
        ctx.moveTo(w - 4, h / 2 + 4);
        ctx.lineTo(w + 2, h / 2 + 6);
        ctx.lineTo(w - 2, h / 2 + 8);
        ctx.fill();
    }
}

// ============================================================================
// ============================================================================
// BOSS ENEMY - The Cyberdemon Lord
// Three-phase boss with unique attack patterns
// ============================================================================

class BossEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, 'boss');
        this.width = 96;
        this.height = 120;
        this.health = 800 * getDifficulty().enemyHealthMultiplier;
        this.maxHealth = this.health;
        this.damage = 30 * getDifficulty().enemyDamageMultiplier;
        this.detectionRange = 2000;
        this.moveSpeed = 180;

        // Boss phases (1=normal, 2=damaged, 3=enraged)
        this.phase = 1;
        this.phaseThresholds = [0.66, 0.33];
        this.invulnerable = false;
        this.invulnerableTimer = 0;

        // Attack system
        this.attackPattern = 'idle';
        this.attackTimer = 0;
        this.attackCooldown = 0;
        this.attackSubTimer = 0;
        
        // Movement patterns
        this.targetX = x;
        this.targetY = y;
        this.baseY = y;
        this.hoverTime = 0;
        this.teleportCooldown = 0;
        this.isGrounded = true;

        // Attack-specific variables
        this.fireballCount = 0;
        this.waveCount = 0;
        this.spiralAngle = 0;
        this.summonCount = 0;
        this.groundPoundActive = false;
        this.laserChargeTime = 0;
        this.laserActive = false;
        this.laserAngle = 0;
        this.shockwaveRadius = 0;
        
        // Minions
        this.minions = [];
        
        // Visual effects
        this.eyeGlow = 1;
        this.shakeIntensity = 0;
        this.auraSize = 0;
        this.crackProgress = 0;
        this.phaseTransitionTimer = 0;

        // Combat tracking
        this.lastDamageTaken = 0;
        this.enrageActivated = false;
    }

    update(dt, tileMap, player, projectiles) {
        if (this.isDead) {
            this.deathTimer -= dt;
            this.deathAnimationTimer += dt;
            return;
        }

        this.hoverTime += dt;
        this.updateAI(dt, player, projectiles);
        this.updateVisuals(dt);
        
        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerableTimer -= dt;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }

        // Update minions
        this.minions = this.minions.filter(m => !m.isDead);

        // Apply movement
        this.x += this.velocityX * dt;
        this.y += this.velocityY * dt;

        // Hover animation when in air
        if (!this.isGrounded) {
            this.y = this.baseY + Math.sin(this.hoverTime * 2) * 8;
        }

        // Decay velocity
        this.velocityX *= 0.9;
        this.velocityY *= 0.9;
    }

    updateAI(dt, player, projectiles) {
        if (player.isDead) return;

        // Check phase transitions
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent <= this.phaseThresholds[1] && this.phase < 3) {
            this.transitionToPhase(3);
        } else if (healthPercent <= this.phaseThresholds[0] && this.phase < 2) {
            this.transitionToPhase(2);
        }

        // Update timers
        this.attackTimer += dt;
        this.attackCooldown -= dt;
        this.teleportCooldown -= dt;

        // Face player
        this.facingRight = player.x > this.x;

        // Execute current attack pattern
        switch (this.attackPattern) {
            case 'idle':
                this.executeIdle(dt, player);
                break;
            case 'fireball_barrage':
                this.executeFireballBarrage(dt, player, projectiles);
                break;
            case 'spiral_shot':
                this.executeSpiralShot(dt, player, projectiles);
                break;
            case 'ground_pound':
                this.executeGroundPound(dt, player, projectiles);
                break;
            case 'laser_sweep':
                this.executeLaserSweep(dt, player, projectiles);
                break;
            case 'teleport_strike':
                this.executeTeleportStrike(dt, player);
                break;
            case 'summon_minions':
                this.executeSummonMinions(dt, player);
                break;
            case 'shockwave':
                this.executeShockwave(dt, player, projectiles);
                break;
        }

        // Choose new attack when ready
        if (this.attackPattern === 'idle' && this.attackCooldown <= 0) {
            this.chooseAttack(player);
        }
    }

    transitionToPhase(newPhase) {
        this.phase = newPhase;
        this.invulnerable = true;
        this.invulnerableTimer = 1.2;
        this.phaseTransitionTimer = 1.2;
        this.attackPattern = 'idle';
        this.attackCooldown = 0.5;
        
        if (screenShake) screenShake.shake(20, 0.8);
        if (soundSystem) {
            soundSystem.playTone(40, 0.8, 'sawtooth', 0.6);
            setTimeout(() => soundSystem.playTone(80, 0.5, 'sawtooth', 0.5), 300);
        }
        
        if (particleSystem) {
            for (let i = 0; i < 50; i++) {
                particleSystem.emit(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    1,
                    {
                        color: this.phase === 3 ? '#ff0000' : '#ff6600',
                        minSpeed: 100,
                        maxSpeed: 300,
                        lifetime: 1.5
                    }
                );
            }
        }

        // Increase speed with each phase
        if (this.phase === 2) {
            this.moveSpeed = 220;
        } else if (this.phase === 3 && !this.enrageActivated) {
            this.enrageActivated = true;
            this.moveSpeed = 280;
            this.damage *= 1.5;
        }
    }

    chooseAttack(player) {
        let attacks = [];
        
        // Each phase has its own attack set
        if (this.phase === 1) {
            attacks = ['fireball_barrage', 'ground_pound', 'spiral_shot'];
        } else if (this.phase === 2) {
            attacks = ['fireball_barrage', 'spiral_shot', 'laser_sweep', 'teleport_strike', 'ground_pound'];
        } else if (this.phase === 3) {
            attacks = ['fireball_barrage', 'spiral_shot', 'laser_sweep', 'teleport_strike', 'summon_minions', 'shockwave', 'ground_pound'];
        }

        // Prevent repeating same attack
        let newAttack;
        do {
            newAttack = attacks[Math.floor(Math.random() * attacks.length)];
        } while (newAttack === this.lastAttack && attacks.length > 1);
        
        this.lastAttack = newAttack;
        this.attackPattern = newAttack;
        this.attackTimer = 0;
        this.attackSubTimer = 0;
    }

    executeIdle(dt, player) {
        // Slowly move towards center of arena
        const centerX = CANVAS_WIDTH / 2;
        const dx = centerX - this.x;
        
        if (Math.abs(dx) > 50) {
            this.velocityX = Math.sign(dx) * this.moveSpeed * 0.5;
        }
    }

    executeFireballBarrage(dt, player, projectiles) {
        if (this.attackTimer === 0) {
            this.fireballCount = this.phase === 3 ? 12 : this.phase === 2 ? 8 : 5;
            this.velocityX = 0;
        }

        if (this.fireballCount > 0 && this.attackSubTimer <= 0) {
            const startX = this.x + this.width / 2;
            const startY = this.y + 30;
            const dx = player.x - startX;
            const dy = player.y - startY;
            const angle = Math.atan2(dy, dx);
            const spread = (Math.random() - 0.5) * 0.4;
            const speed = 300 + Math.random() * 100;

            const proj = new Projectile(
                startX,
                startY,
                Math.cos(angle + spread) * speed,
                Math.sin(angle + spread) * speed,
                false
            );
            proj.damage = 20 * getDifficulty().enemyDamageMultiplier;
            proj.color = '#ff4400';
            projectiles.push(proj);

            this.fireballCount--;
            this.attackSubTimer = this.phase === 3 ? 0.15 : 0.25;
            
            if (soundSystem) soundSystem.playTone(250, 0.05, 'square', 0.2);
            this.shakeIntensity = 3;
        }

        this.attackSubTimer -= dt;

        if (this.fireballCount <= 0 && this.attackSubTimer <= -0.5) {
            this.attackPattern = 'idle';
            this.attackCooldown = 0.8;
        }
    }

    executeSpiralShot(dt, player, projectiles) {
        if (this.attackTimer === 0) {
            this.spiralAngle = 0;
            this.waveCount = this.phase === 3 ? 30 : 20;
            this.velocityX = 0;
        }

        if (this.waveCount > 0 && this.attackSubTimer <= 0) {
            const startX = this.x + this.width / 2;
            const startY = this.y + this.height / 2;
            
            // Shoot 3 projectiles in spiral pattern
            for (let i = 0; i < 3; i++) {
                const angle = this.spiralAngle + (i * Math.PI * 2 / 3);
                const speed = 200;

                const proj = new Projectile(
                    startX,
                    startY,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    false
                );
                proj.damage = 15 * getDifficulty().enemyDamageMultiplier;
                proj.color = '#ff00ff';
                projectiles.push(proj);
            }

            this.spiralAngle += 0.3;
            this.waveCount--;
            this.attackSubTimer = 0.08;
            
            if (soundSystem) soundSystem.playTone(350 + Math.sin(this.spiralAngle) * 50, 0.03, 'sine', 0.15);
        }

        this.attackSubTimer -= dt;

        if (this.waveCount <= 0) {
            this.attackPattern = 'idle';
            this.attackCooldown = 1.0;
        }
    }

    executeGroundPound(dt, player, projectiles) {
        if (this.attackTimer === 0) {
            this.isGrounded = false;
            this.targetY = this.baseY - 100;
            this.groundPoundActive = false;
        }

        // Rise up
        if (!this.groundPoundActive && this.attackTimer < 1.0) {
            this.y = this.baseY - (this.attackTimer / 1.0) * 100;
            this.shakeIntensity = 5;
        }
        // Slam down
        else if (!this.groundPoundActive && this.attackTimer >= 1.0) {
            this.velocityY = 800;
            this.groundPoundActive = true;
            if (soundSystem) soundSystem.playTone(60, 0.3, 'sawtooth', 0.4);
        }

        // Impact
        if (this.groundPoundActive && this.y >= this.baseY) {
            this.y = this.baseY;
            this.isGrounded = true;
            
            if (screenShake) screenShake.shake(15, 0.4);
            if (soundSystem) soundSystem.playTone(30, 0.5, 'sawtooth', 0.5);
            
            // Create shockwave projectiles
            const numWaves = this.phase === 3 ? 8 : 6;
            for (let i = 0; i < numWaves; i++) {
                const angle = (i / numWaves) * Math.PI * 2;
                const speed = 200;
                const proj = new Projectile(
                    this.x + this.width / 2,
                    this.y + this.height,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    false
                );
                proj.damage = 25 * getDifficulty().enemyDamageMultiplier;
                proj.color = '#ffaa00';
                projectiles.push(proj);
            }
            
            if (particleSystem) {
                particleSystem.emitExplosion(this.x + this.width / 2, this.y + this.height, '#aa6600');
            }

            this.attackPattern = 'idle';
            this.attackCooldown = 1.2;
        }
    }

    executeLaserSweep(dt, player, projectiles) {
        if (this.attackTimer === 0) {
            this.laserChargeTime = 0;
            this.laserActive = false;
            this.laserAngle = player.y < this.y ? -0.3 : 0.3;
            this.velocityX = 0;
        }

        // Charge up
        if (this.attackTimer < 1.5) {
            this.laserChargeTime += dt;
            this.eyeGlow = 2 + Math.sin(this.laserChargeTime * 20) * 0.5;
            if (this.attackTimer > 1.0 && soundSystem && !this.laserActive) {
                soundSystem.playTone(800, 0.5, 'sine', 0.3);
            }
        }
        // Fire laser
        else if (!this.laserActive) {
            this.laserActive = true;
            if (soundSystem) soundSystem.playTone(1200, 1.0, 'sine', 0.4);
        }

        // Sweep laser
        if (this.laserActive && this.attackTimer < 3.0) {
            const sweepProgress = (this.attackTimer - 1.5) / 1.5;
            this.laserAngle = -0.5 + sweepProgress * 1.0;

            // Spawn laser projectiles
            if (this.attackSubTimer <= 0) {
                const startX = this.x + (this.facingRight ? this.width : 0);
                const startY = this.y + 30;
                const speed = 600;

                const proj = new Projectile(
                    startX,
                    startY,
                    Math.cos(this.laserAngle) * speed * (this.facingRight ? 1 : -1),
                    Math.sin(this.laserAngle) * speed,
                    false
                );
                proj.damage = 18 * getDifficulty().enemyDamageMultiplier;
                proj.color = '#00ffff';
                proj.width = 8;
                proj.height = 8;
                projectiles.push(proj);

                this.attackSubTimer = 0.05;
            }
            this.attackSubTimer -= dt;
        }

        if (this.attackTimer >= 3.0) {
            this.laserActive = false;
            this.attackPattern = 'idle';
            this.attackCooldown = 1.5;
        }
    }

    executeTeleportStrike(dt, player) {
        if (this.attackTimer === 0) {
            // Fade out
            if (particleSystem) {
                for (let i = 0; i < 30; i++) {
                    particleSystem.emit(this.x + this.width / 2, this.y + this.height / 2, 1, {
                        color: '#aa00ff',
                        minSpeed: 50,
                        maxSpeed: 150,
                        lifetime: 0.8
                    });
                }
            }
            if (soundSystem) soundSystem.playTone(400, 0.3, 'sine', 0.3);
        }

        if (this.attackTimer > 0.5 && this.attackTimer < 0.51) {
            // Teleport behind player
            this.x = player.x + (player.facingRight ? -150 : 150);
            this.y = player.y - 20;
            this.facingRight = player.x > this.x;
            
            if (particleSystem) {
                for (let i = 0; i < 30; i++) {
                    particleSystem.emit(this.x + this.width / 2, this.y + this.height / 2, 1, {
                        color: '#aa00ff',
                        minSpeed: 50,
                        maxSpeed: 150,
                        lifetime: 0.8
                    });
                }
            }
            if (soundSystem) soundSystem.playTone(600, 0.3, 'sine', 0.3);
        }

        if (this.attackTimer > 1.0) {
            this.attackPattern = 'idle';
            this.attackCooldown = 0.8;
            this.teleportCooldown = 4.0;
        }
    }

    executeSummonMinions(dt, player) {
        if (this.attackTimer === 0) {
            this.summonCount = 3;
            this.velocityX = 0;
        }

        if (this.summonCount > 0 && this.attackSubTimer <= 0) {
            // Spawn a minion - it will be added to enemies array externally
            const offsetX = (Math.random() - 0.5) * 200;
            const minionX = this.x + offsetX;
            const minionY = this.y;
            
            const minion = new GroundPatrolEnemy(minionX, minionY);
            minion.health *= 0.5; // Half health
            this.minions.push(minion);
            
            // Add to global enemies array if it exists
            if (typeof enemies !== 'undefined') {
                enemies.push(minion);
            }

            if (particleSystem) {
                particleSystem.emitExplosion(minionX, minionY, '#ff00ff');
            }
            if (soundSystem) soundSystem.playTone(200, 0.2, 'square', 0.3);

            this.summonCount--;
            this.attackSubTimer = 0.8;
        }

        this.attackSubTimer -= dt;

        if (this.summonCount <= 0 && this.attackSubTimer <= -0.5) {
            this.attackPattern = 'idle';
            this.attackCooldown = 2.0;
        }
    }

    executeShockwave(dt, player, projectiles) {
        if (this.attackTimer === 0) {
            this.shockwaveRadius = 0;
            if (soundSystem) soundSystem.playTone(100, 1.0, 'sawtooth', 0.5);
        }

        this.shockwaveRadius += 400 * dt;

        // Spawn ring of projectiles
        if (this.attackSubTimer <= 0) {
            const numProj = 16;
            for (let i = 0; i < numProj; i++) {
                const angle = (i / numProj) * Math.PI * 2;
                const spawnX = this.x + this.width / 2 + Math.cos(angle) * this.shockwaveRadius;
                const spawnY = this.y + this.height / 2 + Math.sin(angle) * this.shockwaveRadius;
                
                const proj = new Projectile(
                    spawnX,
                    spawnY,
                    Math.cos(angle) * 150,
                    Math.sin(angle) * 150,
                    false
                );
                proj.damage = 12 * getDifficulty().enemyDamageMultiplier;
                proj.color = '#ff0000';
                projectiles.push(proj);
            }
            this.attackSubTimer = 0.3;
        }

        this.attackSubTimer -= dt;

        if (this.attackTimer >= 1.5) {
            this.shockwaveRadius = 0;
            this.attackPattern = 'idle';
            this.attackCooldown = 1.5;
        }
    }

    updateVisuals(dt) {
        this.eyeGlow = 1 + Math.sin(Date.now() / 300) * 0.3;
        this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 10);
        
        if (this.phaseTransitionTimer > 0) {
            this.phaseTransitionTimer -= dt;
        }

        if (this.invulnerable) {
            this.auraSize = 20 + Math.sin(Date.now() / 100) * 5;
        } else {
            this.auraSize = 0;
        }

        // Update crack progression based on health
        this.crackProgress = 1 - (this.health / this.maxHealth);
    }

    takeDamage(amount, particleSystem) {
        if (this.invulnerable || this.isDead) return;

        super.takeDamage(amount, particleSystem);
        this.shakeIntensity = 8;
        this.lastDamageTaken = amount;
    }

    applyGravity(dt) {
        // Boss doesn't use normal gravity
    }

    render(ctx, camera) {
        if (this.isDead && this.deathTimer <= 0) return;

        const screenPos = camera.worldToScreen(this.x, this.y);

        ctx.save();

        // Death fade
        if (this.isDead) {
            ctx.globalAlpha = this.deathTimer / this.deathDuration;
        }

        // Damage flash
        if (this.damageFlash > 0) {
            ctx.filter = 'brightness(2)';
        }

        const centerX = screenPos.x + this.width / 2;
        const bottomY = screenPos.y + this.height;

        ctx.translate(centerX, bottomY);
        ctx.scale(this.facingRight ? 1 : -1, 1);
        ctx.translate(-this.width / 2, -this.height);

        this.drawEnemy(ctx);

        ctx.restore();

        // Boss health bar (always show)
        this.drawHealthBar(ctx, screenPos);
    }

    drawEnemy(ctx) {
        const w = this.width;
        const h = this.height;

        ctx.save();
        
        // Apply shake effect
        if (this.shakeIntensity > 0) {
            ctx.translate(
                (Math.random() - 0.5) * this.shakeIntensity,
                (Math.random() - 0.5) * this.shakeIntensity
            );
        }

        // Invulnerability aura
        if (this.auraSize > 0) {
            ctx.strokeStyle = this.phase === 3 ? '#ff0000' : '#ffaa00';
            ctx.lineWidth = 4;
            ctx.globalAlpha = 0.6;
            ctx.strokeRect(-this.auraSize / 2, -this.auraSize / 2, w + this.auraSize, h + this.auraSize);
            ctx.globalAlpha = 1;
        }

        // Main body
        const bodyColor = this.phase === 3 ? '#660000' : this.phase === 2 ? '#663300' : '#4a1a1a';
        const highlightColor = this.phase === 3 ? '#aa0000' : this.phase === 2 ? '#aa5500' : '#8a2a2a';
        
        const bodyGrad = ctx.createLinearGradient(0, 0, w, h);
        bodyGrad.addColorStop(0, bodyColor);
        bodyGrad.addColorStop(0.5, highlightColor);
        bodyGrad.addColorStop(1, bodyColor);
        ctx.fillStyle = bodyGrad;
        
        // Torso
        ctx.fillRect(w * 0.2, h * 0.25, w * 0.6, h * 0.6);

        // Shoulders
        ctx.fillStyle = '#2a0a0a';
        ctx.fillRect(0, h * 0.25, w * 0.25, h * 0.3);
        ctx.fillRect(w * 0.75, h * 0.25, w * 0.25, h * 0.3);

        // Spikes on shoulders
        ctx.fillStyle = '#1a0505';
        for (let i = 0; i < 3; i++) {
            const spikeY = h * 0.25 + i * 10;
            ctx.beginPath();
            ctx.moveTo(0, spikeY);
            ctx.lineTo(-8, spikeY + 5);
            ctx.lineTo(0, spikeY + 10);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(w, spikeY);
            ctx.lineTo(w + 8, spikeY + 5);
            ctx.lineTo(w, spikeY + 10);
            ctx.fill();
        }

        // Legs
        ctx.fillStyle = bodyColor;
        ctx.fillRect(w * 0.25, h * 0.75, w * 0.2, h * 0.25);
        ctx.fillRect(w * 0.55, h * 0.75, w * 0.2, h * 0.25);

        // Head
        ctx.fillStyle = highlightColor;
        ctx.fillRect(w * 0.25, h * 0.05, w * 0.5, h * 0.25);

        // Horns (get bigger in phase 3)
        const hornSize = this.phase === 3 ? 30 : 20;
        ctx.fillStyle = '#1a0000';
        ctx.beginPath();
        ctx.moveTo(w * 0.2, h * 0.15);
        ctx.lineTo(w * 0.1, h * 0.05 - hornSize);
        ctx.lineTo(w * 0.25, h * 0.1);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w * 0.8, h * 0.15);
        ctx.lineTo(w * 0.9, h * 0.05 - hornSize);
        ctx.lineTo(w * 0.75, h * 0.1);
        ctx.fill();

        // Eyes (glowing based on phase)
        const eyeColor = this.phase === 3 ? '#ff0000' : this.phase === 2 ? '#ff6600' : '#ffaa00';
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 20 * this.eyeGlow;
        ctx.fillStyle = eyeColor;
        
        const eyeWidth = 16;
        const eyeHeight = this.laserActive ? 4 : 10;
        ctx.fillRect(w * 0.3, h * 0.12, eyeWidth, eyeHeight);
        ctx.fillRect(w * 0.7 - eyeWidth, h * 0.12, eyeWidth, eyeHeight);
        ctx.shadowBlur = 0;

        // Mouth/teeth
        ctx.fillStyle = '#0a0000';
        ctx.fillRect(w * 0.35, h * 0.22, w * 0.3, h * 0.06);
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(w * 0.37 + i * 6, h * 0.22, 3, 5);
        }

        // Chest core (pulses with attacks)
        const coreSize = 12 + (this.attackPattern !== 'idle' ? Math.sin(Date.now() / 100) * 4 : 0);
        ctx.fillStyle = eyeColor;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.45, coreSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Battle damage cracks
        if (this.crackProgress > 0.3) {
            ctx.strokeStyle = '#ff4400';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(w * 0.5, h * 0.3);
            ctx.lineTo(w * 0.4, h * 0.5);
            ctx.lineTo(w * 0.5, h * 0.7);
            ctx.stroke();
        }
        if (this.crackProgress > 0.6) {
            ctx.beginPath();
            ctx.moveTo(w * 0.3, h * 0.4);
            ctx.lineTo(w * 0.2, h * 0.6);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(w * 0.7, h * 0.4);
            ctx.lineTo(w * 0.8, h * 0.6);
            ctx.stroke();
        }

        // Phase transition effect
        if (this.phaseTransitionTimer > 0) {
            ctx.globalAlpha = this.phaseTransitionTimer / 1.5;
            ctx.fillStyle = this.phase === 3 ? '#ff0000' : '#ff6600';
            ctx.fillRect(0, 0, w, h);
            ctx.globalAlpha = 1;
        }

        // Draw shockwave ring if active
        if (this.shockwaveRadius > 0) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 4;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, this.shockwaveRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        ctx.restore();
    }

    drawHealthBar(ctx, screenPos) {
        const barWidth = 400;
        const barHeight = 20;
        const x = (CANVAS_WIDTH - barWidth) / 2;
        const y = 80;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x - 5, y - 5, barWidth + 10, barHeight + 10);

        // Health bar background
        ctx.fillStyle = '#2a0000';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Health bar fill
        const healthPercent = Math.max(0, this.health / this.maxHealth);
        const barColor = this.phase === 3 ? '#ff0000' : this.phase === 2 ? '#ff6600' : '#00ff00';
        ctx.fillStyle = barColor;
        ctx.fillRect(x + 2, y + 2, (barWidth - 4) * healthPercent, barHeight - 4);

        // Phase markers
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + barWidth * 0.66, y);
        ctx.lineTo(x + barWidth * 0.66, y + barHeight);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + barWidth * 0.33, y);
        ctx.lineTo(x + barWidth * 0.33, y + barHeight);
        ctx.stroke();

        // Border
        ctx.strokeStyle = '#8b0000';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, barWidth, barHeight);

        // Boss name
        ctx.font = 'bold 18px Impact';
        ctx.fillStyle = this.phase === 3 ? '#ff0000' : '#ffaa00';
        ctx.textAlign = 'center';
        ctx.fillText('THE CYBERDEMON LORD', CANVAS_WIDTH / 2, y - 10);

        // Phase indicator
        ctx.font = 'bold 14px Impact';
        ctx.fillStyle = '#ffffff';
        const phaseText = this.phase === 3 ? 'ENRAGED' : this.phase === 2 ? 'DAMAGED' : 'PHASE 1';
        ctx.fillText(phaseText, CANVAS_WIDTH / 2, y + barHeight + 20);
    }
}

// ============================================================================
// CHECKPOINT CLASS
// ============================================================================

class Checkpoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 48;
        this.activated = false;
        this.animationTime = 0;
    }

    update(dt) {
        this.animationTime += dt;
    }

    activate(player, soundSystem) {
        if (this.activated) return;
        this.activated = true;
        player.setCheckpoint(this.x, this.y - player.height + this.height);
        if (soundSystem) {
            soundSystem.playTone(400, 0.1, 'square', 0.3);
            soundSystem.playTone(600, 0.1, 'square', 0.2);
        }
    }

    render(ctx, camera) {
        const screenPos = camera.worldToScreen(this.x, this.y);
        const pulse = Math.sin(this.animationTime * 4) * 0.2 + 0.8;

        ctx.save();

        if (this.activated) {
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 15 * pulse;
        }

        // Flag pole
        ctx.fillStyle = '#444';
        ctx.fillRect(screenPos.x + 14, screenPos.y, 4, this.height);

        // Flag
        const flagColor = this.activated ? '#00ff00' : '#ff4444';
        ctx.fillStyle = flagColor;
        ctx.beginPath();
        ctx.moveTo(screenPos.x + 18, screenPos.y + 4);
        ctx.lineTo(screenPos.x + 32, screenPos.y + 12);
        ctx.lineTo(screenPos.x + 18, screenPos.y + 20);
        ctx.closePath();
        ctx.fill();

        // Base
        ctx.fillStyle = '#666';
        ctx.fillRect(screenPos.x + 8, screenPos.y + this.height - 8, 16, 8);

        ctx.restore();
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

// ============================================================================
// LEVEL MANAGER
// ============================================================================

class LevelManager {
    constructor() {
        this.currentLevelIndex = 0;
        this.currentMap = null;
        this.transitioning = false;
        this.transitionTimer = 0;
        this.transitionDuration = 1.0;
        this.transitionPhase = 'none'; // 'fadeOut', 'fadeIn', 'none'
    }

    loadLevel(index) {
        if (index >= LEVELS.length) {
            // Game complete - loop back or show victory
            index = 0;
            // Could show victory screen here
        }

        this.currentLevelIndex = index;
        this.currentMap = new TileMap(LEVELS[index]);

        // Reset player position
        if (player) {
            // Clear checkpoint when loading new level
            player.clearCheckpoint();
            player.reset(
                this.currentMap.playerStart.x * TILE_SIZE,
                this.currentMap.playerStart.y * TILE_SIZE
            );
        }

        // Set camera bounds
        if (camera) {
            camera.setBounds(this.currentMap.pixelWidth, this.currentMap.pixelHeight);
            // Center camera on player immediately
            camera.x = player.x - camera.width / 2;
            camera.y = player.y - camera.height / 2;
        }

        // Clear and spawn enemies
        enemies = [];
        projectiles = [];
        pickups = [];
        checkpoints = [];
        if (particleSystem) particleSystem.clear();

        const levelData = LEVELS[index];
        if (levelData.enemies) {
            for (const enemyData of levelData.enemies) {
                const ex = enemyData.x * TILE_SIZE;
                const ey = enemyData.y * TILE_SIZE;

                let enemy;
                switch (enemyData.type) {
                    case 'patrol':
                        enemy = new GroundPatrolEnemy(ex, ey);
                        break;
                    case 'shooter':
                        enemy = new StationaryShooterEnemy(ex, ey);
                        break;
                    case 'flying':
                        enemy = new FlyingEnemy(ex, ey);
                        break;
                    case 'boss':
                        enemy = new BossEnemy(ex, ey);
                        break;
                    default:
                        enemy = new GroundPatrolEnemy(ex, ey);
                }
                enemies.push(enemy);
            }
        }

        // Spawn pickups
        if (levelData.pickups) {
            for (const pickupData of levelData.pickups) {
                const px = pickupData.x * TILE_SIZE;
                const py = pickupData.y * TILE_SIZE;
                pickups.push(new Pickup(px, py, pickupData.type));
            }
        }

        // Spawn checkpoints
        if (levelData.checkpoints) {
            for (const cpData of levelData.checkpoints) {
                const cx = cpData.x * TILE_SIZE;
                const cy = cpData.y * TILE_SIZE;
                checkpoints.push(new Checkpoint(cx, cy));
            }
        }

        // Award points and coins for completing a level (except first)
        if (index > 0 && gameState.started) {
            gameState.score += 500;
            if (soundSystem) soundSystem.playLevelComplete();
            if (coinSystem) coinSystem.onLevelComplete();
        }

        // Reset damage tracking for new level
        if (coinSystem) coinSystem.resetLevelDamage();

        gameState.currentLevel = index;
    }

    nextLevel() {
        if (this.transitioning) return;

        this.transitioning = true;
        this.transitionTimer = this.transitionDuration;
        this.transitionPhase = 'fadeOut';
    }

    update(dt) {
        if (!this.transitioning) return;

        this.transitionTimer -= dt;

        if (this.transitionPhase === 'fadeOut' && this.transitionTimer <= this.transitionDuration / 2) {
            // Load next level at midpoint
            this.loadLevel(this.currentLevelIndex + 1);
            this.transitionPhase = 'fadeIn';
        }

        if (this.transitionTimer <= 0) {
            this.transitioning = false;
            this.transitionPhase = 'none';
        }
    }

    renderTransition(ctx) {
        if (!this.transitioning) return;

        let alpha;
        if (this.transitionPhase === 'fadeOut') {
            alpha = 1 - (this.transitionTimer / (this.transitionDuration / 2));
        } else {
            alpha = this.transitionTimer / (this.transitionDuration / 2);
        }

        alpha = Math.max(0, Math.min(1, alpha));

        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Level name during transition
        if (alpha > 0.5) {
            ctx.fillStyle = `rgba(139, 0, 0, ${(alpha - 0.5) * 2})`;
            ctx.font = 'bold 24px Impact, Arial Black, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.currentMap.name, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        }
    }
}

// ============================================================================
// GAME SYSTEMS
// ============================================================================

const input = new InputHandler();
let player = null;
let camera = null;
let levelManager = null;
let particleSystem = null;
let soundSystem = null;
let screenShake = null;
let highScoreSystem = null;
let projectiles = [];
let enemies = [];
let pickups = [];
let checkpoints = [];

// Achievement system
let achievementSystem = null;
let coinSystem = null;
let skinManager = null;
let shopUI = null;

function updateTiming(timestamp) {
    deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (deltaTime > 0.1) deltaTime = 0.1;

    frameCount++;
    fpsUpdateTime += deltaTime * 1000;

    if (fpsUpdateTime >= FPS_UPDATE_INTERVAL) {
        fps = Math.round(frameCount / (fpsUpdateTime / 1000));
        fpsCounter.textContent = `FPS: ${fps}`;
        frameCount = 0;
        fpsUpdateTime = 0;
    }
}

function drawHUD() {
    // Level name
    ctx.font = 'bold 14px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#8b0000';
    ctx.textAlign = 'left';
    ctx.fillText(`LEVEL ${gameState.currentLevel + 1}: ${levelManager.currentMap.name}`, 10, 20);

    // Player health bar
    const healthBarX = 10;
    const healthBarY = 30;
    const healthBarWidth = 150;
    const healthBarHeight = 16;

    // Health bar background
    ctx.fillStyle = '#1a0000';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    // Health bar fill
    const healthPercent = Math.max(0, player.health / player.maxHealth);
    const healthGradient = ctx.createLinearGradient(healthBarX, healthBarY, healthBarX + healthBarWidth, healthBarY);
    if (healthPercent > 0.5) {
        healthGradient.addColorStop(0, '#00aa00');
        healthGradient.addColorStop(1, '#00dd00');
    } else if (healthPercent > 0.25) {
        healthGradient.addColorStop(0, '#aaaa00');
        healthGradient.addColorStop(1, '#dddd00');
    } else {
        healthGradient.addColorStop(0, '#aa0000');
        healthGradient.addColorStop(1, '#dd0000');
    }
    ctx.fillStyle = healthGradient;
    ctx.fillRect(healthBarX + 2, healthBarY + 2, (healthBarWidth - 4) * healthPercent, healthBarHeight - 4);

    // Health bar border
    ctx.strokeStyle = '#4a0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    // Health text
    ctx.font = 'bold 11px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.max(0, Math.ceil(player.health))} / ${player.maxHealth}`, healthBarX + healthBarWidth / 2, healthBarY + 12);

    // Armor bar (if player has armor)
    if (player.armor > 0) {
        const armorBarY = healthBarY + healthBarHeight + 4;
        const armorBarHeight = 10;

        ctx.fillStyle = '#000066';
        ctx.fillRect(healthBarX, armorBarY, healthBarWidth, armorBarHeight);

        const armorPercent = player.armor / player.maxArmor;
        ctx.fillStyle = '#4444ff';
        ctx.fillRect(healthBarX + 2, armorBarY + 2, (healthBarWidth - 4) * armorPercent, armorBarHeight - 4);

        ctx.strokeStyle = '#000044';
        ctx.lineWidth = 1;
        ctx.strokeRect(healthBarX, armorBarY, healthBarWidth, armorBarHeight);

        ctx.font = 'bold 8px Impact';
        ctx.fillStyle = '#fff';
        ctx.fillText(`ARMOR: ${Math.ceil(player.armor)}`, healthBarX + healthBarWidth / 2, armorBarY + 8);
    }

    // Invincibility indicator
    if (player.invincibilityPowerup > 0) {
        ctx.font = 'bold 12px Impact';
        ctx.fillStyle = '#ffff00';
        ctx.textAlign = 'left';
        ctx.fillText(`INVINCIBLE: ${player.invincibilityPowerup.toFixed(1)}s`, healthBarX, healthBarY + (player.armor > 0 ? 42 : 30));
    }

    // Weapon and Ammo display
    const weapon = WEAPONS[player.currentWeapon];
    ctx.font = 'bold 14px Impact, Arial Black, sans-serif';
    ctx.fillStyle = weapon.color;
    ctx.textAlign = 'left';
    ctx.fillText(weapon.name, 10, 65);

    ctx.font = 'bold 12px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#aaa';
    const ammoText = player.currentWeapon === 'pistol' ? 'INF' : player.ammo[player.currentWeapon];
    ctx.fillText(`AMMO: ${ammoText}`, 10, 80);

    // Score display (right side)
    ctx.font = 'bold 16px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#ffaa00';
    ctx.textAlign = 'right';
    ctx.fillText(`SCORE: ${gameState.score}`, CANVAS_WIDTH - 10, 20);

    // High score
    const highScore = highScoreSystem ? highScoreSystem.getHighScore() : 0;
    ctx.font = 'bold 12px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText(`HIGH: ${highScore}`, CANVAS_WIDTH - 10, 38);

    // Coin balance
    if (coinSystem) {
        ctx.font = 'bold 12px Impact, Arial Black, sans-serif';
        ctx.fillStyle = '#ffdd00';
        ctx.textAlign = 'right';
        ctx.fillText(`COINS: ${coinSystem.balance}`, CANVAS_WIDTH - 10, 53);
    }

    // Weapon slots indicator
    const weaponList = ['pistol', 'shotgun', 'machinegun', 'plasma'];
    const slotX = CANVAS_WIDTH - 120;
    const slotY = 70;
    ctx.font = 'bold 10px Courier New, monospace';
    weaponList.forEach((w, i) => {
        const hasWeapon = player.weapons[w];
        const isCurrent = player.currentWeapon === w;
        ctx.fillStyle = isCurrent ? '#ffff00' : (hasWeapon ? '#666' : '#333');
        ctx.textAlign = 'left';
        ctx.fillText(`${i + 1}:${w.substring(0, 3).toUpperCase()}`, slotX + (i % 2) * 55, slotY + Math.floor(i / 2) * 12);
    });

    // Debug info
    ctx.font = '11px Courier New, monospace';
    ctx.fillStyle = '#444';
    ctx.textAlign = 'left';
    const debugY = CANVAS_HEIGHT - 10;
    ctx.fillText(`Enemies: ${enemies.filter(e => !e.isDead).length}`, 10, debugY);
}

// ============================================================================
// MENU SYSTEM
// ============================================================================

function drawStartMenu() {
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Title
    ctx.font = 'bold 48px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#8b0000';
    ctx.textAlign = 'center';
    ctx.fillText('DOOM', CANVAS_WIDTH / 2, 100);

    ctx.font = 'bold 32px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#cc0000';
    ctx.fillText('PLATFORMER', CANVAS_WIDTH / 2, 140);

    // Subtitle
    ctx.font = 'bold 14px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText('A 2D Side-Scrolling Adventure', CANVAS_WIDTH / 2, 165);

    // Difficulty selector
    ctx.font = 'bold 14px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText('DIFFICULTY (Press 1-3):', CANVAS_WIDTH / 2, 210);

    const difficulties = ['EASY', 'NORMAL', 'HARD'];
    const diffColors = ['#00ff00', '#ffaa00', '#ff4444'];
    difficulties.forEach((diff, i) => {
        const isSelected = gameState.difficulty === diff.toLowerCase();
        ctx.font = isSelected ? 'bold 16px Impact' : '14px Impact';
        ctx.fillStyle = isSelected ? diffColors[i] : '#444';
        ctx.fillText(`${i + 1}. ${diff}`, CANVAS_WIDTH / 2 - 80 + i * 80, 235);
    });

    // Instructions
    ctx.font = 'bold 18px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#00aa00';
    const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
    ctx.globalAlpha = pulse;
    ctx.fillText('PRESS ENTER OR SPACE TO START', CANVAS_WIDTH / 2, 290);
    ctx.globalAlpha = 1;

    // Continue option if save exists
    if (saveSystem && saveSystem.hasSave()) {
        ctx.font = '14px Impact';
        ctx.fillStyle = '#4488ff';
        ctx.fillText('Press F9 to Load Saved Game', CANVAS_WIDTH / 2, 320);
    }

    // Shop button
    ctx.font = 'bold 16px Impact';
    ctx.fillStyle = '#ffdd00';
    ctx.fillText('Press B to open SKIN SHOP', CANVAS_WIDTH / 2, 340);
    if (coinSystem) {
        ctx.font = '12px Impact';
        ctx.fillStyle = '#aa8800';
        ctx.fillText(`Coins: ${coinSystem.balance}`, CANVAS_WIDTH / 2, 355);
    }

    // Controls
    ctx.font = 'bold 12px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText('CONTROLS:', CANVAS_WIDTH / 2, 378);
    ctx.font = '10px Courier New, monospace';
    ctx.fillStyle = '#666';
    ctx.fillText('WASD / Arrows - Move & Jump | J / Z / Ctrl - Shoot', CANVAS_WIDTH / 2, 395);
    ctx.fillText('1-6 / Q/E - Switch Weapons | P / Escape - Pause', CANVAS_WIDTH / 2, 410);
    ctx.fillText('F - Fullscreen | L - Level Editor | F5 - Save | F9 - Load', CANVAS_WIDTH / 2, 425);

    // High scores and achievements
    const highScore = highScoreSystem ? highScoreSystem.getHighScore() : 0;
    ctx.font = 'bold 14px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText(`HIGH SCORE: ${highScore}`, CANVAS_WIDTH / 2 - 100, 465);

    if (achievementSystem) {
        ctx.fillStyle = '#aa88ff';
        ctx.fillText(`ACHIEVEMENTS: ${achievementSystem.getUnlockedCount()}/${achievementSystem.getTotalCount()}`, CANVAS_WIDTH / 2 + 100, 465);
    }

    // Skin info
    if (skinManager) {
        ctx.font = '11px Impact';
        ctx.fillStyle = '#888';
        ctx.fillText(`Skin: ${skinManager.getEquippedSkin().name}`, CANVAS_WIDTH / 2, 485);
    }

    // Version info
    ctx.font = '10px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('v3.0 - Shop Edition', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 10);
}

function drawPauseMenu() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Pause text
    ctx.font = 'bold 48px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#ffaa00';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

    ctx.font = 'bold 18px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText('Press P or ESC to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

    // Current stats
    ctx.font = 'bold 14px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText(`Score: ${gameState.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
    ctx.fillText(`Level: ${gameState.currentLevel + 1}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
    if (coinSystem) {
        ctx.fillStyle = '#ffdd00';
        ctx.fillText(`Coins: ${coinSystem.balance}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100);
    }

    // Shop button
    ctx.font = 'bold 14px Impact';
    ctx.fillStyle = '#ffdd00';
    ctx.fillText('Press B to open SKIN SHOP', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 130);
}

function drawGameOverMenu() {
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Game Over text
    ctx.font = 'bold 48px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#8b0000';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, 180);

    // Final score
    ctx.font = 'bold 24px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText(`FINAL SCORE: ${gameState.score}`, CANVAS_WIDTH / 2, 250);

    // Level reached
    ctx.font = 'bold 18px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText(`Level Reached: ${gameState.currentLevel + 1}`, CANVAS_WIDTH / 2, 290);

    // High score check
    const highScore = highScoreSystem ? highScoreSystem.getHighScore() : 0;
    if (gameState.score >= highScore && gameState.score > 0) {
        ctx.font = 'bold 20px Impact, Arial Black, sans-serif';
        ctx.fillStyle = '#00ff00';
        ctx.fillText('NEW HIGH SCORE!', CANVAS_WIDTH / 2, 340);
    }

    // Restart prompt
    ctx.font = 'bold 18px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#00aa00';
    const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
    ctx.globalAlpha = pulse;
    ctx.fillText('PRESS ENTER TO PLAY AGAIN', CANVAS_WIDTH / 2, 420);
    ctx.globalAlpha = 1;
}

function update(dt) {
    // Handle pause toggle
    if (input.consumePause() && gameState.started && !gameState.showMenu && !gameState.gameOver) {
        gameState.paused = !gameState.paused;
        if (gameState.paused && soundSystem) {
            soundSystem.stopMusic();
        } else if (!gameState.paused && soundSystem) {
            soundSystem.startMusic();
        }
    }

    // Update screen shake
    if (screenShake) {
        screenShake.update(dt);
    }

    levelManager.update(dt);

    if (gameState.started && player && !levelManager.transitioning && !gameState.paused) {
        player.update(dt, input, levelManager.currentMap, projectiles, particleSystem);
        camera.follow(player, dt);

        // Update enemies
        for (const enemy of enemies) {
            enemy.update(dt, levelManager.currentMap, player, projectiles);
        }

        // Check for enemy deaths and award score + coins
        for (const enemy of enemies) {
            if (enemy.isDead && !enemy.scoreCounted) {
                enemy.scoreCounted = true;
                gameState.score += Math.floor(100 * getDifficulty().scoreMultiplier);
                if (soundSystem) soundSystem.playEnemyDeath();
                if (screenShake) screenShake.shake(4, 0.15);

                // Award coins
                if (coinSystem) {
                    coinSystem.onEnemyKill(
                        enemy.type,
                        enemy.x + enemy.width / 2,
                        enemy.y
                    );
                }

                // Track achievement
                if (achievementSystem) {
                    achievementSystem.onEnemyKilled(player);
                    if (enemy.type === 'boss') {
                        achievementSystem.onBossKilled();
                    }
                }
            }
        }

        // Remove fully dead enemies
        enemies = enemies.filter(e => !e.isFullyDead());

        // Update achievement system
        if (achievementSystem) {
            achievementSystem.update(dt);
        }

        // Update pickups
        for (const pickup of pickups) {
            pickup.update(dt);

            if (!pickup.collected) {
                const playerBounds = player.getBounds();
                const pickupBounds = pickup.getBounds();
                if (aabbCollision(playerBounds, pickupBounds)) {
                    pickup.collect(player, soundSystem);
                    player.stats.pickupsCollected++;
                }
            }
        }
        pickups = pickups.filter(p => !p.collected);

        // Update checkpoints
        for (const checkpoint of checkpoints) {
            checkpoint.update(dt);

            if (!checkpoint.activated) {
                const playerBounds = player.getBounds();
                const cpBounds = checkpoint.getBounds();
                if (aabbCollision(playerBounds, cpBounds)) {
                    checkpoint.activate(player, soundSystem);
                }
            }
        }

        // Update projectiles
        for (const projectile of projectiles) {
            projectile.update(dt, levelManager.currentMap);
        }

        // Collision detection: player projectiles vs enemies
        for (const projectile of projectiles) {
            if (!projectile.isPlayerProjectile || projectile.isDead()) continue;

            const pBounds = projectile.getBounds();
            for (const enemy of enemies) {
                if (enemy.isDead) continue;

                const eBounds = enemy.getBounds();
                if (aabbCollision(pBounds, eBounds)) {
                    enemy.takeDamage(projectile.damage, particleSystem);
                    player.stats.damageDealt += projectile.damage;
                    projectile.onHit(); // Handles piercing and explosive
                    particleSystem.emitHit(
                        projectile.x + projectile.width / 2,
                        projectile.y + projectile.height / 2
                    );
                    if (soundSystem) soundSystem.playEnemyHit();
                    if (!projectile.piercing) break; // Piercing projectiles continue
                }
            }
        }

        // Collision detection: enemy projectiles vs player
        for (const projectile of projectiles) {
            if (projectile.isPlayerProjectile || projectile.isDead()) continue;

            const pBounds = projectile.getBounds();
            const playerBounds = player.getBounds();

            if (aabbCollision(pBounds, playerBounds)) {
                player.takeDamage(projectile.damage, particleSystem);
                projectile.dead = true;
                particleSystem.emitHit(
                    projectile.x + projectile.width / 2,
                    projectile.y + projectile.height / 2
                );
            }
        }

        // Collision detection: enemies vs player (contact damage)
        if (!player.isDead && player.invulnerableTime <= 0) {
            const playerBounds = player.getBounds();
            for (const enemy of enemies) {
                if (enemy.isDead) continue;

                const eBounds = enemy.getBounds();
                if (aabbCollision(playerBounds, eBounds)) {
                    player.takeDamage(enemy.damage, particleSystem);
                    // Knockback
                    player.velocityX = enemy.x > player.x ? -200 : 200;
                    player.velocityY = -150;
                    break;
                }
            }
        }

        // Remove dead projectiles
        projectiles = projectiles.filter(p => !p.isDead());

        // Update particles
        particleSystem.update(dt);
    }

    // Update coin system (always, even when paused)
    if (coinSystem) {
        coinSystem.update(dt);
    }

    // Update shop UI if open
    if (gameState.showShop && shopUI) {
        shopUI.handleInput(input);
        shopUI.update(dt);
    }

    // Handle shop opening
    if (input.shopOpen) {
        input.shopOpen = false;
        if (shopUI && !gameState.showShop) {
            shopUI.open();
        }
    }
}

// AABB collision helper
function aabbCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function render() {
    ctx.save();

    // Apply screen shake
    if (screenShake) {
        screenShake.apply(ctx);
    }

    // Render tilemap (includes background)
    if (levelManager.currentMap) {
        levelManager.currentMap.render(ctx, camera);
    }

    // Render pickups
    for (const pickup of pickups) {
        pickup.render(ctx, camera);
    }

    // Render checkpoints
    for (const checkpoint of checkpoints) {
        checkpoint.render(ctx, camera);
    }

    // Render enemies
    for (const enemy of enemies) {
        enemy.render(ctx, camera);
    }

    // Render player
    if (player) {
        player.render(ctx, camera);
    }

    // Render projectiles
    for (const projectile of projectiles) {
        projectile.render(ctx, camera);
    }

    // Render particles
    particleSystem.render(ctx, camera);

    ctx.restore();

    // Render HUD (not affected by screen shake)
    drawHUD();

    // Render transition effect
    levelManager.renderTransition(ctx);

    // Render menus
    if (gameState.showMenu) {
        drawStartMenu();
    } else if (gameState.gameOver) {
        drawGameOverMenu();
    } else if (gameState.paused && (!levelEditor || !levelEditor.active)) {
        drawPauseMenu();
    }

    // Render coin popups and notifications
    if (coinSystem) {
        coinSystem.renderPopups(ctx, camera);
        coinSystem.renderNotification(ctx);
    }

    // Render shop UI
    if (gameState.showShop && shopUI) {
        shopUI.render(ctx);
    }

    // Render achievement notifications
    if (achievementSystem) {
        achievementSystem.render(ctx);
    }

    // Render level editor
    if (levelEditor && levelEditor.active) {
        levelEditor.render(ctx);
    }
}

function gameLoop(timestamp) {
    if (!gameState.running) return;

    if (lastTime === 0) lastTime = timestamp;

    updateTiming(timestamp);

    // Handle menu input
    if (gameState.showMenu) {
        if (input.consumeEnter()) {
            startGame();
        }
        render();
    } else if (gameState.gameOver) {
        if (input.consumeEnter()) {
            restartGame();
        }
        render();
    } else {
        update(deltaTime);
        render();
    }

    requestAnimationFrame(gameLoop);
}

function startGame() {
    gameState.showMenu = false;
    gameState.started = true;
    gameState.gameOver = false;
    gameState.score = 0;

    // Initialize audio on user interaction
    if (soundSystem) {
        soundSystem.init();
        soundSystem.resume();
        soundSystem.startMusic();
    }

    // Reset player and load first level
    player.fullReset();
    levelManager.loadLevel(0);
}

function restartGame() {
    // Save high score
    if (highScoreSystem) {
        highScoreSystem.addScore(gameState.score, gameState.currentLevel);
    }

    gameState.gameOver = false;
    gameState.started = true;
    gameState.score = 0;

    // Reset player and load first level
    player.fullReset();
    player.health = player.maxHealth;
    player.isDead = false;
    levelManager.loadLevel(0);

    if (soundSystem) {
        soundSystem.startMusic();
    }
}

// Global systems for new features
let saveSystem = null;
let fullscreenManager = null;
let levelEditor = null;

function init() {
    console.log('DOOM Platformer initialized');
    console.log(`Canvas: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}`);
    console.log(`Tile size: ${TILE_SIZE}px`);

    // Create camera
    camera = new Camera(CANVAS_WIDTH, CANVAS_HEIGHT);

    // Create particle system
    particleSystem = new ParticleSystem();

    // Create sound system
    soundSystem = new SoundSystem();

    // Create screen shake
    screenShake = new ScreenShake();

    // Create high score system
    highScoreSystem = new HighScoreSystem();

    // Create achievement system
    achievementSystem = new AchievementSystem();

    // Create coin system and skin manager
    coinSystem = new CoinSystem();
    skinManager = new SkinManager();
    shopUI = new ShopUI();

    // Create save system
    saveSystem = new SaveSystem();

    // Create fullscreen manager
    fullscreenManager = new FullscreenManager(document.documentElement);

    // Create level editor
    levelEditor = new LevelEditor();

    // Create player (position will be set by level manager)
    player = new Player(0, 0);

    // Create level manager and load first level
    levelManager = new LevelManager();
    levelManager.loadLevel(0);

    // Start with menu
    gameState.showMenu = true;
    gameState.started = false;

    // Add canvas click handler for level editor
    canvas.addEventListener('click', (e) => {
        if (levelEditor && levelEditor.active) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            levelEditor.handleClick(mouseX, mouseY);
        }
    });

    requestAnimationFrame(gameLoop);
}

window.addEventListener('load', init);

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        gameState.paused = true;
        if (soundSystem) soundSystem.stopMusic();
    } else {
        gameState.paused = false;
        lastTime = 0;
    }
});
