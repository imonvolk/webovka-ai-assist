// API Test Examples for Doom Platformer Backend
// Copy these into your browser console or use with fetch/axios

const API_URL = 'http://localhost:3000/api';
let token = null;

// ============================================================================
// 1. REGISTER NEW USER
// ============================================================================
async function registerUser() {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'testplayer',
            email: 'test@example.com',
            password: 'password123'
        })
    });
    const data = await response.json();
    console.log('Register:', data);
    
    if (data.token) {
        token = data.token;
        localStorage.setItem('token', token);
    }
    return data;
}

// ============================================================================
// 2. LOGIN
// ============================================================================
async function login() {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'testplayer',
            password: 'password123'
        })
    });
    const data = await response.json();
    console.log('Login:', data);
    
    if (data.token) {
        token = data.token;
        localStorage.setItem('token', token);
    }
    return data;
}

// ============================================================================
// 3. GET PROFILE
// ============================================================================
async function getProfile() {
    token = token || localStorage.getItem('token');
    const response = await fetch(`${API_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    console.log('Profile:', data);
    return data;
}

// ============================================================================
// 4. SUBMIT SCORE
// ============================================================================
async function submitScore(score, level, coins) {
    token = token || localStorage.getItem('token');
    const response = await fetch(`${API_URL}/scores`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score, level, coins })
    });
    const data = await response.json();
    console.log('Submit Score:', data);
    return data;
}

// ============================================================================
// 5. GET LEADERBOARD
// ============================================================================
async function getLeaderboard(timeframe = 'all') {
    const response = await fetch(`${API_URL}/leaderboard?timeframe=${timeframe}&limit=10`);
    const data = await response.json();
    console.log('Leaderboard:', data);
    return data;
}

// ============================================================================
// 6. SAVE GAME
// ============================================================================
async function saveGame(saveData) {
    token = token || localStorage.getItem('token');
    const response = await fetch(`${API_URL}/save`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            saveData: {
                level: saveData.level || 1,
                health: saveData.health || 100,
                coins: saveData.coins || 0,
                weapons: saveData.weapons || ['pistol'],
                checkpoint: saveData.checkpoint || { x: 0, y: 0 }
            }
        })
    });
    const data = await response.json();
    console.log('Save Game:', data);
    return data;
}

// ============================================================================
// 7. LOAD GAME
// ============================================================================
async function loadGame() {
    token = token || localStorage.getItem('token');
    const response = await fetch(`${API_URL}/save`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    console.log('Load Game:', data);
    return data;
}

// ============================================================================
// 8. GET STATS
// ============================================================================
async function getStats() {
    const response = await fetch(`${API_URL}/stats`);
    const data = await response.json();
    console.log('Stats:', data);
    return data;
}

// ============================================================================
// QUICK TEST SEQUENCE
// ============================================================================
async function runTests() {
    console.log('🧪 Running API Tests...\n');
    
    // Register
    console.log('1️⃣ Registering user...');
    await registerUser();
    
    // Submit some scores
    console.log('\n2️⃣ Submitting scores...');
    await submitScore(1500, 1, 50);
    await submitScore(3200, 2, 120);
    await submitScore(5800, 3, 200);
    
    // Get profile
    console.log('\n3️⃣ Getting profile...');
    await getProfile();
    
    // Save game
    console.log('\n4️⃣ Saving game...');
    await saveGame({
        level: 2,
        health: 75,
        coins: 150,
        weapons: ['pistol', 'shotgun'],
        checkpoint: { x: 500, y: 200 }
    });
    
    // Load game
    console.log('\n5️⃣ Loading game...');
    await loadGame();
    
    // Get leaderboard
    console.log('\n6️⃣ Getting leaderboard...');
    await getLeaderboard('all');
    
    // Get stats
    console.log('\n7️⃣ Getting stats...');
    await getStats();
    
    console.log('\n✅ All tests completed!');
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registerUser,
        login,
        getProfile,
        submitScore,
        getLeaderboard,
        saveGame,
        loadGame,
        getStats,
        runTests
    };
}

console.log(`
🎮 Doom Platformer API Test Suite
==================================
Available functions:
- registerUser()
- login()
- getProfile()
- submitScore(score, level, coins)
- getLeaderboard(timeframe)
- saveGame(saveData)
- loadGame()
- getStats()
- runTests() - Run all tests

Example:
await registerUser();
await submitScore(5000, 2, 100);
await getLeaderboard('all');
`);
