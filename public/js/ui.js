// DOOM Platformer - UI & Menus - All rendering functions for HUD, menus, and screens

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

    // Login/Register button
    ctx.font = 'bold 16px Impact';
    if (gameState.isLoggedIn && gameState.user) {
        ctx.fillStyle = '#00ff00';
        ctx.fillText(`Logged in as: ${gameState.user.username}`, CANVAS_WIDTH / 2, 375);
        ctx.font = '12px Impact';
        ctx.fillStyle = '#888';
        ctx.fillText(`Rank: #${gameState.user.rank || '?'} | Coins: ${gameState.user.coins || 0}`, CANVAS_WIDTH / 2, 390);
    } else {
        ctx.fillStyle = '#4488ff';
        ctx.fillText('Press M to Login/Register (Online Features)', CANVAS_WIDTH / 2, 375);
    }

    // Help and Tutorial buttons
    ctx.font = 'bold 14px Impact';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText('H - Nápověda | T - Tutorial', CANVAS_WIDTH / 2, 405);

    // Controls preview
    ctx.font = 'bold 12px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText('ZÁKLADNÍ OVLÁDÁNÍ:', CANVAS_WIDTH / 2, 430);
    ctx.font = '11px Courier New, monospace';
    ctx.fillStyle = '#666';
    ctx.fillText('WASD - Pohyb | J/Z - Střelba | Q/E - Změna zbraně', CANVAS_WIDTH / 2, 448);
    ctx.fillText('Stiskni H pro kompletní nápovědu', CANVAS_WIDTH / 2, 463);

    // High scores and achievements
    const highScore = highScoreSystem ? highScoreSystem.getHighScore() : 0;
    ctx.font = 'bold 14px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText(`LOCAL HIGH SCORE: ${highScore}`, CANVAS_WIDTH / 2 - 100, 485);

    if (achievementSystem) {
        ctx.fillStyle = '#aa88ff';
        ctx.fillText(`ACHIEVEMENTS: ${achievementSystem.getUnlockedCount()}/${achievementSystem.getTotalCount()}`, CANVAS_WIDTH / 2 + 100, 485);
    }

    // Skin info
    if (skinManager) {
        ctx.font = '11px Impact';
        ctx.fillStyle = '#888';
        ctx.fillText(`Skin: ${skinManager.getEquippedSkin().name}`, CANVAS_WIDTH / 2, 505);
    }

    // Version info
    ctx.font = '10px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('v3.5 - Online Edition', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 10);
}

function drawAuthScreen() {
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Title
    ctx.font = 'bold 32px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#8b0000';
    ctx.textAlign = 'center';
    ctx.fillText(gameState.authMode === 'login' ? 'LOGIN' : 'REGISTER', CANVAS_WIDTH / 2, 100);

    // Mode toggle hint
    ctx.font = '14px Impact';
    ctx.fillStyle = '#666';
    ctx.fillText(`Press TAB to switch to ${gameState.authMode === 'login' ? 'Register' : 'Login'}`, CANVAS_WIDTH / 2, 130);

    const formY = 180;
    const fieldHeight = 50;

    // Username field
    drawInputField('Username:', authForm.username, formY, authForm.activeField === 'username');

    // Email field (register only)
    if (gameState.authMode === 'register') {
        drawInputField('Email:', authForm.email, formY + fieldHeight, authForm.activeField === 'email');
        drawInputField('Password:', '*'.repeat(authForm.password.length), formY + fieldHeight * 2, authForm.activeField === 'password');
    } else {
        drawInputField('Password:', '*'.repeat(authForm.password.length), formY + fieldHeight, authForm.activeField === 'password');
    }

    // Error message
    if (authForm.error) {
        ctx.font = 'bold 14px Impact';
        ctx.fillStyle = '#ff4444';
        ctx.fillText(authForm.error, CANVAS_WIDTH / 2, formY + (gameState.authMode === 'register' ? 180 : 140));
    }

    // Instructions
    const instructY = formY + (gameState.authMode === 'register' ? 220 : 180);
    ctx.font = '12px Impact';
    ctx.fillStyle = '#888';
    ctx.fillText('Type to enter text | ENTER to submit | ESC to cancel', CANVAS_WIDTH / 2, instructY);
    ctx.fillText('UP/DOWN or Click to switch fields | TAB to switch mode', CANVAS_WIDTH / 2, instructY + 20);

    // Submit button (visual)
    const buttonY = instructY + 50;
    const isHoverButton = false; // Simple version
    ctx.fillStyle = isHoverButton ? '#00ff00' : '#00aa00';
    ctx.fillRect(CANVAS_WIDTH / 2 - 100, buttonY, 200, 40);
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(CANVAS_WIDTH / 2 - 100, buttonY, 200, 40);
    
    ctx.font = 'bold 16px Impact';
    ctx.fillStyle = '#000';
    ctx.fillText(gameState.authMode === 'login' ? 'LOGIN' : 'REGISTER', CANVAS_WIDTH / 2, buttonY + 25);
}

