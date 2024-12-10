// server.js
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config(); // For environment variables

const app = express();
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'OPTIONS']
}));
app.use(bodyParser.json()); // For parsing application/json

// MongoDB Atlas connection URI
const uri = process.env.MONGODB_URI; // Store your connection string in .env

// Connect to MongoDB with increased timeout settings
mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    socketTimeoutMS: 45000 // Increase socket timeout to 45 seconds
}).then(() => {
    console.log("Connected to MongoDB!");
}).catch(err => {
    console.error("Error connecting to MongoDB:", err);
});

// Import routes
const songRoutes = require('./api/routes/songRoutes'); // Ensure the correct path
const userRoutes = require('./api/routes/userRoutes'); // Ensure the correct path

// Use routes
app.use('/api/songs', songRoutes);
app.use('/api/users', userRoutes);

// Add proxy endpoint
app.get('/api/songs/download', async (req, res) => {
    try {
        const { videoUrl } = req.query;
        if (!videoUrl) {
            return res.status(400).json({ error: 'Video URL is required' });
        }

        console.log('Downloading from:', videoUrl);

        const response = await axios.get(`http://localhost:5001/download`, {
            params: { videoUrl },
            responseType: 'stream',
            timeout: 300000 // 5 minutes timeout
        });

        response.data.on('error', (error) => {
            console.error('Stream error:', error);
            res.status(500).json({ error: 'Stream error occurred' });
        });

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', 'attachment; filename="download.mp3"');
        
        response.data.pipe(res);
    } catch (error) {
        console.error('Download error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to download song' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});