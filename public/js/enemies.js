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
        this.health = 1000 * getDifficulty().enemyHealthMultiplier;
        this.maxHealth = this.health;
        this.damage = 40 * getDifficulty().enemyDamageMultiplier;
        this.detectionRange = 2000;
        this.moveSpeed = 240;

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
            this.moveSpeed = 280;
        } else if (this.phase === 3 && !this.enrageActivated) {
            this.enrageActivated = true;
            this.moveSpeed = 340;
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
        // Aggressively move towards player
        const dx = player.x - this.x;
        
        if (Math.abs(dx) > 100) {
            this.velocityX = Math.sign(dx) * this.moveSpeed * 0.8;
        }
        
        // Much shorter idle time - boss is constantly attacking
        if (this.attackTimer > 0.2) {
            this.attackCooldown = 0;
        }
    }

    executeFireballBarrage(dt, player, projectiles) {
        if (this.attackTimer === 0) {
            this.fireballCount = this.phase === 3 ? 16 : this.phase === 2 ? 10 : 6;
            this.velocityX = 0;
        }

        if (this.fireballCount > 0 && this.attackSubTimer <= 0) {
            const startX = this.x + this.width / 2;
            const startY = this.y + 30;
            const dx = player.x - startX;
            const dy = player.y - startY;
            const angle = Math.atan2(dy, dx);
            const spread = (Math.random() - 0.5) * 0.4;
            const speed = 350 + Math.random() * 150;

            const proj = new Projectile(
                startX,
                startY,
                Math.cos(angle + spread) * speed,
                Math.sin(angle + spread) * speed,
                false
            );
            proj.damage = 25 * getDifficulty().enemyDamageMultiplier;
            proj.color = '#ff4400';
            projectiles.push(proj);

            this.fireballCount--;
            this.attackSubTimer = this.phase === 3 ? 0.1 : 0.18;
            
            if (soundSystem) soundSystem.playTone(250, 0.05, 'square', 0.2);
            this.shakeIntensity = 3;
        }

        this.attackSubTimer -= dt;

        if (this.fireballCount <= 0 && this.attackSubTimer <= -0.2) {
            this.attackPattern = 'idle';
            this.attackCooldown = 0.2;
        }
    }

    executeSpiralShot(dt, player, projectiles) {
        if (this.attackTimer === 0) {
            this.spiralAngle = 0;
            this.waveCount = this.phase === 3 ? 40 : 25;
            this.velocityX = 0;
        }

        if (this.waveCount > 0 && this.attackSubTimer <= 0) {
            const startX = this.x + this.width / 2;
            const startY = this.y + this.height / 2;
            
            // Shoot 3 projectiles in spiral pattern
            for (let i = 0; i < 3; i++) {
                const angle = this.spiralAngle + (i * Math.PI * 2 / 3);
                const speed = 250;

                const proj = new Projectile(
                    startX,
                    startY,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    false
                );
                proj.damage = 18 * getDifficulty().enemyDamageMultiplier;
                proj.color = '#ff00ff';
                projectiles.push(proj);
            }

            this.spiralAngle += 0.4;
            this.waveCount--;
            this.attackSubTimer = 0.06;
            
            if (soundSystem) soundSystem.playTone(350 + Math.sin(this.spiralAngle) * 50, 0.03, 'sine', 0.15);
        }

        this.attackSubTimer -= dt;

        if (this.waveCount <= 0) {
            this.attackPattern = 'idle';
            this.attackCooldown = 0.3;
        }
    }

    executeGroundPound(dt, player, projectiles) {
        if (this.attackTimer === 0) {
            this.isGrounded = false;
            this.targetY = this.baseY - 120;
            this.groundPoundActive = false;
        }

        // Rise up faster
        if (!this.groundPoundActive && this.attackTimer < 0.6) {
            this.y = this.baseY - (this.attackTimer / 0.6) * 120;
            this.shakeIntensity = 5;
        }
        // Slam down
        else if (!this.groundPoundActive && this.attackTimer >= 0.6) {
            this.velocityY = 1000;
            this.groundPoundActive = true;
            if (soundSystem) soundSystem.playTone(60, 0.3, 'sawtooth', 0.4);
        }

        // Impact
        if (this.groundPoundActive && this.y >= this.baseY) {
            this.y = this.baseY;
            this.isGrounded = true;
            
            if (screenShake) screenShake.shake(18, 0.4);
            if (soundSystem) soundSystem.playTone(30, 0.5, 'sawtooth', 0.5);
            
            // Create shockwave projectiles - more waves, faster speed
            const numWaves = this.phase === 3 ? 12 : 8;
            for (let i = 0; i < numWaves; i++) {
                const angle = (i / numWaves) * Math.PI * 2;
                const speed = 250;
                const proj = new Projectile(
                    this.x + this.width / 2,
                    this.y + this.height,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    false
                );
                proj.damage = 30 * getDifficulty().enemyDamageMultiplier;
                proj.color = '#ffaa00';
                projectiles.push(proj);
            }
            
            if (particleSystem) {
                particleSystem.emitExplosion(this.x + this.width / 2, this.y + this.height, '#aa6600');
            }

            this.attackPattern = 'idle';
            this.attackCooldown = 0.4;
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

        // Sweep laser - faster sweep
        if (this.laserActive && this.attackTimer < 2.5) {
            const sweepProgress = (this.attackTimer - 1.2) / 1.3;
            this.laserAngle = -0.6 + sweepProgress * 1.2;

            // Spawn laser projectiles
            if (this.attackSubTimer <= 0) {
                const startX = this.x + (this.facingRight ? this.width : 0);
                const startY = this.y + 30;
                const speed = 700;

                const proj = new Projectile(
                    startX,
                    startY,
                    Math.cos(this.laserAngle) * speed * (this.facingRight ? 1 : -1),
                    Math.sin(this.laserAngle) * speed,
                    false
                );
                proj.damage = 22 * getDifficulty().enemyDamageMultiplier;
                proj.color = '#00ffff';
                proj.width = 10;
                proj.height = 10;
                projectiles.push(proj);

                this.attackSubTimer = 0.04;
            }
            this.attackSubTimer -= dt;
        }

        if (this.attackTimer >= 2.5) {
            this.laserActive = false;
            this.attackPattern = 'idle';
            this.attackCooldown = 0.4;
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

        if (this.attackTimer > 0.3 && this.attackTimer < 0.31) {
            // Teleport behind player faster
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

        if (this.attackTimer > 0.7) {
            this.attackPattern = 'idle';
            this.attackCooldown = 0.3;
            this.teleportCooldown = 2.0;
        }
    }

    executeSummonMinions(dt, player) {
        if (this.attackTimer === 0) {
            this.summonCount = this.phase === 3 ? 5 : 4;
            this.velocityX = 0;
        }

        if (this.summonCount > 0 && this.attackSubTimer <= 0) {
            // Spawn a minion
            const offsetX = (Math.random() - 0.5) * 300;
            const minionX = this.x + offsetX;
            const minionY = this.y;
            
            // Create different enemy types randomly
            const enemyTypes = ['patrol', 'shooter'];
            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            
            let minion;
            if (enemyType === 'shooter') {
                minion = new StationaryShooterEnemy(minionX, minionY);
            } else {
                minion = new GroundPatrolEnemy(minionX, minionY);
            }
            minion.health *= 0.6; // Reduced health
            
            // Add to global enemies array
            if (typeof enemies !== 'undefined' && enemies !== null) {
                enemies.push(minion);
            }

            if (particleSystem) {
                particleSystem.emitExplosion(minionX, minionY, '#ff00ff');
            }
            if (soundSystem) soundSystem.playTone(200, 0.2, 'square', 0.3);
            if (screenShake) screenShake.shake(8, 0.2);

            this.summonCount--;
            this.attackSubTimer = 0.5;
        }

        this.attackSubTimer -= dt;

        if (this.summonCount <= 0 && this.attackSubTimer <= -0.3) {
            this.attackPattern = 'idle';
            this.attackCooldown = 0.8;
        }
    }

    executeShockwave(dt, player, projectiles) {
        if (this.attackTimer === 0) {
            this.shockwaveRadius = 0;
            if (soundSystem) soundSystem.playTone(100, 1.0, 'sawtooth', 0.5);
        }

        this.shockwaveRadius += 500 * dt;

        // Spawn ring of projectiles - more projectiles, faster
        if (this.attackSubTimer <= 0) {
            const numProj = this.phase === 3 ? 24 : 20;
            for (let i = 0; i < numProj; i++) {
                const angle = (i / numProj) * Math.PI * 2;
                const spawnX = this.x + this.width / 2 + Math.cos(angle) * this.shockwaveRadius;
                const spawnY = this.y + this.height / 2 + Math.sin(angle) * this.shockwaveRadius;
                
                const proj = new Projectile(
                    spawnX,
                    spawnY,
                    Math.cos(angle) * 200,
                    Math.sin(angle) * 200,
                    false
                );
                proj.damage = 16 * getDifficulty().enemyDamageMultiplier;
                proj.color = '#ff0000';
                projectiles.push(proj);
            }
            this.attackSubTimer = 0.25;
        }

        this.attackSubTimer -= dt;

        if (this.attackTimer >= 1.2) {
            this.shockwaveRadius = 0;
            this.attackPattern = 'idle';
            this.attackCooldown = 0.4;
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
