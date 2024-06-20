// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://127.0.0.1:8080",
    methods: ["GET", "POST"]
  }
});

// Use CORS middleware
app.use(cors());

// Track connected players
const players = [];
let gameState = {}; // Initialize your game state

io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  // Handle player joining the game
  socket.on('joinGame', (playerName) => {
    // Create a player object
    const player = {
      id: socket.id,
      name: playerName,
    };

    // Add the player to the list of players
    players.push(player);

    // Emit the game state to the newly joined player
    socket.emit('gameUpdate', gameState);

    // Broadcast the updated player list to all clients
    io.emit('playerList', players);
  });

  // Handle player making a move
  socket.on('makeMove', (card) => {
    // Validate the move and update the game state accordingly

    // Broadcast the updated game state to all players
    io.emit('gameUpdate', gameState);
  });

  // Handle player disconnection
  socket.on('disconnect', () => {
    // Remove the player from the list of players
    const index = players.findIndex((player) => player.id === socket.id);
    if (index !== -1) {
      players.splice(index, 1);
      // Broadcast the updated player list to all clients
      io.emit('playerList', players);
    }
    console.log('A player disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
