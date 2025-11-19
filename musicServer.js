// musicService.js
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config(); // Load environment variables

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

async function searchTracks(query) {
  try {
    const data = await spotifyApi.searchTracks(query);
    return data.body.tracks.items.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists[0].name,
      thumbnail: track.album.images[0].url,
      previewUrl: track.preview_url
    }));
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
}