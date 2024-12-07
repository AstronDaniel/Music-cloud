const Video = require('../../models/video');

// Fetch all videos
exports.getAllVideos = async (req, res) => {
    try {
        const videos = await Video.find();
        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
};

// Create a new video
exports.createVideo = async (req, res) => {
    const { videoId, title, description, thumbnail, publishedAt, channelId, channelTitle } = req.body;
    const newVideo = new Video({ videoId, title, description, thumbnail, publishedAt, channelId, channelTitle });
    try {
        await newVideo.save();
        res.status(201).json({ message: 'Video created successfully', video: newVideo });
    } catch (error) {
        res.status(400).json({ error: 'Failed to create video' });
    }
};
