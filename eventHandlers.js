// eventHandlers.js
const EventHandlers = (function() {
    let _onMoveAttemptCallback = null; // 嘗試移動的回調
    let _onPieceSelectedCallback = null; // 棋子被選中的回調
    let _onPieceDeselectedCallback = null; // 棋子被取消選中的回調
    let _chessboardContainer;
    let _currentSelectedPieceElement = null; // 追蹤當前選中的棋子 DOM 元素

    function init(chessboardContainer) {
        _chessboardContainer = chessboardContainer;
        // 棋盤容器本身的點擊事件，只在這裡綁定一次
        _chessboardContainer.addEventListener('click', handleBoardClick);
    }

    function setCallbacks(onMoveAttempt, onPieceSelected, onPieceDeselected) {
        _onMoveAttemptCallback = onMoveAttempt;
        _onPieceSelectedCallback = onPieceSelected;
        _onPieceDeselectedCallback = onPieceDeselected;
    }

    // 棋子點擊事件處理
    function handlePieceClick(clickedElement) {
        const clickedRow = parseInt(clickedElement.dataset.row);
        const clickedCol = parseInt(clickedElement.dataset.col);
        const clickedPieceData = GameLogic.getCurrentBoard()[clickedRow][clickedCol];
        const currentTurnColor = GameLogic.getCurrentTurn();

        // 如果目前有選中的棋子
        if (_currentSelectedPieceElement) {
            const selectedRow = parseInt(_currentSelectedPieceElement.dataset.row);
            const selectedCol = parseInt(_currentSelectedPieceElement.dataset.col);

            // 判斷點擊的是否為同一個棋子，則取消選中
            if (_currentSelectedPieceElement === clickedElement) {
                _onPieceDeselectedCallback(_currentSelectedPieceElement);
                _currentSelectedPieceElement = null;
            }
            // 判斷點擊的是否為己方棋子 (切換選中)
            else if (clickedPieceData && clickedPieceData.color === (currentTurnColor === '紅方' ? '紅' : '黑')) {
                _onPieceDeselectedCallback(_currentSelectedPieceElement); // 取消舊的選中
                _currentSelectedPieceElement = clickedElement;
                _onPieceSelectedCallback(_currentSelectedPieceElement); // 選中新的
            }
            // 點擊的是對方棋子或空位，嘗試移動或吃子
            else {
                // 執行移動邏輯
                if (_onMoveAttemptCallback) {
                    const moveResult = _onMoveAttemptCallback(
                        { row: selectedRow, col: selectedCol },
                        { row: clickedRow, col: clickedCol }
                    );
                    if (moveResult && moveResult.success) {
                        _onPieceDeselectedCallback(_currentSelectedPieceElement);
                        _currentSelectedPieceElement = null;
                    }
                }
            }
        }
        // 如果目前沒有選中的棋子，且點擊的是棋子，並且是當前回合的棋子
        else if (clickedPieceData && clickedPieceData.color === (currentTurnColor === '紅方' ? '紅' : '黑')) {
            _currentSelectedPieceElement = clickedElement;
            _onPieceSelectedCallback(_currentSelectedPieceElement);
        }
        console.log('當前選中棋子:', _currentSelectedPieceElement ? _currentSelectedPieceElement.dataset : '無');
    }

    // 處理棋盤空白處點擊的函數
    function handleBoardClick(event) {
        // 如果點擊的是棋子元素，則不處理，讓 handlePieceClick 接管
        if (event.target.classList.contains('chess-piece')) {
            return;
        }

        // 如果點擊的是棋盤空白處，且有棋子被選中
        if (_currentSelectedPieceElement) {
            const rect = _chessboardContainer.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;

            // 將點擊的像素座標轉換為棋盤網格座標
            const targetCol = Math.round((clickX - CHESS.HALF_GRID_SIZE) / CHESS.GRID_SIZE);
            const targetRow = Math.round((clickY - CHESS.HALF_GRID_SIZE) / CHESS.GRID_SIZE);

            const selectedRow = parseInt(_currentSelectedPieceElement.dataset.row);
            const selectedCol = parseInt(_currentSelectedPieceElement.dataset.col);

            if (_onMoveAttemptCallback) {
                const moveResult = _onMoveAttemptCallback(
                    { row: selectedRow, col: selectedCol },
                    { row: targetRow, col: targetCol }
                );
                if (moveResult && moveResult.success) {
                    _onPieceDeselectedCallback(_currentSelectedPieceElement);
                    _currentSelectedPieceElement = null;
                }
            }
        }
    }

    // 重置選中的棋子狀態
    function resetSelectedPiece() {
        if (_currentSelectedPieceElement) {
            _onPieceDeselectedCallback(_currentSelectedPieceElement);
            _currentSelectedPieceElement = null;
        }
    }

    return {
        init: init,
        setCallbacks: setCallbacks,
        handlePieceClick: handlePieceClick, // 暴露給 PieceManager 調用
        resetSelectedPiece: resetSelectedPiece
    };
})();