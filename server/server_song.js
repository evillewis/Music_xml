const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');

class SongService {
    readSongs() {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, '../data/songs.xml'), (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                xml2js.parseString(data, (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                });
            });
        });
    }

    writeSongs(data) {
        return new Promise((resolve, reject) => {
            const builder = new xml2js.Builder();
            const xml = builder.buildObject(data);
            fs.writeFile(path.join(__dirname, '../data/songs.xml'), xml, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    async getAllSongs() {
        return this.readSongs();
    }

    async addSong(song) {
        const songs = await this.readSongs();
        songs.SongCollection.Song.push({
            Id: [song.Id.toString()],
            Title: [song.Title],
            Artist: [song.Artist],
            Genre: [song.Genre],
            PlayCount: [song.PlayCount.toString()]
        });
        await this.writeSongs(songs);
    }

    async resetSongs() {
        return new Promise((resolve, reject) => {
            fs.copyFile(path.join(__dirname, '../data/songs_original.xml'), path.join(__dirname, '../data/songs.xml'), (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    async editSong(editedSong) {
        const songs = await this.readSongs();
        const songIndex = songs.SongCollection.Song.findIndex(song => song.Id[0] === editedSong.Id);
        if (songIndex === -1) {
            throw new Error('Song not found');
        }
        if (editedSong.Title) songs.SongCollection.Song[songIndex].Title = [editedSong.Title];
        if (editedSong.Artist) songs.SongCollection.Song[songIndex].Artist = [editedSong.Artist];
        if (editedSong.Genre) songs.SongCollection.Song[songIndex].Genre = [editedSong.Genre];
        if (editedSong.PlayCount) songs.SongCollection.Song[songIndex].PlayCount = [editedSong.PlayCount.toString()];
        
        await this.writeSongs(songs);
    }

    async deleteSong(songId) {
        const songs = await this.readSongs();
        const songIndex = songs.SongCollection.Song.findIndex(song => song.Id[0] === songId);
        if (songIndex === -1) {
            throw new Error('Song not found');
        }
        songs.SongCollection.Song.splice(songIndex, 1);
        await this.writeSongs(songs);
    }
}

module.exports = new SongService();
