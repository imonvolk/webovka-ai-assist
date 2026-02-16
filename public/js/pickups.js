// ============================================================================
// PICKUPS & CHECKPOINTS
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
