// client/client.js

let socket;
let playerName = '';
let roomName = '';

document.addEventListener("DOMContentLoaded", () => {
  const createRoomButton = document.getElementById('create-room-button');
  const disconnectButton = document.getElementById('disconnect-button');
  const roomListContainer = document.getElementById('room-list');

  // Ask for player name when the page loads
  askForPlayerName();

  createRoomButton.addEventListener('click', () => {
    roomName = prompt("Enter the room name:");
    const password = prompt("Enter a password for the room (optional):");
    if (roomName !== null && password !== null) {
      socket.emit('createRoom', { roomName, password });

      socket.on('roomCreated', (response) => {
        if (response.success) {
          joinRoom(response.roomName);
        } else {
          alert(response.message);
        }
      });
    }
  });

  roomListContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('room-item')) {
      roomName = event.target.textContent;
      const password = prompt("Enter the room password (if any):");
      if (roomName !== null && password !== null) {
        socket.emit('joinRoom', { roomName, password });

        socket.on('joinRoom', (response) => {
          if (response.success) {
            joinRoom(response.roomName);
          } else {
            alert(response.message);
          }
        });
      }
    }
  });

  disconnectButton.addEventListener('click', () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      askForPlayerName(); // Re-ask for player name after disconnecting
    }
    document.getElementById('lobby').style.display = 'block';
    document.getElementById('game').style.display = 'none';
    roomName = '';
  });

  function askForPlayerName() {
    playerName = prompt("Enter your player name:");
    if (playerName) {
      initializeSocket();
      socket.emit('playerName', playerName);
    } else {
      askForPlayerName(); // Keep asking until a name is provided
    }
  }

  function joinRoom(roomName) {
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.getElementById('room-name').textContent = `Room: ${roomName}`;

    socket.on('gameUpdate', (gameState) => {
      updateGameUI(gameState);
    });

    socket.on('playerList', (players) => {
      updatePlayerList(players);
    });
  }

  function initializeSocket() {
    if (!socket) {
      socket = io('http://localhost:3000');
      socket.on('lobbyInfo', (lobbyInfo) => {
        updateLobbyInfo(lobbyInfo);
      });
    }
  }

  function fetchRoomList() {
    // Temporary socket connection to fetch room list
    const tempSocket = io('http://localhost:3000');
    tempSocket.on('lobbyInfo', (lobbyInfo) => {
      updateLobbyInfo(lobbyInfo);
      tempSocket.disconnect(); // Disconnect after fetching the lobby info
    });
  }
});

function updateLobbyInfo(lobbyInfo) {
  const roomListContainer = document.getElementById('room-list');
  roomListContainer.innerHTML = '';

  const playersInLobby = document.createElement('div');
  playersInLobby.textContent = `Players in Lobby: ${lobbyInfo.players.join(', ')}`;
  roomListContainer.appendChild(playersInLobby);

  lobbyInfo.rooms.forEach(room => {
    const roomItem = document.createElement('div');
    roomItem.classList.add('room-item');
    roomItem.textContent = room.name + (room.isFull ? ' (Full)' : '');
    const roomPlayers = document.createElement('div');
    roomPlayers.textContent = `Players: ${room.players.join(', ')}`;
    roomListContainer.appendChild(roomItem);
    roomListContainer.appendChild(roomPlayers);
  });
}

function makeMove(card) {
  if (socket) {
    socket.emit('makeMove', { roomName, card });
  }
}

function updateGameUI(gameState) {
  console.log('Game state updated:', gameState);
}

function updatePlayerList(players) {
  const playerListContainer = document.getElementById('player-list');
  playerListContainer.innerHTML = 'Players in Room: ' + players.map(player => player.name === playerName ? `${player.name} (You)` : player.name).join(', ');
}
