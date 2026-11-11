# 回声信使 · Echo Messenger

> 用你的声音点亮世界 —— 一款靠**麦克风音量与音高**操控角色的网页闯关游戏。

[![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange?logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![Web Audio](https://img.shields.io/badge/Web%20Audio-API-9cf)](https://developer.mozilla.org/docs/Web/API/Web_Audio_API)
[![零依赖](https://img.shields.io/badge/dependencies-0-brightgreen)](#技术栈)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## 这是什么

《回声信使》是一个纯前端的小游戏：屏幕上没有键盘、没有虚拟摇杆，你唯一的输入设备就是**自己的声音**。

对着麦克风说话、喊叫、吹口哨、拍手、跺脚、唱歌 —— 游戏会实时分析这段声音的**基频（音高）**、**持续时长**和**音量**，把它翻译成一条动作指令，让角色前进或跳跃，去收集散落在关卡里的三块「声音碎片」。三块碎片集齐，即可通往下一关。

整个游戏零依赖、零构建、零后端，音频全程在浏览器本地处理，不会上传到任何服务器。

---

## 玩法

每一关有 **3 块碎片**，每块碎片对应一种「声音动作」，必须同时满足频率、时长、音量的条件才会被激活。

### 第一关 · 寂静森林
| 碎片 | 触发条件 |
| --- | --- |
| 模仿鸟叫 | 高频 1 秒以上（1000–2000 Hz） |
| 轻轻敲击 | 中等音量、短声（音量 0.2–0.4，时长 ≤ 0.5 s） |
| 持续啊声 | 中频 2 秒以上（500–1000 Hz） |

### 第二关 · 深海迷宫
| 碎片 | 触发条件 |
| --- | --- |
| 鲸鱼叫声 | 低频 2 秒以上（100–200 Hz） |
| 吹口哨 | 高频 1 秒以上（2000–3000 Hz） |
| 拍手 | 短促响亮（音量 ≥ 0.4，时长 ≤ 0.3 s） |

### 第三关 · 城市交响
| 碎片 | 触发条件 |
| --- | --- |
| 汽车喇叭 | 中高频短声（800–1500 Hz，时长 ≤ 0.5 s） |
| 跺脚 | 大声短促（音量 0.6–0.9，时长 ≤ 0.5 s） |
| 唱歌 | 持续 3 秒以上（音量 ≥ 0.3） |

### 操作流程
1. 页面加载后会先播放一段引导，告诉你当前关卡该发出什么声音。
2. **按住**白色圆形按钮 = 开始录音（最短 2 秒，最长 8 秒，松开或超时自动结束）。
3. 录音结束后点播放按钮回放，确认无误后再提交，判定通过则角色移动 / 跳跃去拾取碎片。
4. 三块碎片集齐即通关，自动进入下一关。

---

## 技术栈

| 层次 | 实现 |
| --- | --- |
| 渲染 | 原生 Canvas + DOM，`requestAnimationFrame` 驱动 |
| 音效 | **Web Audio API 实时合成**（`OscillatorNode` / `GainNode`），仓库内不含任何音频文件 |
| 环境音 | 白噪声 + 滤波 + 包络，按关卡切换（森林 / 海洋 / 城市） |
| 录音 | `navigator.mediaDevices.getUserMedia` + `MediaRecorder` |
| 音高检测 | **自相关算法（autocorrelation）**，在时域波形上求基频周期 |
| 音量 | `AnalyserNode` 取时域 RMS，配合方差判断「持续」还是「短促」 |
| 运动 | 抛物线与线性插值实现的跳跃 / 位移补间 |
| 存档 | `localStorage`（无需登录，清浏览器数据即重置） |

游戏脚本完全由手写原生 JavaScript 组织，没有使用任何框架、打包器或第三方库。

---

## 运行方式

**必须通过 `http://localhost` 或 HTTPS 打开**。浏览器规定 `getUserMedia`（麦克风）只在安全上下文中可用，直接双击用 `file://` 打开会拿不到麦克风。

```bash
# 任选一种本地静态服务器
python -m http.server 8000
# 或
npx serve .
```

然后浏览器访问 `http://localhost:8000`，允许麦克风权限即可开玩。

部署到 GitHub Pages / Vercel / Netlify 等任意静态托管同样可用（自带 HTTPS）。

### 浏览器支持
Chrome / Edge / Firefox / Safari 的近期版本均可。首次进入需要授予麦克风权限；被拒绝后可在地址栏权限面板重新开启。

---

## 目录结构

```
.
├── index.html          # 页面骨架、游戏容器与各 UI 元素
├── css/
│   └── style.css       # 全部样式：容器、按钮、波纹、调试面板、引导与通关遮罩
└── js/
    ├── config.js       # 关卡、阈值与碎片条件的集中配置
    ├── state.js        # 全局游戏状态与 DOM 元素引用
    ├── audio.js        # AudioSystem：合成音效、环境音、音高检测
    ├── physics.js      # PhysicsSystem：接收声音指令、位移与跳跃补间
    ├── recorder.js     # RecordingSystem：录音、实时波形、回声指令解析
    ├── utils.js        # 提示文案、声音波纹、状态条与频谱可视化
    ├── init.js         # 初始化：实例化各系统、绑定按钮与长按逻辑
    ├── progress.js     # 存档读写、碎片收集、通关判定、UI 与调试面板刷新
    └── main.js         # 入口：首次进入引导与启动
```

各模块按 **config → state → audio → physics → recorder → utils → init → progress → main** 的顺序加载，通过全局对象协作，无模块打包。

---

## 配置项

游戏手感全部集中在 `js/config.js` 的 `CONFIG` 里，改完刷新即可生效：

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `RECORD_MIN` / `RECORD_MAX` | 2000 / 8000 | 单次录音的最短 / 最长毫秒数 |
| `FREQ_HIGH` / `FREQ_LOW` | 800 / 300 | 判定「高音 / 低音」的分界频率（Hz） |
| `DURATION_SHORT` / `DURATION_LONG` | 0.5 / 2 | 判定「短声 / 长声」的秒数阈值 |
| `VOLUME_VARIANCE` | 0.6 | 声音稳定性阈值，方差过大视为抖动噪声 |
| `MOVE_SPEED` | 30 | 角色单次移动的像素步长 |
| `JUMP_HEIGHT` / `JUMP_DURATION` | 80 / 400 | 跳跃高度（px）与耗时（ms） |
| `LEVELS` | 3 关 | 关卡名与环境音标识 |
| `FRAGMENTS` | 3 × 3 | 每关三块碎片的频率 / 时长 / 音量条件 |

---

## 已知限制

- **必须联网授予麦克风权限**：`file://` 打开无法录音，需本地服务器或 HTTPS 部署。
- **环境噪声敏感**：开放式办公室、风扇、键盘声都可能被自相关算法误判为基频，建议戴耳机或安静环境游玩。
- **音高检测取时域自相关**，对气声、嘶吼、强混响场景准确率下降；纯噪声（如「嘶——」）可能被判为高频。
- **调试面板默认可见**，展示实时频率 / 时长 / 音量 / 方差 / 判定动作，方便调参；正式游玩可在 `css/style.css` 中隐藏 `#debugPanel`。
- **仅三关**，关卡数据写在 `CONFIG.LEVELS` 与 `CONFIG.FRAGMENTS` 中，新增关卡需同时补充碎片条件。
- **无移动端专门适配**，长按录音在小屏上体验一般。

---

## 隐私

- 录音仅在浏览器内存中处理，**不上传、不写盘、不持久化**。
- 存档只写 `localStorage` 的 `echoMessenger`（关卡与碎片进度）与 `echoMessengerPlayed`（是否看过引导）。
- 页面不加载任何第三方脚本、字体、统计或广告。

---

## License

[MIT](LICENSE) © 2026 siyu0209

---

## English

**Echo Messenger** is a zero-dependency HTML5 game where your **microphone** is the only controller. Each level hides three "sound fragments"; to claim one you must produce the right **pitch**, **duration** and **loudness** (hum a bird call, whistle, clap, stomp, sing a note…). The game extracts the fundamental frequency with an autocorrelation pitch detector, reads loudness from an `AnalyserNode`, and converts the result into a move or jump command. All audio is synthesized at runtime with the Web Audio API — no audio assets ship with the repo, and nothing is ever uploaded.

Serve it over `http://localhost` (or any HTTPS host) because `getUserMedia` requires a secure context:

```bash
python -m http.server 8000
```

Gameplay tuning lives in `js/config.js`.
