const { createClient } = require('@supabase/supabase-js');

// ============================================================================
// SUPABASE INITIALIZATION
// ============================================================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initDatabase() {
    // Test connection by querying users table
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) {
        console.error('❌ Supabase connection error:', error.message);
        console.error('Make sure you ran supabase-migration.sql in your Supabase SQL Editor!');
        throw error;
    }
    console.log('✅ Supabase connected successfully');
}

// ============================================================================
// EXPORTED FUNCTIONS (all async – returning Promises)
// ============================================================================

module.exports = {
    init: initDatabase,
    supabase, // expose client if needed elsewhere

    // ── User functions ──────────────────────────────────────────────────

    getUserByUsername: async (username) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .maybeSingle();
        if (error) throw error;
        return data;
    },

    getUserByEmail: async (email) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();
        if (error) throw error;
        return data;
    },

    getUserById: async (id) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error) throw error;
        return data;
    },

    createUser: async (username, email, password) => {
        const { data, error } = await supabase
            .from('users')
            .insert({ username, email, password })
            .select('id')
            .single();
        if (error) throw error;
        return data.id;
    },

    updateLastLogin: async (id) => {
        const { error } = await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
    },

    updateHighScore: async (id, score) => {
        const { error } = await supabase
            .from('users')
            .update({ high_score: score })
            .eq('id', id);
        if (error) throw error;
    },

    updateCoins: async (id, coins) => {
        const { error } = await supabase
            .from('users')
            .update({ coins })
            .eq('id', id);
        if (error) throw error;
    },

    incrementGamesPlayed: async (id) => {
        // Fetch current value then increment
        const { data: user, error: fetchErr } = await supabase
            .from('users')
            .select('games_played')
            .eq('id', id)
            .single();
        if (fetchErr) throw fetchErr;

        const { error } = await supabase
            .from('users')
            .update({ games_played: (user.games_played || 0) + 1 })
            .eq('id', id);
        if (error) throw error;
    },

    // ── Score functions ─────────────────────────────────────────────────

    submitScore: async (userId, score, level, coins) => {
        const { data, error } = await supabase
            .from('scores')
            .insert({ user_id: userId, score, level, coins })
            .select('id')
            .single();
        if (error) throw error;
        return data.id;
    },

    getUserScores: async (userId, limit = 10) => {
        const { data, error } = await supabase
            .from('scores')
            .select('score, level, coins, created_at')
            .eq('user_id', userId)
            .order('score', { ascending: false })
            .limit(limit);
        if (error) throw error;
        return data || [];
    },

    getAllTimeLeaderboard: async (limit = 100) => {
        const { data, error } = await supabase
            .from('users')
            .select('username, high_score, coins, games_played')
            .gt('high_score', 0)
            .order('high_score', { ascending: false })
            .limit(limit);
        if (error) throw error;
        // Map high_score -> score for API compatibility
        return (data || []).map(u => ({
            username: u.username,
            score: u.high_score,
            coins: u.coins,
            games_played: u.games_played
        }));
    },

    getDailyLeaderboard: async (limit = 100) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        const { data, error } = await supabase
            .rpc('get_daily_leaderboard', { since: todayISO, lim: limit });

        if (error) {
            // Fallback: simple query if RPC not available
            console.warn('Daily leaderboard RPC not available, using fallback');
            const { data: scores, error: err2 } = await supabase
                .from('scores')
                .select('user_id, score, coins, users!inner(username)')
                .gte('created_at', todayISO)
                .order('score', { ascending: false })
                .limit(limit);
            if (err2) throw err2;
            return (scores || []).map(s => ({
                username: s.users.username,
                score: s.score,
                coins: s.coins,
                games_played: 1
            }));
        }
        return data || [];
    },

    getWeeklyLeaderboard: async (limit = 100) => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        const weekAgoISO = weekAgo.toISOString();

        const { data, error } = await supabase
            .rpc('get_weekly_leaderboard', { since: weekAgoISO, lim: limit });

        if (error) {
            // Fallback: simple query if RPC not available
            console.warn('Weekly leaderboard RPC not available, using fallback');
            const { data: scores, error: err2 } = await supabase
                .from('scores')
                .select('user_id, score, coins, users!inner(username)')
                .gte('created_at', weekAgoISO)
                .order('score', { ascending: false })
                .limit(limit);
            if (err2) throw err2;
            return (scores || []).map(s => ({
                username: s.users.username,
                score: s.score,
                coins: s.coins,
                games_played: 1
            }));
        }
        return data || [];
    },

    getUserRank: async (userId) => {
        // Get user's high score
        const { data: user, error: userErr } = await supabase
            .from('users')
            .select('high_score')
            .eq('id', userId)
            .single();
        if (userErr) throw userErr;

        // Count users with higher score
        const { count, error } = await supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .gt('high_score', user.high_score || 0);
        if (error) throw error;

        return (count || 0) + 1;
    },

    // ── Game save functions ─────────────────────────────────────────────

    saveGameProgress: async (userId, saveData) => {
        // Upsert: insert or update on conflict (user_id is UNIQUE)
        const { error } = await supabase
            .from('game_saves')
            .upsert(
                {
                    user_id: userId,
                    save_data: typeof saveData === 'string' ? JSON.parse(saveData) : saveData,
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'user_id' }
            );
        if (error) throw error;
    },

    loadGameProgress: async (userId) => {
        const { data, error } = await supabase
            .from('game_saves')
            .select('save_data')
            .eq('user_id', userId)
            .maybeSingle();
        if (error) throw error;
        if (!data) return null;
        // Return as string for compatibility with existing code
        return typeof data.save_data === 'string'
            ? data.save_data
            : JSON.stringify(data.save_data);
    },

    // ── Stats functions ─────────────────────────────────────────────────

    getTotalPlayers: async () => {
        const { count, error } = await supabase
            .from('users')
            .select('id', { count: 'exact', head: true });
        if (error) throw error;
        return count || 0;
    },

    getTotalGames: async () => {
        const { count, error } = await supabase
            .from('scores')
            .select('id', { count: 'exact', head: true });
        if (error) throw error;
        return count || 0;
    },

    getTopScore: async () => {
        const { data, error } = await supabase
            .from('users')
            .select('high_score')
            .order('high_score', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) throw error;
        return data ? data.high_score || 0 : 0;
    }
};
