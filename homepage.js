let isLoggedIn = false; // Track login state

// Utility Functions
const utils = {
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
};

// Render music section
function renderMusicSection(data, containerId) {
    if (!Array.isArray(data)) {
        console.error('Expected an array but got:', data);
        return;
    }

    const container = document.getElementById(containerId);
    container.innerHTML = data.map(track => `
        <div class="music-card bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition hover:scale-105">
            <img src="${utils.sanitizeHTML(track.thumbnail)}" 
                 alt="${utils.sanitizeHTML(track.title)}" 
                 class="w-full h-48 md:h-64 object-cover">
            <div class="p-4">
                <h3 class="text-lg font-semibold truncate">${utils.sanitizeHTML(track.title)}</h3>
                <p class="text-sm text-gray-400">${utils.sanitizeHTML(track.artist)}</p>
                <div class="flex justify-between items-center mt-2">
                    <button class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full text-sm transition"
                            onclick="musicPlayer.play('${utils.sanitizeHTML(track.url)}')">
                        Play
                    </button>
                    <button class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-full text-sm transition"
                            onclick="musicDownloader.download('${utils.sanitizeHTML(track.url)}', '${utils.sanitizeHTML(track.title)}', event)">
                        Download
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Advanced Music Player
const musicPlayer = {
    async play(videoUrl) {
        if (!videoUrl) {
            this.showError('Invalid video URL');
            return;
        }

        try {
            // Show loading state
            Swal.fire({
                title: 'Loading Track',
                html: '<div class="spinner"></div>',
                showConfirmButton: false,
                allowOutsideClick: false
            });

            // Update SweetAlert with video player
            Swal.fire({
                title: 'Now Playing',
                html: `
                    <iframe id="videoPlayer" width="560" height="315" src="https://www.youtube.com/embed/${videoUrl.split('v=')[1]}?autoplay=1&modestbranding=1&rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                    <p id="watchOnYouTube" style="display:none;">If the video fails to load, <a href="https://www.youtube.com/watch?v=${videoUrl.split('v=')[1]}" target="_blank">watch on YouTube</a>.</p>
                `,
                showCloseButton: true,
                showConfirmButton: false,
                customClass: {
                    popup: 'bg-gray-800 text-white',
                    title: 'text-lg font-semibold',
                    closeButton: 'text-white',
                },
                didOpen: () => {
                    const videoPlayer = document.getElementById('videoPlayer');
                    const watchOnYouTube = document.getElementById('watchOnYouTube');

                    // Handle video player error
                    videoPlayer.onerror = () => {
                        videoPlayer.style.display = 'none';
                        watchOnYouTube.style.display = 'block';
                    };

                    // Fallback mechanism to check if the video is unavailable
                    setTimeout(() => {
                        if (videoPlayer.style.display !== 'none' && videoPlayer.contentWindow.document.body.innerHTML.includes('Video unavailable')) {
                            videoPlayer.style.display = 'none';
                            watchOnYouTube.style.display = 'block';
                        }
                    }, 5000); // Adjust the delay as needed
                }
            });

        } catch (error) {
            console.error('Playback Error:', error);
            this.showError('Unable to play track. Please try again.');
        }
    },
    showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Playback Error',
            text: message
        });
    }
};

// homepage.js - Update API URLs
const PC_IP = '192.168.43.57'; // Replace with your PC's IP address
const API_URL = `http://${PC_IP}:5000`;
const FLASK_URL = `http://${PC_IP}:5001`;

// Music Downloader
const musicDownloader = {
    socket: null,
    activeDownloads: new Map(),
    
    async ensureSocketConnection() {
        if (this.socket?.connected) return true;
        return this.initSocket();
    },

    initSocket() {
        return new Promise((resolve) => {
            this.socket = io('http://localhost:5001', {
                transports: ['websocket', 'polling'], // Allow fallback to polling
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                path: '/socket.io',
                cors: {
                    origin: "http://localhost:5000",
                    methods: ["GET", "POST"]
                }
            });

            this.socket.on('connect', () => {
                console.log('Socket connected:', this.socket.id);
                resolve(true);
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            this.socket.on('download_progress', (data) => {
                const toast = Swal.mixin({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: data.status === 'completed' ? 5000 : null,
                    timerProgressBar: true
                });

                toast.fire({
                    title: data.message,
                    html: data.status === 'downloading' ? 
                        `Progress: ${data.progress}<br>Speed: ${data.speed}<br>ETA: ${data.eta}` : 
                        undefined,
                    icon: data.status === 'error' ? 'error' : 'info'
                });

                // Log to console
                console.log(`Download Status: ${data.status}`, data);
            });
        });
    },

    updateDownloadProgress(downloadId, data) {
        const toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });

        if (data.progress === '100%') {
            toast.fire({
                icon: 'success',
                title: 'Download Complete!'
            });
            this.activeDownloads.delete(downloadId);
        } else {
            if (!this.activeDownloads.has(downloadId)) {
                toast.fire({
                    html: `
                        <div class="download-progress">
                            <div class="progress-bar" style="width: ${data.progress}"></div>
                            <div class="text-sm">Downloading: ${data.progress}</div>
                            <div class="text-xs text-gray-400">Speed: ${data.speed}</div>
                        </div>
                    `
                });
                this.activeDownloads.set(downloadId, true);
            }
        }
    },

    async download(videoUrl, title, event) {
        if (event) event.preventDefault();

        try {
            await this.ensureSocketConnection();
            const downloadId = `${this.socket.id}-${Date.now()}`;

            const downloadUrl = `${API_URL}/api/songs/download?videoUrl=${encodeURIComponent(videoUrl)}&socketId=${this.socket.id}`;
            
            // Start download in background
            const downloadPromise = fetch(downloadUrl).then(async (response) => {
                if (!response.ok) throw new Error('Download failed');
                const blob = await response.blob();
                return { blob, title };
            });

            // Show initial progress
            Swal.fire({
                title: 'Starting Download...',
                html: '<div class="spinner"></div>',
                showConfirmButton: false,
                allowOutsideClick: true,
                willClose: () => {
                    // Continue download in background
                    downloadPromise.then(({blob, title}) => {
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.style.display = 'none';
                        link.href = url;
                        link.download = `${title}.mp3`;
                        document.body.appendChild(link);
                        link.click();
                        setTimeout(() => {
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                        }, 100);
                    }).catch(error => {
                        console.error('Download failed:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Download Failed',
                            text: error.message
                        });
                    });
                }
            });

        } catch (error) {
            console.error('Download Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Download Failed',
                text: error.message || 'Unable to download track'
            });
        }
    }
};

