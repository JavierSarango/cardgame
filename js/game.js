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
let isTimerRunning = false;

// Variables adicionales
let lastMovedCard = null;
let currentActiveStack = null;
let userQuestionText = ""; 
let consecutiveCorrectStackMoves = 0; 
// Elementos UI adicionales
const movesDisplay = document.getElementById('movesDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const statusText = document.getElementById('statusText'); 

// Referencias a los botones
const btnShuffle = document.getElementById('btnShuffle');
const btnDeal = document.getElementById('btnDeal');
const btnReset = document.getElementById('btnReset');

// Referencias a los elementos del juego y modales
const gameArea = document.getElementById('gameArea');
const gameScreen = document.getElementById('gameScreen'); 

const oracleIntroModal = document.getElementById('oracleIntroModal');
const winModal = document.getElementById('winModal');
const loseModal = document.getElementById('loseModal');

const userQuestionInput = document.getElementById('userQuestion');
const startGameButton = document.getElementById('startGameButton');
const oracleWinAnswer = document.getElementById('oracleWinAnswer');
const oracleLoseAnswer = document.getElementById('oracleLoseAnswer');
const playAgainWinButton = document.getElementById('playAgainWin');
const playAgainLoseButton = document.getElementById('playAgainLose');


// Función para actualizar el timer
function updateTimer() {
    const seconds = Math.floor(elapsedTime % 60);
    const minutes = Math.floor((elapsedTime / 60) % 60);
    const hours = Math.floor(elapsedTime / 3600);

    timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Función para iniciar el timer
function startTimer() {
    if (isTimerRunning) return;

    isTimerRunning = true;
    startTime = Date.now() - (elapsedTime * 1000);

    timerInterval = setInterval(() => {
        elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        updateTimer();
    }, 1000);
}

// Función para detener el timer
function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isTimerRunning = false;
}

// Precarga de imágenes
function preloadImages() {
    const numericValues = Array.from({length: 13}, (_, i) => i + 1);

    new Image().src = 'assets/images/back/card_back.png';

    suits.forEach(suit => {
        numericValues.forEach(value => {
            new Image().src = `assets/images/front/${value}_${suit}.png`;
        });
    });
    // Precargar imagen del oráculo 
    new Image().src = 'assets/oracle/oracle_character2.png'; 
}

// Variables del juego
let deck = [];
let stacks = {};
let gameState = 'ready';
let movesCount = 0;

// Inicializar el juego
function initGame() {
    // Esconder la pantalla del juego
    gameScreen.classList.add('hidden');

    // Mostrar el modal de introducción
    oracleIntroModal.classList.remove('hidden');

   
    winModal.classList.add('hidden');
    loseModal.classList.add('hidden');

    // Resetear el estado del juego para un nuevo inicio
    resetGame();
    statusText.textContent = 'Por favor, ingresa tu pregunta al oráculo.';
}

function resetGame() {
    stopTimer();
    elapsedTime = 0;
    updateTimer();
    isTimerRunning = false;

    movesCount = 0;
    movesDisplay.textContent = '0';
    lastMovedCard = null;
    currentActiveStack = null;
    statusText.textContent = 'Preparado para comenzar ¡Dale a Barajar!'; 

    gameArea.innerHTML = ''; 

    createDeck();
    createStacks();
    updateGameState('ready');
}

// Crear la baraja
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
function createCardElement(card, isFlippedInitially = true) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    if (isFlippedInitially) {
        cardEl.classList.add('flipped');
    }

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
        const cardEl = createCardElement(card, true);
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
    stopTimer();
    elapsedTime = 0;
    updateTimer();
    movesCount = 0;
    movesDisplay.textContent = '0';

    Object.values(stacks).forEach(stack => {
        stack.cards.forEach(card => {
            if (card.element) {
                card.element.remove();
            }
        });
        stack.cards = [];
    });

    createDeck();

    let cardIndex = 0;
    const dealPromises = []; // Para esperar a que todas las cartas se repartan

    for (let i = 0; i < 4; i++) {
        for (let stackId = 1; stackId <= 13; stackId++) {
            if (cardIndex >= deck.length) break;

            const card = deck[cardIndex++];
            const stack = stacks[stackId];

            stack.cards.unshift(card);

            const cardEl = createCardElement(card, true);
            card.element = cardEl;
            gameArea.appendChild(cardEl);

            cardEl.style.left = '50%';
            cardEl.style.top = '50%';
            cardEl.style.transform = 'translate(-50%, -50%)';
            cardEl.style.zIndex = 50 + i;
            cardEl.style.transition = 'left 0.8s ease, top 0.8s ease, transform 0.8s ease, z-index 0.8s ease';

            const promise = new Promise(resolve => {
                setTimeout(() => {
                    cardEl.style.left = `${stack.position.x}px`;
                    cardEl.style.top = `${stack.position.y}px`;
                    cardEl.style.transform = 'none';
                    cardEl.style.zIndex = i; // Asegurar el z-index correcto
                    cardEl.addEventListener('transitionend', function handler(e) {
                        if (e.propertyName === 'left' || e.propertyName === 'top') {
                            cardEl.removeEventListener('transitionend', handler);
                            resolve();
                        }
                    }, {once: true});
                }, cardIndex * 50);
            });
            dealPromises.push(promise);
        }
    }

    // Esperar a que todas las animaciones de reparto terminen
    Promise.all(dealPromises).then(() => {
        Object.values(stacks).forEach(stack => {
            updateStackVisuals(stack);
        });
        statusText.textContent = '¡Comienza el juego! Haz clic en una carta para moverla.';
        updateGameState('playing');
        startTimer();
    });
}

