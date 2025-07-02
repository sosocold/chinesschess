// boardRenderer.js
const BoardRenderer = (function() {
    let ctx;
    let canvas;
    let container;

    function init(chessboardContainer) {
        container = chessboardContainer;
        canvas = document.createElement('canvas');
        canvas.id = 'boardCanvas';
        canvas.width = CHESS.BOARD_WIDTH;
        canvas.height = CHESS.BOARD_HEIGHT;
        container.appendChild(canvas);
        ctx = canvas.getContext('2d');
    }

    function drawBoardBackground() {
        if (!ctx) {
            console.error("Canvas context not initialized. Call BoardRenderer.init() first.");
            return;
        }

        ctx.clearRect(0, 0, CHESS.BOARD_WIDTH, CHESS.BOARD_HEIGHT);
        ctx.fillStyle = CHESS.BOARD_BACKGROUND_COLOR;
        ctx.fillRect(0, 0, CHESS.BOARD_WIDTH, CHESS.BOARD_HEIGHT);

        ctx.strokeStyle = CHESS.LINE_COLOR;
        ctx.lineWidth = 1;

        // 繪製水平線 (10條)
        for (let i = 0; i < 10; i++) {
            const y = CHESS.HALF_GRID_SIZE + i * CHESS.GRID_SIZE;
            ctx.beginPath();
            ctx.moveTo(CHESS.HALF_GRID_SIZE, y);
            ctx.lineTo(CHESS.BOARD_WIDTH - CHESS.HALF_GRID_SIZE, y);
            ctx.stroke();
        }

        // 繪製垂直線 (9條，但中間河界處斷開)
        for (let i = 0; i < 9; i++) {
            const x = CHESS.HALF_GRID_SIZE + i * CHESS.GRID_SIZE;

            // 上半部分 (0-4行)
            ctx.beginPath();
            ctx.moveTo(x, CHESS.HALF_GRID_SIZE);
            ctx.lineTo(x, CHESS.HALF_GRID_SIZE + 4 * CHESS.GRID_SIZE);
            ctx.stroke();

            // 下半部分 (5-9行)
            ctx.beginPath();
            ctx.moveTo(x, CHESS.HALF_GRID_SIZE + 5 * CHESS.GRID_SIZE);
            ctx.lineTo(x, CHESS.BOARD_HEIGHT - CHESS.HALF_GRID_SIZE);
            ctx.stroke();
        }

        // 特別處理最左邊和最右邊的垂直線，它們是貫穿的
        ctx.beginPath();
        ctx.moveTo(CHESS.HALF_GRID_SIZE, CHESS.HALF_GRID_SIZE);
        ctx.lineTo(CHESS.HALF_GRID_SIZE, CHESS.BOARD_HEIGHT - CHESS.HALF_GRID_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(CHESS.BOARD_WIDTH - CHESS.HALF_GRID_SIZE, CHESS.HALF_GRID_SIZE);
        ctx.lineTo(CHESS.BOARD_WIDTH - CHESS.HALF_GRID_SIZE, CHESS.BOARD_HEIGHT - CHESS.HALF_GRID_SIZE);
        ctx.stroke();

        // 繪製九宮格斜線 (黑方)
        ctx.beginPath();
        ctx.moveTo(CHESS.HALF_GRID_SIZE + 3 * CHESS.GRID_SIZE, CHESS.HALF_GRID_SIZE + 0 * CHESS.GRID_SIZE);
        ctx.lineTo(CHESS.HALF_GRID_SIZE + 5 * CHESS.GRID_SIZE, CHESS.HALF_GRID_SIZE + 2 * CHESS.GRID_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(CHESS.HALF_GRID_SIZE + 5 * CHESS.GRID_SIZE, CHESS.HALF_GRID_SIZE + 0 * CHESS.GRID_SIZE);
        ctx.lineTo(CHESS.HALF_GRID_SIZE + 3 * CHESS.GRID_SIZE, CHESS.HALF_GRID_SIZE + 2 * CHESS.GRID_SIZE);
        ctx.stroke();

        // 繪製九宮格斜線 (紅方)
        ctx.beginPath();
        ctx.moveTo(CHESS.HALF_GRID_SIZE + 3 * CHESS.GRID_SIZE, CHESS.HALF_GRID_SIZE + 7 * CHESS.GRID_SIZE);
        ctx.lineTo(CHESS.HALF_GRID_SIZE + 5 * CHESS.GRID_SIZE, CHESS.HALF_GRID_SIZE + 9 * CHESS.GRID_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(CHESS.HALF_GRID_SIZE + 5 * CHESS.GRID_SIZE, CHESS.HALF_GRID_SIZE + 7 * CHESS.GRID_SIZE);
        ctx.lineTo(CHESS.HALF_GRID_SIZE + 3 * CHESS.GRID_SIZE, CHESS.HALF_GRID_SIZE + 9 * CHESS.GRID_SIZE);
        ctx.stroke();

        // 繪製楚河漢界文字
        ctx.fillStyle = CHESS.LINE_COLOR;
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const riverLineY = CHESS.BOARD_HEIGHT / 2;
        const textOffset = 20;

        ctx.fillText('楚', CHESS.BOARD_WIDTH / 2 - 125, riverLineY);
        ctx.fillText('河', CHESS.BOARD_WIDTH / 2 - 75, riverLineY);
        ctx.fillText('漢', CHESS.BOARD_WIDTH / 2 + 75, riverLineY);
        ctx.fillText('界', CHESS.BOARD_WIDTH / 2 + 125, riverLineY);
    }

    return {
        init: init,
        drawBoardBackground: drawBoardBackground
    };
})();