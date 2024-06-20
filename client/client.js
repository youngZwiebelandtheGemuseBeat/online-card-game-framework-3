// client/client.js

const socket = io('http://localhost:3000');

const playerName = prompt("Enter your player name:");

socket.emit('joinGame', playerName);

// Listen for game updates from the server
socket.on('gameUpdate', (gameState) => {
  // Update the UI with the updated game state
  updateGameUI(gameState);
});

// Listen for the updated player list
socket.on('playerList', (players) => {
  // Update the UI with the updated player list
  updatePlayerList(players);
});

// Handle player actions
function makeMove(card) {
  // Send the chosen card to the server for validation
  socket.emit('makeMove', card);
}

function updateGameUI(gameState) {
  // Implement your UI update logic here
  console.log('Game state updated:', gameState);
}

function updatePlayerList(players) {
  // Implement your UI update logic here
  console.log('Player list updated:', players);
}