function updateStackVisuals(stack) {
    const CARD_OFFSET = 15;

    // Limpiar visualmente el contenido del stack, si es necesario, antes de re-renderizar
    if (stack.id === 13) {

        stack.element.classList.add('central-stack');
        stack.element.classList.remove('completed-stack-base');
    } else {

        stack.element.classList.remove('central-stack', 'completed-stack-base');
    }

    stack.cards.forEach((card, index) => {
        const cardEl = card.element;
        let targetX = stack.position.x;
        let targetY = stack.position.y;
        let zIndex = index;

        targetY = stack.position.y + index * CARD_OFFSET;
        zIndex = index;

        if (index === stack.cards.length - 1) { 
            cardEl.classList.remove('flipped'); // Mostrar cara (quita 'flipped')
        } else {
            cardEl.classList.add('flipped'); // Esconder cara (añade 'flipped')
        }

        cardEl.style.transition = 'left 0.2s ease, top 0.2s ease, z-index 0.2s ease';
        cardEl.style.left = `${targetX}px`;
        cardEl.style.top = `${targetY}px`;
        cardEl.style.zIndex = zIndex;

        // Gestión de clickability: solo la carta superior es clicable
        if (index === stack.cards.length - 1) {
            if (!card.clickListener) {
                card.clickListener = () => {
                    if (gameState === 'playing') {
                        moveCardToStack(card);
                    }
                };
            }
            cardEl.addEventListener('click', card.clickListener);
            cardEl.style.pointerEvents = 'auto';
        } else {
            if (card.clickListener) {
                cardEl.removeEventListener('click', card.clickListener);
            }
            cardEl.style.pointerEvents = 'none';
        }
    });
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

    if (sourceStack.cards[sourceStack.cards.length - 1] !== card) {
        statusText.textContent = 'Solo puedes mover la carta superior del montón.';
        return;
    }

    if (sourceStack.id === targetStackId) { 
        consecutiveCorrectStackMoves++;
    } else {
        consecutiveCorrectStackMoves = 0; 
    }

    // Comprobación temprana de derrota si ya excedió el límite
  statusText.textContent = `Movimientos seguidos al stack correcto: ${consecutiveCorrectStackMoves}.`;
    if (consecutiveCorrectStackMoves >= 5) {
    loseGame();
    statusText.textContent = '¡Has perdido! Demasiados movimientos seguidos a tu stack correcto.';
    return;
}   


    if (sourceStack.id === targetStackId && card.numericValue === sourceStack.id && targetStack.cards[0] === card && targetStack.cards.length === 4) {
        statusText.textContent = 'Esta carta ya está en su posición final.';
       
        consecutiveCorrectStackMoves = 0; 
        return;
    }

    statusText.textContent = `Moviendo ${card.value} de ${card.suit} al montón ${targetStackId}.`;

    if (card.clickListener) {
        card.element.removeEventListener('click', card.clickListener);
    }
    card.element.style.pointerEvents = 'none';

    card.element.style.transition = 'transform 0.3s ease';
    card.element.classList.remove('flipped'); 

    setTimeout(() => {
      
        // Eliminar la carta del stack de origen
        sourceStack.cards.pop();
        // Añadir la carta al stack de destino
        targetStack.cards.unshift(card);

        const tempTargetX = targetStack.position.x;
        const tempTargetY = targetStack.position.y;

        // Establecer una transición para el movimiento
        card.element.style.transition = 'left 0.5s ease, top 0.5s ease, z-index 0.5s ease';
        card.element.style.left = `${tempTargetX}px`;
        card.element.style.top = `${tempTargetY}px`;
        card.element.style.zIndex = -1; // Enviar la carta al fondo mientras se mueve

        card.element.addEventListener('transitionend', function handler(e) {
           
            if (e.propertyName === 'left' || e.propertyName === 'top' || e.propertyName === 'z-index') {
                card.element.removeEventListener('transitionend', handler);

                // --- PASO 3: ACTUALIZAR VISUALES Y ESTADO DEL JUEGO ---
                updateStackVisuals(sourceStack);
                updateStackVisuals(targetStack);

                movesCount++;
                movesDisplay.textContent = movesCount;

                checkGameStatus(card);
            }
        });
    }, 300); // Pequeño retraso para que se vea el volteo
}

