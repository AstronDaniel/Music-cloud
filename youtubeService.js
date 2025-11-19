// youtubeService.js
const axios = require('axios');
const ytdl = require('ytdl-core'); // Import ytdl-core
require('dotenv').config(); // Load environment variables

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

async function fetchLatestMusic() {
    try {
        const response = await axios.get(YOUTUBE_API_URL, {
            params: {
                part: 'snippet',
                maxResults: 1,
                q: 'latest music',
                type: 'video',
                key: YOUTUBE_API_KEY
            }
        });

        console.log('YouTube API response:', response.data);

        return response.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high.url,
            publishedAt: item.snippet.publishedAt,
            channelId: item.snippet.channelId,
            channelTitle: item.snippet.channelTitle
        }));
    } catch (error) {
        console.error('Error fetching latest music from YouTube:', error.response ? error.response.data : error.message);
        return [];
    }
}

async function fetchTrendingMusic() {
    try {
        const response = await axios.get(YOUTUBE_API_URL, {
            params: {
                part: 'snippet',
                maxResults: 10,
                q: 'trending music',
                type: 'video',
                key: YOUTUBE_API_KEY
            }
        });

        console.log('YouTube API response for trending music:', response.data);

        return response.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high.url,
            publishedAt: item.snippet.publishedAt,
            channelId: item.snippet.channelId,
            channelTitle: item.snippet.channelTitle
        }));
    } catch (error) {
        console.error('Error fetching trending music from YouTube:', error.response ? error.response.data : error.message);
        return [];
    }
}

async function getDownloadUrl(videoUrl) {
    try {
        const info = await ytdl.getInfo(videoUrl);
        const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        return audioFormat.url;
    } catch (error) {
        console.error('Error getting download URL:', error);
    }
}

async function searchYouTube(query) {
    try {
        const response = await axios.get(YOUTUBE_API_URL, {
            params: {
                part: 'snippet',
                maxResults: 10,
                q: query + ' music',
                type: 'video',
                key: YOUTUBE_API_KEY
            }
        });

        return response.data.items.map(item => ({
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            thumbnail: item.snippet.thumbnails.high.url,
            genre: 'YouTube',
            source: 'youtube'
        }));
    } catch (error) {
        console.error('YouTube search error:', error);
        return [];
    }
}

module.exports = { 
    fetchLatestMusic, 
    fetchTrendingMusic, 
    getDownloadUrl,
    searchYouTube 
};