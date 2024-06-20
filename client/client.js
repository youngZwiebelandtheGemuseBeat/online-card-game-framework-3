// client/client.js

let socket;
let playerName = sessionStorage.getItem('playerName') || '';
let roomName = '';

document.addEventListener("DOMContentLoaded", () => {
  const enterLobbyButton = document.getElementById('enter-lobby-button');
  const playerNameInput = document.getElementById('player-name-input');
  const createRoomButton = document.getElementById('create-room-button');
  const disconnectButton = document.getElementById('disconnect-button');
  const roomListContainer = document.getElementById('room-list');

  // Show welcome page if playerName is not already set
  if (!playerName) {
    document.getElementById('welcome').style.display = 'block';
  } else {
    enterLobby();
  }

  enterLobbyButton.addEventListener('click', enterLobbyHandler);
  playerNameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      enterLobbyHandler();
    }
  });

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
    const roomItem = event.target.closest('.room-item');
    if (roomItem) {
      roomName = roomItem.getAttribute('data-room-name');
      const isFull = roomItem.getAttribute('data-is-full') === 'true';
      const hasPassword = roomItem.getAttribute('data-has-password') === 'true';
      if (isFull) {
        alert('Room is full');
        return;
      }
      let password = '';
      if (hasPassword) {
        password = prompt("Enter the room password (if any):");
      }
      if (roomName !== null && (password !== null || !hasPassword)) {
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
      document.getElementById('lobby').style.display = 'block';
      document.getElementById('game').style.display = 'none';
      document.querySelector('#lobby h1').textContent = 'Lobby';
      roomName = '';
      initializeSocket();
      socket.emit('playerName', playerName); // Re-emit player name to update lobby info
    }
  });

  window.addEventListener('beforeunload', () => {
    if (socket) {
      socket.disconnect();
    }
  });

  function enterLobbyHandler() {
    playerName = playerNameInput.value.trim();
    if (playerName) {
      sessionStorage.setItem('playerName', playerName);
      enterLobby();
    } else {
      alert('Please enter your name.');
    }
  }

  function enterLobby() {
    document.getElementById('welcome').style.display = 'none';
    document.getElementById('lobby').style.display = 'block';
    initializeSocket();
    socket.emit('playerName', playerName);
  }

  function joinRoom(roomName) {
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.getElementById('room-name-header').textContent = `Room: ${roomName}`;

    socket.on('gameUpdate', (gameState) => {
      updateGameUI(gameState);
    });

    socket.on('playerList', (players) => {
      updatePlayerList(players);
    });
  }

  function initializeSocket() {
    if (!socket) {
      const serverIp = '192.168.31.128'; // Replace with current server IP address
      socket = io(`http://${serverIp}:3000`);
      socket.on('lobbyInfo', (lobbyInfo) => {
        updateLobbyInfo(lobbyInfo);
      });
    }
  }

  function fetchRoomList() {
    // Temporary socket connection to fetch room list
    const serverIp = '192.168.31.128'; // Replace with current server IP address
    const tempSocket = io(`http://${serverIp}:3000`);
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
    roomItem.setAttribute('data-room-name', room.name);
    roomItem.setAttribute('data-is-full', room.isFull);
    roomItem.setAttribute('data-has-password', !!room.password);

    const roomDot = document.createElement('span');
    roomDot.classList.add('dot', room.isFull ? 'red' : 'green');
    roomItem.appendChild(roomDot);

    const roomNameText = document.createElement('span');
    roomNameText.textContent = room.name + (room.isFull ? ' (Full)' : '');
    roomItem.appendChild(roomNameText);

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
