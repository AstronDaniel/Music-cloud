const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    videoId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    thumbnail: { type: String },
    publishedAt: { type: Date },
    channelId: { type: String },
    channelTitle: { type: String },
    createdAt: { type: Date, default: Date.now } // Timestamp
});

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;