// Funciones auxiliares
function findCardStack(card) {
    return Object.values(stacks).find(stack => stack.cards.includes(card));
}

function checkGameStatus(movedCard) {
    let allGameStacksCompleted = true;

    // Recalcular el estado de "completado" para todos los stacks
    Object.values(stacks).forEach(stack => {
        const requiredValue = stack.id;
        const allCardsMatchValue = stack.cards.every(card => card.numericValue === requiredValue);
        stack.completed = allCardsMatchValue && stack.cards.length === 4;
        stack.element.classList.toggle('completed', stack.completed);

        if (!stack.completed) {
            allGameStacksCompleted = false;
        }
    });

    // Si todos los stacks están completos, es una victoria.
    if (allGameStacksCompleted) {
        winGame();
        return;
    }

}


function winGame() {
    updateGameState('win');
    stopTimer();

    // Mostrar mensaje de victoria del oráculo en el modal
    oracleWinAnswer.textContent = `La respuesta a tu pregunta "${userQuestionText}" es SÍ`;
    document.getElementById('finalTime').textContent = timerDisplay.textContent;
    document.getElementById('finalMoves').textContent = movesCount;

    gameScreen.classList.add('hidden'); // Ocultar la pantalla del juego
    winModal.classList.remove('hidden'); // Mostrar el modal de victoria

    // Visualizar todos los stacks como completados 
    Object.values(stacks).forEach(stack => stack.element.classList.add('completed'));
}

function loseGame() {
    updateGameState('lose');
    stopTimer();

    // Mostrar mensaje de derrota del oráculo en el modal
    oracleLoseAnswer.textContent = `Lamentablemente, la respuesta a tu pregunta "${userQuestionText}" es NO`;

    gameScreen.classList.add('hidden'); 
    loseModal.classList.remove('hidden'); 
}

function updateGameState(state) {
    gameState = state;

    btnShuffle.disabled = state !== 'ready';
    btnDeal.disabled = state !== 'ready';
    btnReset.disabled = false; 
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    preloadImages();
    initGame(); 

    // Event listeners para los modales
    startGameButton.addEventListener('click', () => {
        const question = userQuestionInput.value.trim();
        if (question === "") {
            alert("Por favor, ingresa tu pregunta al oráculo.");
            return;
        }
        userQuestionText = question; 
        oracleIntroModal.classList.add('hidden'); 
        gameScreen.classList.remove('hidden'); 
        resetGame(); 
        statusText.textContent = 'Presiona "Barajar" para comenzar.';
    });

    playAgainWinButton.addEventListener('click', () => {
        winModal.classList.add('hidden');
        initGame(); 
        userQuestionInput.value = ""; 
    });

    playAgainLoseButton.addEventListener('click', () => {
        loseModal.classList.add('hidden'); 
        initGame(); 
        userQuestionInput.value = ""; 
    });

    // Tus event listeners existentes
    btnShuffle.addEventListener('click', shuffleDeck);
    btnDeal.addEventListener('click', dealCards);
    btnReset.addEventListener('click', resetGame);
});