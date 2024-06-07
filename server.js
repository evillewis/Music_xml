const express = require('express');
const fs = require('fs');
const xml2js = require('xml2js');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const app = express();
const port = 3000;

app.use(express.static('UI'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'your_secret_key',
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

// Read and parse the XML file
function readXMLFile(callback) {
    fs.readFile('data/songs.xml', (err, data) => {
        if (err) {
            callback(err, null);
            return;
        }
        xml2js.parseString(data, (err, result) => {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, result);
        });
    });
}

// Write to the XML file
function writeXMLFile(data, callback) {
    const builder = new xml2js.Builder();
    const xml = builder.buildObject(data);
    fs.writeFile('data/songs.xml', xml, callback);
}

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

app.get('/songs', (req, res) => {
    readXMLFile((err, result) => {
        if (err) {
            res.status(500).send('Error reading XML file');
            return;
        }
        res.json(result);
    });
});

app.post('/add-song', (req, res) => {
    const newSong = req.body;
    readXMLFile((err, result) => {
        if (err) {
            res.status(500).send('Error reading XML file');
            return;
        }
        result.SongCollection.Song.push({
            Id:[newSong.Id.toString()],
            Title: [newSong.Title],
            Artist: [newSong.Artist],
            Genre: [newSong.Genre],
            PlayCount: [newSong.PlayCount.toString()]
        });
        writeXMLFile(result, (err) => {
            if (err) {
                res.status(500).send('Error writing XML file');
                return;
            }
            res.status(200).send('Song added successfully');
        });
    });
});


app.post('/reset-songs', (req, res) => {
    fs.copyFile('data/songs_original.xml', 'data/songs.xml', (err) => {
        if (err) {
            res.status(500).send('Error resetting XML file');
            return;
        }
        res.status(200).send('Songs reset successfully');
    });
});

app.put('/edit-song', (req, res) => {
    const editedSong = req.body;
    readXMLFile((err, result) => {
        if (err) {
            res.status(500).send('Error reading XML file');
            return;
        }
        const songIndex = result.SongCollection.Song.findIndex(song => song.Id[0] === editedSong.Id);
        if (songIndex === -1) {
            res.status(404).send('Song not found');
            return;
        }
        if (editedSong.Title) result.SongCollection.Song[songIndex].Title = [editedSong.Title];
        if (editedSong.Artist) result.SongCollection.Song[songIndex].Artist = [editedSong.Artist];
        if (editedSong.Genre) result.SongCollection.Song[songIndex].Genre = [editedSong.Genre];
        if (editedSong.PlayCount) result.SongCollection.Song[songIndex].PlayCount = [editedSong.PlayCount.toString()];
        
        writeXMLFile(result, (err) => {
            if (err) {
                res.status(500).send('Error writing XML file');
                return;
            }
            res.status(200).send('Song edited successfully');
        });
    });
});

app.delete('/delete-song/:id', (req, res) => {
    const songId = req.params.id;
    readXMLFile((err, result) => {
        if (err) {
            res.status(500).send('Error reading XML file');
            return;
        }
        const songIndex = result.SongCollection.Song.findIndex(song => song.Id[0] === songId);
        if (songIndex === -1) {
            res.status(404).send('Song not found');
            return;
        }
        result.SongCollection.Song.splice(songIndex, 1);
        
        writeXMLFile(result, (err) => {
            if (err) {
                res.status(500).send('Error writing XML file');
                return;
            }
            res.status(200).send('Song deleted successfully');
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
