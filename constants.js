// constants.js
const CHESS = {
    BOARD_WIDTH: 450,
    BOARD_HEIGHT: 500,
    GRID_SIZE: 50,
    HALF_GRID_SIZE: 25,
    PIECE_SIZE: 46,
    LINE_COLOR: '#5a3825',
    BOARD_BACKGROUND_COLOR: '#f0d9b5',
    INITIAL_BOARD_STATE: [
        // 黑方
        [{ type: '車', color: '黑' }, { type: '馬', color: '黑' }, { type: '象', color: '黑' }, { type: '士', color: '黑' }, { type: '將', color: '黑' }, { type: '士', color: '黑' }, { type: '象', color: '黑' }, { type: '馬', color: '黑' }, { type: '車', color: '黑' }],
        [null, null, null, null, null, null, null, null, null],
        [null, { type: '砲', color: '黑' }, null, null, null, null, null, { type: '砲', color: '黑' }, null],
        [{ type: '卒', color: '黑' }, null, { type: '卒', color: '黑' }, null, { type: '卒', color: '黑' }, null, { type: '卒', color: '黑' }, null, { type: '卒', color: '黑' }],
        [null, null, null, null, null, null, null, null, null],
        // 河界
        [null, null, null, null, null, null, null, null, null],
        [{ type: '卒', color: '紅' }, null, { type: '卒', color: '紅' }, null, { type: '卒', color: '紅' }, null, { type: '卒', color: '紅' }, null, { type: '卒', color: '紅' }],
        [null, { type: '砲', color: '紅' }, null, null, null, null, null, { type: '砲', color: '紅' }, null],
        [null, null, null, null, null, null, null, null, null],
        // 紅方
        [{ type: '車', color: '紅' }, { type: '馬', color: '紅' }, { type: '象', color: '紅' }, { type: '士', color: '紅' }, { type: '將', color: '紅' }, { type: '士', color: '紅' }, { type: '象', color: '紅' }, { type: '馬', color: '紅' }, { type: '車', color: '紅' }]
    ],
    PIECE_CHAR_MAP: {
        'red': {
            '車': '車', '馬': '馬', '象': '相', '士': '仕', '將': '帥', '砲': '炮', '卒': '兵'
        },
        'black': {
            '車': '車', '馬': '馬', '象': '象', '士': '士', '將': '將', '砲': '砲', '卒': '卒'
        }
    }
};

// 將這些常數暴露為全局對象，或者如果偏好，放在一個命名空間中。
// 為了在這種非模組環境中簡化，我們將使用全局對象。