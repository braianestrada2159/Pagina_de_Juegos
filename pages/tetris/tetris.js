// Código JavaScript para manejar el menú desplegable
function toggleMenu() {
    const container = document.querySelector('.menu-container');
    container.classList.toggle('menu-open');
}

function selectItem(itemName) {
    // Cerrar el menú después de seleccionar
    const container = document.querySelector('.menu-container');
    container.classList.remove('menu-open');
    
    // Aquí puedes agregar lógica adicional si es necesario
    console.log(`Seleccionado: ${itemName}`);
}

// Cerrar el menú al hacer clic fuera de él
document.addEventListener('click', function(event) {
    const container = document.querySelector('.menu-container');
    const isClickInsideMenu = container.contains(event.target);
    
    if (!isClickInsideMenu && container.classList.contains('menu-open')) {
        container.classList.remove('menu-open');
    }
});

// Cerrar el menú con la tecla Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const container = document.querySelector('.menu-container');
        container.classList.remove('menu-open');
    }
});


// Código JavaScript para el juego de Tetris
// Configuración del juego
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
let BLOCK_SIZE;

// Canvas y contextos
const canvas = document.getElementById('tetris-canvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');

// Estado del juego
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let gameRunning = false;
let gamePaused = false;
let dropTime = 0;
let dropSpeed = 1000;

// Definición de las piezas de Tetris
const PIECES = {
    I: {
        shape: [
            [1, 1, 1, 1]
        ],
        color: '#00ffff'
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#ffff00'
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1]
        ],
        color: '#800080'
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0]
        ],
        color: '#00ff00'
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1]
        ],
        color: '#ff0000'
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1]
        ],
        color: '#0000ff'
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1]
        ],
        color: '#ffa500'
    }
};

const PIECE_TYPES = Object.keys(PIECES);

// Clase para las piezas
class Piece {
    constructor(type, x = 3, y = 0) {
        this.type = type;
        this.shape = PIECES[type].shape;
        this.color = PIECES[type].color;
        this.x = x;
        this.y = y;
    }
    
    rotate() {
        const rotated = this.shape[0].map((_, i) => 
            this.shape.map(row => row[i]).reverse()
        );
        return rotated;
    }
    
    copy() {
        const piece = new Piece(this.type, this.x, this.y);
        piece.shape = this.shape.map(row => [...row]);
        return piece;
    }
}

// Función para ajustar el tamaño del canvas
function resizeCanvas() {
    const maxCanvasWidth = window.innerWidth - 250; // Espacio para el panel de información
    const maxCanvasHeight = window.innerHeight - 50;
    
    // Calcular tamaño manteniendo relación de aspecto 1:2
    const canvasWidth = Math.min(maxCanvasWidth, maxCanvasHeight * 0.5);
    const canvasHeight = canvasWidth * 2;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    BLOCK_SIZE = canvasWidth / BOARD_WIDTH;
    
    // Redibujar el juego
    if (gameRunning) {
        drawBoard();
        drawNextPiece();
    }
}

// Inicializar el tablero
function initBoard() {
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
}

// Generar pieza aleatoria
function getRandomPiece() {
    const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
    return new Piece(type);
}

// Verificar colisión
function isValidMove(piece, dx = 0, dy = 0, shape = piece.shape) {
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const newX = piece.x + x + dx;
                const newY = piece.y + y + dy;
                
                if (newX < 0 || newX >= BOARD_WIDTH || 
                    newY >= BOARD_HEIGHT || 
                    (newY >= 0 && board[newY][newX])) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Colocar pieza en el tablero
function placePiece(piece) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const boardY = piece.y + y;
                const boardX = piece.x + x;
                if (boardY >= 0) {
                    board[boardY][boardX] = piece.color;
                }
            }
        }
    }
}

// Limpiar líneas completas
function clearLines() {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++; // Revisar la misma línea de nuevo
        }
    }
    
    if (linesCleared > 0) {
        lines += linesCleared;
        score += linesCleared * 100 * level * (linesCleared > 1 ? 2 : 1);
        level = Math.floor(lines / 10) + 1;
        dropSpeed = Math.max(50, 1000 - (level - 1) * 100);
        updateUI();
    }
}

// Mover pieza hacia abajo
function dropPiece() {
    if (isValidMove(currentPiece, 0, 1)) {
        currentPiece.y++;
    } else {
        placePiece(currentPiece);
        clearLines();
        spawnNewPiece();
    }
}

// Generar nueva pieza
function spawnNewPiece() {
    currentPiece = nextPiece || getRandomPiece();
    nextPiece = getRandomPiece();
    
    if (!isValidMove(currentPiece)) {
        gameOver();
        return;
    }
    
    drawNextPiece();
}

// Dibujar el tablero
function drawBoard() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar bloques colocados
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x]) {
                drawBlock(ctx, x, y, board[y][x]);
            }
        }
    }
    
    // Dibujar pieza actual
    if (currentPiece) {
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    drawBlock(ctx, currentPiece.x + x, currentPiece.y + y, currentPiece.color);
                }
            }
        }
    }
    
    // Dibujar líneas de la grilla
    drawGrid();
}

