// client/src/game/gameSetup.js

document.addEventListener('DOMContentLoaded', () => {
  const gameContainer = document.getElementById('game-container');

  // Create containers for player's cards and other players' stacks
  const playerCardsContainer = document.createElement('div');
  playerCardsContainer.id = 'player-cards-container';

  const leftStackContainer = document.createElement('div');
  leftStackContainer.id = 'left-stack-container';

  const rightStackContainer = document.createElement('div');
  rightStackContainer.id = 'right-stack-container';

  gameContainer.appendChild(leftStackContainer);
  gameContainer.appendChild(playerCardsContainer);
  gameContainer.appendChild(rightStackContainer);

  // Placeholder for player cards and other players' stacks
  const players = [
    { id: 1, cards: generateCards(7), element: playerCardsContainer },
    { id: 2, cards: generateCardBacks(7), element: leftStackContainer },
    { id: 3, cards: generateCardBacks(7), element: rightStackContainer }
  ];

  // Render cards for each player
  players.forEach(player => {
    player.cards.forEach(card => {
      player.element.appendChild(card);
    });
  });
});

function generateCards(count) {
  const cards = [];
  for (let i = 0; i < count; i++) {
    const card = document.createElement('img');
    card.src = 'src/assets/cards-front/_Y.png'; // Placeholder for actual card faces
    card.classList.add('card');
    cards.push(card);
  }
  return cards;
}

function generateCardBacks(count) {
  const cards = [];
  for (let i = 0; i < count; i++) {
    const card = document.createElement('img');
    card.src = 'src/assets/card-back.png';
    card.classList.add('card');
    cards.push(card);
  }
  return cards;
}
