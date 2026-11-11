    // ===== 进度管理 =====
    function loadGameProgress() {
        try {
            const saved = localStorage.getItem('echoMessenger');
            if (saved) {
                const data = JSON.parse(saved);
                gameState.currentLevel = data.currentLevel || 0;
                gameState.fragments = data.fragments || gameState.fragments;
            }
        } catch (error) {
            console.error('加载进度失败:', error);
        }
    }

    function saveGameProgress() {
        try {
            localStorage.setItem('echoMessenger', JSON.stringify({
                currentLevel: gameState.currentLevel,
                fragments: gameState.fragments
            }));
        } catch (error) {
            console.error('保存进度失败:', error);
        }
    }

    function resetGame() {
        gameState.currentLevel = 0;
        gameState.fragments = [[false, false, false], [false, false, false], [false, false, false]];
        gameState.playerPos = { x: 0, y: 0 };
        physicsSystem.playerPos = { x: 0, y: 0 };
        physicsSystem.targetPos = { x: 0, y: 0 };

        saveGameProgress();
        updateUI();
        audioSystem.playErrorSound();
        showStatusHint('游戏已重置');
    }

    // ===== 碎片收集 =====
    function collectFragment(index) {
        gameState.fragments[gameState.currentLevel][index] = true;
        saveGameProgress();
        updateUI();

        // 动画效果
        elements.fragments[index].classList.add('collecting');
        setTimeout(() => elements.fragments[index].classList.remove('collecting'), 500);

        audioSystem.playCollectSound();
        showStatusHint(`收集: ${CONFIG.FRAGMENTS[gameState.currentLevel][index].name}`);

        // 检查通关
        const allCollected = gameState.fragments[gameState.currentLevel].every(f => f);
        if (allCollected) {
            setTimeout(() => {
                showVictory();
            }, 1000);
        }
    }

    function showVictory() {
        audioSystem.playVictorySound();
        elements.victoryOverlay.classList.add('visible');

        if (gameState.currentLevel < 2) {
            elements.victorySubtitle.textContent = `进入: ${CONFIG.LEVELS[gameState.currentLevel + 1].name}`;
            setTimeout(() => {
                gameState.currentLevel++;
                saveGameProgress();
                updateUI();
                elements.victoryOverlay.classList.remove('visible');

                // 重置位置
                physicsSystem.playerPos = { x: 0, y: 0 };
                physicsSystem.targetPos = { x: 0, y: 0 };
            }, 3000);
        } else {
            elements.victorySubtitle.textContent = '恭喜通关所有关卡!';
            setTimeout(() => {
                elements.victoryOverlay.classList.remove('visible');
            }, 5000);
        }
    }

    // ===== UI更新 =====
    function updateUI() {
        // 碎片
        const fragments = gameState.fragments[gameState.currentLevel];
        elements.fragments.forEach((el, i) => {
            el.classList.toggle('collected', fragments[i]);
        });

        // 关卡
        elements.levelIndicator.textContent = `第${gameState.currentLevel + 1}关: ${CONFIG.LEVELS[gameState.currentLevel].name}`;

        // 环境音效
        audioSystem.startEnvironment(CONFIG.LEVELS[gameState.currentLevel].bgSound);
    }

    function updateDebugPanel() {
        if (!gameState.debugMode || !gameState.lastAnalysis) return;

        const a = gameState.lastAnalysis;
        document.getElementById('debugFreq').textContent = a.averageFrequency.toFixed(1);
        document.getElementById('debugDuration').textContent = a.duration.toFixed(2);
        document.getElementById('debugVolume').textContent = a.averageVolume.toFixed(3);
        document.getElementById('debugVariance').textContent = a.volumeVariance.toFixed(3);
        document.getElementById('debugAction').textContent = physicsSystem.isMoving ? '移动' : physicsSystem.isJumping ? '跳跃' : '静止';
        document.getElementById('debugPos').textContent = `${physicsSystem.playerPos.x.toFixed(0)}, ${physicsSystem.playerPos.y.toFixed(0)}`;
        document.getElementById('debugLevel').textContent = gameState.currentLevel + 1;
        document.getElementById('debugFragments').textContent = `${gameState.fragments[gameState.currentLevel].filter(f => f).length}/3`;
    }