function drawInputField(label, value, y, active) {
    const fieldWidth = 400;
    const fieldHeight = 35;
    const x = CANVAS_WIDTH / 2 - fieldWidth / 2;

    // Label
    ctx.font = 'bold 14px Impact';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'left';
    ctx.fillText(label, x, y - 10);

    // Field background
    ctx.fillStyle = active ? '#1a1a1a' : '#0a0a0a';
    ctx.fillRect(x, y, fieldWidth, fieldHeight);

    // Field border
    ctx.strokeStyle = active ? '#00ff00' : '#444';
    ctx.lineWidth = active ? 3 : 2;
    ctx.strokeRect(x, y, fieldWidth, fieldHeight);

    // Value text
    ctx.font = '16px Courier New, monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(value + (active ? '|' : ''), x + 10, y + 23);
}

function drawTutorial() {
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const step = TUTORIAL_STEPS[gameState.tutorialStep];
    if (!step) return;

    // Window background
    const boxWidth = 600;
    const boxHeight = 400;
    const boxX = (CANVAS_WIDTH - boxWidth) / 2;
    const boxY = (CANVAS_HEIGHT - boxHeight) / 2;

    // Box shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(boxX + 5, boxY + 5, boxWidth, boxHeight);

    // Box background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    // Box border
    ctx.strokeStyle = '#8b0000';
    ctx.lineWidth = 4;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX + 3, boxY + 3, boxWidth - 6, boxHeight - 6);

    // Title
    ctx.font = 'bold 28px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#ff4444';
    ctx.textAlign = 'center';
    ctx.fillText(step.title, CANVAS_WIDTH / 2, boxY + 50);

    // Step indicator
    ctx.font = '14px Impact';
    ctx.fillStyle = '#666';
    ctx.fillText(`Krok ${gameState.tutorialStep + 1} / ${TUTORIAL_STEPS.length}`, CANVAS_WIDTH / 2, boxY + 75);

    // Content
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    let contentY = boxY + 110;
    
    step.content.forEach(line => {
        if (line === '') {
            contentY += 10;
        } else if (line.includes('TIP:') || line.includes('CÍL:')) {
            ctx.fillStyle = '#ffaa00';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(line, boxX + 30, contentY);
            ctx.font = '16px Arial';
            contentY += 25;
        } else if (line.startsWith('  •')) {
            ctx.fillStyle = '#ccc';
            ctx.fillText(line, boxX + 50, contentY);
            contentY += 22;
        } else if (line.startsWith('Stiskni ENTER')) {
            const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
            ctx.globalAlpha = pulse;
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 16px Impact';
            ctx.textAlign = 'center';
            ctx.fillText(line, CANVAS_WIDTH / 2, contentY);
            ctx.globalAlpha = 1;
            ctx.font = '16px Arial';
            ctx.textAlign = 'left';
            contentY += 25;
        } else {
            ctx.fillStyle = '#fff';
            ctx.fillText(line, boxX + 30, contentY);
            contentY += 22;
        }
    });

    // Buttons
    const btnY = boxY + boxHeight - 60;
    
    // Skip button
    ctx.fillStyle = '#444';
    ctx.fillRect(boxX + 30, btnY, 120, 35);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX + 30, btnY, 120, 35);
    ctx.font = 'bold 14px Impact';
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'center';
    ctx.fillText('ESC - Přeskočit', boxX + 90, btnY + 22);

    // Step indicator dots
    const dotStartX = CANVAS_WIDTH / 2 - (TUTORIAL_STEPS.length * 15) / 2;
    for (let i = 0; i < TUTORIAL_STEPS.length; i++) {
        ctx.fillStyle = i === gameState.tutorialStep ? '#ff4444' : '#333';
        ctx.beginPath();
        ctx.arc(dotStartX + i * 15, btnY + 17, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawHelp() {
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Window background
    const boxWidth = 700;
    const boxHeight = 520;
    const boxX = (CANVAS_WIDTH - boxWidth) / 2;
    const boxY = (CANVAS_HEIGHT - boxHeight) / 2;

    // Box shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(boxX + 5, boxY + 5, boxWidth, boxHeight);

    // Box background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    // Box border
    ctx.strokeStyle = '#8b0000';
    ctx.lineWidth = 4;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX + 3, boxY + 3, boxWidth - 6, boxHeight - 6);

    // Title
    ctx.font = 'bold 32px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#ff4444';
    ctx.textAlign = 'center';
    ctx.fillText('📖 NÁPOVĚDA', CANVAS_WIDTH / 2, boxY + 45);

    let contentY = boxY + 80;
    const leftCol = boxX + 30;
    const rightCol = boxX + boxWidth / 2 + 20;

    // Left column - Controls
    ctx.font = 'bold 18px Impact';
    ctx.fillStyle = '#ffaa00';
    ctx.textAlign = 'left';
    ctx.fillText('🎮 OVLÁDÁNÍ:', leftCol, contentY);
    contentY += 25;

    ctx.font = '13px Courier New, monospace';
    HELP_CONTENT.controls.slice(0, 8).forEach(control => {
        ctx.fillStyle = '#00ff00';
        ctx.fillText(control.key, leftCol, contentY);
        ctx.fillStyle = '#ccc';
        ctx.fillText('- ' + control.desc, leftCol + 150, contentY);
        contentY += 18;
    });

    contentY += 10;
    ctx.font = 'bold 18px Impact';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText('⚙️ POKROČILÉ:', leftCol, contentY);
    contentY += 25;

    ctx.font = '13px Courier New, monospace';
    HELP_CONTENT.advanced.forEach(control => {
        ctx.fillStyle = '#00ff00';
        ctx.fillText(control.key, leftCol, contentY);
        ctx.fillStyle = '#ccc';
        ctx.fillText('- ' + control.desc, leftCol + 150, contentY);
        contentY += 18;
    });

    // Right column - Gameplay & Online
    contentY = boxY + 80;
    ctx.font = 'bold 18px Impact';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText('💡 GAMEPLAY TIPY:', rightCol, contentY);
    contentY += 25;

    ctx.font = '13px Arial';
    ctx.fillStyle = '#fff';
    HELP_CONTENT.gameplay.forEach(tip => {
        // Word wrap
        const maxWidth = boxWidth / 2 - 60;
        const words = tip.split(' ');
        let line = '';
        
        words.forEach(word => {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && line !== '') {
                ctx.fillText(line, rightCol, contentY);
                line = word + ' ';
                contentY += 18;
            } else {
                line = testLine;
            }
        });
        ctx.fillText(line, rightCol, contentY);
        contentY += 20;
    });

    contentY += 5;
    ctx.font = 'bold 18px Impact';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText('🌐 ONLINE FEATURES:', rightCol, contentY);
    contentY += 25;

    ctx.font = '13px Arial';
    ctx.fillStyle = '#4488ff';
    HELP_CONTENT.online.forEach(feature => {
        ctx.fillText(feature, rightCol, contentY);
        contentY += 20;
    });

    // Close instruction
    const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
    ctx.globalAlpha = pulse;
    ctx.font = 'bold 16px Impact';
    ctx.fillStyle = '#00ff00';
    ctx.textAlign = 'center';
    ctx.fillText('Stiskni H nebo ESC pro zavření', CANVAS_WIDTH / 2, boxY + boxHeight - 25);
    ctx.globalAlpha = 1;
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
    
    // Return to menu button
    ctx.font = 'bold 14px Impact';
    ctx.fillStyle = '#ff5555';
    ctx.fillText('Press M to return to MENU', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 155);
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
        ctx.fillText('NEW LOCAL HIGH SCORE!', CANVAS_WIDTH / 2, 340);
    }

    // Online status
    if (gameState.isLoggedIn) {
        ctx.font = '14px Impact';
        ctx.fillStyle = '#4488ff';
        ctx.fillText('✓ Score submitted to online leaderboard', CANVAS_WIDTH / 2, 370);
    } else {
        ctx.font = '14px Impact';
        ctx.fillStyle = '#888';
        ctx.fillText('Press M to login and compete online', CANVAS_WIDTH / 2, 370);
    }

    // Restart prompt
    ctx.font = 'bold 18px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#00aa00';
    const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
    ctx.globalAlpha = pulse;
    ctx.fillText('PRESS ENTER TO PLAY AGAIN', CANVAS_WIDTH / 2, 420);
    ctx.globalAlpha = 1;
}

