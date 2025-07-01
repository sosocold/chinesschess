document.addEventListener('DOMContentLoaded', () => {
    const chessboardContainer = document.getElementById('chessboard-container');
    const currentTurnDisplay = document.getElementById('current-turn');
    const resetButton = document.getElementById('reset-button');

    // 棋盤尺寸和網格定義
    const BOARD_WIDTH = 450;
    const BOARD_HEIGHT = 500;
    const GRID_SIZE = 50; // 每個格子的寬高
    const HALF_GRID_SIZE = GRID_SIZE / 2; // 每個格子中心點的偏移量
    const PIECE_SIZE = 46; // 棋子的寬高

    // 創建 Canvas 元素並添加到容器
    const boardCanvas = document.createElement('canvas');
    boardCanvas.id = 'boardCanvas';
    boardCanvas.width = BOARD_WIDTH;
    boardCanvas.height = BOARD_HEIGHT;
    chessboardContainer.appendChild(boardCanvas);
    const ctx = boardCanvas.getContext('2d');

    // 棋盤線條顏色
    const LINE_COLOR = '#5a3825';
    const BOARD_BACKGROUND_COLOR = '#f0d9b5'; // 棋盤底色 (與CSS保持一致)

    // 中國象棋棋盤數據結構 (9列 x 10行)
    let board = [];
    let selectedPiece = null; // 當前選中的棋子元素 (DOM 元素)
    let selectedPiecePosition = null; // 當前選中棋子的座標 {row, col} (數據)
    let currentTurn = '紅方'; // 初始為紅方

    const pieceMap = {
        'red': {
            '車': '車', '馬': '馬', '象': '相', '士': '仕', '將': '帥', '砲': '炮', '卒': '兵'
        },
        'black': {
            '車': '車', '馬': '馬', '象': '象', '士': '士', '將': '將', '砲': '砲', '卒': '卒'
        }
    };

    // 初始化棋盤數據
    function initializeBoard() {
        board = [
            // 黑方
            [{type: '車', color: '黑'}, {type: '馬', color: '黑'}, {type: '象', color: '黑'}, {type: '士', color: '黑'}, {type: '將', color: '黑'}, {type: '士', color: '黑'}, {type: '象', color: '黑'}, {type: '馬', color: '黑'}, {type: '車', color: '黑'}],
            [null, null, null, null, null, null, null, null, null],
            [null, {type: '砲', color: '黑'}, null, null, null, null, null, {type: '砲', color: '黑'}, null],
            [{type: '卒', color: '黑'}, null, {type: '卒', color: '黑'}, null, {type: '卒', color: '黑'}, null, {type: '卒', color: '黑'}, null, {type: '卒', color: '黑'}],
            [null, null, null, null, null, null, null, null, null],
            // 河界
            [null, null, null, null, null, null, null, null, null],
            [{type: '卒', color: '紅'}, null, {type: '卒', color: '紅'}, null, {type: '卒', color: '紅'}, null, {type: '卒', color: '紅'}, null, {type: '卒', color: '紅'}],
            [null, {type: '砲', color: '紅'}, null, null, null, null, null, {type: '砲', color: '紅'}, null],
            [null, null, null, null, null, null, null, null, null],
            // 紅方
            [{type: '車', color: '紅'}, {type: '馬', color: '紅'}, {type: '象', color: '紅'}, {type: '士', color: '紅'}, {type: '將', color: '紅'}, {type: '士', color: '紅'}, {type: '象', color: '紅'}, {type: '馬', color: '紅'}, {type: '車', color: '紅'}]
        ];
        currentTurn = '紅方';
        currentTurnDisplay.textContent = currentTurn;
        selectedPiece = null;
        selectedPiecePosition = null;
    }

    // 繪製棋盤背景 (使用 Canvas)
    function drawBoardBackground() {
        ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT); // 清除舊的繪圖
        ctx.fillStyle = BOARD_BACKGROUND_COLOR; // 設置背景色
        ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT); // 填充背景

        ctx.strokeStyle = LINE_COLOR;
        ctx.lineWidth = 1;

        // 繪製垂直線 (9條)
        for (let i = 0; i < 9; i++) {
            const x = HALF_GRID_SIZE + i * GRID_SIZE; // 25, 75, 125 ... 425
            ctx.beginPath();
            ctx.moveTo(x, HALF_GRID_SIZE);
            ctx.lineTo(x, BOARD_HEIGHT - HALF_GRID_SIZE);
            ctx.stroke();
        }

        // 繪製水平線 (10條)
        for (let i = 0; i < 10; i++) {
            const y = HALF_GRID_SIZE + i * GRID_SIZE; // 25, 75, 125 ... 475
            ctx.beginPath();
            ctx.moveTo(HALF_GRID_SIZE, y);
            ctx.lineTo(BOARD_WIDTH - HALF_GRID_SIZE, y);
            ctx.stroke();
        }

        // 繪製河界線 (獨立處理，使其更粗)
        ctx.lineWidth = 3; // 河界線粗一點
        ctx.beginPath();
        ctx.moveTo(0, BOARD_HEIGHT / 2); // 從棋盤左邊中間開始
        ctx.lineTo(BOARD_WIDTH, BOARD_HEIGHT / 2); // 到棋盤右邊中間結束
        ctx.stroke();
        ctx.lineWidth = 1; // 恢復預設線寬

        // 繪製九宮格斜線 (黑方)
        // 從 (3,0) 交叉點 到 (5,2) 交叉點
        ctx.beginPath();
        ctx.moveTo(HALF_GRID_SIZE + 3 * GRID_SIZE, HALF_GRID_SIZE + 0 * GRID_SIZE); // (25+150, 25) = (175, 25)
        ctx.lineTo(HALF_GRID_SIZE + 5 * GRID_SIZE, HALF_GRID_SIZE + 2 * GRID_SIZE); // (25+250, 25+100) = (275, 125)
        ctx.stroke();

        // 從 (5,0) 交叉點 到 (3,2) 交叉點
        ctx.beginPath();
        ctx.moveTo(HALF_GRID_SIZE + 5 * GRID_SIZE, HALF_GRID_SIZE + 0 * GRID_SIZE); // (275, 25)
        ctx.lineTo(HALF_GRID_SIZE + 3 * GRID_SIZE, HALF_GRID_SIZE + 2 * GRID_SIZE); // (175, 125)
        ctx.stroke();

        // 繪製九宮格斜線 (紅方)
        // 從 (3,7) 交叉點 到 (5,9) 交叉點
        ctx.beginPath();
        ctx.moveTo(HALF_GRID_SIZE + 3 * GRID_SIZE, HALF_GRID_SIZE + 7 * GRID_SIZE); // (175, 25+350) = (175, 375)
        ctx.lineTo(HALF_GRID_SIZE + 5 * GRID_SIZE, HALF_GRID_SIZE + 9 * GRID_SIZE); // (275, 25+450) = (275, 475)
        ctx.stroke();

        // 從 (5,7) 交叉點 到 (3,9) 交叉點
        ctx.beginPath();
        ctx.moveTo(HALF_GRID_SIZE + 5 * GRID_SIZE, HALF_GRID_SIZE + 7 * GRID_SIZE); // (275, 375)
        ctx.lineTo(HALF_GRID_SIZE + 3 * GRID_SIZE, HALF_GRID_SIZE + 9 * GRID_SIZE); // (175, 475)
        ctx.stroke();
    }



