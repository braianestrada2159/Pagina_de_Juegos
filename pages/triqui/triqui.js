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




// JavaScript para el juego de Triqui con variantes y modos de juego
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const gameModeSelect = document.getElementById('gameMode');
    const difficultySection = document.getElementById('difficultySection');
    const difficultySelect = document.getElementById('difficulty');
    const gameVariantSelect = document.getElementById('gameVariant');
    const startGameBtn = document.getElementById('startGame');
    const resetScoresBtn = document.getElementById('resetScores');
    const gameContainer = document.getElementById('gameBoard');
    const gameStatus = document.getElementById('gameStatus');
    const resetGameBtn = document.getElementById('resetGame');
    const scoreX = document.getElementById('scoreX');
    const scoreO = document.getElementById('scoreO');
    const scoreTie = document.getElementById('scoreTie');
    
    // Variables del juego
    let board = [];
    let currentPlayer = 'X';
    let gameActive = false;
    let gameMode = 'pvp';
    let difficulty = 'medium';
    let gameVariant = 'classic';
    let scores = { X: 0, O: 0, tie: 0 };
    let ultimateActiveBoard = null;
    
    // Cargar puntuaciones guardadas
    loadScores();
    
    // Event listeners
    gameModeSelect.addEventListener('change', function() {
        gameMode = this.value;
        difficultySection.style.display = gameMode === 'pvc' ? 'block' : 'none';
    });
    
    difficultySelect.addEventListener('change', function() {
        difficulty = this.value;
    });
    
    gameVariantSelect.addEventListener('change', function() {
        gameVariant = this.value;
    });
    
    startGameBtn.addEventListener('click', startGame);
    resetGameBtn.addEventListener('click', resetGame);
    resetScoresBtn.addEventListener('click', resetScores);
    
    // Iniciar el juego
    // Reemplazar las funciones startGame y resetGame con estas versiones mejoradas
function startGame() {
    gameMode = gameModeSelect.value;
    difficulty = difficultySelect.value;
    gameVariant = gameVariantSelect.value;
    
    resetBoard();
    gameActive = true;
    
    // Selección aleatoria del primer jugador
    currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
    
    updateGameStatus();
    
    // Mostrar mensaje especial para el primer turno
    const firstTurnMessage = currentPlayer === 'X' 
        ? '¡Jugador X comienza la partida!' 
        : gameMode === 'pvp' 
            ? '¡Jugador O comienza la partida!' 
            : '¡Computadora (O) comienza la partida!';
    
    gameStatus.textContent = firstTurnMessage;
    gameStatus.classList.add('highlight-message');
    
    // Eliminar el resaltado después de 2 segundos
    setTimeout(() => {
        gameStatus.classList.remove('highlight-message');
        updateGameStatus();
        
        // Si es modo vs computadora y comienza O
        if (gameMode === 'pvc' && currentPlayer === 'O') {
            setTimeout(makeComputerMove, 500);
        }
    }, 2000);
}

