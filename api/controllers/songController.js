const Song = require('../../models/song');

// Fetch all songs
exports.getAllSongs = async (req, res) => {
    try {
        const songs = await Song.find();
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch songs' });
    }
};

// Create a new song
exports.createSong = async (req, res) => {
    const { title, artist, url, thumbnail, genre, duration } = req.body;
    const newSong = new Song({ title, artist, url, thumbnail, genre, duration });
    try {
        await newSong.save();
        res.status(201).json({ message: 'Song created successfully', song: newSong });
    } catch (error) {
        res.status(400).json({ error: 'Failed to create song' });
    }
};
