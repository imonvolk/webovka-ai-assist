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
    transitionAlpha: 0
};

// FPS Counter element
const fpsCounter = document.getElementById('fps-counter');

// ============================================================================
// LEVEL DATA
// ============================================================================

const LEVELS = [
    // Level 1 - Introduction
    {
        name: "ENTRANCE TO HELL",
        playerStart: { x: 2, y: 13 },
        width: 40,
        height: 19,
        data: [
            "1111111111111111111111111111111111111111",
            "1000000000000000000000000000000000000001",
            "1000000000000000000000000000000000000001",
            "1000000000000000000000000000000000000001",
            "1000000000000000000000000000000000000001",
            "1000000000000000000000000000000000000001",
            "1000000000000000000000001111000000000001",
            "1000000000000000000000000000000000000001",
            "1000000000000000011100000000000000000001",
            "1000000000000000000000000000000011111111",
            "1000000000002220000000000000000010000001",
            "1000000000000000000000000022200010000051",
            "1000000001110000000000000000000010000011",
            "1000000000000000000000000000000010000001",
            "1000000000000000001111100000000010000001",
            "1000000000000000000000000000001110000001",
            "1000000000000000000000000000000000000001",
            "1111111111111111111333111111111111111111",
            "1111111111111111111111111111111111111111"
        ]
    },
    // Level 2 - Platforming Challenge
    {
        name: "THE BLOOD PITS",
        playerStart: { x: 2, y: 16 },
        width: 50,
        height: 19,
        data: [
            "11111111111111111111111111111111111111111111111111",
            "10000000000000000000000000000000000000000000000001",
            "10000000000000000000000000000000000000000000000001",
            "10000000000000000000000000000000000000000000000001",
            "10000000000000000000000000000000000000000000000051",
            "10000000000000000000000000000000000000000000001111",
            "10000000000000000000000000000000000000000011100001",
            "10000000000000000000000000000000000002220000000001",
            "10000000000000000000000000000001110000000000000001",
            "10000000000000000000000000000000000000000000000001",
            "10000000000000000000000011100000000000000000000001",
            "10000000000000000011100000000000000000000000000001",
            "10000000000001110000000000000000000000000000000001",
            "10000000000000000000000000000000000000000000000001",
            "10000002220000000000000000000000000000000000000001",
            "10000000000000000000000000000000000000000000000001",
            "10000000000000000000000000000000000000000000000001",
            "11111111111133331111333311113333111133331111111111",
            "11111111111111111111111111111111111111111111111111"
        ]
    },
    // Level 3 - Advanced Challenge
    {
        name: "DEMON'S LAIR",
        playerStart: { x: 2, y: 16 },
        width: 60,
        height: 19,
        data: [
            "111111111111111111111111111111111111111111111111111111111111",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000000000000000000000000000000000000000000000000000051",
            "100000000000000000000000000000000000000000000000000000011111",
            "100000000000000000000000000000000000000000000000000111000001",
            "100000000000000000000000000000000000000000000001110000000001",
            "100000000000000000000000000000000000000000022200000000000001",
            "100000000000000000000000000000000000000111000000000000000001",
            "100000000000000000000000000000000002220000000000000000000001",
            "100000000000000000000000000000011100000000000000000000000001",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000000000000000002220000000000000000000000000000000001",
            "100000000000000001110000000000000000000000000000000000000001",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000022200000000000000000000000000000000000000000000001",
            "100000111000000000000000000000000000000000000000000000000001",
            "111333111133311111333111113331111133311111333111113331111111",
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
            jump: false
        };
        this.jumpPressed = false;

        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(e) {
        if (!gameState.started) {
            gameState.started = true;
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
        }
    }

    consumeJump() {
        const pressed = this.jumpPressed;
        this.jumpPressed = false;
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
    }

    setBounds(levelWidth, levelHeight) {
        this.minX = 0;
        this.minY = 0;
        this.maxX = Math.max(0, levelWidth - this.width);
        this.maxY = Math.max(0, levelHeight - this.height);
    }

    follow(target, dt) {
        // Center camera on target
        this.targetX = target.x + target.width / 2 - this.width / 2;
        this.targetY = target.y + target.height / 2 - this.height / 2;

        // Smooth camera movement
        this.x += (this.targetX - this.x) * this.smoothing * dt;
        this.y += (this.targetY - this.y) * this.smoothing * dt;

        // Clamp to bounds
        this.x = Math.max(this.minX, Math.min(this.maxX, this.x));
        this.y = Math.max(this.minY, Math.min(this.maxY, this.y));
    }

    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
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
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isGrounded = false;
        this.isDead = false;
        this.respawnTimer = 0;
        this.state = 'idle';
    }

    update(dt, input, tileMap) {
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

        this.wasGrounded = this.isGrounded;

        // Decay visual effects
        this.landingSquash *= Math.pow(0.001, dt);
        this.jumpStretch *= Math.pow(0.001, dt);

        // Handle movement
        this.handleMovement(dt, input);
        this.handleJump(dt, input);
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

    handleJump(dt, input) {
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
        const w = this.width;
        const h = this.height;

        let bobOffset = 0;
        let armOffset = 0;
        if (this.state === 'walking') {
            bobOffset = Math.sin(this.animationTime * this.walkCycleSpeed * Math.PI * 2) * 2;
            armOffset = Math.sin(this.animationTime * this.walkCycleSpeed * Math.PI * 2) * 4;
        }

        // Legs
        ctx.fillStyle = '#152515';
        ctx.fillRect(3, h - 18 + bobOffset, 9, 18 - bobOffset);
        ctx.fillRect(w - 12, h - 18 - bobOffset, 9, 18 + bobOffset);

        // Body
        const bodyGradient = ctx.createLinearGradient(0, 0, w, 0);
        bodyGradient.addColorStop(0, '#1a3a1a');
        bodyGradient.addColorStop(0.5, '#2a5a2a');
        bodyGradient.addColorStop(1, '#1a3a1a');
        ctx.fillStyle = bodyGradient;
        ctx.fillRect(2, 14, w - 4, h - 32);

        // Chest armor
        ctx.fillStyle = '#2a5a2a';
        ctx.fillRect(5, 18, w - 10, 16);

        // Armor highlight
        ctx.fillStyle = '#3a7a3a';
        ctx.fillRect(7, 20, w - 14, 3);

        // Belt
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(3, h - 22, w - 6, 5);

        // Arms
        ctx.fillStyle = '#1a3a1a';
        ctx.fillRect(-1, 16 - armOffset, 6, 20);
        ctx.fillRect(w - 5, 16 + armOffset, 6, 20);

        // Helmet
        ctx.fillStyle = '#1a3a1a';
        ctx.fillRect(3, 0, w - 6, 16);

        // Visor
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = this.state === 'idle' ? 10 : 15;
        ctx.fillStyle = this.getVisorColor();
        ctx.fillRect(6, 4, w - 12, 7);
        ctx.shadowBlur = 0;

        // Visor reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(7, 5, 5, 2);

        // Jet effect when jumping
        if (this.state === 'jumping' && this.velocityY < -200) {
            ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
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
        if (this.isDead) return '#ff0000';
        switch (this.state) {
            case 'jumping': return '#00ff88';
            case 'falling': return '#88ff00';
            case 'walking': return '#00dd00';
            default:
                const pulse = Math.sin(this.animationTime * 2) * 0.2 + 0.8;
                return `rgb(0, ${Math.floor(170 * pulse)}, 0)`;
        }
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

    // Instructions (only at start)
    if (!gameState.started) {
        ctx.font = 'bold 16px Impact, Arial Black, sans-serif';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('PRESS ANY KEY TO START', CANVAS_WIDTH / 2, 50);
    }

    // Debug info
    ctx.font = '11px Courier New, monospace';
    ctx.fillStyle = '#444';
    ctx.textAlign = 'left';

    const debugY = CANVAS_HEIGHT - 10;
    ctx.fillText(`Pos: ${Math.floor(player.x)}, ${Math.floor(player.y)} | ${player.state}`, 10, debugY);
}

function update(dt) {
    levelManager.update(dt);

    if (gameState.started && player && !levelManager.transitioning) {
        player.update(dt, input, levelManager.currentMap);
        camera.follow(player, dt);
    }
}

function render() {
    // Render tilemap (includes background)
    if (levelManager.currentMap) {
        levelManager.currentMap.render(ctx, camera);
    }

    // Render player
    if (player) {
        player.render(ctx, camera);
    }

    // Render HUD
    drawHUD();

    // Render transition effect
    levelManager.renderTransition(ctx);
}

function gameLoop(timestamp) {
    if (!gameState.running) return;

    if (lastTime === 0) lastTime = timestamp;

    updateTiming(timestamp);

    if (!gameState.paused) {
        update(deltaTime);
        render();
    }

    requestAnimationFrame(gameLoop);
}

function init() {
    console.log('DOOM Platformer initialized');
    console.log(`Canvas: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}`);
    console.log(`Tile size: ${TILE_SIZE}px`);

    // Create camera
    camera = new Camera(CANVAS_WIDTH, CANVAS_HEIGHT);

    // Create player (position will be set by level manager)
    player = new Player(0, 0);

    // Create level manager and load first level
    levelManager = new LevelManager();
    levelManager.loadLevel(0);

    requestAnimationFrame(gameLoop);
}

window.addEventListener('load', init);

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        gameState.paused = true;
    } else {
        gameState.paused = false;
        lastTime = 0;
    }
});
