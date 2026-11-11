// ===== 游戏物理系统 =====
class PhysicsSystem {
    constructor() {
        this.playerPos = { x: 0, y: 0 };
        this.targetPos = { x: 0, y: 0 };
        this.isMoving = false;
        this.isJumping = false;
        this.animating = false;
    }

    processSoundCommand(analysis) {
        const { averageFrequency, duration, averageVolume, volumeVariance } = analysis;

        // 优先级判断
        if (volumeVariance > CONFIG.VOLUME_VARIANCE) {
            return 'confused';
        }
        if (duration < CONFIG.DURATION_SHORT && averageVolume > 0.1) {
            this.jump();
            return 'jump';
        }
        if (averageFrequency > CONFIG.FREQ_HIGH) {
            this.move('up');
            return 'up';
        }
        if (averageFrequency < CONFIG.FREQ_LOW && averageFrequency > 50) {
            this.move('down');
            return 'down';
        }
        if (duration > CONFIG.DURATION_LONG) {
            this.move('forward');
            return 'forward';
        }

        return 'idle';
    }

    move(direction) {
        const speed = CONFIG.MOVE_SPEED;
        switch (direction) {
            case 'up':
                this.targetPos.y -= speed;
                break;
            case 'down':
                this.targetPos.y += speed;
                break;
            case 'forward':
                this.targetPos.x += speed;
                break;
        }
        this.animateMovement();
    }

    jump() {
        if (this.isJumping) return;
        this.isJumping = true;

        const startY = this.playerPos.y;
        const jumpHeight = CONFIG.JUMP_HEIGHT;
        const duration = CONFIG.JUMP_DURATION;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 抛物线运动
            const jumpOffset = jumpHeight * Math.sin(progress * Math.PI);
            this.playerPos.y = startY - jumpOffset;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.playerPos.y = startY;
                this.isJumping = false;
            }
        };

        requestAnimationFrame(animate);
    }

    animateMovement() {
        if (this.animating) return;
        this.animating = true;

        const animate = () => {
            const dx = this.targetPos.x - this.playerPos.x;
            const dy = this.targetPos.y - this.playerPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 1) {
                this.playerPos.x = this.targetPos.x;
                this.playerPos.y = this.targetPos.y;
                this.animating = false;
                return;
            }

            const speed = 0.2;
            this.playerPos.x += dx * speed;
            this.playerPos.y += dy * speed;

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    checkFragmentCollection(analysis, level) {
        const fragments = CONFIG.FRAGMENTS[level];
        const collected = gameState.fragments[level];

        for (let i = 0; i < fragments.length; i++) {
            if (collected[i]) continue;

            const condition = fragments[i];
            let match = true;

            if (condition.minFreq && analysis.averageFrequency < condition.minFreq) match = false;
            if (condition.maxFreq && analysis.averageFrequency > condition.maxFreq) match = false;
            if (condition.minDuration && analysis.duration < condition.minDuration) match = false;
            if (condition.maxDuration && analysis.duration > condition.maxDuration) match = false;
            if (condition.minVolume && analysis.averageVolume < condition.minVolume) match = false;
            if (condition.maxVolume && analysis.averageVolume > condition.maxVolume) match = false;

            // 需要音量大于阈值
            if (analysis.averageVolume < 0.05) match = false;

            if (match) {
                return i;
            }
        }

        return -1;
    }

    checkEndPoint() {
        const allCollected = gameState.fragments[gameState.currentLevel].every(f => f);
        return allCollected && this.playerPos.x > 200;
    }
}
