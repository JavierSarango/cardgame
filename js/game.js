// Configuración del juego
const suits = ['heart', 'diamond', 'club', 'spade'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const stackPositions = [
    // Fila superior
    {id: 1, x: 30, y: 15},
    {id: 2, x: 220, y: 15},
    {id: 3, x: 420, y: 15},
    {id: 4, x: 600, y: 15},
    
    // Lado derecho
    {id: 5, x: 600, y: 180},
    {id: 6, x: 600, y: 350},
    {id: 7, x: 600, y: 520},
    
    // Fila inferior
    {id: 8, x: 420, y: 520},
    {id: 9, x: 220, y: 520},
    {id: 10, x: 30, y: 520},
    
    // Lado izquierdo
    {id: 11, x: 30, y: 350},
    {id: 12, x: 30, y: 180},
    
    // Centro
    {id: 13, x: 320, y: 280}
];

// Precarga de imágenes
function preloadImages() {
    const numericValues = Array.from({length: 13}, (_, i) => i + 1);
   
    // Precargar reverso
    new Image().src = 'assets/images/back/card_back.png';
    
    // Precargar todas las cartas
    suits.forEach(suit => {
        numericValues.forEach(value => {
            new Image().src = `assets/images/front/${value}_${suit}.png`;
            
        });
    });
}

// Variables del juego
let deck = [];
let stacks = {};
let gameArea = document.getElementById('gameArea');
let statusText = document.getElementById('statusText');
let winMessage = document.getElementById('winMessage');
let loseMessage = document.getElementById('loseMessage');
let gameState = 'ready';
let movesCount = 0;

// Elementos UI
const btnShuffle = document.getElementById('btnShuffle');
const btnDeal = document.getElementById('btnDeal');
const btnReset = document.getElementById('btnReset');

// Inicializar el juego
function initGame() {
    createDeck();
    createStacks();
    updateGameState('ready');
}

// Crear la baraja// Crear la baraja
function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({
                suit: suit,
                value: value,
                numericValue: values.indexOf(value) + 1,
                element: null
            });
        }
    }
    // Barajar inmediatamente después de crear
    shuffleArray(deck);
}

// Función auxiliar para barajar arrays
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
// Crear los montones
function createStacks() {
    gameArea.innerHTML = '';
    stacks = {};
    
    stackPositions.forEach(pos => {
        const stack = document.createElement('div');
        stack.className = 'stack';
        stack.id = `stack${pos.id}`;
        // stack.textContent = pos.id === 13 ? 'K' : pos.id;
        stack.style.left = `${pos.x}px`;
        stack.style.top = `${pos.y}px`;
        gameArea.appendChild(stack);
        
        stacks[pos.id] = {
            id: pos.id,
            element: stack,
            cards: [],
            position: {x: pos.x, y: pos.y},
            completed: false
        };
    });
}

// Crear elemento de carta
function createCardElement(card, isFaceUp = false) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    
    // Asignar imágenes
    const frontImagePath = `assets/images/front/${card.numericValue}_${card.suit}.png`;
    const backImagePath = 'assets/images/back/card_back.png';
    
    // Verifica rutas en consola (para debug)
    //console.log('Buscando imagen frontal en:', frontImagePath);
    //console.log('Buscando imagen trasera en:', backImagePath);
    
    // Crea elementos de imagen
    const front = document.createElement('div');
    front.className = 'card-face card-front';
    front.style.backgroundImage = `url('${frontImagePath}')`;
    
    const back = document.createElement('div');
    back.className = 'card-face card-back';
    back.style.backgroundImage = `url('${backImagePath}')`;
    
    cardEl.appendChild(front);
    cardEl.appendChild(back);
     // Inicialmente mostrar el reverso
    if (!isFaceUp) {
        cardEl.classList.add('flipped');
    }
    // Evento para mover carta
    // cardEl.addEventListener('click', () => {
    //     if (gameState === 'playing') {
    //         moveCardToStack(card);
    //     }
    // });
    
    return cardEl;
}

// Barajar cartas
function shuffleDeck() {
    updateGameState('shuffling');
    statusText.textContent = 'Barajando cartas...';
    
    deck.forEach(card => {
        const cardEl = createCardElement(card);
        card.element = cardEl;
        gameArea.appendChild(cardEl);
        
        cardEl.style.left = '50%';
        cardEl.style.top = '50%';
        cardEl.style.transform = 'translate(-50%, -50%)';
    });
    
    setTimeout(() => {
        const shufflePromises = [];
        
        deck.forEach(card => {
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 100;
            const rotation = Math.random() * 360;
            
            card.element.style.setProperty('--endX', `${Math.cos(angle) * distance}px`);
            card.element.style.setProperty('--endY', `${Math.sin(angle) * distance}px`);
            card.element.style.setProperty('--rotation', `${rotation}deg`);
            
            card.element.classList.add('card-shuffle');
            
            const promise = new Promise(resolve => {
                card.element.addEventListener('animationend', () => {
                    card.element.remove();
                    resolve();
                }, {once: true});
            });
            
            shufflePromises.push(promise);
        });
        
        Promise.all(shufflePromises).then(() => {
            statusText.textContent = 'Cartas barajadas. Listo para repartir.';
            updateGameState('ready');
        });
    }, 100);
}

// Repartir cartas

