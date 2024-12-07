// api/controllers/songController.js
const Song = require('../../models/song');
const { fetchLatestMusic, fetchTrendingMusic, getDownloadUrl, searchYouTube } = require('../../youtubeService');
const ytdl = require('ytdl-core');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

// Fetch and save latest music from YouTube
exports.fetchAndSaveLatestMusic = async (req, res) => {
    try {
        const latestMusic = await fetchLatestMusic();
        console.log('Fetched latest music:', latestMusic);

        const savedSongs = await Promise.all(latestMusic.map(async (music) => {
            const existingSong = await Song.findOne({ url: `https://www.youtube.com/watch?v=${music.videoId}` });
            if (existingSong) {
                return existingSong;
            }

            const newSong = new Song({
                title: music.title,
                artist: music.channelTitle,
                url: `https://www.youtube.com/watch?v=${music.videoId}`,
                thumbnail: music.thumbnail,
                genre: 'Latest',
                duration: 0 // Duration can be fetched separately if needed
            });
            return await newSong.save();
        }));

        res.status(201).json({ message: 'Latest music fetched and saved successfully', songs: savedSongs });
    } catch (error) {
        console.error('Error saving latest music:', error);
        res.status(500).json({ error: 'Failed to save latest music' });
    }
};

// Fetch and save trending music from YouTube
exports.fetchAndSaveTrendingMusic = async (req, res) => {
    try {
        const trendingMusic = await fetchTrendingMusic();
        console.log('Fetched trending music:', trendingMusic);

        const savedSongs = await Promise.all(trendingMusic.map(async (music) => {
            const existingSong = await Song.findOne({ url: `https://www.youtube.com/watch?v=${music.videoId}` });
            if (existingSong) {
                return existingSong;
            }

            const newSong = new Song({
                title: music.title,
                artist: music.channelTitle,
                url: `https://www.youtube.com/watch?v=${music.videoId}`,
                thumbnail: music.thumbnail,
                genre: 'Trending',
                duration: 0 // Duration can be fetched separately if needed
            });
            return await newSong.save();
        }));

        res.status(201).json({ message: 'Trending music fetched and saved successfully', songs: savedSongs });
    } catch (error) {
        console.error('Error saving trending music:', error);
        res.status(500).json({ error: 'Failed to save trending music' });
    }
};

// Fetch all songs
exports.getAllSongs = async (req, res) => {
    try {
        const songs = await Song.find();
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch songs' });
    }
};

// Fetch latest songs
exports.getLatestSongs = async (req, res) => {
    try {
        const latestSongs = await Song.find({ genre: 'Latest' });
        res.status(200).json(latestSongs);
    } catch (error) {
        res.status(500).json({ error: 'Faileds to fetch latest songs' });
    }
};

// Fetch trending songs
exports.getTrendingSongs = async (req, res) => {
    try {
        const trendingSongs = await Song.find({ genre: 'Trending' });
        res.status(200).json(trendingSongs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trending songs' });
    }
};

// Get download URL for a song
exports.getDownloadUrl = async (req, res) => {
    console.log("here")
    try {
        const { videoUrl } = req.query;
        const downloadUrl = await getDownloadUrl(videoUrl);
        res.status(200).json({ downloadUrl });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get download URL' });
    }
};

// Add this method to your existing controller
exports.createSong = async (req, res) => {
    try {
        const { title, artist, url, audioUrl, thumbnail, genre, duration } = req.body;
        
        // Check if song already exists
        const existingSong = await Song.findOne({ url });
        if (existingSong) {
            return res.status(400).json({ error: 'Song already exists' });
        }

        // Create new song
        const newSong = new Song({
            title,
            artist,
            url,
            audioUrl,
            thumbnail,
            genre,
            duration: duration || 0
        });

        // Save to database
        const savedSong = await newSong.save();
        res.status(201).json({ 
            message: 'Song created successfully',
            song: savedSong 
        });
    } catch (error) {
        console.error('Error creating song:', error);
        res.status(500).json({ error: 'Failed to create song' });
    }
};

// Add to exports in songController.js
exports.downloadSong = async (req, res) => {
    try {
        const { videoUrl, socketId } = req.query;
        if (!videoUrl) {
            return res.status(400).json({ error: 'Video URL is required' });
        }

        // Send initial status
        wss.clients.forEach(client => {
            if (client.id === socketId) {
                client.send(JSON.stringify({
                    status: 'Initializing download...',
                    progress: 0
                }));
            }
        });

        // Get video info
        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
        const audioFormat = ytdl.chooseFormat(info.formats, { 
            quality: 'highestaudio',
            filter: 'audioonly' 
        });

        // Update format selection
        wss.clients.forEach(client => {
            if (client.id === socketId) {
                client.send(JSON.stringify({
                    status: 'Selected audio format...',
                    progress: 20
                }));
            }
        });

        res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
        res.header('Content-Type', 'audio/mpeg');
        res.header('Transfer-Encoding', 'chunked');

        const stream = ytdl(videoUrl, {
            format: audioFormat,
            highWaterMark: 1024 * 1024
        });

        stream.on('progress', (_, downloaded, total) => {
            const progress = Math.floor((downloaded / total) * 100);
            wss.clients.forEach(client => {
                if (client.id === socketId) {
                    client.send(JSON.stringify({
                        status: `Downloading: ${progress}%`,
                        progress: 20 + (progress * 0.8) // Scale from 20% to 100%
                    }));
                }
            });
        });

        stream.pipe(res);

    } catch (error) {
        console.error('Download error:', error);
        wss.clients.forEach(client => {
            if (client.id === socketId) {
                client.send(JSON.stringify({
                    status: 'Download failed',
                    error: error.message
                }));
            }
        });
        res.status(500).json({ error: 'Failed to download song' });
    }
};

// api/controllers/songController.js - Update search endpoint
exports.searchSongs = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        // Search database
        const dbSongs = await Song.find({
            $or: [
                { title: { $regex: query, $options: 'i' }},
                { artist: { $regex: query, $options: 'i' }},
                { genre: { $regex: query, $options: 'i' }}
            ]
        }).limit(10);

        // If few results, search YouTube
        if (dbSongs.length < 5) {
            const youtubeSongs = await searchYouTube(query);
            
            // Combine and deduplicate results
            const allSongs = [
                ...dbSongs.map(song => ({...song.toObject(), source: 'database'})),
                ...youtubeSongs
            ];

            // Remove duplicates based on URL
            const uniqueSongs = Array.from(new Map(
                allSongs.map(song => [song.url, song])
            ).values());

            res.status(200).json(uniqueSongs);
        } else {
            res.status(200).json(dbSongs.map(song => ({
                ...song.toObject(),
                source: 'database'
            })));
        }

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to search songs' });
    }
};
