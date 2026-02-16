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
        // Set position to provided coordinates (which may be checkpoint or start)
        this.x = x;
        this.y = y;
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
        // Keep checkpoint on respawn - don't clear it
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
                // Respawn at checkpoint if available, otherwise at level start
                if (this.hasCheckpoint) {
                    this.reset(this.checkpointX, this.checkpointY);
                } else {
                    this.reset(
                        tileMap.playerStart.x * TILE_SIZE,
                        tileMap.playerStart.y * TILE_SIZE
                    );
                }
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

        // Don't trigger game over - just respawn at checkpoint
        // gameState.gameOver = true;
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
                const shootDir = this.shoot(input, projectiles, particleSystem);
                this.shootCooldown = weapon.fireRate;
                if (this.currentWeapon !== 'pistol') {
                    this.ammo[this.currentWeapon]--;
                }
                
                // Rocket jumping - if shooting down with rocket launcher
                if (this.currentWeapon === 'rocket' && shootDir.y > 0.5) {
                    // Apply upward velocity for rocket jump - much stronger
                    this.velocityY = -650;
                    if (screenShake) screenShake.shake(15, 0.3);
                }
            }
        }
    }

    shoot(input, projectiles, particleSystem) {
        const weapon = WEAPONS[this.currentWeapon];
        
        // Determine shoot direction based on input
        let shootAngle = 0;
        let aimingUp = false;
        let aimingDown = false;
        
        if (input.keys.up && input.keys.shoot) {
            shootAngle = -Math.PI / 2; // Straight up
            aimingUp = true;
        } else if (input.keys.down && input.keys.shoot) {
            shootAngle = Math.PI / 2; // Straight down
            aimingDown = true;
        } else {
            // Normal horizontal shooting
            shootAngle = this.facingRight ? 0 : Math.PI;
        }
        
        const startX = this.x + this.width / 2;
        const startY = aimingUp ? this.y : aimingDown ? this.y + this.height : this.y + this.height / 2 - 4;
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
            const finalAngle = shootAngle + spread;
            const vx = Math.cos(finalAngle) * weapon.projectileSpeed;
            const vy = Math.sin(finalAngle) * weapon.projectileSpeed;

            const projectile = new Projectile(startX, startY, vx, vy, true, this.currentWeapon);
            projectile.damage = weapon.damage;
            projectiles.push(projectile);
        }

        this.stats.shotsFired++;
        
        // Return shoot direction for rocket jumping
        return {
            x: Math.cos(shootAngle),
            y: Math.sin(shootAngle)
        };
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
