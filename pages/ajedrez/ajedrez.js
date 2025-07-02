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

//código para el tablero de ajedrez
// Configuración del juego
let halfMoveClock = 0; // Contador para la regla de 50 movimientos
let fullMoveNumber = 1; // Contador de movimientos completos
let positionHistory = [];
let gameMode = 'friend';
let difficulty = 'medium';
let currentPlayer = 'white';
let selectedSquare = null;
let board = [];
let gameOver = false;
let moveHistory = [];
let promotionCallback = null;
let enPassantTarget = null;

// Representación de las piezas
const pieces = {
    white: {
        king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟'
    },
    black: {
        king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟'
    }
};

// Inicializar tablero
function initializeBoard() {
    // Crear el tablero vacío
    board = [
        [
            // Piezas negras
            {piece: 'rook', color: 'black', hasMoved: false}, 
            {piece: 'knight', color: 'black'}, 
            {piece: 'bishop', color: 'black'}, 
            {piece: 'queen', color: 'black'}, 
            {piece: 'king', color: 'black', hasMoved: false}, 
            {piece: 'bishop', color: 'black'}, 
            {piece: 'knight', color: 'black'}, 
            {piece: 'rook', color: 'black', hasMoved: false}
        ],
        [
            {piece: 'pawn', color: 'black'}, {piece: 'pawn', color: 'black'}, 
            {piece: 'pawn', color: 'black'}, {piece: 'pawn', color: 'black'}, 
            {piece: 'pawn', color: 'black'}, {piece: 'pawn', color: 'black'}, 
            {piece: 'pawn', color: 'black'}, {piece: 'pawn', color: 'black'}
        ],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [
            {piece: 'pawn', color: 'white'}, {piece: 'pawn', color: 'white'}, 
            {piece: 'pawn', color: 'white'}, {piece: 'pawn', color: 'white'}, 
            {piece: 'pawn', color: 'white'}, {piece: 'pawn', color: 'white'}, 
            {piece: 'pawn', color: 'white'}, {piece: 'pawn', color: 'white'}
        ],
        [
            // Representación de las piezas blancas
            {piece: 'rook', color: 'white', hasMoved: false}, 
            {piece: 'knight', color: 'white'}, 
            {piece: 'bishop', color: 'white'}, 
            {piece: 'queen', color: 'white'}, 
            {piece: 'king', color: 'white', hasMoved: false}, 
            {piece: 'bishop', color: 'white'}, 
            {piece: 'knight', color: 'white'}, 
            {piece: 'rook', color: 'white', hasMoved: false}
        ]
    ];
    enPassantTarget = null;
}

// Inicializar el juego
function createBoard() {
    const boardElement = document.getElementById('chessboard');
    boardElement.innerHTML = '';
    
    // Verificar jaque para ambos bandos (para mostrar correctamente en el tablero)
    const whiteInCheck = isInCheck('white');
    const blackInCheck = isInCheck('black');
    let whiteKingPos = whiteInCheck ? findKingPosition('white') : null;
    let blackKingPos = blackInCheck ? findKingPosition('black') : null;

    // Crear filas y columnas del tablero
    for (let row = 0; row < 8; row++) {
        const rowElement = document.createElement('div');
        rowElement.className = 'board-row';

        // Crear casillas del tablero, Alternar colores de las casillas
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            square.onclick = () => handleSquareClick(row, col);

            // Resaltar reyes en jaque
            if (whiteKingPos && whiteKingPos.row === row && whiteKingPos.col === col) {
                square.classList.add('in-check');
            }
            if (blackKingPos && blackKingPos.row === row && blackKingPos.col === col) {
                square.classList.add('in-check');
            }

            // Agregar pieza si existe
            const pieceData = board[row][col];
            if (pieceData) {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'piece';
                pieceElement.dataset.color = pieceData.color;
                pieceElement.textContent = pieces[pieceData.color][pieceData.piece];
                square.appendChild(pieceElement);
            }

            rowElement.appendChild(square);
        }
        boardElement.appendChild(rowElement);
    }
}

