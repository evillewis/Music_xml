require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const songService = require('./server/server_song.js');
const app = express();
const port = 1017;

app.use(express.static('UI'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
});
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

// Route to serve login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'UI', 'login.html'));
});

// Handle login
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username === 'root' && password === '123456') {
        res.json({ success: true, redirect: 'admin.html' });
    } else if (username === 'zhangsan' && password === '123456') {
        res.json({ success: true, redirect: 'server.html' });
    } else {
        res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
});

// Route to serve main page, requires authentication
app.get('/main.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'UI', 'main.html'));
});

app.get('/songs', async (req, res) => {
    try {
        const songs = await songService.getAllSongs();
        res.json(songs);
    } catch (error) {
        res.status(500).send('Error reading songs');
    }
});

app.post('/add-song', async (req, res) => {
    try {
        await songService.addSong(req.body);
        res.status(200).send('Song added successfully');
    } catch (error) {
        res.status(500).send('Error adding song');
    }
});

app.post('/reset-songs', async (req, res) => {
    try {
        await songService.resetSongs();
        res.status(200).send('Songs reset successfully');
    } catch (error) {
        res.status(500).send('Error resetting songs');
    }
});

app.put('/edit-song', async (req, res) => {
    try {
        await songService.editSong(req.body);
        res.status(200).send('Song edited successfully');
    } catch (error) {
        res.status(500).send('Error editing song');
    }
});

app.delete('/delete-song/:id', async (req, res) => {
    try {
        await songService.deleteSong(req.params.id);
        res.status(200).send('Song deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting song');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
