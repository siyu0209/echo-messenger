// ===== 游戏状态 =====
const gameState = {
    currentLevel: 0,
    fragments: [[false, false, false], [false, false, false], [false, false, false]],
    playerPos: { x: 0, y: 0 },
    isRecording: false,
    isPlaying: false,
    audioContext: null,
    mediaRecorder: null,
    recordedChunks: [],
    lastRecording: null,
    lastAnalysis: null,
    debugMode: false,
    longPressTimer: null,
    environmentSound: null,
    analyserNode: null,
    animationFrame: null
};

// ===== DOM元素 =====
const elements = {
    btnRecord: document.getElementById('btnRecord'),
    btnPlay: document.getElementById('btnPlay'),
    btnHelp: document.getElementById('btnHelp'),
    rippleContainer: document.getElementById('rippleContainer'),
    soundVisualizer: document.getElementById('soundVisualizer'),
    statusHint: document.getElementById('statusHint'),
    guideOverlay: document.getElementById('guideOverlay'),
    victoryOverlay: document.getElementById('victoryOverlay'),
    victorySubtitle: document.getElementById('victorySubtitle'),
    levelIndicator: document.getElementById('levelIndicator'),
    debugPanel: document.getElementById('debugPanel'),
    fragments: [
        document.getElementById('fragment1'),
        document.getElementById('fragment2'),
        document.getElementById('fragment3')
    ]
};