// Encontrar posición del rey
function findKingPosition(color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const pieceData = board[row][col];
            if (pieceData && pieceData.piece === 'king' && pieceData.color === color) {
                return { row, col };
            }
        }
    }
    return null;
}

// Manejar clic en una casilla del tablero
function handleSquareClick(row, col) {
    if (gameOver) return;
    if (gameMode === 'ai' && currentPlayer === 'black') return;

    const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    const pieceData = board[row][col];

    // Si hay una pieza seleccionada
    if (selectedSquare) {
        // Si se hace clic en la misma pieza, deseleccionar
        if (selectedSquare.row === row && selectedSquare.col === col) {
            clearSelection();
            return;
        }
        
        // Si es un movimiento válido, mover la pieza
        if (isValidMove(selectedSquare.row, selectedSquare.col, row, col)) {
            makeMove(selectedSquare.row, selectedSquare.col, row, col);
            return;
        }
        
        // Si no es un movimiento válido, deseleccionar primero
        clearSelection();
    }

    // Seleccionar nueva pieza solo si es del color del jugador actual
    if (pieceData && pieceData.color === currentPlayer) {
        selectedSquare = { row, col };
        highlightSquare(row, col, 'selected');
        showPossibleMoves(row, col);
    }
}

// Seleccionar nueva pieza
function selectNewPiece(row, col) {
    clearSelection(); // Limpiar selección previa primero
    const pieceData = board[row][col];
    
    if (pieceData && pieceData.color === currentPlayer) {
        selectedSquare = { row, col };
        highlightSquare(row, col, 'selected');
        showPossibleMoves(row, col);
    }
}

// Limpiar selección actual
function clearSelection() {
    if (selectedSquare) {
        const square = document.querySelector(
            `[data-row="${selectedSquare.row}"][data-col="${selectedSquare.col}"]`
        );
        if (square) {
            square.classList.remove('selected');
        }
        selectedSquare = null;
    }
    clearHighlights();
}

// Resaltar casilla
function highlightSquare(row, col, className) {
    const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    square.classList.add(className);
}

// Limpiar resaltados
function clearHighlights() {
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('selected', 'possible-move', 'possible-capture');
    });
}

// Mostrar movimientos posibles
function showPossibleMoves(row, col) {
    const moves = getPossibleMoves(row, col);
    moves.forEach(move => {
        const targetPiece = board[move.row][move.col];
        const className = targetPiece ? 'possible-capture' : 'possible-move';
        highlightSquare(move.row, move.col, className);
    });
}

// Validar movimiento
function isValidMove(fromRow, fromCol, toRow, toCol, color = currentPlayer, customBoard = board) {
    if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;
    
    // Verificar que el color de la pieza sea el del jugador actual
    const pieceData = board[fromRow][fromCol];
    const targetData = board[toRow][toCol];
    
    // Verificar que haya una pieza en la posición de origen
    if (!pieceData) return false;
    if (targetData && pieceData.color === targetData.color) return false;
    
    // Verificar enroque
    if (pieceData.piece === 'king' && Math.abs(fromCol - toCol) === 2) {
        return canCastle(pieceData.color, toCol > fromCol ? 'king' : 'queen');
    }
    
    // Verificar movimiento válido según las reglas de la pieza
    if (!isPieceValidMove(pieceData.piece, fromRow, fromCol, toRow, toCol)) {
        return false;
    }
    
    // Simular el movimiento para verificar si deja al rey en jaque
    const originalTargetData = board[toRow][toCol];
    board[toRow][toCol] = pieceData;
    board[fromRow][fromCol] = null;
    
    const isKingInCheck = isInCheck(pieceData.color);
    
    // Revertir el movimiento simulado
    board[fromRow][fromCol] = pieceData;
    board[toRow][toCol] = originalTargetData;
    
    return !isKingInCheck;
}

