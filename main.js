// main.js
document.addEventListener('DOMContentLoaded', () => {
    const chessboardContainer = document.getElementById('chessboard-container');
    const currentTurnDisplay = document.getElementById('current-turn');
    const resetButton = document.getElementById('reset-button');

    // 獲取音頻元素
    const moveSound = document.getElementById('moveSound');
    const captureSound = document.getElementById('captureSound');
    const checkSound = document.getElementById('checkSound');

    // 這裡保留 currentTurn 變數，因為您的代碼依賴它來更新顯示
    let currentTurn = '紅方'; // 遊戲中的當前回合

    // 初始化所有模組
    BoardRenderer.init(chessboardContainer);
    PieceManager.init(chessboardContainer);
    EventHandlers.init(chessboardContainer);

    // 將音頻元素傳遞給 GameLogic 模組
    GameLogic.setSoundElements({ move: moveSound, capture: captureSound, check: checkSound });

    // 設定 PieceManager 在棋子被點擊時的回調
    // PieceManager 會調用 EventHandlers.handlePieceClick
    PieceManager.setOnPieceClick(EventHandlers.handlePieceClick);

    // 設定 EventHandlers 的回調，這些回調將調用 GameLogic 和 PieceManager 的方法
    EventHandlers.setCallbacks(
        // onMoveAttemptCallback
        (from, to) => {
            // 在棋子移動前，獲取移動者的顏色 (這用於判斷遊戲邏輯，與將軍檢查無直接關係，但保留以防其他邏輯依賴)
            const pieceAboutToMove = GameLogic.getCurrentBoard()[from.row][from.col];
            const movedPieceColor = pieceAboutToMove ? pieceAboutToMove.color : null; 

            const moveResult = GameLogic.movePiece(from, to); // movePiece 現在會處理音效
            if (moveResult.success) {
                // 成功移動後，切換回合
                currentTurn = GameLogic.switchTurn(); 
                currentTurnDisplay.textContent = currentTurn; // 更新顯示
                renderGame(); // 重新渲染整個遊戲狀態

                const boardAfterMove = GameLogic.getCurrentBoard();
                let checkAlerts = []; // 儲存需要彈出的將軍提示

                // 檢查紅方將軍是否被黑方威脅
                if (GameLogic.isGeneralInCheck(boardAfterMove, '紅', '黑')) {
                    checkAlerts.push('紅方被將軍！');
                }
                
                // 檢查黑方將軍是否被紅方威脅
                if (GameLogic.isGeneralInCheck(boardAfterMove, '黑', '紅')) {
                    checkAlerts.push('黑方被將軍！');
                }

                // 如果有任何一方被將軍，播放音效並顯示提示
                if (checkAlerts.length > 0) {
                    checkSound.currentTime = 0; // 重置音頻到開頭
                    checkSound.play();
                    alert(checkAlerts.join('\n')); // 將所有將軍提示合併顯示
                }
            }
            if (moveResult.gameOver) {
                // 遊戲結束，可以做一些額外的處理，例如禁用棋盤點擊
                console.log("遊戲結束，贏家是: " + moveResult.winner);
            }
            return moveResult; // 返回移動結果
        },
        // onPieceSelectedCallback
        (pieceElement) => {
            PieceManager.highlightPiece(pieceElement);
        },
        // onPieceDeselectedCallback
        (pieceElement) => {
            PieceManager.unhighlightPiece(pieceElement);
        }
    );

    // 渲染遊戲狀態 (重繪棋盤背景和棋子)
    function renderGame() {
        BoardRenderer.drawBoardBackground(); // 繪製棋盤線條和背景
        PieceManager.renderPieces(GameLogic.getCurrentBoard()); // 根據當前棋盤數據渲染棋子
    }

    // 重置遊戲函數
    function resetGame() {
        const initialState = GameLogic.initializeBoard(); // 重置遊戲邏輯層的棋盤數據和回合
        currentTurn = initialState.turn; // 更新 main.js 自己的 currentTurn
        currentTurnDisplay.textContent = currentTurn;
        EventHandlers.resetSelectedPiece(); // 重置事件處理層的選中狀態
        renderGame(); // 重新渲染遊戲畫面
    }

    // 重置按鈕事件監聽
    resetButton.addEventListener('click', resetGame);

    // 初始載入時調用
    resetGame(); // 遊戲啟動時進行初始化和首次渲染
});