// 渲染棋盤和棋子
function renderBoard() {
    // 清空現有的所有棋子元素，但保留 Canvas 元素
    Array.from(chessboardContainer.children).forEach(child => {
        if (child.id !== 'boardCanvas') {
            child.remove();
        }
    });

    drawBoardBackground(); // 重新繪製棋盤背景

    for (let r = 0; r < 10; r++) { // 10行
        for (let c = 0; c < 9; c++) { // 9列
            const piece = board[r][c];
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('chess-piece');
                pieceElement.classList.add(piece.color === '紅' ? 'red-piece' : 'black-piece');
                pieceElement.textContent = pieceMap[piece.color === '紅' ? 'red' : 'black'][piece.type];

                // 計算棋子中心點位置，然後減去棋子半徑得到左上角位置
                pieceElement.style.left = `${(c * GRID_SIZE) + HALF_GRID_SIZE - (PIECE_SIZE / 2)}px`;
                pieceElement.style.top = `${(r * GRID_SIZE) + HALF_GRID_SIZE - (PIECE_SIZE / 2)}px`;

                // *** 新增邏輯：如果棋子是黑方，直接應用旋轉樣式 ***
                if (piece.color === '黑') {
                    pieceElement.style.transform = 'rotate(180deg)';
                } else {
                    // 確保紅方棋子沒有旋轉樣式，避免之前設定的影響
                    pieceElement.style.transform = 'none';
                }
                // *** 結束新增邏輯 ***

                pieceElement.dataset.row = r;
                pieceElement.dataset.col = c;
                chessboardContainer.appendChild(pieceElement);
            }
        }
    }
    addEventListenersToPieces(); // 重新添加事件監聽器到新創建的棋子
}



    // 輔助函數：查找特定棋子的位置 (用於將帥對面判斷)
    function findPiecePosition(currentBoard, type, color) {
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 9; c++) {
                const piece = currentBoard[r][c];
                if (piece && piece.type === type && piece.color === color) {
                    return { row: r, col: c };
                }
            }
        }
        return null;
    }

    // 檢查將帥是否面對面 (通用函數)
    function checkGeneralsFaceToFace(currentBoard) {
        // 找到紅方和黑方的將/帥位置
        const redGeneralPos = findPiecePosition(currentBoard, '將', '紅');
        const blackGeneralPos = findPiecePosition(currentBoard, '將', '黑');

        // 如果兩個將/帥在同一列，檢查中間是否有棋子阻擋
        if (redGeneralPos && blackGeneralPos && redGeneralPos.col === blackGeneralPos.col) {
            let obstacleBetweenGenerals = false;
            // 檢查兩個將帥之間是否有其他棋子
            const startR = Math.min(redGeneralPos.row, blackGeneralPos.row) + 1;
            const endR = Math.max(redGeneralPos.row, blackGeneralPos.row);
            for (let r = startR; r < endR; r++) {
                if (currentBoard[r][redGeneralPos.col] !== null) {
                    obstacleBetweenGenerals = true;
                    break;
                }
            }
            return !obstacleBetweenGenerals; // 如果沒有阻擋物，返回 true (面對面)
        }
        return false; // 不在同一列或有阻擋物
    }

    // 判斷移動是否合法 (只判斷棋子本身移動規則，不含將帥對面)
    // from: {row, col}, to: {row, col}
    function isValidMove(from, to) {
        // 確保目標位置在棋盤範圍內
        if (to.row < 0 || to.row >= 10 || to.col < 0 || to.col >= 9) {
            console.log("移動超出棋盤範圍");
            return false;
        }

        const piece = board[from.row][from.col];
        if (!piece) {
            console.log("沒有棋子可移動");
            return false; // 沒有棋子可移動
        }

        // 檢查是否是輪到該方
        const pieceColor = piece.color === '紅' ? '紅方' : '黑方';
        if (pieceColor !== currentTurn) {
            console.log("不是你的回合");
            return false; // 不是該方的棋子
        }

        // 不能移動到原地
        if (from.row === to.row && from.col === to.col) {
            console.log("不能移動到原地");
            return false;
        }

        const targetPiece = board[to.row][to.col];
        if (targetPiece && targetPiece.color === piece.color) {
            console.log("不能移動到己方棋子佔據的位置");
            return false; // 不能移動到己方棋子上
        }

        // 計算行列距離
        const dRow = Math.abs(to.row - from.row);
        const dCol = Math.abs(to.col - from.col);

        // 根據棋子類型判斷合法移動
        switch (piece.type) {
            case '將': // 將/帥
                // 只能走一步，直行
                if ((dRow === 1 && dCol === 0) || (dRow === 0 && dCol === 1)) {
                    // 必須在九宮格內 (將/帥的活動範圍)
                    const inPalace = (color) => {
                        if (color === '紅') {
                            return to.row >= 7 && to.row <= 9 && to.col >= 3 && to.col <= 5;
                        } else { // 黑
                            return to.row >= 0 && to.row <= 2 && to.col >= 3 && to.col <= 5;
                        }
                    };
                    return inPalace(piece.color);
                }
                return false;

            case '士': // 士/仕
                // 只能走一步，斜行
                if (dRow === 1 && dCol === 1) {
                    // 必須在九宮格內 (士/仕的活動範圍)
                    const inPalace = (color) => {
                        if (color === '紅') {
                            return to.row >= 7 && to.row <= 9 && to.col >= 3 && to.col <= 5;
                        } else { // 黑
                            return to.row >= 0 && to.row <= 2 && to.col >= 3 && to.col <= 5;
                        }
                    };
                    if (inPalace(piece.color)) {
                        return true;
                    }
                }
                return false;

	case '象': // 象/相
                // 走兩步斜線 (田字格)，且不能「塞象眼」
                if (dRow === 2 && dCol === 2) {
                    const middleRow = (from.row + to.row) / 2;
                    const middleCol = (from.col + to.col) / 2;
                    // 檢查象眼是否有棋子
                    if (board[middleRow][middleCol] === null) {
                        // 象不能過河：判斷目標位置是否在己方半場
                        if (piece.color === '紅') {
                            // 紅象的有效行範圍是 5 到 9
                            return to.row >= 5; // 如果目標行小於5，則過河，不允許
                        } else { // 黑方
                            // 黑象的有效行範圍是 0 到 4
                            return to.row <= 4; // 如果目標行大於4，則過河，不允許
                        }
                    }
                }
                return false;

            case '馬': // 馬
                // 走「日」字，且不能「蹩馬腿」
                if ((dRow === 1 && dCol === 2) || (dRow === 2 && dCol === 1)) {
                    let horseLegRow, horseLegCol;
                    // 判斷馬腿位置
                    if (dRow === 1) { // 直走一格，橫走兩格
                        horseLegRow = from.row;
                        horseLegCol = from.col + (to.col > from.col ? 1 : -1);
                    } else { // 橫走一格，直走兩格
                        horseLegRow = from.row + (to.row > from.row ? 1 : -1);
                        horseLegCol = from.col;
                    }
                    // 檢查馬腿是否有棋子
                    if (board[horseLegRow][horseLegCol] === null) {
                        return true;
                    }
                }
                return false;

            case '車': // 車
                // 直線移動，中間不能有阻礙
                if (dRow === 0 || dCol === 0) { // 必須是直行或橫行
                    if (dRow === 0) { // 橫行
                        const startCol = Math.min(from.col, to.col);
                        const endCol = Math.max(from.col, to.col);
                        for (let col = startCol + 1; col < endCol; col++) {
                            if (board[from.row][col] !== null) {
                                console.log("車路徑上有阻礙 (橫行)");
                                return false; // 路徑上有阻礙
                            }
                        }
                    } else { // 直行
                        const startRow = Math.min(from.row, to.row);
                        const endRow = Math.max(from.row, to.row);
                        for (let row = startRow + 1; row < endRow; row++) {
                            if (board[row][from.col] !== null) {
                                console.log("車路徑上有阻礙 (直行)");
                                return false; // 路徑上有阻礙
                            }
                        }
                    }
                    return true; // 路徑無阻礙
                }
                return false;

            case '砲': // 砲/炮
                // 移動方式與車相同，但吃子必須隔一個子 (砲架)
                if (dRow === 0 || dCol === 0) { // 必須是直行或橫行
                    let obstacleCount = 0;
                    if (dRow === 0) { // 橫行
                        const startCol = Math.min(from.col, to.col);
                        const endCol = Math.max(from.col, to.col);
                        for (let col = startCol + 1; col < endCol; col++) {
                            if (board[from.row][col] !== null) {
                                obstacleCount++;
                            }
                        }
                    } else { // 直行
                        const startRow = Math.min(from.row, to.row);
                        const endRow = Math.max(from.row, to.row);
                        for (let row = startRow + 1; row < endRow; row++) {
                            if (board[row][from.col] !== null) {
                                obstacleCount++;
                            }
                        }
                    }

                    if (targetPiece) { // 如果目標位置有棋子 (吃子)
                        return obstacleCount === 1; // 必須隔一個子
                    } else { // 如果目標位置沒有棋子 (移動)
                        return obstacleCount === 0; // 不能隔子
                    }
                }
                return false;

            case '卒': // 卒/兵
                // 紅方兵和黑方卒的移動方向和過河後移動規則不同
                const isRed = piece.color === '紅';
                let validMove = false;

                if (isRed) {
                    // 兵不能後退 (to.row 必須 <= from.row)
                    if (to.row > from.row) return false;
                    // 未過河：只能向前直走一步 (row從9到5)
                    if (from.row >= 5) {
                        validMove = (to.row === from.row - 1 && dCol === 0);
                    }
                    // 過河後：可向前、向左、向右 (row從4到0)
                    else {
                        validMove = (dRow === 1 && dCol === 0) || (dRow === 0 && dCol === 1);
                    }
                } else { // 黑方
                    // 卒不能後退 (to.row 必須 >= from.row)
                    if (to.row < from.row) return false;
                    // 未過河：只能向前直走一步 (row從0到4)
                    if (from.row <= 4) {
                        validMove = (to.row === from.row + 1 && dCol === 0);
                    }
                    // 過河後：可向前、向左、向右 (row從5到9)
                    else {
                        validMove = (dRow === 1 && dCol === 0) || (dRow === 0 && dCol === 1);
                    }
                }
                return validMove;

            default:
                return false; // 未知的棋子類型
        }
    }

    // 執行棋子移動 (如果合法)
    function movePiece(from, to) {
        // 在執行實際移動前，先檢查基本移動規則
        if (!isValidMove(from, to)) {
            console.log(`移動無效: (${from.row}, ${from.col}) 到 (${to.row}, ${to.col}) - 不符合基本規則`);
            return false; // 如果基本移動不合法，則不執行
        }

        const movedPiece = board[from.row][from.col];
        const targetPiece = board[to.row][to.col];

        // 創建臨時棋盤模擬移動，用於將帥對面檢查
        const tempBoard = board.map(row => [...row]); // 深拷貝當前棋盤
        tempBoard[to.row][to.col] = tempBoard[from.row][from.col]; // 在臨時棋盤上移動棋子
        tempBoard[from.row][from.col] = null; // 清空臨時棋盤上的原位置

        // 檢查移動後是否導致將帥面對面
        if (checkGeneralsFaceToFace(tempBoard)) {
            alert('警告：此移動會導致將帥面對面，無效移動！');
            console.log('移動無效：將帥面對面');
            return false; // 如果面對面，阻止移動
        }

        // 如果所有檢查都通過，則執行實際的棋盤數據更新
        board[to.row][to.col] = movedPiece;
        board[from.row][from.col] = null;

        console.log(`棋子從 (${from.row}, ${from.col}) 移動到 (${to.row}, ${to.col})`);

        // 檢查是否吃掉對方將帥 (遊戲結束條件)
        if (targetPiece && targetPiece.type === '將') {
            const winner = (targetPiece.color === '紅' ? '黑方' : '紅方');
            alert(`${winner}獲勝！遊戲結束。`);
            resetButton.click(); // 自動重置遊戲
            return true; // 即使遊戲結束，移動本身也是成功的
        }

        return true; // 移動成功
    }


    // 棋子點擊事件處理 (核心邏輯，判斷選中、切換選中、嘗試移動)
    function handlePieceClick(event) {
        const clickedElement = event.target;
        const clickedRow = parseInt(clickedElement.dataset.row);
        const clickedCol = parseInt(clickedElement.dataset.col);
        const clickedPiece = board[clickedRow][clickedCol];

        // 如果目前有選中的棋子
        if (selectedPiece) {
            // 判斷點擊的是否為同一個棋子，則取消選中
            if (selectedPiece === clickedElement) {
                selectedPiece.classList.remove('selected-piece');
                selectedPiece = null;
                selectedPiecePosition = null;
            }
            // 判斷點擊的是否為己方棋子 (切換選中)
            else if (clickedPiece && clickedPiece.color === (currentTurn === '紅方' ? '紅' : '黑')) {
                selectedPiece.classList.remove('selected-piece');
                selectedPiece = clickedElement;
                selectedPiece.classList.add('selected-piece');
                selectedPiecePosition = { row: clickedRow, col: clickedCol };
            }
            // 點擊的是對方棋子或空位，嘗試移動或吃子
            else {
                // 執行移動邏輯
                if (movePiece(selectedPiecePosition, { row: clickedRow, col: clickedCol })) {
                    // 如果移動成功，則切換回合，並取消選中狀態
                    selectedPiece.classList.remove('selected-piece');
                    selectedPiece = null;
                    selectedPiecePosition = null;
                    switchTurn(); // 切換回合
                    renderBoard(); // 重新渲染棋盤來更新棋子位置
                }
            }
        }
        // 如果目前沒有選中的棋子，且點擊的是棋子，並且是當前回合的棋子
        else if (clickedPiece && clickedPiece.color === (currentTurn === '紅方' ? '紅' : '黑')) {
            selectedPiece = clickedElement;
            selectedPiece.classList.add('selected-piece');
            selectedPiecePosition = { row: clickedRow, col: clickedCol };
        }
        console.log('Selected:', selectedPiecePosition);
    }

    // 處理棋盤空白處點擊的函數，獨立出來以便移除和添加
    function handleBoardClick(event) {
        // 如果點擊的是棋子元素，則不處理，讓 handlePieceClick 接管
        if (event.target.classList.contains('chess-piece')) {
            return;
        }

        // 如果點擊的是棋盤空白處，且有棋子被選中
        if (selectedPiece) {
            const rect = chessboardContainer.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;

            // 將點擊的像素座標轉換為棋盤網格座標
            // 每個格子是 50px，第一個交叉點在 25px
            const targetCol = Math.round((clickX - HALF_GRID_SIZE) / GRID_SIZE);
            const targetRow = Math.round((clickY - HALF_GRID_SIZE) / GRID_SIZE);

            if (movePiece(selectedPiecePosition, { row: targetRow, col: targetCol })) {
                selectedPiece.classList.remove('selected-piece');
                selectedPiece = null;
                selectedPiecePosition = null;
                switchTurn(); // 切換回合
                renderBoard(); // 重新渲染棋盤
            }
        }
    }

    // 添加點擊事件監聽器到所有棋子 (在每次 renderBoard 後調用)
    function addEventListenersToPieces() {
        document.querySelectorAll('.chess-piece').forEach(pieceElement => {
            // 先移除可能存在的舊監聽器，再添加新的，避免重複綁定在同一個DOM元素上
            pieceElement.removeEventListener('click', handlePieceClick);
            pieceElement.addEventListener('click', handlePieceClick);
        });
    }

    // 切換回合
    function switchTurn() {
        currentTurn = (currentTurn === '紅方' ? '黑方' : '紅方');
        currentTurnDisplay.textContent = currentTurn;
    }

    // 重置按鈕事件監聽 (只綁定一次)
    resetButton.addEventListener('click', () => {
        initializeBoard();
        renderBoard(); // 重置後需要重新渲染棋盤和棋子，並重新綁定棋子事件
    });

    // ========== 初始化遊戲和綁定核心事件監聽器 ==========
    initializeBoard(); // 初始化棋盤數據
    renderBoard();      // 渲染棋盤和棋子 (會自動綁定棋子事件)

    // ！！！ 這是關鍵 ！！！
    // 棋盤容器本身的點擊事件，只在這裡綁定一次，不隨 renderBoard 重複綁定
    chessboardContainer.addEventListener('click', handleBoardClick);

}); // DOMContentLoaded 結束