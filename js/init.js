    // ===== 初始化 =====
    let audioSystem, physicsSystem, recordingSystem;

    function initGame() {
        audioSystem = new AudioSystem();
        physicsSystem = new PhysicsSystem();
        recordingSystem = new RecordingSystem(audioSystem);

        bindButtons();
        loadGameProgress();
        initSoundVisualizer();
        showGuide();
        updateUI();

        console.log('《回声信使》初始化完成');
    }

    function initSoundVisualizer() {
        for (let i = 0; i < 32; i++) {
            const bar = document.createElement('div');
            bar.className = 'visualizer-bar';
            bar.style.height = '2px';
            elements.soundVisualizer.appendChild(bar);
        }
    }

    function bindButtons() {
        // 录音按钮 - 触摸和鼠标支持
        const handleRecordStart = (e) => {
            e.preventDefault();
            if (gameState.isRecording) {
                recordingSystem.stopRecording();
                elements.btnRecord.classList.remove('recording');
                elements.btnRecord.classList.add('completed');
                setTimeout(() => elements.btnRecord.classList.remove('completed'), 1000);
            } else {
                recordingSystem.startRecording();
                elements.btnRecord.classList.add('recording');
            }
        };

        elements.btnRecord.addEventListener('click', handleRecordStart);
        elements.btnRecord.addEventListener('touchend', handleRecordStart);

        // 长按重置
        const startLongPress = (e) => {
            gameState.longPressTimer = setTimeout(() => {
                audioSystem.playTone(300, 0.5, 'square', 0.2);
                setTimeout(() => {
                    if (confirm('确定重置所有进度?')) {
                        resetGame();
                    }
                }, 500);
            }, 5000);
        };

        const cancelLongPress = () => {
            if (gameState.longPressTimer) {
                clearTimeout(gameState.longPressTimer);
                gameState.longPressTimer = null;
            }
        };

        elements.btnRecord.addEventListener('mousedown', startLongPress);
        elements.btnRecord.addEventListener('touchstart', startLongPress);
        elements.btnRecord.addEventListener('mouseup', cancelLongPress);
        elements.btnRecord.addEventListener('touchend', cancelLongPress);

        // 播放按钮
        elements.btnPlay.addEventListener('click', () => {
            recordingSystem.playLastRecording();
        });

        // 求助按钮
        elements.btnHelp.addEventListener('click', () => {
            audioSystem.playHelpSound();
            const hintIndex = getHintForCurrentLevel();
            audioSystem.playFragmentHint(hintIndex);
            showStatusHint(`试试: ${CONFIG.FRAGMENTS[gameState.currentLevel][hintIndex].name}`);
        });

        // F12调试
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12') {
                e.preventDefault();
                gameState.debugMode = !gameState.debugMode;
                elements.debugPanel.classList.toggle('visible', gameState.debugMode);
            }
        });
    }

    function getHintForCurrentLevel() {
        const collected = gameState.fragments[gameState.currentLevel];
        const uncollected = collected.findIndex((c, i) => !c);
        return uncollected >= 0 ? uncollected : 0;
    }
