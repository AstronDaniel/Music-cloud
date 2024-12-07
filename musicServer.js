// musicService.js
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret'
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