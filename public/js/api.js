/**
 * DOOM Platformer - API Client
 * Handles backend communication for authentication, scores, and game saves
 */

const API_URL = 'http://localhost:3000/api';

const API = {
    async register(username, email, password) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        return await response.json();
    },

    async login(username, password) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return await response.json();
    },

    async getProfile() {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    async submitScore(score, level, coins) {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        const response = await fetch(`${API_URL}/scores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ score, level, coins })
        });
        return await response.json();
    },

    async getLeaderboard(timeframe = 'all', limit = 10) {
        const response = await fetch(`${API_URL}/leaderboard?timeframe=${timeframe}&limit=${limit}`);
        return await response.json();
    },

    async saveGame(saveData) {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        const response = await fetch(`${API_URL}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ saveData })
        });
        return await response.json();
    },

    async loadGame() {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        const response = await fetch(`${API_URL}/save`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        return data.saveData || null;
    }
};

// Auth form state
const authForm = {
    username: '',
    email: '',
    password: '',
    error: '',
    activeField: 'username',
    cursor: 0
};

// Auth form helpers
function resetAuthForm() {
    authForm.username = '';
    authForm.email = '';
    authForm.password = '';
    authForm.error = '';
    authForm.activeField = 'username';
}

function handleAuthInput(e) {
    // ESC to close
    if (e.code === 'Escape') {
        gameState.showAuth = false;
        return;
    }

    // TAB to switch mode
    if (e.code === 'Tab') {
        gameState.authMode = gameState.authMode === 'login' ? 'register' : 'login';
        authForm.activeField = 'username';
        authForm.error = '';
        return;
    }

    // Arrow keys to switch fields
    if (e.code === 'ArrowUp') {
        const fields = gameState.authMode === 'register' ? ['username', 'email', 'password'] : ['username', 'password'];
        const idx = fields.indexOf(authForm.activeField);
        authForm.activeField = fields[(idx - 1 + fields.length) % fields.length];
        return;
    }
    if (e.code === 'ArrowDown') {
        const fields = gameState.authMode === 'register' ? ['username', 'email', 'password'] : ['username', 'password'];
        const idx = fields.indexOf(authForm.activeField);
        authForm.activeField = fields[(idx + 1) % fields.length];
        return;
    }

    // ENTER to submit
    if (e.code === 'Enter') {
        submitAuthForm();
        return;
    }

    // Backspace
    if (e.code === 'Backspace') {
        if (authForm[authForm.activeField].length > 0) {
            authForm[authForm.activeField] = authForm[authForm.activeField].slice(0, -1);
        }
        return;
    }

    // Type characters
    if (e.key.length === 1) {
        const maxLen = authForm.activeField === 'email' ? 50 : 20;
        if (authForm[authForm.activeField].length < maxLen) {
            authForm[authForm.activeField] += e.key;
        }
    }
}

async function submitAuthForm() {
    authForm.error = '';

    // Validation
    if (!authForm.username || authForm.username.length < 3) {
        authForm.error = 'Username must be at least 3 characters';
        return;
    }
    if (!authForm.password || authForm.password.length < 6) {
        authForm.error = 'Password must be at least 6 characters';
        return;
    }
    if (gameState.authMode === 'register' && !authForm.email) {
        authForm.error = 'Email is required';
        return;
    }

    try {
        let result;
        if (gameState.authMode === 'register') {
            result = await API.register(authForm.username, authForm.email, authForm.password);
        } else {
            result = await API.login(authForm.username, authForm.password);
        }

        if (result.error) {
            authForm.error = result.error;
        } else if (result.token) {
            // Success!
            localStorage.setItem('token', result.token);
            gameState.token = result.token;
            gameState.isLoggedIn = true;
            gameState.user = result.user;
            gameState.showAuth = false;
            
            console.log('Auth success:', result.user.username);
            
            // Update rank
            API.getProfile().then(data => {
                if (data && !data.error) {
                    gameState.user = data;
                }
            });
        }
    } catch (error) {
        console.error('Auth error:', error);
        authForm.error = 'Connection error. Is the server running?';
    }
}

// Initialize auth on load
function initAuth() {
    // Load token on startup
    if (localStorage.getItem('token')) {
        gameState.token = localStorage.getItem('token');
        gameState.isLoggedIn = true;
        
        // Load user profile
        API.getProfile().then(data => {
            if (data && !data.error) {
                gameState.user = data;
                console.log('Logged in as:', data.username);
            } else {
                localStorage.removeItem('token');
                gameState.isLoggedIn = false;
            }
        });
    }
}
