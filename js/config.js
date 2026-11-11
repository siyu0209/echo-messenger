// ===== 游戏配置 =====
const CONFIG = {
    RECORD_MIN: 2000,
    RECORD_MAX: 8000,

    // 声音阈值
    FREQ_HIGH: 800,
    FREQ_LOW: 300,
    DURATION_SHORT: 0.5,
    DURATION_LONG: 2,
    VOLUME_VARIANCE: 0.6,

    // 游戏物理
    MOVE_SPEED: 30,
    JUMP_HEIGHT: 80,
    JUMP_DURATION: 400,

    // 关卡配置
    LEVELS: [
        { name: '寂静森林', bgSound: 'forest' },
        { name: '深海迷宫', bgSound: 'ocean' },
        { name: '城市交响', bgSound: 'city' }
    ],

    // 碎片激活条件
    FRAGMENTS: [
        [ // 第一关
            { minFreq: 1000, maxFreq: 2000, minDuration: 1, name: '模仿鸟叫(高频1秒+)' },
            { minVolume: 0.2, maxVolume: 0.4, maxDuration: 0.5, name: '轻轻敲击(中等音量短声)' },
            { minFreq: 500, maxFreq: 1000, minDuration: 2, name: '持续啊声(中频2秒+)' }
        ],
        [ // 第二关
            { minFreq: 100, maxFreq: 200, minDuration: 2, name: '鲸鱼叫声(低频2秒+)' },
            { minFreq: 2000, maxFreq: 3000, minDuration: 1, name: '吹口哨(高频1秒+)' },
            { minVolume: 0.4, maxDuration: 0.3, name: '拍手(短促响亮)' }
        ],
        [ // 第三关
            { minFreq: 800, maxFreq: 1500, maxDuration: 0.5, name: '汽车喇叭(中高频短声)' },
            { minVolume: 0.6, maxVolume: 0.9, maxDuration: 0.5, name: '跺脚(大声短促)' },
            { minDuration: 3, minVolume: 0.3, name: '唱歌(持续3秒+)' }
        ]
    ]
};
