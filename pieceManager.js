// pieceManager.js
const PieceManager = (function() {
    let chessboardContainer;
    let _onPieceClickCallback = null; // 點擊棋子時的回調函數

    function init(container) {
        chessboardContainer = container;
    }

    function setOnPieceClick(callback) {
        _onPieceClickCallback = callback;
    }

    function renderPieces(boardState) {
        // 清除現有的棋子 DOM 元素
        Array.from(chessboardContainer.children).forEach(child => {
            if (child.classList.contains('chess-piece')) {
                child.remove();
            }
        });

        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 9; c++) {
                const piece = boardState[r][c];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.classList.add('chess-piece');
                    pieceElement.classList.add(piece.color === '紅' ? 'red-piece' : 'black-piece');
                    pieceElement.textContent = CHESS.PIECE_CHAR_MAP[piece.color === '紅' ? 'red' : 'black'][piece.type];

                    // 計算棋子中心點位置，然後減去棋子半徑得到左上角位置
                    pieceElement.style.left = `${(c * CHESS.GRID_SIZE) + CHESS.HALF_GRID_SIZE - (CHESS.PIECE_SIZE / 2)}px`;
                    pieceElement.style.top = `${(r * CHESS.GRID_SIZE) + CHESS.HALF_GRID_SIZE - (CHESS.PIECE_SIZE / 2)}px`;

                    // 如果是黑方棋子，應用旋轉樣式
                    if (piece.color === '黑') {
                        pieceElement.style.transform = 'rotate(180deg)';
                    } else {
                        pieceElement.style.transform = 'none'; // 確保紅方棋子沒有旋轉
                    }

                    pieceElement.dataset.row = r;
                    pieceElement.dataset.col = c;
                    pieceElement.addEventListener('click', _handlePieceClick); // 綁定點擊事件
                    chessboardContainer.appendChild(pieceElement);
                }
            }
        }
    }

    function _handlePieceClick(event) {
        if (_onPieceClickCallback) {
            _onPieceClickCallback(event.target);
        }
    }

    function highlightPiece(pieceElement) {
        if (pieceElement) {
            pieceElement.classList.add('selected-piece');
        }
    }

    function unhighlightPiece(pieceElement) {
        if (pieceElement) {
            pieceElement.classList.remove('selected-piece');
        }
    }

    return {
        init: init,
        renderPieces: renderPieces,
        highlightPiece: highlightPiece,
        unhighlightPiece: unhighlightPiece,
        setOnPieceClick: setOnPieceClick
    };
})();