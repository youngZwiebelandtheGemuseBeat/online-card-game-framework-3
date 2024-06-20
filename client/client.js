// client/client.js

let socket;
let playerName = '';

document.addEventListener("DOMContentLoaded", () => {
  const joinButton = document.getElementById('join-button');
  const disconnectButton = document.getElementById('disconnect-button');

  joinButton.addEventListener('click', () => {
    playerName = prompt("Enter your player name:");
    if (playerName) {
      socket = io('http://localhost:3000');

      socket.emit('joinGame', playerName);
      document.getElementById('lobby').style.display = 'none';
      document.getElementById('game').style.display = 'block';

      socket.on('gameUpdate', (gameState) => {
        updateGameUI(gameState);
      });

      socket.on('playerList', (players) => {
        updatePlayerList(players);
      });
    }
  });

  disconnectButton.addEventListener('click', () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    document.getElementById('lobby').style.display = 'block';
    document.getElementById('game').style.display = 'none';
  });
});

function makeMove(card) {
  if (socket) {
    socket.emit('makeMove', card);
  }
}

function updateGameUI(gameState) {
  console.log('Game state updated:', gameState);
}

function updatePlayerList(players) {
  console.log('Player list updated:', players);
}
