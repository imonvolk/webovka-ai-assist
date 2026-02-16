/**
 * Utility Classes Module
 * Various utility systems including screen shake, high scores, achievements, 
 * object pooling, spatial hashing, save/load, and fullscreen management
 */

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
