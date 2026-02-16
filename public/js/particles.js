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