// Validar enroque
function canCastle(color, side) {
    const row = color === 'white' ? 7 : 0;
    const kingCol = 4;
    const rookCol = side === 'king' ? 7 : 0;
    const step = side === 'king' ? 1 : -1;
    
    // Verificar que ni el rey ni la torre se hayan movido
    const king = board[row][kingCol];
    const rook = board[row][rookCol];
    
    if (!king || king.piece !== 'king' || king.hasMoved) return false;
    if (!rook || rook.piece !== 'rook' || rook.hasMoved) return false;
    
    // Verificar que las casillas intermedias estén vacías
    for (let col = kingCol + step; col !== rookCol; col += step) {
        if (board[row][col] !== null) return false;
    }
    
    // Verificar que el rey no esté en jaque ni pase por casillas en jaque
    if (isInCheck(color)) return false;
    
    for (let col = kingCol + step; col !== kingCol + 2 * step; col += step) {
        // Simular movimiento temporal para verificar jaque
        board[row][col] = board[row][kingCol];
        board[row][kingCol] = null;
        const inCheck = isInCheck(color);
        board[row][kingCol] = board[row][col];
        board[row][col] = null;
        
        if (inCheck) return false;
    }
    
    return true;
}

// Corrección en la función canCastle
function canCastle(color, side) {
    const row = color === 'white' ? 7 : 0;
    const kingCol = 4;
    const rookCol = side === 'king' ? 7 : 0;
    const step = side === 'king' ? 1 : -1;
    
    // Verificar que ni el rey ni la torre se hayan movido
    const king = board[row][kingCol];
    const rook = board[row][rookCol];
    
    if (!king || king.piece !== 'king' || king.hasMoved) return false;
    if (!rook || rook.piece !== 'rook' || rook.hasMoved) return false;
    
    // Verificar que las casillas intermedias estén vacías
    for (let col = kingCol + step; col !== rookCol; col += step) {
        if (board[row][col] !== null) return false;
    }
    
    // Verificar que el rey no esté en jaque
    if (isInCheck(color)) return false;
    
    // Verificar que el rey no pase por casillas en jaque
    for (let col = kingCol + step; col !== kingCol + 2 * step; col += step) {
        // Simular movimiento temporal del rey
        const originalKingPos = board[row][kingCol];
        const originalNewPos = board[row][col];
        
        board[row][col] = originalKingPos;
        board[row][kingCol] = null;
        
        const inCheck = isInCheck(color);
        
        // Revertir movimiento simulado
        board[row][kingCol] = originalKingPos;
        board[row][col] = originalNewPos;
        
        if (inCheck) return false;
    } 
    return true;
}

// Validar movimiento específico por pieza
function isPieceValidMove(piece, fromRow, fromCol, toRow, toCol) {
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);

    // Verificar si el movimiento es diagonal
    switch (piece) {
        case 'pawn':
            return isValidPawnMove(fromRow, fromCol, toRow, toCol);
        case 'rook':
            return (rowDiff === 0 || colDiff === 0) && isPathClear(fromRow, fromCol, toRow, toCol);
        case 'bishop':
            return absRowDiff === absColDiff && isPathClear(fromRow, fromCol, toRow, toCol);
        case 'queen':
            return (rowDiff === 0 || colDiff === 0 || absRowDiff === absColDiff) && isPathClear(fromRow, fromCol, toRow, toCol);
        case 'king':

            // Movimiento normal del rey (una casilla en cualquier dirección)
            if (absRowDiff <= 1 && absColDiff <= 1) return true;

            // Movimiento de enroque: solo permitir movimiento de 2 columnas en la misma fila
            if (fromRow === toRow && absColDiff === 2) return true;

    // Cualquier otro movimiento es ilegal
    return false;
        case 'knight':
            return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2);
        default:
            return false;
    }
}

// Validar movimiento de peón
function isValidPawnMove(fromRow, fromCol, toRow, toCol) {
    const pieceData = board[fromRow][fromCol];
    const direction = pieceData.color === 'white' ? -1 : 1;
    const startRow = pieceData.color === 'white' ? 6 : 1;
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);

    // Movimiento hacia adelante
    if (colDiff === 0) {
        if (rowDiff === direction && !board[toRow][toCol]) return true;
        if (fromRow === startRow && rowDiff === 2 * direction && 
            !board[toRow][toCol] && !board[fromRow + direction][fromCol]) {
            return true;
        }
    }
    // Captura diagonal
    else if (colDiff === 1 && rowDiff === direction) {
        // Captura normal
        if (board[toRow][toCol]) return true;
        
        // Captura al paso
        if (enPassantTarget && enPassantTarget.row === toRow && enPassantTarget.col === toCol) {
            return true;
        }
    }
    return false;
}