function resetGame() {
    resetBoard();
    gameActive = true;
    ultimateActiveBoard = null;
    
    // Alternar el jugador inicial al reiniciar
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    
    // Mostrar mensaje de cambio de turno inicial
    const switchMessage = currentPlayer === 'X' 
        ? '¡Ahora comienza Jugador X!' 
        : gameMode === 'pvp' 
            ? '¡Ahora comienza Jugador O!' 
            : '¡Ahora comienza la Computadora!';
    
    gameStatus.textContent = switchMessage;
    gameStatus.classList.add('highlight-message');
    
    setTimeout(() => {
        gameStatus.classList.remove('highlight-message');
        updateGameStatus();
        
        if (gameMode === 'pvc' && currentPlayer === 'O') {
            setTimeout(makeComputerMove, 500);
        }
    }, 2000);
}
    
    function resetScores() {
        if (confirm('¿Estás seguro de que quieres resetear el historial de puntuaciones?')) {
            scores = { X: 0, O: 0, tie: 0 };
            updateScoreDisplay();
            saveScores();
        }
    }
    
    function loadScores() {
        const savedScores = localStorage.getItem('triquiScores');
        if (savedScores) {
            scores = JSON.parse(savedScores);
            updateScoreDisplay();
        }
    }
    
    function saveScores() {
        localStorage.setItem('triquiScores', JSON.stringify(scores));
    }
    
    function updateScoreDisplay() {
        scoreX.textContent = scores.X;
        scoreO.textContent = scores.O;
        scoreTie.textContent = scores.tie;
    }
    
    function resetBoard() {
        if (gameVariant === 'classic') {
            board = Array(9).fill(null);
            renderClassicBoard();
        } else {
            board = Array(9).fill().map(() => Array(9).fill(null));
            renderUltimateBoard();
        }
    }
    
    function renderClassicBoard() {
        gameContainer.innerHTML = '';
        gameContainer.className = 'classic-board';
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'classic-cell';
            cell.dataset.index = i;
            
            if (board[i]) {
                cell.textContent = board[i];
                cell.classList.add(board[i].toLowerCase());
            }
            
            cell.addEventListener('click', () => handleCellClick(i));
            gameContainer.appendChild(cell);
        }
    }
    
    function renderUltimateBoard() {
        gameContainer.innerHTML = '';
        gameContainer.className = 'ultimate-board';
        
        for (let i = 0; i < 9; i++) {
            const miniBoard = document.createElement('div');
            miniBoard.className = 'mini-board';
            miniBoard.dataset.boardIndex = i;
            miniBoard.dataset.boardNumber = i + 1;
            
            const isActive = ultimateActiveBoard === null || ultimateActiveBoard === i;
            const miniBoardWinner = checkMiniBoardWinner(i);
            
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'mini-cell';
                cell.dataset.boardIndex = i;
                cell.dataset.cellIndex = j;
                
                if (board[i][j]) {
                    cell.textContent = board[i][j];
                    cell.classList.add(board[i][j].toLowerCase());
                    
                    if (miniBoardWinner) {
                        const winningPattern = getWinningPattern(i);
                        if (winningPattern.includes(j)) {
                            cell.classList.add('winning-cell');
                        }
                    }
                }
                
                if (isActive && !board[i][j] && gameActive && !miniBoardWinner) {
                    cell.addEventListener('click', () => handleUltimateCellClick(i, j));
                }
                
                miniBoard.appendChild(cell);
            }
            
            if (isActive && !miniBoardWinner) {
                miniBoard.classList.add('active-board');
            }
            
            if (miniBoardWinner) {
                miniBoard.classList.add('won-board', miniBoardWinner.toLowerCase());
            }
            
            gameContainer.appendChild(miniBoard);
        }
    }
    
    function getWinningPattern(boardIndex) {
        const miniBoard = board[boardIndex];
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (miniBoard[a] && miniBoard[a] === miniBoard[b] && miniBoard[a] === miniBoard[c]) {
                return pattern;
            }
        }
        
        return [];
    }
    
    function handleCellClick(index) {
        if (!gameActive || board[index]) return;
        
        board[index] = currentPlayer;
        renderClassicBoard();
        
        if (checkWinner()) {
            gameActive = false;
            updateScores(currentPlayer);
            gameStatus.textContent = `¡Jugador ${currentPlayer} gana!`;
            return;
        }
        
        if (isBoardFull()) {
            gameActive = false;
            updateScores('tie');
            gameStatus.textContent = '¡Empate!';
            return;
        }
        
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateGameStatus();
        
        if (gameMode === 'pvc' && currentPlayer === 'O' && gameActive) {
            setTimeout(makeComputerMove, 500);
        }
    }
    
    function handleUltimateCellClick(boardIndex, cellIndex) {
        if (!gameActive || board[boardIndex][cellIndex]) return;
        
        board[boardIndex][cellIndex] = currentPlayer;
        ultimateActiveBoard = checkMiniBoardWinner(cellIndex) ? null : cellIndex;
        
        renderUltimateBoard();
        
        const globalWinner = checkGlobalWinner();
        if (globalWinner) {
            gameActive = false;
            updateScores(globalWinner);
            gameStatus.textContent = `¡Jugador ${globalWinner} gana el juego Ultimate!`;
            return;
        }
        
        if (isUltimateBoardFull()) {
            gameActive = false;
            updateScores('tie');
            gameStatus.textContent = '¡Empate en el juego Ultimate!';
            return;
        }
        
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateGameStatus();
        
        if (gameMode === 'pvc' && currentPlayer === 'O' && gameActive) {
            setTimeout(makeComputerMove, 500);
        }
    }
    
    function makeComputerMove() {
        if (!gameActive) return;
        
        if (gameVariant === 'classic') {
            let move;
            
            if (difficulty === 'easy') {
                move = getRandomMove();
            } else if (difficulty === 'medium') {
                move = Math.random() < 0.5 ? getBestMove() : getRandomMove();
            } else {
                move = getBestMove();
            }
            
            board[move] = 'O';
            renderClassicBoard();
            
            if (checkWinner()) {
                gameActive = false;
                updateScores('O');
                gameStatus.textContent = '¡La computadora gana!';
                return;
            }
            
            if (isBoardFull()) {
                gameActive = false;
                updateScores('tie');
                gameStatus.textContent = '¡Empate!';
                return;
            }
            
            currentPlayer = 'X';
            updateGameStatus();
        } else {
            let boardIndex, cellIndex;
            
            if (difficulty === 'easy') {
                [boardIndex, cellIndex] = getRandomUltimateMove();
            } else if (difficulty === 'medium') {
                if (Math.random() < 0.5) {
                    [boardIndex, cellIndex] = getBestUltimateMove();
                } else {
                    [boardIndex, cellIndex] = getRandomUltimateMove();
                }
            } else {
                [boardIndex, cellIndex] = getBestUltimateMove();
            }
            
            board[boardIndex][cellIndex] = 'O';
            ultimateActiveBoard = checkMiniBoardWinner(cellIndex) ? null : cellIndex;
            
            renderUltimateBoard();
            
            const globalWinner = checkGlobalWinner();
            if (globalWinner) {
                gameActive = false;
                updateScores(globalWinner);
                gameStatus.textContent = '¡La computadora gana el juego Ultimate!';
                return;
            }
            
            if (isUltimateBoardFull()) {
                gameActive = false;
                updateScores('tie');
                gameStatus.textContent = '¡Empate en el juego Ultimate!';
                return;
            }
            
            currentPlayer = 'X';
            updateGameStatus();
        }
    }
    
    function getRandomMove() {
        const emptyCells = [];
        for (let i = 0; i < 9; i++) {
            if (!board[i]) emptyCells.push(i);
        }
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
    
    function getBestMove() {
        let bestScore = -Infinity;
        let move;
        
        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                board[i] = 'O';
                let score = minimax(board, 0, false);
                board[i] = null;
                
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        
        return move;
    }
    
    function minimax(board, depth, isMaximizing) {
        const scores = {
            'O': 1,
            'X': -1,
            'tie': 0
        };
        
        const winner = checkWinner();
        if (winner) {
            return scores[winner];
        }
        
        if (isBoardFull()) {
            return scores['tie'];
        }
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    board[i] = 'O';
                    let score = minimax(board, depth + 1, false);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    board[i] = 'X';
                    let score = minimax(board, depth + 1, true);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
    
    function getRandomUltimateMove() {
        let availableBoards = [];
        
        if (ultimateActiveBoard !== null) {
            availableBoards.push(ultimateActiveBoard);
        } else {
            for (let i = 0; i < 9; i++) {
                if (!checkMiniBoardWinner(i) && !isMiniBoardFull(i)) {
                    availableBoards.push(i);
                }
            }
        }
        
        const boardIndex = availableBoards[Math.floor(Math.random() * availableBoards.length)];
        const emptyCells = [];
        
        for (let j = 0; j < 9; j++) {
            if (!board[boardIndex][j]) {
                emptyCells.push(j);
            }
        }
        
        const cellIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
        return [boardIndex, cellIndex];
    }
    
    function getBestUltimateMove() {
        for (let i = 0; i < 9; i++) {
            if ((ultimateActiveBoard === null || ultimateActiveBoard === i) && !checkMiniBoardWinner(i)) {
                for (let j = 0; j < 9; j++) {
                    if (!board[i][j]) {
                        board[i][j] = 'O';
                        if (checkMiniBoardWinner(i)) {
                            board[i][j] = null;
                            return [i, j];
                        }
                        board[i][j] = null;
                    }
                }
            }
        }
        
        for (let i = 0; i < 9; i++) {
            if ((ultimateActiveBoard === null || ultimateActiveBoard === i) && !checkMiniBoardWinner(i)) {
                for (let j = 0; j < 9; j++) {
                    if (!board[i][j]) {
                        board[i][j] = 'X';
                        if (checkMiniBoardWinner(i)) {
                            board[i][j] = null;
                            return [i, j];
                        }
                        board[i][j] = null;
                    }
                }
            }
        }
        
        return getRandomUltimateMove();
    }
    
    function checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        
        return null;
    }
    
    function isBoardFull() {
        return board.every(cell => cell !== null);
    }
    
    function checkMiniBoardWinner(boardIndex) {
        const miniBoard = board[boardIndex];
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (miniBoard[a] && miniBoard[a] === miniBoard[b] && miniBoard[a] === miniBoard[c]) {
                return miniBoard[a];
            }
        }
        
        return null;
    }
    
    function checkGlobalWinner() {
        const globalBoard = [];
        for (let i = 0; i < 9; i++) {
            globalBoard[i] = checkMiniBoardWinner(i);
        }
        
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (globalBoard[a] && globalBoard[a] === globalBoard[b] && globalBoard[a] === globalBoard[c]) {
                return globalBoard[a];
            }
        }
        
        return null;
    }
    
    function isMiniBoardFull(boardIndex) {
        return board[boardIndex].every(cell => cell !== null);
    }
    
    function isUltimateBoardFull() {
        for (let i = 0; i < 9; i++) {
            if (!checkMiniBoardWinner(i) && !isMiniBoardFull(i)) {
                return false;
            }
        }
        return true;
    }
    
    function updateScores(winner) {
        if (winner === 'X') {
            scores.X++;
        } else if (winner === 'O') {
            scores.O++;
        } else {
            scores.tie++;
        }
        updateScoreDisplay();
        saveScores();
    }
    
    function updateGameStatus() {
        if (gameVariant === 'classic') {
            gameStatus.textContent = `Turno del Jugador ${currentPlayer}`;
        } else {
            gameStatus.textContent = `Turno del Jugador ${currentPlayer}`;
            if (ultimateActiveBoard !== null) {
                gameStatus.textContent += ` (Tablero ${ultimateActiveBoard + 1})`;
            }
        }
    }
    
    // Inicializar la interfaz
    difficultySection.style.display = 'none';
});