// Fetch and render latest music
async function fetchAndRenderLatestMusic() {
    try {
        const response = await fetch('http://localhost:5000/api/songs/latest');
        const data = await response.json();

        if (response.ok) {
            console.log('Fetched latest music:', data);
            renderMusicSection(data, 'latestMusicGrid');
        } else {
            console.error('Error fetching latest music:', data.error);
        }
    } catch (error) {
        console.error('Error fetching latest music:', error);
    }
}

// Fetch and render trending music
async function fetchAndRenderTrendingMusic() {
    try {
        const response = await fetch('http://localhost:5000/api/songs/trending');
        const data = await response.json();

        if (response.ok) {
            console.log('Fetched trending music:', data);
            renderMusicSection(data, 'trendingMusicGrid');
        } else {
            console.error('Error fetching trending music:', data.error);
        }
    } catch (error) {
        console.error('Error fetching trending music:', error);
    }
}

// Function to generate a music card
function createMusicCard(videoId) {
    return `
        <div class="music-card bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <iframe 
                class="w-full h-48 md:h-64"
                src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" 
                allowfullscreen>
            </iframe>
            <div class="p-4">
                <h3 class="text-lg font-semibold truncate">Music Track ${Math.floor(Math.random() * 1000)}</h3>
                <div class="flex justify-between items-center mt-2">
                    <button class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full text-sm transition">
                        Play
                    </button>
                    <div class="flex items-center">
                        <i class="fas fa-heart text-red-500 mr-2"></i>
                        <span>${Math.floor(Math.random() * 10000)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to generate playlist card
function createPlaylistCard(name) {
    return `
        <div class="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <div class="p-4">
                <h3 class="text-lg font-semibold truncate">${name || `Playlist ${Math.floor(Math.random() * 100)}`}</h3>
                <div class="flex justify-between items-center mt-2">
                    <span class="text-sm text-gray-400">${Math.floor(Math.random() * 20)} tracks</span>
                    <button class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-full text-sm transition">
                        Play
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Populate Latest Music
async function populateLatestMusic() {
    await fetchAndRenderLatestMusic();
}

// Populate Trending Music
async function populateTrendingMusic() {
    await fetchAndRenderTrendingMusic();
}

// Populate Playlists
function populatePlaylists() {
    const playlistNames = ['Chill Vibes', 'Workout Mix', 'Road Trip', 'Late Night', 'Party Hits'];
    for (let i = 0; i < 8; i++) {
        document.getElementById('playlistGrid').innerHTML += createPlaylistCard(playlistNames[Math.floor(Math.random() * playlistNames.length)]);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    populateLatestMusic();
    populateTrendingMusic();
    populatePlaylists();

    // Mobile menu toggle
    document.getElementById('mobile-menu-toggle').addEventListener('click', () => {
        document.getElementById('mobile-menu').classList.toggle('hidden');
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (event) {
            event.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            document.getElementById('mobile-menu').classList.add('hidden');
        });
    });

    // Search functionality (placeholder)
    document.getElementById('searchBar').addEventListener('keyup', utils.debounce(async function() {
        const query = this.value.trim();
        if (query.length < 2) {
            document.getElementById('searchResults').innerHTML = '';
            return;
        }
        
        const songs = await searchHandler.searchSongs(query);
        searchHandler.renderSearchResults(songs);
    }, 300));

    // Add playlist functionality
    document.getElementById('playlistInput').nextElementSibling.addEventListener('click', () => {
        const playlistName = document.getElementById('playlistInput').value || `Playlist ${Math.floor(Math.random() * 100)}`;
        document.getElementById('playlistGrid').innerHTML = createPlaylistCard(playlistName) + document.getElementById('playlistGrid').innerHTML;
        document.getElementById('playlistInput').value = ''; // Clear input
    });

    musicDownloader.initSocket().catch(console.error);
});

