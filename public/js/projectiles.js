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
