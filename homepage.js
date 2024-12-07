let isLoggedIn = false; // Track login state

// Mock data for tracks
const latestMusic = [
    { title: "New Vibe 1", artist: "Artist A", cover: "https://via.placeholder.com/200", url: "https://example.com/song1.mp3" },
    { title: "New Vibe 2", artist: "Artist B", cover: "https://via.placeholder.com/200", url: "https://example.com/song2.mp3" },
    { title: "New Vibe 3", artist: "Artist C", cover: "https://via.placeholder.com/200", url: "https://example.com/song3.mp3" },
];

// Render music section
function renderMusicSection(data, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    data.forEach(track => {
        const card = document.createElement("div");
        card.className = "music-card";
        card.innerHTML = `
            <img src="${track.cover}" alt="${track.title}">
            <h3>${track.title}</h3>
            <p>${track.artist}</p>
            <button onclick="playMusic('${track.url}')">Play</button>
            <button onclick="downloadMusic('${track.url}', '${track.title}')">Download</button>
        `;
        container.appendChild(card);
    });
}

// Play selected music
function playMusic(url) {
    const audio = new Audio(url);
    audio.play();
    alert("Now playing: " + url);
}

// Download music
function downloadMusic(url, title) {
    const link = document.createElement("a");
    link.href = url;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Trigger music upload
function triggerUpload() {
    document.getElementById("uploadFile").click(); // Allow upload regardless of login state
}

// Upload music
function uploadMusic() {
    const fileInput = document.getElementById("uploadFile");
    const file = fileInput.files[0];
    if (file) {
        alert(`Uploaded: ${file.name}`);
    }
}

// User authentication (Login/Logout functionality remains for display purposes)
function showLoginForm() {
    document.getElementById("loginModal").style.display = "flex";
}

function hideLoginForm() {
    document.getElementById("loginModal").style.display = "none";
}

function login() {
    const username = document.getElementById("username").value.trim();
    if (username) {
        alert(`Welcome, ${username}!`);
        isLoggedIn = true;
        document.getElementById("loginBtn").style.display = "none";
        document.getElementById("logoutBtn").style.display = "inline-block";
        hideLoginForm();
    } else {
        alert("Please enter a username.");
    }
}

function logout() {
    alert("Logged out successfully.");
    isLoggedIn = false;
    document.getElementById("loginBtn").style.display = "inline-block";
    document.getElementById("logoutBtn").style.display = "none";
}

// Initial render
renderMusicSection(latestMusic, "latestMusic");

// Your Google API Key and Search Engine ID
const API_KEY = "AIzaSyDDOFf3CEvnjrcTpXIa2lLV6sRuV3GpUoI"; // Replace with your actual API key
const SEARCH_ENGINE_ID = "62da59768b2474040"; // Replace with your actual Search Engine ID

// Search music
async function searchMusic() {
    const query = document.getElementById("searchBar").value.trim();
    const resultsContainer = document.getElementById("searchResults");

    // Clear results if query is empty
    if (!query) {
        resultsContainer.innerHTML = "";
        return;
    }

    // Fetch search results
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${AIzaSyDDOFf3CEvnjrcTpXIa2lLV6sRuV3GpUoI}&cx=${"62da59768b2474040"}&q=${encodeURIComponent(
        query
    )}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Render search results
        resultsContainer.innerHTML = data.items
            .map(
                (item) => `
            <div class="search-item">
                <h3><a href="${item.link}" target="_blank">${item.title}</a></h3>
                <p>${item.snippet}</p>
                <a href="${item.link}" target="_blank">Visit</a>
            </div>
        `
            )
            .join("");
    } catch (error) {
        resultsContainer.innerHTML = `<p>Failed to fetch results. Please try again.</p>`;
        console.error("Error fetching search results:", error);
    }
}

// Add event listener to the search button
document.getElementById("searchButton").addEventListener("click", searchMusic);