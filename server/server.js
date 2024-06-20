// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Use CORS middleware
app.use(cors());

// Track rooms and players
const rooms = {};
const playersInLobby = new Set();

const MAX_PLAYERS = 3;

io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  socket.on('playerName', (playerName) => {
    socket.playerName = playerName;
    playersInLobby.add(playerName);
    broadcastLobbyInfo();
  });

  // Handle room creation
  socket.on('createRoom', ({ roomName, password }) => {
    if (!rooms[roomName]) {
      rooms[roomName] = {
        players: [],
        password: password,
        gameState: {}
      };
      console.log(`Room created: ${roomName}`);
      socket.emit('roomCreated', { success: true, roomName });
      joinRoom(socket, roomName, socket.playerName);
    } else {
      socket.emit('roomCreated', { success: false, message: 'Room already exists' });
    }
  });

  // Handle joining a room
  socket.on('joinRoom', ({ roomName, password }) => {
    const room = rooms[roomName];
    if (room) {
      if (room.password === password) {
        if (room.players.length < MAX_PLAYERS) {
          joinRoom(socket, roomName, socket.playerName);
        } else {
          socket.emit('joinRoom', { success: false, message: 'Room is full' });
        }
      } else {
        socket.emit('joinRoom', { success: false, message: 'Incorrect password' });
      }
    } else {
      socket.emit('joinRoom', { success: false, message: 'Room does not exist' });
    }
  });

  // Handle player making a move
  socket.on('makeMove', ({ roomName, card }) => {
    const room = rooms[roomName];
    if (room) {
      // Validate the move and update the game state accordingly

      // Broadcast the updated game state to all players in the room
      io.to(roomName).emit('gameUpdate', room.gameState);
    }
  });

  // Handle player disconnection
  socket.on('disconnect', () => {
    if (socket.playerName) {
      playersInLobby.delete(socket.playerName);
    }
    for (const roomName in rooms) {
      const room = rooms[roomName];
      const index = room.players.findIndex(player => player.id === socket.id);
      if (index !== -1) {
        room.players.splice(index, 1);
        io.to(roomName).emit('playerList', room.players);
        console.log(`A player disconnected from room: ${roomName}`);
        if (room.players.length === 0) {
          delete rooms[roomName];
          io.emit('roomList', Object.keys(rooms));
          console.log(`Room deleted: ${roomName}`);
        }
        break;
      }
    }
    broadcastLobbyInfo();
    logRoomStatus();
  });

  function joinRoom(socket, roomName, playerName) {
    const room = rooms[roomName];
    const player = {
      id: socket.id,
      name: playerName
    };
    room.players.push(player);
    socket.join(roomName);
    playersInLobby.delete(playerName);
    socket.emit('joinRoom', { success: true, roomName });
    io.to(roomName).emit('playerList', room.players);
    console.log(`Player ${playerName} joined room: ${roomName}`);
    broadcastLobbyInfo();
    logRoomStatus();
  }

  function broadcastLobbyInfo() {
    const lobbyInfo = {
      players: Array.from(playersInLobby),
      rooms: Object.keys(rooms).map(roomName => ({
        name: roomName,
        players: rooms[roomName].players.map(player => player.name),
        isFull: rooms[roomName].players.length >= MAX_PLAYERS,
        password: rooms[roomName].password
      }))
    };
    io.emit('lobbyInfo', lobbyInfo);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

// Function to log the status of rooms
function logRoomStatus() {
  console.log(`Current rooms: ${JSON.stringify(rooms, null, 2)}`);
}
