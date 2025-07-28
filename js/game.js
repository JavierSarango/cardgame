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
let userQuestionText = ""; // Variable para guardar la pregunta del usuario

// Elementos UI adicionales
const movesDisplay = document.getElementById('movesDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const statusText = document.getElementById('statusText'); // Mantenemos este para el sidebar

// Referencias a los botones
const btnShuffle = document.getElementById('btnShuffle');
const btnDeal = document.getElementById('btnDeal');
const btnReset = document.getElementById('btnReset');

// Referencias a los elementos del juego y modales
const gameArea = document.getElementById('gameArea');
const gameScreen = document.getElementById('gameScreen'); // El contenedor principal del juego

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
    // Precargar imagen del oráculo si existe
    new Image().src = 'assets/oracle/oracle_character2.png'; // Asegúrate de que esta ruta sea correcta
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

    // Asegurarse de que los otros modales estén ocultos
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
    statusText.textContent = 'Preparado para comenzar ¡Dale a Barajar!'; // Mensaje en sidebar

    gameArea.innerHTML = ''; // Limpiar el área de juego

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

// Helper function to update the visual position and z-index of all cards in a stack
function updateStackVisuals(stack) {
    const CARD_OFFSET = 15;

    // Limpiar visualmente el contenido del stack, si es necesario, antes de re-renderizar
    if (stack.id === 13) {
        // Para el stack K, si necesitas que la 'K' sea el texto principal del div stack
        // stack.element.textContent = 'K';
        stack.element.classList.add('central-stack');
        stack.element.classList.remove('completed-stack-base');
    } else {
        // stack.element.textContent = '';
        stack.element.classList.remove('central-stack', 'completed-stack-base');
    }

    stack.cards.forEach((card, index) => {
        const cardEl = card.element;
        let targetX = stack.position.x;
        let targetY = stack.position.y;
        let zIndex = index;

        targetY = stack.position.y + index * CARD_OFFSET;
        zIndex = index;

        if (index === stack.cards.length - 1) { // Si es la última carta en el array (la superior)
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

    if (sourceStack.id === targetStackId && card.numericValue === sourceStack.id && targetStack.cards[0] === card && targetStack.cards.length === 4) {
        statusText.textContent = 'Esta carta ya está en su posición final.';
        return;
    }

    statusText.textContent = `Moviendo ${card.value} de ${card.suit} al montón ${targetStackId}.`;

    if (card.clickListener) {
        card.element.removeEventListener('click', card.clickListener);
    }
    card.element.style.pointerEvents = 'none';

    // --- PASO 1: VOLTEAR LA CARTA ---
    card.element.style.transition = 'transform 0.3s ease';
    card.element.classList.remove('flipped'); // Asegurarse de que esté boca arriba para el movimiento

    setTimeout(() => {
        // --- PASO 2: MOVER LA CARTA ---
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
            // Asegurarse de que la transición correcta haya terminado
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

    // Lógica de derrota solo si el rey (K) se mueve y no hay más movimientos posibles
    if (movedCard.value === 'K') {
        const nonKingCardsCanMove = Object.values(stacks).some(stack =>
            stack.id !== 13 && // No es el stack del rey
            stack.cards.length > 0 && // Tiene cartas
            stack.cards[stack.cards.length - 1].value !== 'K' && // La carta superior no es K
            stack.cards[stack.cards.length - 1].numericValue !== stack.id // La carta superior no está en su stack correcto
            // Aquí podrías añadir una lógica más compleja para determinar si hay un movimiento "legal"
            // Por simplicidad, si un K se mueve y no hay otras cartas no-K que no estén en su lugar, se considera derrota.
        );

        // Si el K se movió y no quedan cartas no-K fuera de su stack final
        // Y el stack K no está completo aún
        if (!nonKingCardsCanMove && !stacks[13].completed) {
            loseGame();
        }
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

    // Visualizar todos los stacks como completados (aunque el juego esté oculto, es por consistencia)
    Object.values(stacks).forEach(stack => stack.element.classList.add('completed'));
}

function loseGame() {
    updateGameState('lose');
    stopTimer();

    // Mostrar mensaje de derrota del oráculo en el modal
    oracleLoseAnswer.textContent = `Lamentablemente, la respuesta a tu pregunta "${userQuestionText}" es NO`;

    gameScreen.classList.add('hidden'); // Ocultar la pantalla del juego
    loseModal.classList.remove('hidden'); // Mostrar el modal de derrota
}

function updateGameState(state) {
    gameState = state;

    btnShuffle.disabled = state !== 'ready';
    btnDeal.disabled = state !== 'ready';
    btnReset.disabled = false; // El botón de reset siempre debería estar disponible
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    preloadImages();
    initGame(); // Ahora initGame muestra el modal de introducción

    // Event listeners para los modales
    startGameButton.addEventListener('click', () => {
        const question = userQuestionInput.value.trim();
        if (question === "") {
            alert("Por favor, ingresa tu pregunta al oráculo.");
            return;
        }
        userQuestionText = question; // Guardar la pregunta
        oracleIntroModal.classList.add('hidden'); // Ocultar modal de intro
        gameScreen.classList.remove('hidden'); // Mostrar la pantalla del juego principal
        resetGame(); // Reiniciar el juego para empezar
        statusText.textContent = 'Presiona "Barajar" para comenzar.';
    });

    playAgainWinButton.addEventListener('click', () => {
        winModal.classList.add('hidden'); // Ocultar modal de victoria
        initGame(); // Vuelve a la pantalla de introducción (modal)
        userQuestionInput.value = ""; // Limpia la pregunta anterior
    });

    playAgainLoseButton.addEventListener('click', () => {
        loseModal.classList.add('hidden'); // Ocultar modal de derrota
        initGame(); // Vuelve a la pantalla de introducción (modal)
        userQuestionInput.value = ""; // Limpia la pregunta anterior
    });

    // Tus event listeners existentes
    btnShuffle.addEventListener('click', shuffleDeck);
    btnDeal.addEventListener('click', dealCards);
    btnReset.addEventListener('click', resetGame);
});