function drawVictoryScreen() {
    // Bright overlay with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, 'rgba(139, 0, 0, 0.9)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Victory text with glow
    const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 20 * pulse;
    ctx.font = 'bold 56px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#ffdd00';
    ctx.textAlign = 'center';
    ctx.fillText('VICTORY!', CANVAS_WIDTH / 2, 150);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.font = 'bold 24px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#ff6600';
    ctx.fillText('THE CYBERDEMON HAS BEEN DEFEATED!', CANVAS_WIDTH / 2, 200);

    // Final score with bonus
    ctx.font = 'bold 28px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`FINAL SCORE: ${gameState.score}`, CANVAS_WIDTH / 2, 270);
    
    ctx.font = 'bold 18px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#88ff88';
    ctx.fillText('(+5000 Victory Bonus)', CANVAS_WIDTH / 2, 300);

    // Stats
    if (player) {
        ctx.font = 'bold 16px Impact, Arial Black, sans-serif';
        ctx.fillStyle = '#cccccc';
        ctx.fillText(`Shots Fired: ${player.stats.shotsFired}`, CANVAS_WIDTH / 2, 350);
        ctx.fillText(`Damage Taken: ${Math.floor(player.stats.damageTaken)}`, CANVAS_WIDTH / 2, 375);
        ctx.fillText(`Levels Completed: 4`, CANVAS_WIDTH / 2, 400);
    }

    // High score check
    const highScore = highScoreSystem ? highScoreSystem.getHighScore() : 0;
    if (gameState.score >= highScore) {
        ctx.font = 'bold 22px Impact, Arial Black, sans-serif';
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 15;
        ctx.fillText('★ NEW HIGH SCORE! ★', CANVAS_WIDTH / 2, 450);
        ctx.shadowBlur = 0;
    }

    // Play again prompt
    ctx.font = 'bold 18px Impact, Arial Black, sans-serif';
    ctx.fillStyle = '#00ff00';
    const promptPulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
    ctx.globalAlpha = promptPulse;
    ctx.fillText('PRESS ENTER TO PLAY AGAIN', CANVAS_WIDTH / 2, 510);
    ctx.globalAlpha = 1;
}
