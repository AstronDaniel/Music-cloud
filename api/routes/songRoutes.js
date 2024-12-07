const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController'); // Ensure the correct path

router.get('/', songController.getAllSongs);
router.post('/', songController.createSong);
router.get('/latest', songController.getLatestSongs); // Fetch latest songs from the database
router.get('/trending', songController.getTrendingSongs); // Fetch trending songs from the database
router.get('/fetch-latest', songController.fetchAndSaveLatestMusic); // Fetch and save latest music from YouTube
router.get('/fetch-trending', songController.fetchAndSaveTrendingMusic); // Fetch and save trending music from YouTube
router.get('/download-url', songController.getDownloadUrl); // Get download URL for a song
router.get('/download', songController.downloadSong);
// api/routes/songRoutes.js - Add search route
router.get('/search', songController.searchSongs);

module.exports = router;