function dealCards() {
    updateGameState('dealing');
    statusText.textContent = 'Repartiendo cartas...';
    
     // Limpiar los stacks
    Object.values(stacks).forEach(stack => {
        stack.cards = [];
        stack.element.innerHTML = stack.id === 13 ? 'K' : stack.id; // Restaurar texto del stack
    });
    
    // Barajar nuevamente antes de repartir
    shuffleArray(deck);
    
    // Distribución mejorada
    // Distribución mejorada
    let cardIndex = 0;
    const CARD_OFFSET = 15; // Pixeles de separación para el efecto escalera
    
    for (let i = 0; i < 4; i++) {
        for (let stackId = 1; stackId <= 13; stackId++) {
            if (cardIndex >= deck.length) break;
            
            const card = deck[cardIndex++];
            const stack = stacks[stackId];
            stack.cards.push(card);
            
            const cardEl = createCardElement(card, false); // Todas comienzan boca abajo
            card.element = cardEl;
            gameArea.appendChild(cardEl);
            
            const targetX = stack.position.x;
            const targetY = stack.position.y + (i * CARD_OFFSET); // Efecto escalera
            
            cardEl.style.left = `${targetX}px`;
            cardEl.style.top = `${targetY}px`;
            cardEl.style.zIndex = i; // Asegurar orden de apilamiento
            
            // Animación de reparto
            cardEl.style.setProperty('--startX', `-${targetX}px`);
            cardEl.style.setProperty('--startY', `-${targetY}px`);
            cardEl.classList.add('dealCard');
            
            // Configurar evento de clic solo para la última carta añadida
            if (i === 3) {
                cardEl.addEventListener('click', () => {
                    if (gameState === 'playing') {
                        moveCardToStack(card);
                    }
                });
            }
        }
    }
    
    
    // Actualizar el mazo después de repartir
    deck = deck.slice(cardIndex);
    
    setTimeout(() => {
        statusText.textContent = '¡Comienza el juego! Haz clic en una carta para moverla.';
        updateGameState('playing');
    }, 2000);
}
function checkSuitsDistribution() {
    const suitCount = {
        heart: 0,
        diamond: 0,
        club: 0,
        spade: 0
    };
    
    Object.values(stacks).forEach(stack => {
        if (stack.cards.length > 0) {
            const topCard = stack.cards[stack.cards.length - 1];
            suitCount[topCard.suit]++;
        }
    });
    
    console.log('Distribución de palos en cartas visibles:', suitCount);
}
// Mover carta a stack
function moveCardToStack(card) {
    const sourceStack = findCardStack(card);
    if (!sourceStack) return;
    
    const targetStackId = card.numericValue;
    const targetStack = stacks[targetStackId];
    
    // Verificar que es la carta superior
    if (sourceStack.cards[sourceStack.cards.length - 1] !== card) {
        statusText.textContent = 'Solo puedes mover la carta superior del montón';
        return;
    }
    
    // Animación de movimiento
    sourceStack.cards.pop();
    movesCount++;
    targetStack.cards.push(card);
    
    const cardEl = card.element;
    const targetX = targetStack.position.x;
    const targetY = targetStack.position.y + ((targetStack.cards.length - 1) * 15); // Posición en escalera
    
    cardEl.style.zIndex = 1000; // Asegurar que está por encima durante el movimiento
    
    cardEl.style.transition = 'all 0.5s ease';
    cardEl.style.left = `${targetX}px`;
    cardEl.style.top = `${targetY}px`;
    
    cardEl.addEventListener('transitionend', () => {
        cardEl.style.transition = '';
        cardEl.style.zIndex = targetStack.cards.length - 1;
        
        // Voltear la nueva carta superior en el stack de origen
        if (sourceStack.cards.length > 0) {
            const newTopCard = sourceStack.cards[sourceStack.cards.length - 1];
            setTimeout(() => {
                newTopCard.element.classList.remove('flipped');
            }, 300);
        }
        
        checkGameStatus(card);
    }, {once: true});
}

// Funciones auxiliares
function findCardStack(card) {
    return Object.values(stacks).find(stack => stack.cards.includes(card));
}

function checkGameStatus(movedCard) {
    let allCompleted = true;
    
    Object.values(stacks).forEach(stack => {
        const requiredValue = stack.id;
        const allMatch = stack.cards.every(card => card.numericValue === requiredValue);
        
        stack.completed = allMatch && stack.cards.length === 4;
        stack.element.classList.toggle('completed', stack.completed);
        
        if (!stack.completed) allCompleted = false;
    });
    
    if (allCompleted) {
        winGame();
        return;
    }
    
    if (movedCard.value === 'K') {
        const nonKingCards = Object.values(stacks).some(stack => 
            stack.id !== 13 && 
            stack.cards.length < 4 &&
            stack.cards.some(card => card.value !== 'K')
        );
        
        if (!nonKingCards) {
            loseGame();
        }
    }
}

function winGame() {
    updateGameState('win');
    statusText.textContent = '¡Felicidades! Has ganado el juego.';
    winMessage.classList.remove('hidden');
    Object.values(stacks).forEach(stack => stack.element.classList.add('completed'));
}

function loseGame() {
    updateGameState('lose');
    statusText.textContent = '¡Juego terminado! El Rey bloqueó el juego.';
    loseMessage.classList.remove('hidden');
}

function updateGameState(state) {
    gameState = state;
    btnShuffle.disabled = state === 'shuffling' || state === 'dealing';
    btnDeal.disabled = state === 'shuffling' || state === 'dealing' || state === 'playing';
    btnReset.disabled = false;
    winMessage.classList.add('hidden');
    loseMessage.classList.add('hidden');
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    preloadImages();
    initGame();
    btnShuffle.addEventListener('click', shuffleDeck);
    btnDeal.addEventListener('click', () => {
        dealCards();
        setTimeout(checkSuitsDistribution, 2100); // Verificar después de repartir
    });
    btnReset.addEventListener('click', initGame);
});