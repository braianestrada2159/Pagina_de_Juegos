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

        // Estado del juego
        let gameBoard = Array(9).fill().map(() => Array(9).fill(0));
        let solutionBoard = Array(9).fill().map(() => Array(9).fill(0));
        let originalBoard = Array(9).fill().map(() => Array(9).fill(0));
        let currentDifficulty = 'easy';
        let selectedCell = null;
        let selectedNumber = null;
        let gameStartTime = null;
        let pausedTime = 0;
        let gameTimer = null;
        let mistakes = 0;
        let maxMistakes = 3;
        let hintsUsed = 0;
        let gameCompleted = false;
        let isPaused = false;

        // Configuración de dificultad
        const difficultySettings = {
            easy: { cellsToRemove: 40, name: 'Fácil' },
            medium: { cellsToRemove: 50, name: 'Medio' },
            hard: { cellsToRemove: 60, name: 'Difícil' }
        };

        // Inicialización
        document.addEventListener('DOMContentLoaded', function() {
            initializeGame();
            setupEventListeners();
            updateDifficultyButtons();
        });

        function initializeGame() {
            createGrid();
            generateNewPuzzle();
            startTimer();
        }

        function setupEventListeners() {
            // Botones numéricos
            document.querySelectorAll('.number-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    if (isPaused) return;
                    
                    document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedNumber = this.dataset.number;
                    
                    if (selectedCell && !selectedCell.classList.contains('given')) {
                        if (selectedNumber === '0') {
                            selectedCell.value = '';
                            gameBoard[selectedCell.dataset.row][selectedCell.dataset.col] = 0;
                        } else {
                            selectedCell.value = selectedNumber;
                            gameBoard[selectedCell.dataset.row][selectedCell.dataset.col] = parseInt(selectedNumber);
                        }
                        
                        validateMove(selectedCell);
                        updateProgress();
                        highlightSameNumbers();
                        
                        if (isPuzzleComplete()) {
                            completePuzzle();
                        }
                    }
                });
            });

            // Controles de teclado
            document.addEventListener('keydown', function(e) {
                if (isPaused) return;
                
                if (e.key >= '1' && e.key <= '9') {
                    selectedNumber = e.key;
                    document.querySelectorAll('.number-btn').forEach(btn => {
                        btn.classList.toggle('selected', btn.dataset.number === e.key);
                    });
                    
                    if (selectedCell && !selectedCell.classList.contains('given')) {
                        selectedCell.value = selectedNumber;
                        gameBoard[selectedCell.dataset.row][selectedCell.dataset.col] = parseInt(selectedNumber);
                        validateMove(selectedCell);
                        updateProgress();
                        highlightSameNumbers();
                        
                        if (isPuzzleComplete()) {
                            completePuzzle();
                        }
                    }
                } else if (e.key === 'Delete' || e.key === 'Backspace') {
                    if (selectedCell && !selectedCell.classList.contains('given')) {
                        selectedCell.value = '';
                        gameBoard[selectedCell.dataset.row][selectedCell.dataset.col] = 0;
                        selectedCell.classList.remove('error');
                        updateProgress();
                        highlightSameNumbers();
                    }
                } else if (e.key === 'Escape') {
                    const dropdown = document.getElementById('dropdown-content');
                    if (dropdown.classList.contains('show')) {
                        toggleDropdown();
                    }
                }
            });

            /*// Cerrar dropdown al hacer click fuera
            document.addEventListener('click', function(e) {
                const dropdown = document.getElementById('dropdown-content');
                const dropdownBtn = document.querySelector('.dropdown-btn');
                
                if (!dropdownBtn.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.remove('show');
                    document.getElementById('dropdown-arrow').style.transform = 'rotate(0deg)';
                }
            });*/
        }

        function createGrid() {
            const grid = document.getElementById('sudoku-grid');
            grid.innerHTML = '';
            
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    const cell = document.createElement('input');
                    cell.type = 'text';
                    cell.className = 'sudoku-cell';
                    cell.maxLength = 1;
                    cell.dataset.row = row;
                    cell.dataset.col = col;
                    
                    cell.addEventListener('click', function() {
                        if (isPaused) return;
                        selectCell(this);
                    });
                    
                    cell.addEventListener('input', function(e) {
                        if (isPaused) return;
                        
                        const value = e.target.value;
                        if (!/^[1-9]$/.test(value)) {
                            e.target.value = '';
                            return;
                        }
                        
                        if (!this.classList.contains('given')) {
                            gameBoard[row][col] = parseInt(value);
                            validateMove(this);
                            updateProgress();
                            highlightSameNumbers();
                            
                            if (isPuzzleComplete()) {
                                completePuzzle();
                            }
                        }
                    });
                    
                    grid.appendChild(cell);
                }
            }
        }

        function selectCell(cell) {
            document.querySelectorAll('.sudoku-cell').forEach(c => {
                c.classList.remove('highlight');
            });
            
            selectedCell = cell;
            cell.classList.add('highlight');
            cell.focus();
            
            highlightSameNumbers();
        }

        function highlightSameNumbers() {
            const cells = document.querySelectorAll('.sudoku-cell');
            cells.forEach(cell => cell.classList.remove('same-number'));
            
            if (selectedCell && selectedCell.value) {
                cells.forEach(cell => {
                    if (cell.value === selectedCell.value) {
                        cell.classList.add('same-number');
                    }
                });
            }
        }

        function generateNewPuzzle() {
            // Crear un tablero vacío
            gameBoard = Array(9).fill().map(() => Array(9).fill(0));
            
            // Llenar el tablero con una solución válida
            fillBoard(gameBoard);
            
            // Copiar la solución
            solutionBoard = gameBoard.map(row => [...row]);
            
            // Remover celdas según la dificultad
            const cellsToRemove = difficultySettings[currentDifficulty].cellsToRemove;
            removeCells(gameBoard, cellsToRemove);
            
            // Guardar el estado original
            originalBoard = gameBoard.map(row => [...row]);
            
            // Actualizar la interfaz
            updateGrid();
            resetGameState();
        }

        function fillBoard(board) {
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (board[row][col] === 0) {
                        shuffleArray(numbers);
                        
                        for (let num of numbers) {
                            if (isValidPlacement(board, row, col, num)) {
                                board[row][col] = num;
                                
                                if (fillBoard(board)) {
                                    return true;
                                }
                                
                                board[row][col] = 0;
                            }
                        }
                        
                        return false;
                    }
                }
            }
            
            return true;
        }

        function isValidPlacement(board, row, col, num) {
            // Verificar fila
            for (let x = 0; x < 9; x++) {
                if (board[row][x] === num) return false;
            }
            
            // Verificar columna
            for (let x = 0; x < 9; x++) {
                if (board[x][col] === num) return false;
            }
            
            // Verificar caja 3x3
            const boxRow = Math.floor(row / 3) * 3;
            const boxCol = Math.floor(col / 3) * 3;
            
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[boxRow + i][boxCol + j] === num) return false;
                }
            }
            
            return true;
        }

        function isValidMove(board, row, col, num) {
            // Verificar si el número es válido para la posición actual
            return num === solutionBoard[row][col];
        }

        function removeCells(board, count) {
            let removed = 0;
            while (removed < count) {
                const row = Math.floor(Math.random() * 9);
                const col = Math.floor(Math.random() * 9);
                
                if (board[row][col] !== 0) {
                    board[row][col] = 0;
                    removed++;
                }
            }
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        function updateGrid() {
            const cells = document.querySelectorAll('.sudoku-cell');
            
            cells.forEach((cell, index) => {
                const row = Math.floor(index / 9);
                const col = index % 9;
                const value = gameBoard[row][col];
                
                cell.value = value === 0 ? '' : value;
                cell.classList.remove('given', 'error', 'highlight', 'same-number');
                
                if (value !== 0 && originalBoard[row][col] !== 0) {
                    cell.classList.add('given');
                    cell.readOnly = true;
                } else {
                    cell.readOnly = false;
                }
            });
        }

        function validateMove(cell) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const num = parseInt(cell.value);
            
            cell.classList.remove('error');
            
            if (num && !isValidMove(gameBoard, row, col, num)) {
                cell.classList.add('error');
                mistakes++;
                updateMistakes();
                
                if (mistakes >= maxMistakes) {
                    alert('¡Demasiados errores! El juego se reiniciará.');
                    resetGame();
                }
            }
        }

        function updateProgress() {
            const totalCells = 81;
            const filledCells = gameBoard.flat().filter(cell => cell !== 0).length;
            const progress = (filledCells / totalCells) * 100;
            
            document.getElementById('progress').style.width = progress + '%';
        }

        function isPuzzleComplete() {
            // Verificar que todas las celdas estén llenas
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (gameBoard[row][col] === 0) {
                        return false;
                    }
                }
            }
            
            // Verificar que no haya errores
            const errorCells = document.querySelectorAll('.sudoku-cell.error');
            return errorCells.length === 0;
        }

        function completePuzzle() {
            gameCompleted = true;
            clearInterval(gameTimer);
            
            const finalTime = document.getElementById('timer').textContent;
            const finalMistakes = mistakes;
            const finalDifficulty = difficultySettings[currentDifficulty].name;
            
            document.getElementById('final-time').textContent = finalTime;
            document.getElementById('final-mistakes').textContent = finalMistakes;
            document.getElementById('final-difficulty').textContent = finalDifficulty;
            
            setTimeout(() => {
                document.getElementById('completion-modal').style.display = 'flex';
            }, 500);
        }

        function startTimer() {
            gameStartTime = Date.now() - pausedTime;
            gameTimer = setInterval(updateTimer, 1000);
            pausedTime = 0;
        }

        function updateTimer() {
            if (gameCompleted || isPaused) return;
            
            const elapsed = Date.now() - gameStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            document.getElementById('timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        function pauseTimer() {
            clearInterval(gameTimer);
            pausedTime = Date.now() - gameStartTime;
        }

        function togglePause() {
            isPaused = !isPaused;
            const pauseBtn = document.getElementById('pause-btn');
            
            if (isPaused) {
                pauseTimer();
                pauseBtn.textContent = '▶️ Continuar';
                document.getElementById('pause-modal').style.display = 'flex';
            } else {
                startTimer();
                pauseBtn.textContent = '⏸️ Pausar';
                document.getElementById('pause-modal').style.display = 'none';
            }
        }

        function updateMistakes() {
            document.getElementById('mistakes').textContent = mistakes;
        }

        function resetGameState() {
            mistakes = 0;
            hintsUsed = 0;
            gameCompleted = false;
            selectedCell = null;
            selectedNumber = null;
            isPaused = false;
            pausedTime = 0;
            
            updateMistakes();
            updateProgress();
            
            document.querySelectorAll('.number-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            document.getElementById('pause-btn').textContent = '⏸️ Pausar';
            document.getElementById('pause-modal').style.display = 'none';
        }

        function newGame() {
            clearInterval(gameTimer);
            generateNewPuzzle();
            startTimer();
        }

        function resetGame() {
            clearInterval(gameTimer);
            gameBoard = originalBoard.map(row => [...row]);
            updateGrid();
            resetGameState();
            startTimer();
        }

        function giveHint() {
            if (isPaused) return;
            if (hintsUsed >= 3) {
                alert('¡No quedan más pistas disponibles!');
                return;
            }
            
            const emptyCells = [];
            
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (gameBoard[row][col] === 0) {
                        emptyCells.push({ row, col });
                    }
                }
            }
            
            if (emptyCells.length === 0) {
                alert('¡El puzzle ya está completo!');
                return;
            }
            
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const correctValue = solutionBoard[randomCell.row][randomCell.col];
            
            gameBoard[randomCell.row][randomCell.col] = correctValue;
            
            const cellIndex = randomCell.row * 9 + randomCell.col;
            const cell = document.querySelectorAll('.sudoku-cell')[cellIndex];
            cell.value = correctValue;
            cell.classList.add('given');
            cell.readOnly = true;
            
            hintsUsed++;
            updateProgress();
            
            if (isPuzzleComplete()) {
                completePuzzle();
            }
        }

        function setDifficulty(level) {
            currentDifficulty = level;
            updateDifficultyButtons();
            newGame();
        }

        function updateDifficultyButtons() {
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                if (btn.dataset.level === currentDifficulty) {
                    btn.style.opacity = '1';
                    btn.style.transform = 'scale(1.05)';
                } else {
                    btn.style.opacity = '0.7';
                    btn.style.transform = 'scale(1)';
                }
            });
        }

        function solvePuzzle() {
            if (isPaused) return;
            if (confirm('¿Estás seguro de que quieres resolver el puzzle automáticamente?')) {
                gameBoard = solutionBoard.map(row => [...row]);
                updateGrid();
                
                // Marcar todas las celdas como dadas
                document.querySelectorAll('.sudoku-cell').forEach(cell => {
                    cell.classList.add('given');
                    cell.readOnly = true;
                });
                
                updateProgress();
                completePuzzle();
            }
        }

        function closeModal() {
            document.getElementById('completion-modal').style.display = 'none';
            newGame();
        }

       /* function toggleDropdown() {
            const dropdown = document.getElementById('dropdown-content');
            const arrow = document.getElementById('dropdown-arrow');
            
            dropdown.classList.toggle('show');
            
            if (dropdown.classList.contains('show')) {
                arrow.style.transform = 'rotate(180deg)';
            } else {
                arrow.style.transform = 'rotate(0deg)';
            }
        }*/

        function showInstructions() {
            alert('INSTRUCCIONES DEL SUDOKU:\n\n' +
                  '• Rellena todas las celdas con números del 1 al 9\n' +
                  '• Cada fila debe contener los números 1-9 sin repetir\n' +
                  '• Cada columna debe contener los números 1-9 sin repetir\n' +
                  '• Cada caja 3x3 debe contener los números 1-9 sin repetir\n' +
                  '• Usa el teclado o los botones para introducir números\n' +
                  '• Tienes máximo 3 errores por partida\n' +
                  '• Usa las pistas si necesitas ayuda');
        }

        function showStatistics() {
            const currentTime = document.getElementById('timer').textContent;
            const currentMistakes = mistakes;
            const currentDifficultyName = difficultySettings[currentDifficulty].name;
            const progress = Math.round((gameBoard.flat().filter(cell => cell !== 0).length / 81) * 100);
            
            alert('ESTADÍSTICAS ACTUALES:\n\n' +
                  `⏱️ Tiempo: ${currentTime}\n` +
                  `❌ Errores: ${currentMistakes}/3\n` +
                  `🎯 Dificultad: ${currentDifficultyName}\n` +
                  `📊 Progreso: ${progress}%\n` +
                  `💡 Pistas usadas: ${hintsUsed}/3`);
        }
