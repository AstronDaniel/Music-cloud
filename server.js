// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors({
  origin: ['https://beatwave13.netlify.app', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// WebSocket connection handling
wss.on('connection', (ws) => {
  ws.id = Math.random().toString(36).substr(2, 9);
  console.log('New client connected');
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Add WebSocket server to app
app.set('wss', wss);

// Routes
app.use('/api/songs', require('./api/routes/songRoutes'));
app.use('/api/users', require('./api/routes/userRoutes'));

const PORT = process.env.PORT || 10000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));