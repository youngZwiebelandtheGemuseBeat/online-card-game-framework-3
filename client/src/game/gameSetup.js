// client/src/game/gameSetup.js

document.addEventListener('DOMContentLoaded', () => {
  const gameContainer = document.getElementById('game-container');

  const leftStackContainer = document.createElement('div');
  leftStackContainer.id = 'left-stack-container';

  const rightStackContainer = document.createElement('div');
  rightStackContainer.id = 'right-stack-container';

  gameContainer.appendChild(leftStackContainer);
  gameContainer.appendChild(rightStackContainer);
});

function generateCards(card) {
  const cards = [];
  const cardElement = document.createElement('img');
  cardElement.src = `src/assets/cards-front/${card}`;
  cardElement.classList.add('card');
  cards.push(cardElement);
  return cards;
}

// function generateCardBacks(count) {
//   const cards = [];
//   for (let i = 0; i < count; i++) {
//     const card = document.createElement('img');
//     card.src = 'src/assets/card-back.png';
//     card.classList.add('card');
//     cards.push(card);
//   }
//   return cards;
// }
