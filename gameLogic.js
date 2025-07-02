// gameLogic.js
const GameLogic = (function() {
    let currentBoard = [];
    let currentTurn = '紅方'; // 初始為紅方
    let _soundElements = {}; // 儲存音頻元素

    function initializeBoard() {
        currentBoard = CHESS.INITIAL_BOARD_STATE.map(row => [...row]); // Deep copy
        currentTurn = '紅方';
        return { board: currentBoard, turn: currentTurn };
    }

    // 新增：設定音頻元素
    function setSoundElements(sounds) {
        _soundElements = sounds;
    }

    function getCurrentBoard() {
        return currentBoard;
    }

    function getCurrentTurn() {
        return currentTurn;
    }

    function switchTurn() {
        currentTurn = (currentTurn === '紅方' ? '黑方' : '紅方');
        return currentTurn;
    }

    // 輔助函數：查找特定棋子的位置 (用於將帥對面判斷)
    function findPiecePosition(boardState, type, color) {
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 9; c++) {
                const piece = boardState[r][c];
                if (piece && piece.type === type && piece.color === color) {
                    return { row: r, col: c };
                }
            }
        }
        return null;
    }

    // 輔助函數：檢查將帥是否面對面 (通用函數)
    function checkGeneralsFaceToFace(boardState) {
        // 找到紅方和黑方的將/帥位置
        const redGeneralPos = findPiecePosition(boardState, '將', '紅');
        const blackGeneralPos = findPiecePosition(boardState, '將', '黑');

        // 如果兩個將/帥在同一列，檢查中間是否有棋子阻擋
        if (redGeneralPos && blackGeneralPos && redGeneralPos.col === blackGeneralPos.col) {
            let obstacleBetweenGenerals = false;
            // 檢查兩個將帥之間是否有其他棋子
            const startR = Math.min(redGeneralPos.row, blackGeneralPos.row) + 1;
            const endR = Math.max(redGeneralPos.row, blackGeneralPos.row);
            for (let r = startR; r < endR; r++) {
                if (boardState[r][redGeneralPos.col] !== null) {
                    obstacleBetweenGenerals = true;
                    break;
                }
            }
            return !obstacleBetweenGenerals; // 如果沒有阻擋物，返回 true (面對面)
        }
        return false; // 不在同一列或有阻擋物
    }

    // 新增核心移動規則檢查函數，不包含回合判斷
    // boardState: 要檢查的棋盤狀態
    // from: 來源位置 {row, col}
    // to: 目標位置 {row, col}
    function _checkPieceMovementRules(boardState, from, to) {
        // 確保目標位置在棋盤範圍內
        if (to.row < 0 || to.row >= 10 || to.col < 0 || to.col >= 9) {
            return false;
        }

        const piece = boardState[from.row][from.col];
        if (!piece) {
            return false; // 沒有棋子可移動
        }

        // 不能移動到原地
        if (from.row === to.row && from.col === to.col) {
            return false;
        }

        const targetPiece = boardState[to.row][to.col];
        // 己方棋子不能走到己方棋子上 (這個檢查必須保留，因為這是棋子移動規則的一部分)
        if (targetPiece && targetPiece.color === piece.color) {
            return false;
        }

        // 計算行列距離
        const dRow = Math.abs(to.row - from.row);
        const dCol = Math.abs(to.col - from.col);

        // 根據棋子類型判斷合法移動
        switch (piece.type) {
            case '將': // 將/帥
                if ((dRow === 1 && dCol === 0) || (dRow === 0 && dCol === 1)) {
                    const inPalace = (color) => {
                        if (color === '紅') { return to.row >= 7 && to.row <= 9 && to.col >= 3 && to.col <= 5; }
                        else { return to.row >= 0 && to.row <= 2 && to.col >= 3 && to.col <= 5; }
                    };
                    return inPalace(piece.color);
                }
                return false;

            case '士': // 士/仕
                if (dRow === 1 && dCol === 1) {
                    const inPalace = (color) => {
                        if (color === '紅') { return to.row >= 7 && to.row <= 9 && to.col >= 3 && to.col <= 5; }
                        else { return to.row >= 0 && to.row <= 2 && to.col >= 3 && to.col <= 5; }
                    };
                    return inPalace(piece.color);
                }
                return false;

            case '象': // 象/相
                if (dRow === 2 && dCol === 2) {
                    const middleRow = (from.row + to.row) / 2;
                    const middleCol = (from.col + to.col) / 2;
                    if (boardState[middleRow][middleCol] === null) {
                        if (piece.color === '紅') { return to.row >= 5; }
                        else { return to.row <= 4; }
                    }
                }
                return false;

            case '馬': // 馬
                if ((dRow === 1 && dCol === 2) || (dRow === 2 && dCol === 1)) {
                    let horseLegRow, horseLegCol;
                    if (dRow === 1) {
                        horseLegRow = from.row;
                        horseLegCol = from.col + (to.col > from.col ? 1 : -1);
                    } else {
                        horseLegRow = from.row + (to.row > from.row ? 1 : -1);
                        horseLegCol = from.col;
                    }
                    if (boardState[horseLegRow][horseLegCol] === null) {
                        return true;
                    }
                }
                return false;

            case '車': // 車
                if (dRow === 0 || dCol === 0) {
                    if (dRow === 0) {
                        const startCol = Math.min(from.col, to.col);
                        const endCol = Math.max(from.col, to.col);
                        for (let col = startCol + 1; col < endCol; col++) {
                            if (boardState[from.row][col] !== null) { return false; }
                        }
                    } else {
                        const startRow = Math.min(from.row, to.row);
                        const endRow = Math.max(from.row, to.row);
                        for (let row = startRow + 1; row < endRow; row++) {
                            if (boardState[row][from.col] !== null) { return false; }
                        }
                    }
                    return true;
                }
                return false;

            case '砲': // 砲/炮
                if (dRow === 0 || dCol === 0) {
                    let obstacleCount = 0;
                    if (dRow === 0) {
                        const startCol = Math.min(from.col, to.col);
                        const endCol = Math.max(from.col, to.col);
                        for (let col = startCol + 1; col < endCol; col++) {
                            if (boardState[from.row][col] !== null) { obstacleCount++; }
                        }
                    } else {
                        const startRow = Math.min(from.row, to.row);
                        const endRow = Math.max(from.row, to.row);
                        for (let row = startRow + 1; row < endRow; row++) {
                            if (boardState[row][from.col] !== null) { obstacleCount++; }
                        }
                    }
                    if (targetPiece) { return obstacleCount === 1; }
                    else { return obstacleCount === 0; }
                }
                return false;

            case '卒': // 卒/兵
                const isRed = piece.color === '紅';
                let validMove = false;
                if (isRed) {
                    if (to.row > from.row) return false;
                    if (from.row >= 5) { validMove = (to.row === from.row - 1 && dCol === 0); }
                    else { validMove = (dRow === 1 && dCol === 0) || (dRow === 0 && dCol === 1); }
                } else {
                    if (to.row < from.row) return false;
                    if (from.row <= 4) { validMove = (to.row === from.row + 1 && dCol === 0); }
                    else { validMove = (dRow === 1 && dCol === 0) || (dRow === 0 && dCol === 1); }
                }
                return validMove;

            default:
                return false;
        }
    }


    // 判斷移動是否合法 (包含回合判斷)
    function isValidMove(from, to) {
        const piece = currentBoard[from.row][from.col];
        if (!piece) {
            console.log("沒有棋子可移動");
            return false;
        }

        // **只在這裡進行回合判斷**
        const pieceColor = piece.color === '紅' ? '紅方' : '黑方';
        if (pieceColor !== currentTurn) {
            console.log("不是你的回合");
            return false; // 不是該方的棋子
        }

        // 調用新的核心移動規則檢查函數
        return _checkPieceMovementRules(currentBoard, from, to);
    }

    // 輔助函數：檢查某個將軍是否被威脅
    // boardState: 當前棋盤狀態
    // generalColor: 被檢查的將軍的顏色 ('紅' 或 '黑')
    // attackingColor: 潛在攻擊方的顏色 ('紅' 或 '黑')
    function isGeneralInCheck(boardState, generalColor, attackingColor) {
        const generalPos = findPiecePosition(boardState, '將', generalColor);
        if (!generalPos) return false; // 將軍已經不在棋盤上 (遊戲結束，不應被將軍)

        // 遍歷所有攻擊方的棋子，看它們是否能攻擊到將軍
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 9; c++) {
                const piece = boardState[r][c];
                if (piece && piece.color === attackingColor) {
                    // 直接調用核心移動規則檢查函數，傳入模擬的 boardState
                    const canAttackGeneral = _checkPieceMovementRules(
                        boardState, // 使用傳入的 boardState
                        { row: r, col: c },
                        { row: generalPos.row, col: generalPos.col }
                    );
                    if (canAttackGeneral) {
                        return true; // 發現可以攻擊將軍的棋子
                    }
                }
            }
        }
        return false;
    }

    // 執行棋子移動 (如果合法)
    function movePiece(from, to) {
        // 在執行實際移動前，先檢查基本移動規則 (含回合判斷)
        if (!isValidMove(from, to)) {
            console.log(`移動無效: (${from.row}, ${from.col}) 到 (${to.row}, ${to.col}) - 不符合基本規則或不是你的回合`);
            return false; // 如果基本移動不合法，則不執行
        }

        const movedPiece = currentBoard[from.row][from.col];
        const targetPiece = currentBoard[to.row][to.col]; // 目標位置的棋子（可能是要被吃掉的）

        // 創建臨時棋盤模擬移動，用於將帥對面檢查
        const tempBoard = currentBoard.map(row => [...row]); // 深拷貝當前棋盤
        tempBoard[to.row][to.col] = tempBoard[from.row][from.col]; // 在臨時棋盤上移動棋子
        tempBoard[from.row][from.col] = null; // 清空臨時棋盤上的原位置

        // 檢查移動後是否導致將帥面對面
        if (checkGeneralsFaceToFace(tempBoard)) {
            alert('警告：此移動會導致將帥面對面，無效移動！');
            console.log('移動無效：將帥面對面');
            return false; // 如果面對面，阻止移動
        }

        // 如果所有檢查都通過，則執行實際的棋盤數據更新
        currentBoard[to.row][to.col] = movedPiece;
        currentBoard[from.row][from.col] = null;

        console.log(`棋子從 (${from.row}, ${from.col}) 移動到 (${to.row}, ${to.col})`);

        // 播放移動音效
        if (_soundElements.move) {
            _soundElements.move.currentTime = 0; // 重置音頻到開頭
            _soundElements.move.play();
        }

        // 如果吃掉了棋子，播放吃子音效
        if (targetPiece) {
            if (_soundElements.capture) {
                _soundElements.capture.currentTime = 0; // 重置音頻到開頭
                _soundElements.capture.play();
            }
        }

        // 檢查是否吃掉對方將帥 (遊戲結束條件)
        if (targetPiece && targetPiece.type === '將') {
            const winner = (targetPiece.color === '紅' ? '黑方' : '紅方');
            alert(`${winner}獲勝！遊戲結束。`);
            return { success: true, gameOver: true, winner: winner };
        }

        return { success: true, gameOver: false }; // 移動成功，遊戲未結束
    }

    return {
        initializeBoard: initializeBoard,
        setSoundElements: setSoundElements,
        getCurrentBoard: getCurrentBoard,
        getCurrentTurn: getCurrentTurn,
        switchTurn: switchTurn,
        isValidMove: isValidMove,
        movePiece: movePiece,
        isGeneralInCheck: isGeneralInCheck // 暴露將軍檢查函數給 main.js
    };
})();