// homepage.js - Update search functionality
const searchHandler = {
    async searchSongs(query) {
        try {
            const response = await fetch(`http://localhost:5000/api/songs/search?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (response.ok) {
                return data;
            } else {
                console.error('Search error:', data.error);
                return [];
            }
        } catch (error) {
            console.error('Search failed:', error);
            return [];
        }
    },

    renderSearchResults(songs) {
        const resultsContainer = document.getElementById('searchResults');
        
        if (!songs.length) {
            resultsContainer.innerHTML = `
                <div class="text-center text-gray-400 py-8">
                    No songs found
                </div>`;
            return;
        }

        resultsContainer.innerHTML = songs.map(song => `
            <div class="music-card bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition hover:scale-105">
                <img src="${utils.sanitizeHTML(song.thumbnail)}" 
                     alt="${utils.sanitizeHTML(song.title)}" 
                     class="w-full h-48 object-cover">
                <div class="p-4">
                    <h3 class="text-lg font-semibold truncate">${utils.sanitizeHTML(song.title)}</h3>
                    <p class="text-sm text-gray-400">
                        ${utils.sanitizeHTML(song.artist)}
                        ${song.source === 'youtube' ? 
                            '<span class="ml-2 px-2 py-1 bg-red-600 rounded-full text-xs">YouTube</span>' : 
                            ''}
                    </p>
                    <div class="flex justify-between items-center mt-2">
                        <button class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full text-sm transition"
                                onclick="musicPlayer.play('${utils.sanitizeHTML(song.url)}')">
                            Play
                        </button>
                        <button class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-full text-sm transition"
                                onclick="musicDownloader.download('${utils.sanitizeHTML(song.url)}', '${utils.sanitizeHTML(song.title)}', event); return false;">
                            Download
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
};