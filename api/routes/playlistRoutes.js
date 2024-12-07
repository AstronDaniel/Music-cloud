const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');

router.post('/', playlistController.createPlaylist);
router.post('/:playlistId/songs', playlistController.addSongToPlaylist);
router.get('/user/:userId', playlistController.getUserPlaylists);

module.exports = router; 