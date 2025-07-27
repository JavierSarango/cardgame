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

// Variables del juego 
let timerInterval = null;
let startTime = 0;
let elapsedTime = 0;



// Elementos UI adicionales
const movesDisplay = document.getElementById('movesDisplay');
const timerDisplay = document.getElementById('timerDisplay');

// Función para actualizar el timer
function updateTimer() {
    const seconds = Math.floor(elapsedTime % 60);
    const minutes = Math.floor((elapsedTime / 60) % 60);
    const hours = Math.floor(elapsedTime / 3600);
    
    timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Función para iniciar el timer
function startTimer() {
    startTime = Date.now() - elapsedTime * 1000;
    timerInterval = setInterval(() => {
        elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        updateTimer();
    }, 1000);
}

// Función para detener el timer
function stopTimer() {
    clearInterval(timerInterval);
}

// Función para resetear el timer
function resetTimer() {
    stopTimer();
    elapsedTime = 0;
    updateTimer();
}

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
    // Detener y resetear el timer
    stopTimer();
    elapsedTime = 0;
    updateTimer();
    
    // Resetear contador de movimientos
    movesCount = 0;
    movesDisplay.textContent = '0';
    
    // Limpiar mensajes
    statusText.textContent = 'Preparado para comenzar';
    winMessage.classList.add('hidden');
    loseMessage.classList.add('hidden');
    
    // Crear nuevo juego
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
function createCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card flipped'; // Iniciar boca abajo
    
    const frontImagePath = `assets/images/front/${card.numericValue}_${card.suit}.png`;
    const backImagePath = 'assets/images/back/card_back.png';
    
    const front = document.createElement('div');
    front.className = 'card-face card-front';
    front.style.backgroundImage = `url('${frontImagePath}')`;
    
    const back = document.createElement('div');
    back.className = 'card-face card-back';
    back.style.backgroundImage = `url('${backImagePath}')`;
    
    cardEl.appendChild(front);
    cardEl.appendChild(back);
    
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

// Modificar la función dealCards para iniciar el timer
function dealCards() {
    updateGameState('dealing');
    statusText.textContent = 'Repartiendo cartas...';
    startTimer(); // Iniciar el timer al repartir cartas
    // Solo resetear movimientos (el timer sigue corriendo)
    movesCount = 0;
    movesDisplay.textContent = '0';
    
    // Limpiar los stacks
    Object.values(stacks).forEach(stack => {
        stack.cards = [];
        stack.element.innerHTML = stack.id === 13 ? 'K' : stack.id;
    });
    
    // Barajar nuevamente antes de repartir
    shuffleArray(deck);
    
    let cardIndex = 0;
    const CARD_OFFSET = 15;
    
    for (let i = 0; i < 4; i++) {
        for (let stackId = 1; stackId <= 13; stackId++) {
            if (cardIndex >= deck.length) break;
            
            const card = deck[cardIndex++];
            const stack = stacks[stackId];
            stack.cards.push(card);
            
            const cardEl = createCardElement(card, false);
            card.element = cardEl;
            gameArea.appendChild(cardEl);
            
            const targetX = stack.position.x;
            const targetY = stack.position.y + (i * CARD_OFFSET);
            
            cardEl.style.left = `${targetX}px`;
            cardEl.style.top = `${targetY}px`;
            cardEl.style.zIndex = i;
            
            cardEl.style.setProperty('--startX', `-${targetX}px`);
            cardEl.style.setProperty('--startY', `-${targetY}px`);
            cardEl.classList.add('dealCard');
            
            if (i === 3) {
                cardEl.addEventListener('click', () => {
                    if (gameState === 'playing') {
                        moveCardToStack(card);
                    }
                });
            }
        }
    }
    
    deck = deck.slice(cardIndex);
    
    setTimeout(() => {
        statusText.textContent = '¡Comienza el juego! Haz clic en una carta para moverla.';
        updateGameState('playing');
        // Solo iniciar timer si no está corriendo
        if (!timerInterval) {
            startTimer();
        }
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
// Modificar la función moveCardToStack para incluir feedback visual
function moveCardToStack(card) {
    const sourceStack = findCardStack(card);
    if (!sourceStack) return;

    const targetStackId = card.numericValue;
    const targetStack = stacks[targetStackId];
    
    if (sourceStack.cards[sourceStack.cards.length - 1] !== card) {
        statusText.textContent = 'Solo puedes mover la carta superior del montón';
        return;
    }

    // Resaltar el stack destino
    targetStack.element.classList.add('target-highlight');
    
    // Mostrar feedback visual
    statusText.textContent = `Moviendo ${card.value} de ${card.suit} al montón ${targetStackId}`;
    
    // Desactivar clic temporalmente
    card.element.style.pointerEvents = 'none';

    // Voltear la carta (mostrar frente)
    card.element.classList.remove('flipped');
    
    setTimeout(() => {
        // Mover la carta después del volteo
        sourceStack.cards.pop();
        targetStack.cards.push(card);
        
        const cardEl = card.element;
        const targetX = targetStack.position.x;
        const targetY = targetStack.position.y + ((targetStack.cards.length - 1) * 15);
        
        cardEl.style.transition = 'left 0.5s ease, top 0.5s ease';
        cardEl.style.left = `${targetX}px`;
        cardEl.style.top = `${targetY}px`;
        
        cardEl.addEventListener('transitionend', () => {
            // Restaurar interacción
            cardEl.style.pointerEvents = 'auto';
            cardEl.style.transition = 'transform 0.6s ease';
            
            // Quitar resaltado del stack destino
            targetStack.element.classList.remove('target-highlight');
            
            // Mostrar nueva carta superior si existe
            if (sourceStack.cards.length > 0) {
                const newTopCard = sourceStack.cards[sourceStack.cards.length - 1];
                newTopCard.element.classList.remove('flipped');
            }
            
            // Incrementar contador de movimientos
            movesCount++;
            movesDisplay.textContent = movesCount;
            
            checkGameStatus(card);
        }, { once: true });
    }, 600);
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
    
    // Mostrar estadísticas finales
    document.getElementById('finalTime').textContent = timerDisplay.textContent;
    document.getElementById('finalMoves').textContent = movesCount;
    
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
    
    // Lógica de botones
    btnShuffle.disabled = state !== 'ready';
    btnDeal.disabled = state !== 'ready';
    btnReset.disabled = false;
    
    // Ocultar mensajes
    winMessage.classList.add('hidden');
    loseMessage.classList.add('hidden');
    
    // Manejar timer en estados finales
    if (state === 'win' || state === 'lose') {
        stopTimer();
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    preloadImages();
    initGame();
    
    btnShuffle.addEventListener('click', shuffleDeck);
    btnDeal.addEventListener('click', () => {
        dealCards();
        setTimeout(checkSuitsDistribution, 2100);
    });
    
    // Resetear completamente al presionar Reiniciar
    btnReset.addEventListener('click', () => {
        initGame();
    });
});