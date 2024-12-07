const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    url: { type: String, required: true },
    audioUrl: { type: String, required: true }, // Add audioUrl field
    thumbnail: { type: String, required: true },
    genre: { type: String, required: true },
    duration: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Song', songSchema);