// Verificar si el camino está despejado para movimientos de torre, alfil o reina
function isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    
    while (currentRow !== toRow || currentCol !== toCol) {
        if (board[currentRow][currentCol]) return false;
        currentRow += rowStep;
        currentCol += colStep;
    }
    
    return true;
}

// Obtener movimientos posibles para una pieza
function getPossibleMoves(row, col) {
    const moves = [];
    const pieceData = board[row][col];

    for (let toRow = 0; toRow < 8; toRow++) {
        for (let toCol = 0; toCol < 8; toCol++) {
            // DESCARTAR movimientos mayores a 2 casillas horizontal o vertical
            if (pieceData.piece === 'king') {
                const absRowDiff = Math.abs(row - toRow);
                const absColDiff = Math.abs(col - toCol);
                if (!((absRowDiff <= 1 && absColDiff <= 1) || (absRowDiff === 0 && absColDiff === 2))) {
                    continue; // ignorar movimientos inválidos
                }
            }
            // DESCARTAR movimientos mayores a 2 casillas horizontal o vertical
            if (isValidMove(row, col, toRow, toCol)) {
                moves.push({ row: toRow, col: toCol });
            }
        }
    }
    return moves;
}

// Hacer movimiento
function makeMove(fromRow, fromCol, toRow, toCol) {
    const pieceData = board[fromRow][fromCol];
    const targetData = board[toRow][toCol];
    
    // Actualizar contadores de movimientos
    if (pieceData.piece === 'pawn' || targetData) {
        halfMoveClock = 0; // Resetear si hay movimiento de peón o captura
    } else {
        halfMoveClock++;
    }
    
    // Actualizar número de movimientos completos
    if (pieceData.color === 'black') {
        fullMoveNumber++;
    }

    // Marcar que la pieza se ha movido (para enroque)
    if (pieceData && !pieceData.hasMoved) {
        pieceData.hasMoved = true;
    }   
    
    // Registrar movimiento
    const move = {
        from: `${String.fromCharCode(97 + fromCol)}${8 - fromRow}`,
        to: `${String.fromCharCode(97 + toCol)}${8 - toRow}`,
        piece: pieceData.piece,
        captured: targetData ? targetData.piece : null,
        isCastle: false,
        isEnPassant: false
    };
    
    // Manejar enroque
    if (pieceData.piece === 'king' && Math.abs(fromCol - toCol) === 2) {
        move.isCastle = true;
        const rookFromCol = toCol > fromCol ? 7 : 0;
        const rookToCol = toCol > fromCol ? 5 : 3;
        
        // Mover la torre
        board[toRow][rookToCol] = board[toRow][rookFromCol];
        board[toRow][rookFromCol] = null;
        board[toRow][rookToCol].hasMoved = true;
        
        // Actualizar la representación visual de la torre
        setTimeout(() => {
            createBoard(); // Esto asegura que el tablero se actualice correctamente
        }, 0);
    }
    
    // Manejar captura al paso
    if (pieceData.piece === 'pawn' && !targetData && fromCol !== toCol) {
        // Es una captura al paso
        const capturedPawnRow = fromRow;
        board[capturedPawnRow][toCol] = null;
        move.captured = 'pawn';
        move.isEnPassant = true;
    }
    
    // Ejecutar movimiento principal
    board[toRow][toCol] = pieceData;
    board[fromRow][fromCol] = null;
    
    // Establecer objetivo de captura al paso para el siguiente movimiento
    enPassantTarget = null;
    if (pieceData.piece === 'pawn' && Math.abs(fromRow - toRow) === 2) {
        enPassantTarget = {
            row: fromRow + (toRow - fromRow) / 2,
            col: fromCol
        };
    }
    
    // Verificar promoción de peón
    if (pieceData.piece === 'pawn' && (toRow === 0 || toRow === 7)) {
        promotionCallback = () => {
            finishMove(move);
        };
        showPromotionModal(toRow, toCol);
        return;
    }   
    finishMove(move);
}

