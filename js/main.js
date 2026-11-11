// ===== 游戏引导 =====
function showGuide() {
    const isFirstTime = !localStorage.getItem('echoMessengerPlayed');

    if (isFirstTime) {
        elements.guideOverlay.classList.add('visible');

        setTimeout(() => {
            audioSystem.initialize();
            audioSystem.playTone(600, 0.8, 'sine', 0.2);
        }, 500);

        setTimeout(() => {
            audioSystem.playTone(800, 0.8, 'sine', 0.2);
        }, 1500);

        setTimeout(() => {
            elements.guideOverlay.classList.remove('visible');
            localStorage.setItem('echoMessengerPlayed', 'true');
        }, 3500);
    }
}

// ===== 启动 =====
window.addEventListener('DOMContentLoaded', initGame);

document.addEventListener('visibilitychange', () => {
    if (document.hidden && gameState.isRecording) {
        recordingSystem.stopRecording();
    }
});

// 防止意外关闭
window.addEventListener('beforeunload', (e) => {
    if (gameState.isRecording) {
        e.preventDefault();
        e.returnValue = '';
    }
});
