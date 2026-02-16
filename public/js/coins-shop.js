/**
 * Coins and Shop System Module
 * Currency system, skin definitions, skin manager, and shop UI
 */

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