// Verificar material insuficiente
function isInsufficientMaterial() {
    const pieces = {
        white: { pawn: 0, knight: 0, bishop: 0, rook: 0, queen: 0 },
        black: { pawn: 0, knight: 0, bishop: 0, rook: 0, queen: 0 }
    };
    
    let whiteBishops = [];
    let blackBishops = [];
    
    // Contar piezas
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                if (piece.piece !== 'king') {
                    pieces[piece.color][piece.piece]++;
                    
                    // Guardar color de casilla de los alfiles
                    if (piece.piece === 'bishop') {
                        const squareColor = (row + col) % 2 === 0 ? 'light' : 'dark';
                        if (piece.color === 'white') {
                            whiteBishops.push(squareColor);
                        } else {
                            blackBishops.push(squareColor);
                        }
                    }
                }
            }
        }
    }
    
    // Rey contra rey
    if (pieces.white.pawn === 0 && pieces.white.knight === 0 && pieces.white.bishop === 0 && 
        pieces.white.rook === 0 && pieces.white.queen === 0 &&
        pieces.black.pawn === 0 && pieces.black.knight === 0 && pieces.black.bishop === 0 && 
        pieces.black.rook === 0 && pieces.black.queen === 0) {
        return true;
    }
    
    // Rey y alfil contra rey
    if ((pieces.white.bishop === 1 && pieces.white.pawn === 0 && pieces.white.knight === 0 && 
        pieces.white.rook === 0 && pieces.white.queen === 0 &&
        pieces.black.pawn === 0 && pieces.black.knight === 0 && pieces.black.bishop === 0 && 
        pieces.black.rook === 0 && pieces.black.queen === 0) ||
        (pieces.black.bishop === 1 && pieces.black.pawn === 0 && pieces.black.knight === 0 && 
        pieces.black.rook === 0 && pieces.black.queen === 0 &&
        pieces.white.pawn === 0 && pieces.white.knight === 0 && pieces.white.bishop === 0 && 
        pieces.white.rook === 0 && pieces.white.queen === 0)) {
        return true;
    }
    
    // Rey y caballo contra rey
    if ((pieces.white.knight === 1 && pieces.white.pawn === 0 && pieces.white.bishop === 0 && 
        pieces.white.rook === 0 && pieces.white.queen === 0 &&
        pieces.black.pawn === 0 && pieces.black.knight === 0 && pieces.black.bishop === 0 && 
        pieces.black.rook === 0 && pieces.black.queen === 0) ||
        (pieces.black.knight === 1 && pieces.black.pawn === 0 && pieces.black.bishop === 0 && 
        pieces.black.rook === 0 && pieces.black.queen === 0 &&
        pieces.white.pawn === 0 && pieces.white.knight === 0 && pieces.white.bishop === 0 && 
        pieces.white.rook === 0 && pieces.white.queen === 0)) {
        return true;
    }
    
    // Rey y alfil contra rey y alfil (mismo color de casilla)
    if (pieces.white.bishop === 1 && pieces.black.bishop === 1 &&
        pieces.white.pawn === 0 && pieces.white.knight === 0 && pieces.white.rook === 0 && pieces.white.queen === 0 &&
        pieces.black.pawn === 0 && pieces.black.knight === 0 && pieces.black.rook === 0 && pieces.black.queen === 0) {
        if (whiteBishops[0] === blackBishops[0]) {
            return true;
        }
    }    
    return false;
}

