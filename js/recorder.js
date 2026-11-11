    // ===== 录音系统 =====
    class RecordingSystem {
        constructor(audioSystem) {
            this.audioSystem = audioSystem;
            this.mediaRecorder = null;
            this.recordedChunks = [];
            this.startTime = 0;
        }

        async startRecording() {
            if (!this.audioSystem.audioContext) {
                this.audioSystem.initialize();
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });

                this.mediaRecorder = new MediaRecorder(stream, {
                    mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ?
                        'audio/webm;codecs=opus' : 'audio/webm'
                });

                this.recordedChunks = [];
                this.startTime = Date.now();

                this.mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        this.recordedChunks.push(e.data);
                    }
                };

                this.mediaRecorder.onstop = () => {
                    this.processRecording();
                    stream.getTracks().forEach(track => track.stop());
                };

                this.mediaRecorder.start(100);
                gameState.isRecording = true;
                this.audioSystem.playStartSound();

                // 开始实时分析
                this.startRealtimeAnalysis(stream);

                // 自动停止
                setTimeout(() => {
                    if (gameState.isRecording) {
                        this.stopRecording();
                    }
                }, CONFIG.RECORD_MAX);

                return true;
            } catch (error) {
                console.error('录音失败:', error);
                this.audioSystem.playErrorSound();
                showStatusHint('麦克风权限被拒绝');
                return false;
            }
        }

        startRealtimeAnalysis(stream) {
            if (!this.audioSystem.audioContext) return;

            const source = this.audioSystem.audioContext.createMediaStreamSource(stream);
            const analyser = this.audioSystem.audioContext.createAnalyser();
            analyser.fftSize = 256;

            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const visualize = () => {
                if (!gameState.isRecording) return;

                analyser.getByteFrequencyData(dataArray);

                // 更新可视化
                updateSoundVisualizer(dataArray);

                // 更新环境音量
                const avgVolume = dataArray.reduce((a, b) => a + b, 0) / bufferLength / 255;
                audioSystem.setEnvironmentVolume(avgVolume);

                gameState.animationFrame = requestAnimationFrame(visualize);
            };

            visualize();
        }

        stopRecording() {
            const duration = Date.now() - this.startTime;

            if (duration < CONFIG.RECORD_MIN) {
                showStatusHint(`录音太短，至少需要${CONFIG.RECORD_MIN / 1000}秒`);
                setTimeout(() => {
                    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                        this.mediaRecorder.stop();
                    }
                }, CONFIG.RECORD_MIN - duration);
                return;
            }

            if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
                gameState.isRecording = false;
                this.audioSystem.playEndSound();

                if (gameState.animationFrame) {
                    cancelAnimationFrame(gameState.animationFrame);
                }

                // 隐藏可视化
                elements.soundVisualizer.classList.remove('active');
            }
        }

        async processRecording() {
            const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
            const arrayBuffer = await blob.arrayBuffer();

            try {
                const audioBuffer = await this.audioSystem.audioContext.decodeAudioData(arrayBuffer);
                gameState.lastRecording = audioBuffer;
                gameState.lastAnalysis = this.audioSystem.analyzeRecording(audioBuffer);

                elements.btnPlay.disabled = false;
                elements.btnPlay.classList.add('enabled');

                this.processSoundCommand(gameState.lastAnalysis);
            } catch (error) {
                console.error('音频处理失败:', error);
                this.audioSystem.playErrorSound();
            }
        }

        processSoundCommand(analysis) {
            const action = physicsSystem.processSoundCommand(analysis);

            // 播放音效和显示反馈
            switch (action) {
                case 'up':
                case 'down':
                case 'forward':
                    audioSystem.playMoveSound(action);
                    showSoundRipple();
                    showStatusHint(getActionHint(action));
                    break;
                case 'jump':
                    audioSystem.playJumpSound();
                    showSoundRipple();
                    showStatusHint('跳跃!');
                    break;
                case 'confused':
                    audioSystem.playConfusedSound();
                    showStatusHint('太嘈杂了...');
                    break;
                case 'idle':
                    showStatusHint('声音太弱');
                    break;
            }

            // 检测碎片
            const fragmentIndex = physicsSystem.checkFragmentCollection(analysis, gameState.currentLevel);
            if (fragmentIndex >= 0) {
                collectFragment(fragmentIndex);
            }

            updateDebugPanel();
        }

        playLastRecording() {
            if (!gameState.lastRecording || gameState.isPlaying) return;

            gameState.isPlaying = true;
            elements.btnPlay.style.opacity = '0.3';

            const source = audioSystem.audioContext.createBufferSource();
            source.buffer = gameState.lastRecording;
            source.connect(audioSystem.audioContext.destination);

            source.onended = () => {
                gameState.isPlaying = false;
                elements.btnPlay.style.opacity = '1';
            };

            source.start();
        }
    }
