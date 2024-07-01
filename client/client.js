let socket;
let playerName = sessionStorage.getItem('playerName') || '';
let roomName = '';

document.addEventListener("DOMContentLoaded", () => {
  const enterLobbyButton = document.getElementById('enter-lobby-button');
  const playerNameInput = document.getElementById('player-name-input');
  const createRoomButton = document.getElementById('create-room-button');
  const disconnectButton = document.getElementById('disconnect-button');
  const roomListContainer = document.getElementById('room-list');

  // Chat elements
  const chatBoxWrapper = document.createElement('div');
  chatBoxWrapper.className = 'chatBoxWrapper';
  chatBoxWrapper.style.display = 'none'; // Initially hidden
  document.body.appendChild(chatBoxWrapper);

  const chatBox = document.createElement('div');
  chatBox.className = 'chat-box';
  chatBoxWrapper.appendChild(chatBox);

  const chatHead = document.createElement('div');
  chatHead.className = 'chat-head';
  chatBox.appendChild(chatHead);

  const chatTitle = document.createElement('h2');
  chatTitle.textContent = 'Chat Box';
  chatHead.appendChild(chatTitle);

  const toggleChatBox = document.createElement('span');
  toggleChatBox.className = 'material-icons';
  toggleChatBox.textContent = 'keyboard_arrow_up';
  chatHead.appendChild(toggleChatBox);

  const chatBody = document.createElement('div');
  chatBody.className = 'chat-body';
  chatBody.style.display = 'none'; // Initially hidden
  chatBox.appendChild(chatBody);

  const msgInsert = document.createElement('div');
  msgInsert.className = 'msg-insert';
  chatBody.appendChild(msgInsert);

  const chatText = document.createElement('div');
  chatText.className = 'chat-text';
  chatBox.appendChild(chatText);

  const chatInput = document.createElement('input');
  chatInput.type = 'text';
  chatInput.placeholder = 'Type a message...';
  chatText.appendChild(chatInput);

  const sendButton = document.createElement('button');
  sendButton.className = 'send-button';
  sendButton.innerHTML = '<span class="material-icons">send</span>';
  chatText.appendChild(sendButton);

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

  sendButton.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      sendMessage(event);
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
            response.messages.forEach(message => {
              appendMessage(message);
            });
          } else {
            alert(response.message);
          }
        });
      }
    }
  });

  disconnectButton.addEventListener('click', () => {
    const confirmation = confirm('Are you sure you want to leave the room?');
    if (confirmation) {
      leaveRoom();
    }
  });

  window.addEventListener('beforeunload', (event) => {
    if (socket && roomName) {
      const confirmationMessage = 'Are you sure you want to leave the game?';
      event.returnValue = confirmationMessage; // Standard for most browsers
      return confirmationMessage; // For some older browsers
    }
  });

  function leaveRoom() {
    if (socket) {
      socket.disconnect();
      socket = null;
      document.getElementById('lobby').style.display = 'block';
      document.getElementById('game').style.display = 'none';
      chatBoxWrapper.style.display = 'none'; // Hide chat box
      roomName = '';
      initializeSocket();
      socket.emit('playerName', playerName); // Re-emit player name to update lobby info
    }
  }

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
    // document.getElementById('room-name-header').textContent = `Room: ${roomName}`;
    // document.getElementById('room-name-header').textContent = `${roomName}`;
    chatBoxWrapper.style.display = 'block'; // Show chat box

    socket.on('gameUpdate', (gameState) => {
      updateGameUI(gameState);
    });

    socket.on('playerList', (players) => {
      updatePlayerList(players);
    });

    socket.on('message', (message) => {
      appendMessage(message);
    });
  }

  function initializeSocket() {
    if (!socket) {
      const serverIp = '13.51.167.68'; // Replace with current server IP address
      socket = io(`http://${serverIp}:80`);
      socket.on('lobbyInfo', (lobbyInfo) => {
        updateLobbyInfo(lobbyInfo);
      });
    }
  }

  function fetchRoomList() {
    // Temporary socket connection to fetch room list
    const serverIp = '13.51.167.68'; // Replace with current server IP address
    const tempSocket = io(`http://${serverIp}:80`);
    tempSocket.on('lobbyInfo', (lobbyInfo) => {
      updateLobbyInfo(lobbyInfo);
      tempSocket.disconnect(); // Disconnect after fetching the lobby info
    });
  }

  function appendMessage(message) {
    const msgElement = document.createElement('div');
    msgElement.className = message.user === playerName ? 'msg-send' : 'msg-receive';
    msgElement.textContent = `${message.user}: ${message.text}`;
    msgInsert.appendChild(msgElement);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function sendMessage(event) {
    event.preventDefault();
    if (chatInput.value) {
      socket.emit('sendMessage', { roomName, message: chatInput.value });
      chatInput.value = '';
    }
  }

  chatHead.addEventListener('click', () => {
    if (chatBody.style.display === 'none') {
      chatBody.style.display = 'block';
      toggleChatBox.textContent = 'keyboard_arrow_down';
      chatText.style.display = 'block'; // Show input when open
    } else {
      chatBody.style.display = 'none';
      toggleChatBox.textContent = 'keyboard_arrow_up';
      chatText.style.display = 'none'; // Hide input when closed
    }
  });
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
