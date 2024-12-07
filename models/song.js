const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    url: { type: String, required: true }, // URL to the song file
    thumbnail: { type: String }, // URL to the song thumbnail
    genre: { type: String }, // Genre of the song
    duration: { type: Number }, // Duration in seconds
    createdAt: { type: Date, default: Date.now } // Timestamp
});

const Song = mongoose.model('Song', songSchema);
module.exports = Song;