// Actualizar información del juego
function finishMove(move) {
    moveHistory.push(move);
    updateMoveHistory();
    clearSelection();
    
    // Verificar condiciones de fin de juego para el jugador cuyo turno es ahora
    const opponent = currentPlayer === 'white' ? 'black' : 'white';
    
    // Actualizar el estado del juego
    // Verificar jaque mate, ahogado, jaque y otras condiciones
    if (isCheckmate(opponent)) {
        gameOver = true;
        document.getElementById('gameStatus').textContent = 
            `¡Jaque mate! Ganan las ${currentPlayer === 'white' ? 'blancas' : 'negras'}`;
        document.getElementById('gameStatus').style.backgroundColor = '#f8d7da';
        document.getElementById('gameStatus').style.color = '#721c24';
    } else if (isStalemate(opponent)) {
        gameOver = true;
        document.getElementById('gameStatus').textContent = '¡Empate por ahogado!';
    } else if (isInCheck(opponent)) {
        document.getElementById('gameStatus').textContent = 
            `¡Jaque a las ${opponent === 'white' ? 'blancas' : 'negras'}!`;
        document.getElementById('gameStatus').style.backgroundColor = '#fff3cd';
        document.getElementById('gameStatus').style.color = '#856404';
    } else {
        document.getElementById('gameStatus').textContent = 'Juego en progreso';
        document.getElementById('gameStatus').style.backgroundColor = '';
        document.getElementById('gameStatus').style.color = '';
    }

    // Cambiar turno después de verificar las condiciones
    currentPlayer = opponent;
    updateGameInfo();
    createBoard();

    // Otras verificaciones (50 movimientos, repetición, material insuficiente)
    if (halfMoveClock >= 50) {
        gameOver = true;
        document.getElementById('gameStatus').textContent = '¡Empate por regla de 50 movimientos!';
    }
    
    // Verificar repetición de posición
    const positionKey = JSON.stringify(board);
    positionHistory.push(positionKey);
    
    // Limitar el historial a las últimas 10 posiciones
    const count = positionHistory.filter(pos => pos === positionKey).length;
    if (count >= 3) {
        gameOver = true;
        document.getElementById('gameStatus').textContent = '¡Empate por repetición de posición!';
    }

    // Verificar material insuficiente
    if (isInsufficientMaterial()) {
        gameOver = true;
        document.getElementById('gameStatus').textContent = '¡Empate por material insuficiente!';
    }

    // Turno de la IA
    if (gameMode === 'ai' && currentPlayer === 'black' && !gameOver) {
        setTimeout(makeAIMove, 500);
    }
}

// Mostrar modal de promoción
function showPromotionModal(row, col) {
    document.getElementById('promotionModal').style.display = 'block';
    window.currentPromotionSquare = { row, col };
}

// Promocionar peón
function promote(pieceType) {
    const square = window.currentPromotionSquare;
    const pieceData = board[square.row][square.col];
    board[square.row][square.col] = {piece: pieceType, color: pieceData.color};
    document.getElementById('promotionModal').style.display = 'none';
    
    // Actualizar el tablero
    if (promotionCallback) {
        promotionCallback();
        promotionCallback = null;
    }
}

// Actualizar información del juego
function isCheckmate(color) {
    // Primero verificar si el rey está en jaque
    if (!isInCheck(color)) return false;
    
    // Verificar si hay algún movimiento legal posible
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const pieceData = board[row][col];
            if (pieceData && pieceData.color === color) {
                const moves = getPossibleMoves(row, col);
                if (moves.length > 0) {
                    return false; // Hay al menos un movimiento legal
                }
            }
        }
    }
    return true; // No hay movimientos legales y el rey está en jaque
}

// Verificar ahogado
function isStalemate(color) {
    if (isInCheck(color)) return false;
    
    // Verificar si hay algún movimiento legal posible
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const pieceData = board[row][col];
            if (pieceData && pieceData.color === color) {
                const moves = getPossibleMoves(row, col);
                if (moves.length > 0) return false;
            }
        }
    }
    
    return true;
}

// Verificar si el rey está en jaque
function isInCheck(color) {
    const kingPos = findKingPosition(color);
    if (!kingPos) return false;
    
    // Verificar si alguna pieza enemiga puede capturar el rey
    const opponentColor = color === 'white' ? 'black' : 'white';
    
    // Recorrer el tablero en busca de piezas enemigas
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const pieceData = board[row][col];
            if (pieceData && pieceData.color === opponentColor) {
                if (isValidMove(row, col, kingPos.row, kingPos.col, opponentColor)) {
                    return true;
                }
            }
        }
    }
    return false;
}


