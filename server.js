// server.js
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config(); // For environment variables

const app = express();
app.use(cors());
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
const userRoutes = require('./api/routes/userRoutes');
const songRoutes = require('./api/routes/songRoutes');
const videoRoutes = require('./api/routes/videoRoutes');
const playlistRoutes = require('./api/routes/playlistRoutes');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/playlists', playlistRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});