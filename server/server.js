// server.js

require('dotenv').config();
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

app.use(cors());

const rooms = {};
const playersInLobby = new Set();
const MAX_PLAYERS = parseInt(process.env.MAX_PLAYERS, 10) || 3;
const cardDecks = ['_G.png', '_R.png', '_B.png']; // Simplified deck
const ENABLE_SERVER_MESSAGES = false; // debug server messages in ChatBox

io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  socket.on('playerName', (playerName) => {
    socket.playerName = playerName;
    playersInLobby.add(playerName);
    broadcastLobbyInfo();
  });

  socket.on('createRoom', ({ roomName, password }) => {
    if (!rooms[roomName]) {
      rooms[roomName] = {
        players: [],
        password: password,
        gameState: {},
        messages: [],
        readyPlayers: new Set()
      };
      console.log(`Room created: ${roomName}`);
      socket.emit('roomCreated', { success: true, roomName });
      joinRoom(socket, roomName, socket.playerName);
    } else {
      socket.emit('roomCreated', { success: false, message: 'Room already exists' });
    }
  });

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

  socket.on('playerReady', (roomName) => {
    const room = rooms[roomName];
    if (room) {
      room.readyPlayers.add(socket.id);
      io.to(roomName).emit('playerReady', room.readyPlayers.size);
      if (room.readyPlayers.size === MAX_PLAYERS) {
        dealCards(roomName);
      }
    }
  });

  socket.on('makeMove', ({ roomName, card }) => {
    const room = rooms[roomName];
    if (room) {
      // Validate the move and update the game state accordingly
      io.to(roomName).emit('gameUpdate', room.gameState);
    }
  });

  socket.on('disconnect', () => {
    if (socket.playerName) {
      playersInLobby.delete(socket.playerName);
    }
    for (const roomName in rooms) {
      const room = rooms[roomName];
      const index = room.players.findIndex(player => player.id === socket.id);
      if (index !== -1) {
        room.players.splice(index, 1);
        room.readyPlayers.delete(socket.id);
        io.to(roomName).emit('playerList', room.players);
        if (ENABLE_SERVER_MESSAGES) {
          io.to(roomName).emit('message', { user: 'Server', text: `${socket.playerName} has left the room.` });
        }
        console.log(`A player disconnected from room: ${roomName}`);
        if (room.players.length === 0) {
          delete rooms[roomName];
          io.emit('roomList', Object.keys(rooms));
          console.log(`Room deleted: ${roomName}`);
        } else {
          resetReadyState(roomName);
          io.to(roomName).emit('roomState', 'Waiting for players...');
        }
        break;
      }
    }
    broadcastLobbyInfo();
    logRoomStatus();
  });

  function joinRoom(socket, roomName, playerName) {
    const room = rooms[roomName];
    const player = { id: socket.id, name: playerName };
    room.players.push(player);
    socket.join(roomName);
    playersInLobby.delete(playerName);
    socket.emit('joinRoom', { success: true, roomName, messages: room.messages });
    io.to(roomName).emit('playerList', room.players);
    if (ENABLE_SERVER_MESSAGES) {
      io.to(roomName).emit('message', { user: 'Server', text: `${playerName} has joined the room.` });
    }
    console.log(`Player ${playerName} joined room: ${roomName}`);
    broadcastLobbyInfo();
    logRoomStatus();
    checkRoomFull(roomName);
  }

  function checkRoomFull(roomName) {
    const room = rooms[roomName];
    if (room.players.length === MAX_PLAYERS) {
      io.to(roomName).emit('roomFull');
    }
  }

  function resetReadyState(roomName) {
    const room = rooms[roomName];
    room.readyPlayers.clear();
  }

  function dealCards(roomName) {
    const room = rooms[roomName];
    room.players.forEach((player, index) => {
      io.to(player.id).emit('dealCards', {
        hand: Array(7).fill(cardDecks[index]) // Each player gets seven cards of one type
      });
    });
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

  socket.on('sendMessage', ({ roomName, message }) => {
    const room = rooms[roomName];
    if (room) {
      const chatMessage = { user: socket.playerName, text: message };
      room.messages.push(chatMessage);

      if (room.messages.length > 10) {
        room.messages.shift();
      }

      io.to(roomName).emit('message', chatMessage);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

function logRoomStatus() {
  console.log(`Current rooms: ${JSON.stringify(rooms, null, 2)}`);
}
