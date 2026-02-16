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