// Nueva función auxiliar para validar ataques
function isValidAttack(fromRow, fromCol, toRow, toCol, pieceType) {
    // Implementación específica para cada tipo de pieza
    switch (pieceType) {
        case 'pawn':
            return isValidPawnAttack(fromRow, fromCol, toRow, toCol);
        case 'knight':
            return isValidKnightMove(fromRow, fromCol, toRow, toCol);
        // Otros tipos de piezas
        default:
            return isPieceValidMove(pieceType, fromRow, fromCol, toRow, toCol);
    }
}

// IA del juego
function makeAIMove() {
    const moves = getAllPossibleMoves('black');
    if (moves.length === 0) return;
    
    // Seleccionar el mejor movimiento según la dificultad
    let bestMove;
    
    // Determinar la dificultad de la IA
    switch (difficulty) {
        case 'easy':
            bestMove = moves[Math.floor(Math.random() * moves.length)];
            break;
        case 'medium':
            bestMove = getBestMoveSimple(moves);
            break;
        case 'hard':
            bestMove = getBestMoveAdvanced(moves);
            break;
    }
    
    // Si se encontró un movimiento válido, ejecutarlo
    if (bestMove) {
        makeMove(bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol);
    }
}

// Obtener todos los movimientos posibles para el color dado
function getAllPossibleMoves(color) {
    const moves = []; 
    
    // Recorrer el tablero y obtener movimientos para cada pieza del color dado
    for (let row = 0; row < 8; row++) {
        // Verificar si la fila es par o impar para alternar colores de casillas
        for (let col = 0; col < 8; col++) {
            const pieceData = board[row][col];
            // Verificar si la pieza es del color del jugador actual
            if (pieceData && pieceData.color === color) {
                const pieceMoves = getPossibleMoves(row, col);
                pieceMoves.forEach(move => {
                    const targetData = board[move.row][move.col];
                    moves.push({
                        fromRow: row,
                        fromCol: col,
                        toRow: move.row,
                        toCol: move.col,
                        piece: pieceData.piece,
                        captured: targetData ? targetData.piece : null
                    });
                });
            }
        }
    }   
    return moves;
}

// Obtener el mejor movimiento para la IA
function getBestMoveSimple(moves) {
    // Priorizar capturas
    const captures = moves.filter(move => move.captured);
    if (captures.length > 0) {
        return captures[Math.floor(Math.random() * captures.length)];
    }    
    // Si no hay capturas, seleccionar un movimiento aleatorio
    return moves[Math.floor(Math.random() * moves.length)];
}

// Obtener el mejor movimiento avanzado para la IA
function getBestMoveAdvanced(moves) {
    let bestMove = null;
    let bestScore = -Infinity;
    
    // Evaluar cada movimiento y seleccionar el mejor
    moves.forEach(move => {
        const score = evaluateMove(move);
        // Si el movimiento es una captura, aumentar la puntuación
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    });
    
    return bestMove;
}

