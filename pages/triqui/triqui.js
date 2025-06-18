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

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const gameModeSelect = document.getElementById('gameMode');
    const difficultySection = document.getElementById('difficultySection');
    const difficultySelect = document.getElementById('difficulty');
    const gameVariantSelect = document.getElementById('gameVariant');
    const playersSection = document.getElementById('playersSection');
    const playersConfig = document.getElementById('playersConfig');
    const startGameBtn = document.getElementById('startGame');
    const resetScoresBtn = document.getElementById('resetScores');
    const gameContainer = document.getElementById('gameBoard');
    const gameStatus = document.getElementById('gameStatus');
    const resetGameBtn = document.getElementById('resetGame');
    const scoreX = document.getElementById('scoreX');
    const scoreO = document.getElementById('scoreO');
    const scoreY = document.getElementById('scoreY');
    const scoreTie = document.getElementById('scoreTie');
    const scoreYItem = document.getElementById('scoreYItem');
    const scorePanel = document.getElementById('scorePanel');

    // Variables del juego
    let board = [];
    let currentPlayer = 'X';
    let currentPlayerIndex = 0;
    let gameActive = false;
    let gameMode = 'pvp';
    let difficulty = 'medium';
    let gameVariant = 'classic';
    let players = [];
    let ultimateActiveBoard = null;
    const PLAYER_SYMBOLS = ['X', 'O', 'Y'];
    let scores = { X: 0, O: 0, Y: 0, tie: 0 };

    // Cargar puntuaciones guardadas
    loadScores();

    // Ocultar todas las opciones al inicio excepto la variante
    gameModeSelect.closest('.panel-section').style.display = 'none';
    difficultySection.style.display = 'none';
    playersSection.style.display = 'none';
    startGameBtn.style.display = 'none';
    resetScoresBtn.style.display = 'none';
    resetGameBtn.style.display = 'none'; // Also hide reset game button initially
    gameContainer.style.display = 'none'; // Hide game board initially
    gameStatus.style.display = 'none'; // Hide game status initially
    scorePanel.style.display = 'none'; // Hide score panel initially

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
        // Hide all options first
        gameModeSelect.closest('.panel-section').style.display = 'none';
        difficultySection.style.display = 'none';
        playersSection.style.display = 'none';
        scoreYItem.style.display = 'none';
        startGameBtn.style.display = 'block';
        resetScoresBtn.style.display = 'block';

        if (gameVariant === 'classic' || gameVariant === 'ultimate') {
            gameModeSelect.closest('.panel-section').style.display = 'block';
            if (gameModeSelect.value === 'pvc') {
                difficultySection.style.display = 'block';
            }
            scoreYItem.style.display = 'none';
            scorePanel.classList.remove('extended'); // Ensure extended class is removed
        } else if (gameVariant === 'extended') {
            playersSection.style.display = 'block';
            scoreYItem.style.display = 'flex';
            scorePanel.classList.add('extended');
            // For extended, game mode and difficulty are tied to player config
            // The logic for displaying difficulty for AI players is handled within updatePlayersConfig and startGame
            gameModeSelect.closest('.panel-section').style.display = 'none'; // Hide game mode for extended
            difficultySection.style.display = 'none'; // Hide difficulty for extended initially
        }
    });

    playersConfig.addEventListener('change', updatePlayersConfig);

    startGameBtn.addEventListener('click', startGame);
    resetGameBtn.addEventListener('click', resetGame);
    resetScoresBtn.addEventListener('click', resetScores);

    // Funciones del juego
    function startGame() {
        gameMode = gameModeSelect.value;
        difficulty = difficultySelect.value;
        gameVariant = gameVariantSelect.value;

        if (gameVariant === 'extended') {
            updatePlayersConfig();
        }

        resetBoard();
        gameActive = true;

        if (gameVariant === 'extended') {
            currentPlayerIndex = Math.floor(Math.random() * 3);
        } else {
            currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
        }

        // Mostrar el tablero inmediatamente para Ultimate
        if (gameVariant === 'ultimate') {
            gameContainer.style.display = 'grid';
            gameContainer.style.visibility = 'visible';
            gameContainer.style.opacity = '1';
        }

        // Show game elements
        gameContainer.style.display = 'flex';
        gameStatus.style.display = 'block';
        scorePanel.style.display = 'flex';
        resetGameBtn.style.display = 'block';

        updateGameStatus();

        const firstTurnMessage = getFirstTurnMessage();
        gameStatus.innerHTML = firstTurnMessage;
        gameStatus.classList.add('highlight-message');

        setTimeout(() => {
            gameStatus.classList.remove('highlight-message');
            updateGameStatus();

            if ((gameMode === 'pvc' && currentPlayer === 'O' && gameVariant !== 'extended') ||
                (gameVariant === 'extended' && players[currentPlayerIndex] === 'ai')) {
                setTimeout(gameVariant === 'extended' ? makeExtendedComputerMove : gameVariant === 'ultimate' ? makeUltimateComputerMove : makeComputerMove, 500);
            }
        }, 2000);
    }

    function getFirstTurnMessage() {
        if (gameVariant === 'extended') {
            const playerNumber = currentPlayerIndex + 1;
            const symbol = PLAYER_SYMBOLS[currentPlayerIndex];
            const playerType = players[currentPlayerIndex] === 'human' ? 'Jugador' : 'Computadora';
            return `¡${playerType} ${playerNumber} (${symbol}) comienza la partida!`;
        } else if (currentPlayer === 'X') {
            return '¡Jugador X comienza la partida!';
        } else {
            return gameMode === 'pvp' ? '¡Jugador O comienza la partida!' : '¡Computadora (O) comienza la partida!';
        }
    }

    function updatePlayersConfig() {
        const config = playersConfig.value;
        players = [];

        if (config === '3human') {
            players = ['human', 'human', 'human'];
            difficultySection.style.display = 'none'; // No difficulty needed for 3 human players
        } else if (config === '2human1ai') {
            players = ['human', 'human', 'ai'];
            difficultySection.style.display = 'block'; // Difficulty for 1 AI
        } else { // 1human2ai
            players = ['human', 'ai', 'ai'];
            difficultySection.style.display = 'block'; // Difficulty for 2 AI
        }
    }

    function resetGame() {
        resetBoard();
        gameActive = true;
        ultimateActiveBoard = null;

        if (gameVariant === 'extended') {
            currentPlayerIndex = (currentPlayerIndex + 1) % 3;
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        }

        const switchMessage = getSwitchMessage();
        gameStatus.innerHTML = switchMessage;
        gameStatus.classList.add('highlight-message');

        setTimeout(() => {
            gameStatus.classList.remove('highlight-message');
            updateGameStatus();

            if ((gameMode === 'pvc' && currentPlayer === 'O' && gameVariant !== 'extended') ||
                (gameVariant === 'extended' && players[currentPlayerIndex] === 'ai')) {
                setTimeout(gameVariant === 'extended' ? makeExtendedComputerMove : makeComputerMove, 500);
            }
        }, 2000);
    }

    function getSwitchMessage() {
        if (gameVariant === 'extended') {
            const playerNumber = currentPlayerIndex + 1;
            const symbol = PLAYER_SYMBOLS[currentPlayerIndex];
            const playerType = players[currentPlayerIndex] === 'human' ? 'Jugador' : 'Computadora';
            return `¡Ahora comienza ${playerType} ${playerNumber} (${symbol})!`;
        } else if (currentPlayer === 'X') {
            return '¡Ahora comienza Jugador X!';
        } else {
            return gameMode === 'pvp' ? '¡Ahora comienza Jugador O!' : '¡Ahora comienza la Computadora!';
        }
    }

    function resetScores() {
        if (confirm('¿Estás seguro de que quieres resetear el historial de puntuaciones?')) {
            scores = { X: 0, O: 0, Y: 0, tie: 0 };
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
        scoreY.textContent = scores.Y;
        scoreTie.textContent = scores.tie;
    }


    function resetBoard() {
        if (gameVariant === 'classic') {
            board = Array(9).fill(null);
            renderClassicBoard();
            // Forzar el renderizado inmediato
            gameContainer.style.display = 'grid';
            gameContainer.style.visibility = 'visible';
            gameContainer.style.opacity = '1';
        } else if (gameVariant === 'ultimate') {
            board = Array.from({length: 9}, () => Array(9).fill(null));
            ultimateActiveBoard = null;
            renderUltimateBoard();
            // Forzar el renderizado inmediato
            gameContainer.style.display = 'grid';
            gameContainer.style.visibility = 'visible';
            gameContainer.style.opacity = '1';
        } else if (gameVariant === 'extended') {
            board = Array(25).fill(null);
            renderExtendedBoard();
            // Forzar el renderizado inmediato
            gameContainer.style.display = 'grid';
            gameContainer.style.visibility = 'visible';
            gameContainer.style.opacity = '1';
        }
    }

    function renderClassicBoard() {
        gameContainer.innerHTML = '';
        gameContainer.className = 'game-board classic-board';
        
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
        
        // Forzar el renderizado
        gameContainer.style.display = 'grid';
        gameContainer.style.visibility = 'visible';
        gameContainer.style.opacity = '1';
    }

    function renderUltimateBoard() {
        // Limpiar y preparar el contenedor
        gameContainer.innerHTML = '';
        gameContainer.className = 'ultimate-board rendered visible'; // Asegurar todas las clases necesarias
        gameContainer.style.display = 'grid';
        gameContainer.style.visibility = 'visible';
        gameContainer.style.opacity = '1';

        // Crear estructura completa del tablero
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < 9; i++) {
            const miniBoard = document.createElement('div');
            miniBoard.className = 'mini-board';
            miniBoard.dataset.boardIndex = i;
            miniBoard.dataset.boardNumber = i + 1;

            const miniBoardWinner = checkMiniBoardWinner(i);
            const isActive = ultimateActiveBoard === null || ultimateActiveBoard === i;

            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'mini-cell';
                cell.dataset.boardIndex = i;
                cell.dataset.cellIndex = j;

                if (board[i][j]) {
                    cell.textContent = board[i][j];
                    cell.classList.add(board[i][j].toLowerCase());
                }

                if (isActive && !board[i][j] && gameActive && !miniBoardWinner) {
                    cell.addEventListener('click', () => handleUltimateCellClick(i, j));
                }

                miniBoard.appendChild(cell);
            }

            if (miniBoardWinner) {
                miniBoard.classList.add('won-board', miniBoardWinner.toLowerCase());
            } else if (isActive && gameActive) {
                miniBoard.classList.add('active-board');
            }

            fragment.appendChild(miniBoard);
        }

        gameContainer.appendChild(fragment);
        
        // Mostrar solo cuando todo esté listo
        setTimeout(() => {
            gameContainer.style.display = 'grid';
            gameContainer.style.visibility = 'visible';
        }, 10);
    }

    function renderExtendedBoard() {
        gameContainer.innerHTML = '';
        gameContainer.className = 'game-board extended-board';
        
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.className = 'extended-cell';
            cell.dataset.index = i;

            if (board[i]) {
                cell.textContent = board[i];
                cell.classList.add(board[i].toLowerCase());
            }

            cell.addEventListener('click', () => handleExtendedCellClick(i));
            gameContainer.appendChild(cell);
        }
        
        // Forzar el renderizado
        gameContainer.style.display = 'grid';
        gameContainer.style.visibility = 'visible';
        gameContainer.style.opacity = '1';
    }


    function makeUltimateComputerMove() {
        if (!gameActive) return;

        let boardIndex, cellIndex;

        if (ultimateActiveBoard === null) {
            // Puede elegir cualquier tablero
            const availableBoards = [];
            for (let i = 0; i < 9; i++) {
                if (!checkMiniBoardWinner(i) && !isMiniBoardFull(i)) {
                    availableBoards.push(i);
                }
            }
            boardIndex = availableBoards[Math.floor(Math.random() * availableBoards.length)];
        } else {
            boardIndex = ultimateActiveBoard;
        }

        // Elegir una celda disponible en el tablero seleccionado
        const availableCells = [];
        for (let i = 0; i < 9; i++) {
            if (!board[boardIndex][i]) {
                availableCells.push(i);
            }
        }
        cellIndex = availableCells[Math.floor(Math.random() * availableCells.length)];

        // Realizar el movimiento
        board[boardIndex][cellIndex] = currentPlayer;
        ultimateActiveBoard = checkMiniBoardWinner(cellIndex) ? null : cellIndex;

        // Forzar reflow antes de renderizar
        forceReflow(gameContainer);
        renderUltimateBoard();

        // Verificar estado del juego
        const globalWinner = checkGlobalWinner();
        if (globalWinner) {
            handleWin(globalWinner);
            return;
        }

        if (isUltimateBoardFull()) {
            handleTie();
            return;
        }

        switchPlayer();
    }


        function handleCellClick(index) {
            if (!gameActive || board[index]) return;

            board[index] = currentPlayer;
            renderClassicBoard();

            if (checkWinner()) {
                handleWin(currentPlayer);
                return;
            }

            if (isBoardFull()) {
                handleTie();
                return;
            }

            switchPlayer();

            if (gameMode === 'pvc' && currentPlayer === 'O' && gameActive) {
                setTimeout(makeComputerMove, 500);
            }
        }

    function handleUltimateCellClick(boardIndex, cellIndex) {
        if (!gameActive || board[boardIndex][cellIndex]) return;
        
        board[boardIndex][cellIndex] = currentPlayer;
        ultimateActiveBoard = checkMiniBoardWinner(cellIndex) ? null : cellIndex;
        
        // Forzar un reflow antes del renderizado
        void gameContainer.offsetHeight;
        
        renderUltimateBoard();
        
        // Verificar estado del juego
        const globalWinner = checkGlobalWinner();
        if (globalWinner) {
            handleWin(globalWinner);
            return;
        }

        if (isUltimateBoardFull()) {
            handleTie();
            return;
        }

        switchPlayer();
        
        if (gameMode === 'pvc' && currentPlayer === 'O') {
        setTimeout(makeUltimateComputerMove, 500);
    }
    }

    function forceReflow(element) {
        // Forzar reflow para asegurar el renderizado
        void element.offsetHeight;
    }

        function handleExtendedCellClick(index) {
            if (!gameActive || board[index]) return;

            const currentSymbol = PLAYER_SYMBOLS[currentPlayerIndex];
            board[index] = currentSymbol;
            renderExtendedBoard();

            if (checkExtendedWinner(currentSymbol)) {
                handleWin(currentSymbol);
                return;
            }

            if (isBoardFull()) {
                handleTie();
                return;
            }

            moveToNextPlayer();
            updateGameStatus();

            if (players[currentPlayerIndex] === 'ai' && gameActive) {
                setTimeout(makeExtendedComputerMove, 500);
            }
        }

        function handleWin(winner) {
            gameActive = false;
            updateScores(winner);

            let winMessage;
            if (gameVariant === 'extended') {
                const playerType = winner === 'X' ? (players[0] === 'human' ? 'Jugador' : 'Computadora') :winner === 'O' ? (players[1] === 'human' ? 'Jugador' : 'Computadora') : (players[2] === 'human' ? 'Jugador' : 'Computadora');
                const playerNumber = winner === 'X' ? 1 : winner === 'O' ? 2 : 3;
                winMessage = `¡${playerType} ${playerNumber} (${winner}) gana!`;
            } else if (winner === 'X') {
                winMessage = '¡Jugador X gana!';
            } else {
                winMessage = gameMode === 'pvp' ? '¡Jugador O gana!' : '¡Computadora gana!';
            }

            gameStatus.textContent = winMessage;
        }

        function handleTie() {
            gameActive = false;
            updateScores('tie');
            gameStatus.textContent = '¡Empate!';
        }

        function switchPlayer() {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateGameStatus();
        }

        function moveToNextPlayer() {
            currentPlayerIndex = (currentPlayerIndex + 1) % 3;
        }

        function makeComputerMove() {
            if (!gameActive) return;

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
                handleWin('O');
                return;
            }

            if (isBoardFull()) {
                handleTie();
                return;
            }

            switchPlayer();
        }

        function makeExtendedComputerMove() {
            if (!gameActive) return;

            const currentSymbol = PLAYER_SYMBOLS[currentPlayerIndex];
            let move;

            if (difficulty === 'easy') {
                move = getRandomExtendedMove();
            } else if (difficulty === 'medium') {
                move = Math.random() < 0.5 ? getBestExtendedMove(currentSymbol) : getRandomExtendedMove();
            } else {
                move = getBestExtendedMove(currentSymbol);
            }

            board[move] = currentSymbol;
            renderExtendedBoard();

            if (checkExtendedWinner(currentSymbol)) {
                handleWin(currentSymbol);
                return;
            }

            if (isBoardFull()) {
                handleTie();
                return;
            }

            moveToNextPlayer();
            updateGameStatus();

            if (players[currentPlayerIndex] === 'ai' && gameActive) {
                setTimeout(makeExtendedComputerMove, 500);
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

        function getRandomExtendedMove() {
            const emptyCells = [];
            for (let i = 0; i < 25; i++) {
                if (!board[i]) emptyCells.push(i);
            }
            return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }

        function getBestExtendedMove(symbol) {
            // 1. Verificar si podemos ganar
            for (let i = 0; i < 25; i++) {
                if (!board[i]) {
                    board[i] = symbol;
                    if (checkExtendedWinner(symbol)) {
                        board[i] = null;
                        return i;
                    }
                    board[i] = null;
                }
            }

            // 2. Bloquear a los oponentes
            const opponents = PLAYER_SYMBOLS.filter(s => s !== symbol);
            for (const opponent of opponents) {
                for (let i = 0; i < 25; i++) {
                    if (!board[i]) {
                        board[i] = opponent;
                        if (checkExtendedWinner(opponent)) {
                            board[i] = null;
                            return i;
                        }
                        board[i] = null;
                    }
                }
            }

            // 3. Movimiento estratégico (centro o esquinas)
            const center = 12;
            if (!board[center]) return center;

            const corners = [0, 4, 20, 24];
            const emptyCorners = corners.filter(i => !board[i]);
            if (emptyCorners.length > 0) {
                return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
            }

            // 4. Movimiento aleatorio
            return getRandomExtendedMove();
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
            if (gameVariant === 'classic') {
                return board.every(cell => cell !== null);
            } else if (gameVariant === 'extended') {
                return board.every(cell => cell !== null);
            }
            return false;
        }

        function checkMiniBoardWinner(boardIndex) {
        const miniBoard = board[boardIndex];
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas
            [0, 4, 8], [2, 4, 6]             // diagonales
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
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas
            [0, 4, 8], [2, 4, 6]             // diagonales
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

    function checkExtendedWinner(symbol) {
        const size = 5;
        const winLength = 3;
        let winningCells = [];

    // Verificar filas
    for (let row = 0; row < size; row++) {
        for (let col = 0; col <= size - winLength; col++) {
            let win = true;
            for (let i = 0; i < winLength; i++) {
                if (board[row * size + col + i] !== symbol) {
                    win = false;
                    break;
                }
            }
            if (win) {
                for (let i = 0; i < winLength; i++) {
                    winningCells.push(row * size + col + i);
                }
                highlightWinningCells(winningCells);
                return true;
            }
        }
    }

    // Verificar columnas
    for (let col = 0; col < size; col++) {
        for (let row = 0; row <= size - winLength; row++) {
            let win = true;
            for (let i = 0; i < winLength; i++) {
                if (board[(row + i) * size + col] !== symbol) {
                    win = false;
                    break;
                }
            }
            if (win) {
                for (let i = 0; i < winLength; i++) {
                    winningCells.push((row + i) * size + col);
                }
                highlightWinningCells(winningCells);
                return true;
            }
        }
    }

    // Verificar diagonales (\)
    for (let row = 0; row <= size - winLength; row++) {
        for (let col = 0; col <= size - winLength; col++) {
            let win = true;
            for (let i = 0; i < winLength; i++) {
                if (board[(row + i) * size + (col + i)] !== symbol) {
                    win = false;
                    break;
                }
            }
            if (win) {
                for (let i = 0; i < winLength; i++) {
                    winningCells.push((row + i) * size + (col + i));
                }
                highlightWinningCells(winningCells);
                return true;
            }
        }
    }

    // Verificar diagonales (/)
    for (let row = 0; row <= size - winLength; row++) {
        for (let col = winLength - 1; col < size; col++) {
            let win = true;
            for (let i = 0; i < winLength; i++) {
                if (board[(row + i) * size + (col - i)] !== symbol) {
                    win = false;
                    break;
                }
            }
            if (win) {
                for (let i = 0; i < winLength; i++) {
                    winningCells.push((row + i) * size + (col - i));
                }
                highlightWinningCells(winningCells);
                return true;
            }
        }
    }

    return false;
    }

    function highlightWinningCells(cellIndexes) {
        const cells = document.querySelectorAll('.extended-cell');
        cellIndexes.forEach(index => {
            cells[index].classList.add('winning-cell');
        });
    }

    function updateScores(winner) {
        if (winner === 'X') {
            scores.X++;
        } else if (winner === 'O') {
            scores.O++;
        } else if (winner === 'Y') {
            scores.Y++;
        } else {
            scores.tie++;
        }
        updateScoreDisplay();
        saveScores();
    }

    function updateGameStatus() {
        if (!gameActive) return;

        if (gameVariant === 'extended') {
            const playerNumber = currentPlayerIndex + 1;
            const symbol = PLAYER_SYMBOLS[currentPlayerIndex];
            const playerType = players[currentPlayerIndex] === 'human' ? 'Jugador' : 'Computadora';
            gameStatus.innerHTML = `Turno de <span class="player-${symbol.toLowerCase()}">${playerType} ${playerNumber} (${symbol})</span> <span class="current-player-indicator"></span>`;
        } else if (gameVariant === 'classic') {
            gameStatus.innerHTML = `Turno del <span class="player-${currentPlayer.toLowerCase()}">Jugador ${currentPlayer}</span> <span class="current-player-indicator"></span>`;
        } else {
            gameStatus.innerHTML = `Turno del <span class="player-${currentPlayer.toLowerCase()}">Jugador ${currentPlayer}</span> <span class="current-player-indicator"></span>`;
            if (ultimateActiveBoard !== null) {
                gameStatus.textContent += ` (Tablero ${ultimateActiveBoard + 1})`;
            }
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

    // Call updatePlayersConfig initially to set correct difficulty display for extended if it's the default
    updatePlayersConfig();
});