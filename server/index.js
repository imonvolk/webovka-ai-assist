const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve assets directory
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Doom Platformer server running at http://localhost:${PORT}`);
});