// Evaluar un movimiento
function evaluateMove(move) {
    let score = 0;
    
    // Valores de las piezas
    const pieceValues = {
        pawn: 10, knight: 30, bishop: 30, rook: 50, queen: 90, king: 900
    };
    
    // Tablas de valoración posicional
    const pawnTable = [
        [0,  0,  0,  0,  0,  0,  0,  0],
        [5, 10, 10,-20,-20, 10, 10,  5],
        [5, -5,-10,  0,  0,-10, -5,  5],
        [0,  0,  0, 20, 20,  0,  0,  0],
        [5,  5, 10, 25, 25, 10,  5,  5],
        [10,10, 20, 30, 30, 20, 10, 10],
        [50,50, 50, 50, 50, 50, 50, 50],
        [0,  0,  0,  0,  0,  0,  0,  0]
    ];
    
    // Tabla de valoración para caballos
    const knightTable = [
        [-50,-40,-30,-30,-30,-30,-40,-50],
        [-40,-20,  0,  5,  5,  0,-20,-40],
        [-30,  5, 10, 15, 15, 10,  5,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  5, 15, 20, 20, 15,  5,-30],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-40,-20,  0,  0,  0,  0,-20,-40],
        [-50,-40,-30,-30,-30,-30,-40,-50]
    ];
    
    // Puntos por captura
    if (move.captured) {
        score += pieceValues[move.captured];
    }
    
    // Valor posicional de la pieza
    if (move.piece === 'pawn') {
        score += pawnTable[move.toRow][move.toCol];
    } else if (move.piece === 'knight') {
        score += knightTable[move.toRow][move.toCol];
    }
    
    // Bonus por desarrollo temprano de piezas
    if (fullMoveNumber < 10) {
        if (move.piece === 'knight' || move.piece === 'bishop') {
            score += 5;
        }
        if (move.fromRow === (move.piece.color === 'white' ? 7 : 0) && 
            (move.fromCol === 0 || move.fromCol === 7)) {
            score += 10; // Bonus por sacar la torre
        }
    }
    
    // Penalización por exponer el rey
    if (move.piece === 'king' && fullMoveNumber < 20) {
        score -= 15;
    }
    
    // Bonus por jaque
    const tempBoard = JSON.parse(JSON.stringify(board));
    tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
    tempBoard[move.fromRow][move.fromCol] = null;
    
    // Verificar si el movimiento pone al rey enemigo en jaque
    const opponentColor = currentPlayer === 'white' ? 'black' : 'white';
    if (isSquareUnderAttack(findKingPosition(opponentColor).row, findKingPosition(opponentColor).col, opponentColor, tempBoard)) {
        score += 5;
    }
    
    return score;
}
// Nueva función auxiliar para verificar si una casilla está bajo ataque
function isSquareUnderAttack(row, col, color, customBoard = board) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = customBoard[r][c];
            if (piece && piece.color !== color) {
                if (isValidMove(r, c, row, col, customBoard)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Actualizar información del juego
function updateGameInfo() {
    document.getElementById('currentPlayer').textContent = 
        currentPlayer === 'white' ? 'Blancas' : 'Negras';
}

// Actualizar historial de movimientos
function updateMoveHistory() {
    const moveList = document.getElementById('moveList');
    moveList.innerHTML = '';
    
    // Limpiar historial previo
    moveHistory.forEach((move, index) => {
        const moveElement = document.createElement('div');
        moveElement.className = 'move-item';
        
        let moveText = `${index + 1}. ${move.from}-${move.to}`;
        if (move.isCastle) {
            moveText = `${index + 1}. ${move.toCol > move.fromCol ? 'O-O' : 'O-O-O'}`;
        } else if (move.captured) {
            moveText = `${index + 1}. ${move.from[0]}x${move.to}`;
            if (move.isEnPassant) {
                moveText += ' e.p.';
            }
        }
        
        // Agregar información de promoción si aplica
        moveElement.textContent = moveText;
        moveList.appendChild(moveElement);
    });
}

// Iniciar nueva partida
function startNewGame() {
    gameMode = document.getElementById('gameMode').value;
    difficulty = document.getElementById('difficulty').value;
    currentPlayer = 'white';
    selectedSquare = null;
    gameOver = false;
    moveHistory = [];
    enPassantTarget = null;
    positionHistory = [];
    halfMoveClock = 0;
    fullMoveNumber = 1;
    
    // Reiniciar el tablero
    initializeBoard();
    createBoard();
    updateGameInfo();
    updateMoveHistory();
    
    document.getElementById('gameStatus').textContent = 'Juego en progreso';
}

// Event listeners
document.getElementById('gameMode').addEventListener('change', function() {
    const difficultyGroup = document.getElementById('difficultyGroup');
    difficultyGroup.style.display = this.value === 'ai' ? 'block' : 'none';
});

// Inicializar juego
initializeBoard();
createBoard();
updateGameInfo();