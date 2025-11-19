# Music Cloud Application

A cloud-based music streaming application that integrates with YouTube and Spotify APIs.

## Features

- Search and stream music from YouTube and Spotify
- User authentication and management
- Playlist management
- Audio download and streaming capabilities

## Prerequisites

- Node.js (v12 or higher)
- MongoDB Atlas account
- YouTube Data API key
- Spotify Developer account (optional, for Spotify integration)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/AstronDaniel/Music-cloud.git
cd Music-cloud
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the `.env.example` file to `.env` and fill in your actual credentials:

```bash
cp .env.example .env
```

Edit the `.env` file with your actual values:

```env
# MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# YouTube API Key - Get from Google Cloud Console
YOUTUBE_API_KEY=your_actual_youtube_api_key

# Server Port (default: 5000)
PORT=5000

# Spotify API credentials - Get from Spotify Developer Dashboard
SPOTIFY_CLIENT_ID=your_actual_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_actual_spotify_client_secret
```

### 4. Getting API Credentials

#### MongoDB Atlas
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string from the "Connect" button
4. Add your connection string to `.env` as `MONGODB_URI`

#### YouTube Data API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API key)
5. Add the API key to `.env` as `YOUTUBE_API_KEY`

#### Spotify API (Optional)
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Create a new app
3. Get your Client ID and Client Secret
4. Add them to `.env` as `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`

### 5. Run the Application

```bash
npm start
```

The server will start on port 5000 (or the port specified in your `.env` file).

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit the `.env` file** - It contains sensitive credentials
2. **The `.pem` files** should never be committed to the repository
3. **API keys should be kept secret** - Don't share them publicly
4. **Password Security Warning**: The current implementation stores passwords in plain text. This is not secure for production use. Consider implementing proper password hashing with bcrypt before deploying to production.

## Project Structure

```
Music-cloud/
├── api/
│   ├── controllers/     # API controllers
│   └── routes/          # API routes
├── models/              # MongoDB models
├── assets/              # Static assets
├── flask-server/        # Flask server for downloads
├── index.html           # Main application page
├── login.html           # Login page
├── signup.html          # Signup page
├── about.html           # About page
├── server.js            # Main Express server
├── youtubeService.js    # YouTube API integration
├── musicServer.js       # Spotify API integration
└── package.json         # Node.js dependencies
```

## Available Scripts

- `npm start` - Start the production server

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongoose)
- **APIs**: YouTube Data API v3, Spotify Web API
- **Frontend**: HTML, CSS, JavaScript, jQuery
- **Authentication**: Custom user authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all sensitive data is in environment variables
5. Submit a pull request

## License

ISC

## Author

AstronDaniel