// Dibujar un bloque
function drawBlock(context, x, y, color) {
    const pixelX = x * BLOCK_SIZE;
    const pixelY = y * BLOCK_SIZE;
    
    context.fillStyle = color;
    context.fillRect(pixelX, pixelY, BLOCK_SIZE, BLOCK_SIZE);
    
    // Efecto de borde 3D
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(pixelX, pixelY, BLOCK_SIZE, 2);
    context.fillRect(pixelX, pixelY, 2, BLOCK_SIZE);
    
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.fillRect(pixelX + BLOCK_SIZE - 2, pixelY, 2, BLOCK_SIZE);
    context.fillRect(pixelX, pixelY + BLOCK_SIZE - 2, BLOCK_SIZE, 2);
}

// Dibujar grilla
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= BOARD_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(canvas.width, y * BLOCK_SIZE);
        ctx.stroke();
    }
}

// Dibujar siguiente pieza
function drawNextPiece() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece) {
        const blockSize = nextCanvas.width / 5;
        const offsetX = (nextCanvas.width - nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (nextCanvas.height - nextPiece.shape.length * blockSize) / 2;
        
        for (let y = 0; y < nextPiece.shape.length; y++) {
            for (let x = 0; x < nextPiece.shape[y].length; x++) {
                if (nextPiece.shape[y][x]) {
                    const pixelX = offsetX + x * blockSize;
                    const pixelY = offsetY + y * blockSize;
                    
                    nextCtx.fillStyle = nextPiece.color;
                    nextCtx.fillRect(pixelX, pixelY, blockSize, blockSize);
                    
                    // Efecto 3D
                    nextCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    nextCtx.fillRect(pixelX, pixelY, blockSize, 2);
                    nextCtx.fillRect(pixelX, pixelY, 2, blockSize);
                }
            }
        }
    }
}

// Actualizar UI
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

// Game Over
function gameOver() {
    gameRunning = false;
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over').style.display = 'block';
}

// Reiniciar juego
function restartGame() {
    initBoard();
    score = 0;
    level = 1;
    lines = 0;
    dropSpeed = 1000;
    currentPiece = null;
    nextPiece = null;
    gameRunning = true;
    gamePaused = false;
    
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('pause-overlay').style.display = 'none';
    
    spawnNewPiece();
    updateUI();
    gameLoop();
}

// Controles del teclado
document.addEventListener('keydown', (e) => {
    if (!gameRunning || gamePaused) {
        if (e.key === 'p' || e.key === 'P') {
            togglePause();
        }
        return;
    }
    
    const piece = currentPiece.copy();
    
    switch (e.key) {
        case 'ArrowLeft':
            if (isValidMove(piece, -1, 0)) {
                currentPiece.x--;
            }
            break;
        case 'ArrowRight':
            if (isValidMove(piece, 1, 0)) {
                currentPiece.x++;
            }
            break;
        case 'ArrowDown':
            if (isValidMove(piece, 0, 1)) {
                currentPiece.y++;
                score += 1;
                updateUI();
            }
            break;
        case 'ArrowUp':
            const rotated = piece.rotate();
            if (isValidMove(piece, 0, 0, rotated)) {
                currentPiece.shape = rotated;
            }
            break;
        case ' ':
            e.preventDefault();
            while (isValidMove(currentPiece, 0, 1)) {
                currentPiece.y++;
                score += 2;
            }
            updateUI();
            break;
        case 'p':
        case 'P':
            togglePause();
            break;
    }
});

// Pausar/despausar
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    const overlay = document.getElementById('pause-overlay');
    overlay.style.display = gamePaused ? 'flex' : 'none';
    
    if (!gamePaused) {
        gameLoop();
    }
}

// Bucle principal del juego
function gameLoop(timestamp = 0) {
    if (!gameRunning || gamePaused) return;
    
    if (timestamp - dropTime > dropSpeed) {
        dropPiece();
        dropTime = timestamp;
    }
    
    drawBoard();
    requestAnimationFrame(gameLoop);
}

// Inicializar juego
function initGame() {
    initBoard();
    updateUI();
    drawBoard();
}

// Controles táctiles para móviles
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!gameRunning || gamePaused) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 30) {
            // Deslizar derecha
            if (isValidMove(currentPiece, 1, 0)) {
                currentPiece.x++;
            }
        } else if (deltaX < -30) {
            // Deslizar izquierda
            if (isValidMove(currentPiece, -1, 0)) {
                currentPiece.x--;
            }
        }
    } else {
        if (deltaY > 30) {
            // Deslizar abajo
            while (isValidMove(currentPiece, 0, 1)) {
                currentPiece.y++;
                score += 2;
            }
            updateUI();
        } else if (deltaY < -30) {
            // Deslizar arriba (rotar)
            const piece = currentPiece.copy();
            const rotated = piece.rotate();
            if (isValidMove(piece, 0, 0, rotated)) {
                currentPiece.shape = rotated;
            }
        }
    }
});

// Tap para rotar
canvas.addEventListener('click', (e) => {
    if (!gameRunning || gamePaused) return;
    
    const piece = currentPiece.copy();
    const rotated = piece.rotate();
    if (isValidMove(piece, 0, 0, rotated)) {
        currentPiece.shape = rotated;
    }
});

// Inicializar cuando se carga la página
window.onload = () => {
    resizeCanvas();
    initGame();
    // Auto-iniciar el juego
    setTimeout(() => {
        if (!gameRunning) {
            restartGame();
        }
    }, 1000);
};

// Redimensionar cuando cambia el tamaño de la ventana
window.addEventListener('resize', resizeCanvas);
