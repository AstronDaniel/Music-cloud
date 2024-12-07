const Playlist = require('../../models/playlist');

// Create a new playlist
exports.createPlaylist = async (req, res) => {
    const { name, userId } = req.body;
    const newPlaylist = new Playlist({ name, user: userId });
    try {
        await newPlaylist.save();
        res.status(201).json({ message: 'Playlist created successfully', playlist: newPlaylist });
    } catch (error) {
        res.status(400).json({ error: 'Failed to create playlist' });
    }
};

// Add a song to a playlist
exports.addSongToPlaylist = async (req, res) => {
    const { songId } = req.body;
    try {
        const playlist = await Playlist.findById(req.params.playlistId);
        playlist.songs.push(songId);
        await playlist.save();
        res.status(200).json({ message: 'Song added to playlist' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to add song to playlist' });
    }
};

// Fetch all playlists for a user
exports.getUserPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({ user: req.params.userId }).populate('songs');
        res.status(200).json(playlists);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch playlists' });
    }
};
