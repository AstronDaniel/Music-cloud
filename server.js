// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

mongoose.connect('mongodb://localhost:27017/beatwave', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  playlists: [{
    name: String,
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }]
  }]
});

// Song Schema
const songSchema = new mongoose.Schema({
  title: String,
  artist: String,
  url: String,
  thumbnail: String
});

const User = mongoose.model('User', userSchema);
const Song = mongoose.model('Song', songSchema);