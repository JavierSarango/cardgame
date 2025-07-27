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
let isTimerRunning = false; // Nueva variable para controlar el estado del timer

// Variables adicionales
let lastMovedCard = null;
let currentActiveStack = null;


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
// Función para iniciar el timer (modificada)
function startTimer() {
    if (isTimerRunning) return; // Evitar múltiples inicios
    
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
        
    resetGame();
    
    // Limpiar mensajes
    statusText.textContent = 'Preparado para comenzar ¡Dale a Barajar!';
    winMessage.classList.add('hidden');
    loseMessage.classList.add('hidden');
    
}

function resetGame() {
    // Detener y resetear el timer completamente
    stopTimer();
    elapsedTime = 0;
    updateTimer();
    isTimerRunning = false;
    
    // Resetear otros elementos del juego
    movesCount = 0;
    movesDisplay.textContent = '0';
    lastMovedCard = null;
    currentActiveStack = null;
    statusText.textContent = 'Preparado para comenzar ¡Dale a Barajar!';
    winMessage.classList.add('hidden');
    loseMessage.classList.add('hidden');
    
    // Limpiar el área de juego
    gameArea.innerHTML = '';
    
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
// Crear elemento de carta
function createCardElement(card, isFlippedInitially = true) { // Reintroducir isFlippedInitially
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    if (isFlippedInitially) { // Añadir 'flipped' si se especifica
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
    stopTimer();
    elapsedTime = 0;
    updateTimer();
    movesCount = 0;
    movesDisplay.textContent = '0';
    
    // Clear the stacks visually and logically
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
    
    for (let i = 0; i < 4; i++) { 
        for (let stackId = 1; stackId <= 13; stackId++) { 
            if (cardIndex >= deck.length) break;
            
            const card = deck[cardIndex++];
            const stack = stacks[stackId];
            
            stack.cards.unshift(card); 

            // Crear carta inicialmente boca abajo (true)
            const cardEl = createCardElement(card, true); 
            card.element = cardEl; 
            gameArea.appendChild(cardEl); 
            
            // Posición inicial para la animación (desde el centro)
            cardEl.style.left = '50%';
            cardEl.style.top = '50%';
            cardEl.style.transform = 'translate(-50%, -50%)'; 
            cardEl.style.zIndex = 50 + i; 
            cardEl.style.transition = 'left 0.8s ease, top 0.8s ease, transform 0.8s ease, z-index 0.8s ease'; // Transición para el reparto
            
            // Animar el movimiento de reparto
            setTimeout(() => {
                cardEl.style.left = `${stack.position.x}px`;
                cardEl.style.top = `${stack.position.y}px`;
                cardEl.style.transform = 'none'; 
                cardEl.style.zIndex = i; 
            }, cardIndex * 50); 
        }
    }
    
    // Una vez que todas las cartas están en sus posiciones iniciales de reparto,
    // Llamar a updateStackVisuals para establecer el estado final (volteo de la carta superior)
    setTimeout(() => {
        Object.values(stacks).forEach(stack => {
            updateStackVisuals(stack); 
        });
        statusText.textContent = '¡Comienza el juego! Haz clic en una carta para moverla.';
        updateGameState('playing');
        startTimer();
    }, (deck.length * 50) + 1000); // Esperar a que terminen todas las animaciones de reparto
}

// Helper function to update the visual position and z-index of all cards in a stack
// Helper function to update the visual position and z-index of all cards in a stack
function updateStackVisuals(stack) {
    const CARD_OFFSET = 15; // Vertical offset for stacked cards
    const COMPLETED_CARD_OFFSET_X = 80;
    const COMPLETED_CARD_OFFSET_Y_INCREMENT = 20;

    const isCompletedStackTarget = stack.cards.every(c => c.numericValue === stack.id) && stack.id !== 13;

    // Limpiar visualmente el contenido del stack, si es necesario, antes de re-renderizar
    if (stack.id === 13) {
        // Para el stack del Rey, podemos mantener el texto 'K' si se desea
        if (stack.element.textContent !== 'K') stack.element.textContent = 'K';
        stack.element.classList.add('central-stack'); 
        stack.element.classList.remove('completed-stack-base'); // Asegurarse de que no tenga la clase de completado
    } else if (isCompletedStackTarget) {
        stack.element.textContent = ''; // Los stacks completados no necesitan su ID visible
        stack.element.classList.add('completed-stack-base'); 
        stack.element.classList.remove('central-stack'); 
    } else {
        // Para stacks de juego normales, también podríamos limpiar el ID
        stack.element.textContent = ''; 
        stack.element.classList.remove('central-stack', 'completed-stack-base'); 
    }
    
    // NO ordenar aquí si quieres mantener el orden de "la carta que llega se va al fondo"
    // stack.cards.sort((a, b) => a.numericValue - b.numericValue); 

    stack.cards.forEach((card, index) => {
        const cardEl = card.element;
        let targetX = stack.position.x;
        let targetY = stack.position.y;
        let zIndex = index; // Menor índice (más abajo) = menor z-index

        // Aplicar offset para stacks completados
        if (isCompletedStackTarget) {
            targetX = stack.position.x + COMPLETED_CARD_OFFSET_X;
            targetY = stack.position.y + index * COMPLETED_CARD_OFFSET_Y_INCREMENT;
            zIndex = 100 + index; 
            cardEl.classList.remove('flipped'); // Todas las cartas completadas se muestran boca arriba
        } else if (stack.id === 13) { // Stack del Rey (apila normal)
            targetY = stack.position.y + index * CARD_OFFSET;
            cardEl.classList.remove('flipped'); // Todas las cartas del Rey se muestran boca arriba
        } else { // Resto de stacks (apila normal)
            targetY = stack.position.y + index * CARD_OFFSET;
            // Solo la carta superior se muestra boca arriba, las demás boca abajo
            if (index === stack.cards.length - 1) { // Si es la última carta en el array (la superior)
                cardEl.classList.remove('flipped'); // Mostrar cara
            } else {
                cardEl.classList.add('flipped'); // Esconder cara
            }
        }

        // Aplicar posiciones y z-index SIN TRANSICION AQUI si la transicion ya fue manejada por el movimiento.
        // O con una transicion rápida para cambios de z-index
        cardEl.style.transition = 'left 0.2s ease, top 0.2s ease, z-index 0.2s ease'; // Transición rápida para reorganización
        cardEl.style.left = `${targetX}px`;
        cardEl.style.top = `${targetY}px`;
        cardEl.style.zIndex = zIndex;

        // Gestión de clickability: solo la carta superior es clicable
        if (index === stack.cards.length - 1) { // Si es la carta superior del stack
            if (!card.clickListener) {
                card.clickListener = () => {
                    if (gameState === 'playing') {
                        moveCardToStack(card);
                    }
                };
            }
            cardEl.addEventListener('click', card.clickListener);
            cardEl.style.pointerEvents = 'auto'; 
        } else { // Las cartas enterradas no son clicables
            if (card.clickListener) {
                cardEl.removeEventListener('click', card.clickListener);
            }
            cardEl.style.pointerEvents = 'none';
        }
    });
    
    // Si un stack se vacía, remover los elementos de las cartas
    if (stack.cards.length === 0) {
        // En un escenario real, si el stack puede vaciarse, necesitarías remover los elementos HTML de las cartas que ya no están.
        // Pero dado que se llaman updates sobre stacks con cartas, no es estrictamente necesario aquí.
        // O podrías limpiar el contenedor del stack y luego añadir solo las que quedan.
        // Por ahora, updateStackVisuals solo se llama cuando hay cartas en el array.
    }
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
        statusText.textContent = 'Solo puedes mover la carta superior del montón.';
        return;
    }

    if (sourceStack.id === targetStackId && card.numericValue === sourceStack.id && targetStack.cards[0] === card && targetStack.cards.length === 4) {
         statusText.textContent = 'Esta carta ya está en su posición final.';
         return;
    }
    
    statusText.textContent = `Moviendo ${card.value} de ${card.suit} al montón ${targetStackId}.`;
    
    // Desactivar clic en la carta que se va a mover de inmediato
    if (card.clickListener) {
        card.element.removeEventListener('click', card.clickListener);
    }
    card.element.style.pointerEvents = 'none'; 

    // --- PASO 1: VOLTEAR LA CARTA ---
    // Asegurarse de que solo la propiedad 'transform' tiene transición para el volteo
    card.element.style.transition = 'transform 0.3s ease'; 
    card.element.classList.remove('flipped'); // Voltear la carta boca arriba

    // Esperar a que la animación de volteo termine
    setTimeout(() => {
        // --- PASO 2: MOVER LA CARTA ---
        sourceStack.cards.pop(); // Remover del stack de origen
        targetStack.cards.unshift(card); // Añadir al fondo del stack de destino

        // Posiciones temporales para la animación de movimiento
        const tempTargetX = targetStack.position.x;
        const tempTargetY = targetStack.position.y; 

        // Preparar la carta para la animación de movimiento (ahora solo left/top/z-index)
        card.element.style.transition = 'left 0.5s ease, top 0.5s ease, z-index 0.5s ease';
        card.element.style.left = `${tempTargetX}px`;
        card.element.style.top = `${tempTargetY}px`;
        card.element.style.zIndex = -1; // Enviar al fondo durante el movimiento

        // Esperar a que la animación de movimiento termine
        card.element.addEventListener('transitionend', function handler(e) {
            // Asegurarse de que el listener solo reaccione a las propiedades que controlamos
            if (e.propertyName !== 'left' && e.propertyName !== 'top' && e.propertyName !== 'z-index') return;
            
            card.element.removeEventListener('transitionend', handler);

            // --- PASO 3: ACTUALIZAR VISUALES Y ESTADO DEL JUEGO ---
            updateStackVisuals(sourceStack); // Re-renderizar el stack de origen (nueva carta superior)
            updateStackVisuals(targetStack); // Re-renderizar el stack de destino (incluyendo la carta recién movida)

            movesCount++;
            movesDisplay.textContent = movesCount;
            
            checkGameStatus(card); 
        });
    }, 300); // Duración de la animación de volteo (0.3s)
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
    stopTimer();
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
    btnDeal.addEventListener('click', dealCards);
    btnReset.addEventListener('click', resetGame); // Usar resetGame directamente
});