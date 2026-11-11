// ===== 音频系统 =====
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.gainNode = null;
        this.environmentGain = null;
    }

    initialize() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;

        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);

        this.environmentGain = this.audioContext.createGain();
        this.environmentGain.gain.value = 0.1;
        this.environmentGain.connect(this.audioContext.destination);
    }

    // 生成音调
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.audioContext) this.initialize();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.gainNode);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // 提示音
    playStartSound() {
        this.playTone(880, 0.15, 'sine', 0.2);
        setTimeout(() => this.playTone(1100, 0.1, 'sine', 0.15), 100);
    }

    playEndSound() {
        this.playTone(660, 0.15, 'sine', 0.2);
        setTimeout(() => this.playTone(440, 0.1, 'sine', 0.15), 100);
    }

    playErrorSound() {
        this.playTone(200, 0.4, 'sawtooth', 0.15);
        setTimeout(() => this.playTone(150, 0.3, 'sawtooth', 0.1), 200);
    }

    // 游戏音效
    playMoveSound(direction) {
        const freqMap = { up: 600, down: 400, forward: 500 };
        this.playTone(freqMap[direction] || 500, 0.2, 'sine', 0.15);
    }

    playJumpSound() {
        this.playTone(800, 0.15, 'sine', 0.2);
        setTimeout(() => this.playTone(1200, 0.2, 'sine', 0.25), 100);
    }

    playConfusedSound() {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => this.playTone(250 + i * 50, 0.2, 'sawtooth', 0.1), i * 150);
        }
    }

    playCollectSound() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.25), i * 80);
        });
    }

    playVictorySound() {
        const notes = [523, 659, 784, 1047, 1319, 1568];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3, 'sine', 0.2), i * 150);
        });
    }

    playHelpSound() {
        this.playTone(500, 0.3, 'sine', 0.1);
        setTimeout(() => this.playTone(700, 0.4, 'sine', 0.15), 200);
    }

    playFragmentHint(index) {
        const hints = [
            [1000, 1500], // 鸟叫频率
            [300, 400],   // 敲击频率
            [600, 800]    // 啊声频率
        ];
        const [f1, f2] = hints[index] || [500, 700];
        this.playTone(f1, 0.3, 'sine', 0.2);
        setTimeout(() => this.playTone(f2, 0.3, 'sine', 0.2), 300);
    }

    // 环境音效
    startEnvironment(type) {
        if (!this.audioContext) this.initialize();
        if (this.environmentSound) {
            this.environmentSound.noise.stop();
        }

        const bufferSize = 2 * this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = this.audioContext.createBiquadFilter();
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();

        switch (type) {
            case 'forest':
                filter.type = 'lowpass';
                filter.frequency.value = 800;
                filter.Q.value = 1;
                lfo.frequency.value = 0.3;
                lfoGain.gain.value = 100;
                break;
            case 'ocean':
                filter.type = 'lowpass';
                filter.frequency.value = 400;
                filter.Q.value = 2;
                lfo.frequency.value = 0.1;
                lfoGain.gain.value = 200;
                break;
            case 'city':
                filter.type = 'bandpass';
                filter.frequency.value = 600;
                filter.Q.value = 3;
                lfo.frequency.value = 0.5;
                lfoGain.gain.value = 50;
                break;
        }

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noise.connect(filter);
        filter.connect(this.environmentGain);
        noise.start();
        lfo.start();

        this.environmentSound = { noise, filter, lfo, lfoGain };
    }

    stopEnvironment() {
        if (this.environmentSound) {
            this.environmentSound.noise.stop();
            this.environmentSound.lfo.stop();
            this.environmentSound = null;
        }
    }

    setEnvironmentVolume(volume) {
        if (this.environmentGain) {
            this.environmentGain.gain.value = Math.min(0.3, volume * 0.5);
        }
    }

    // 分析录音
    analyzeRecording(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const duration = audioBuffer.duration;

        // 计算音量
        let sumVolume = 0;
        let sumSquaredDiff = 0;
        const volumes = [];
        const windowSize = Math.floor(sampleRate * 0.05); // 50ms窗口

        for (let i = 0; i < channelData.length; i += windowSize) {
            let windowSum = 0;
            for (let j = 0; j < windowSize && i + j < channelData.length; j++) {
                windowSum += Math.abs(channelData[i + j]);
            }
            const avg = windowSum / windowSize;
            volumes.push(avg);
            sumVolume += avg;
        }

        const avgVolume = sumVolume / volumes.length;

        for (const vol of volumes) {
            sumSquaredDiff += Math.pow(vol - avgVolume, 2);
        }
        const variance = sumSquaredDiff / volumes.length;

        // 频率分析 - 使用自相关算法
        const avgFreq = this.detectPitch(channelData, sampleRate);

        return {
            averageFrequency: avgFreq,
            duration: duration,
            averageVolume: avgVolume,
            volumeVariance: variance
        };
    }

    // 自相关算法检测音高
    detectPitch(buffer, sampleRate) {
        const SIZE = buffer.length;
        let rms = 0;

        for (let i = 0; i < SIZE; i++) {
            rms += buffer[i] * buffer[i];
        }
        rms = Math.sqrt(rms / SIZE);

        if (rms < 0.01) return 0; // 静音

        let r1 = 0, r2 = SIZE - 1;
        const threshold = 0.2;

        for (let i = 0; i < SIZE / 2; i++) {
            if (Math.abs(buffer[i]) < threshold) {
                r1 = i;
                break;
            }
        }

        for (let i = 1; i < SIZE / 2; i++) {
            if (Math.abs(buffer[SIZE - i]) < threshold) {
                r2 = SIZE - i;
                break;
            }
        }

        buffer = buffer.slice(r1, r2);
        const trimmedSize = buffer.length;

        const correlations = new Array(trimmedSize).fill(0);

        for (let lag = 0; lag < trimmedSize; lag++) {
            let sum = 0;
            for (let i = 0; i < trimmedSize - lag; i++) {
                sum += buffer[i] * buffer[i + lag];
            }
            correlations[lag] = sum;
        }

        let d = 0;
        while (correlations[d] > correlations[d + 1] && d < trimmedSize - 1) {
            d++;
        }

        let maxValue = -1;
        let maxIndex = -1;
        for (let i = d; i < trimmedSize; i++) {
            if (correlations[i] > maxValue) {
                maxValue = correlations[i];
                maxIndex = i;
            }
        }

        if (maxIndex === -1) return 0;

        // 抛物线插值
        let T0 = maxIndex;
        if (maxIndex > 0 && maxIndex < trimmedSize - 1) {
            const x1 = correlations[maxIndex - 1];
            const x2 = correlations[maxIndex];
            const x3 = correlations[maxIndex + 1];
            const a = (x1 + x3 - 2 * x2) / 2;
            const b = (x3 - x1) / 2;
            if (a) T0 = maxIndex - b / (2 * a);
        }

        return sampleRate / T0;
    }
}
