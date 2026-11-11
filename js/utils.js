    // ===== 辅助函数 =====
    function getActionHint(action) {
        const hints = {
            up: '向上移动',
            down: '向下移动',
            forward: '向前移动'
        };
        return hints[action] || '';
    }

    function showSoundRipple() {
        const ripple = document.createElement('div');
        ripple.className = 'sound-ripple';
        elements.rippleContainer.appendChild(ripple);

        setTimeout(() => ripple.remove(), 1000);
    }

    function showStatusHint(text) {
        elements.statusHint.textContent = text;
        elements.statusHint.classList.add('visible');

        setTimeout(() => {
            elements.statusHint.classList.remove('visible');
        }, 2000);
    }

    function updateSoundVisualizer(dataArray) {
        elements.soundVisualizer.classList.add('active');

        // 动态创建柱状条
        if (elements.soundVisualizer.children.length === 0) {
            for (let i = 0; i < 32; i++) {
                const bar = document.createElement('div');
                bar.className = 'visualizer-bar';
                elements.soundVisualizer.appendChild(bar);
            }
        }

        const bars = elements.soundVisualizer.children;
        const step = Math.floor(dataArray.length / 32);

        for (let i = 0; i < bars.length; i++) {
            const value = dataArray[i * step] / 255;
            bars[i].style.height = `${value * 60}px`;
        }
    }
