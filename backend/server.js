const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const port = 3000;

// 数据库连接
const db = new sqlite3.Database('./music.db', (err) => {
  if (err) {
    console.error('数据库连接失败:', err);
    return;
  }
  console.log('SQLite数据库连接成功');
});

// 创建表结构
const createTables = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    nickname TEXT NOT NULL,
    avatar TEXT DEFAULT 'http://p1.music.126.net/86ildkNdYbtpJZLyGGsOSg==/109951163982316131.jpg',
    gender INTEGER DEFAULT 0,
    birthday TEXT,
    signature TEXT DEFAULT '',
    email TEXT,
    wechat TEXT,
    level INTEGER DEFAULT 1,
    points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    cover_img_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  
  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    duration INTEGER,
    url TEXT,
    cover_img_url TEXT
  );
  
  CREATE TABLE IF NOT EXISTS playlist_songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER NOT NULL,
    song_id INTEGER NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
  );
  
  CREATE TABLE IF NOT EXISTS user_favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    song_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
  );
  
  CREATE TABLE IF NOT EXISTS prizes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    required_level INTEGER NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS user_prizes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    prize_id INTEGER NOT NULL,
    obtained_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prize_id) REFERENCES prizes(id) ON DELETE CASCADE
  );
`;

db.exec(createTables, (err) => {
  if (err) {
    console.error('创建表失败:', err);
    return;
  }
  console.log('数据库表创建成功');
  
  // 插入样例用户数据
  const insertSampleUsers = `
    INSERT OR IGNORE INTO users (id, phone, password, nickname, level, points) VALUES 
    (1, '13800138000', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '测试用户1', 3, 95),
    (2, '13800138001', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '测试用户2', 2, 85),
    (3, '13800138002', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '测试用户3', 1, 75);
  `;
  
  db.exec(insertSampleUsers, (err) => {
    if (err) {
      console.error('插入样例用户失败:', err);
      return;
    }
    console.log('插入样例用户成功');
  });
  
  // 插入样例奖品数据
  const insertSamplePrizes = `
    INSERT OR IGNORE INTO prizes (id, name, description, required_level, stock) VALUES 
    (1, '豪华VIP', '1个月豪华VIP会员', 3, 100),
    (2, '普通VIP', '1个月普通VIP会员', 2, 200),
    (3, '音乐包', '1个月音乐包', 1, 500),
    (4, '无门槛券', '10元无门槛优惠券', 3, 150),
    (5, '折扣券', '9折优惠券', 2, 300);
  `;
  
  db.exec(insertSamplePrizes, (err) => {
    if (err) {
      console.error('插入样例奖品失败:', err);
      return;
    }
    console.log('插入样例奖品成功');
  });
});

// 中间件
// 配置跨域
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// JWT密钥
const secretKey = process.env.JWT_SECRET || 'your_secret_key';

// 全局变量，用于存储验证码
const captchaStore = new Map();

// 验证JWT令牌的中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ code: 401, message: '未授权' });
  }
  
  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ code: 403, message: '令牌无效' });
    }
    req.user = user;
    next();
  });
};

// 注册接口（已移至下方完整实现）

// 登录接口
app.get('/api/login/cellphone', (req, res) => {
  const { phone, password } = req.query;
  
  if (!phone || !password) {
    return res.status(400).json({ code: 400, message: '手机号和密码不能为空' });
  }
  
  // 查询用户
  const sql = 'SELECT * FROM users WHERE phone = ?';
  db.get(sql, [phone], (err, user) => {
    if (err) {
      return res.status(500).json({ code: 500, message: '数据库查询错误' });
    }
    
    if (!user) {
      return res.status(400).json({ code: 400, message: '用户名或密码错误' });
    }
    
    // 验证密码
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ code: 400, message: '用户名或密码错误' });
    }
    
    // 生成JWT令牌
    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
    
    res.status(200).json({ 
      code: 200, 
      message: '登录成功', 
      data: { 
        token, 
        user: { id: user.id, phone: user.phone, nickname: user.nickname } 
      } 
    });
  });
});

// 获取推荐歌单接口
app.get('/api/recommend/songList', (req, res) => {
  // 模拟推荐歌单数据
  const songList = [
    { id: 1, name: '热门推荐', coverImgUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', playCount: 123456 },
    { id: 2, name: '新歌速递', coverImgUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', playCount: 789012 },
    { id: 3, name: '经典老歌', coverImgUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', playCount: 456789 }
  ];
  
  res.status(200).json({ code: 200, message: '获取成功', data: { playlists: songList } });
});

// 获取轮播图接口
app.get('/api/banner', (req, res) => {
  // 模拟轮播图数据
  const banners = [
    { id: 1, pic: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', typeTitle: '热门推荐', titleColor: '#FF5722' },
    { id: 2, pic: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', typeTitle: '新歌速递', titleColor: '#4CAF50' },
    { id: 3, pic: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', typeTitle: '排行榜', titleColor: '#2196F3' }
  ];
  
  res.status(200).json({ code: 200, message: '获取成功', banners });
})

// 获取推荐歌单接口
app.get('/api/top/playlist', (req, res) => {
  // 模拟推荐歌单数据
  const playlists = [
    { id: 1, name: '热门推荐', coverImgUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', playCount: 123456, creator: { nickname: '小明' } },
    { id: 2, name: '新歌速递', coverImgUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', playCount: 789012, creator: { nickname: '小红' } },
    { id: 3, name: '经典老歌', coverImgUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', playCount: 456789, creator: { nickname: '小刚' } }
  ];
  
  res.status(200).json({ code: 200, message: '获取成功', playlists });
});

// 获取精品歌单接口
app.get('/api/top/playlist/highquality', (req, res) => {
  // 模拟精品歌单数据
  const playlists = [
    { id: 1, name: '精品推荐', coverImgUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', playCount: 123456, creator: { nickname: '小明' } },
    { id: 2, name: '精选集', coverImgUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', playCount: 789012, creator: { nickname: '小红' } }
  ];
  
  res.status(200).json({ code: 200, message: '获取成功', playlists });
});

// 获取登录状态接口
app.get('/api/login/status', authenticateToken, (req, res) => {
  // 查询用户信息
  const sql = 'SELECT * FROM users WHERE id = ?';
  db.get(sql, [req.user.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ code: 500, message: '数据库查询错误' });
    }
    
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    
    res.status(200).json({ 
      code: 200, 
      message: '获取成功', 
      data: { 
        profile: { 
          userId: user.id, 
          nickname: user.nickname, 
          avatarUrl: user.avatar, 
          phone: user.phone
        },
        level: user.level
      } 
    });
  });
});

// 获取用户详情接口
app.get('/api/user/detail', (req, res) => {
  const { uid } = req.query;
  
  // 查询用户信息
  const sql = 'SELECT * FROM users WHERE id = ?';
  db.get(sql, [uid], (err, user) => {
    if (err) {
      return res.status(500).json({ code: 500, message: '数据库查询错误' });
    }
    
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    
    res.status(200).json({ 
      code: 200, 
      message: '获取成功', 
      data: { 
        userId: user.id, 
        nickname: user.nickname, 
        avatar: user.avatar, 
        phone: user.phone,
        level: user.level,
        points: user.points,
        created_at: user.created_at,
        updated_at: user.updated_at
      } 
    });
  });
});

// 获取所有榜单内容摘要接口
app.get('/api/toplist/detail', (req, res) => {
  // 模拟榜单数据
  const list = [
    { id: 1, name: '飙升榜', updateFrequency: '实时', coverImgUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', trackCount: 100 },
    { id: 2, name: '新歌榜', updateFrequency: '每日', coverImgUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', trackCount: 100 },
    { id: 3, name: '热歌榜', updateFrequency: '每周', coverImgUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', trackCount: 100 }
  ];
  
  res.status(200).json({ code: 200, message: '获取成功', list });
});

// 获取排行榜接口
app.get('/api/top/list', (req, res) => {
  const { idx } = req.query;
  
  // 模拟排行榜数据
  const playlist = {
    id: idx || 1,
    name: '排行榜',
    tracks: [
      { id: 1, name: '歌曲1', ar: [{ name: '歌手1' }], al: { name: '专辑1', picUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' } },
      { id: 2, name: '歌曲2', ar: [{ name: '歌手2' }], al: { name: '专辑2', picUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' } },
      { id: 3, name: '歌曲3', ar: [{ name: '歌手3' }], al: { name: '专辑3', picUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' } }
    ]
  };
  
  res.status(200).json({ code: 200, message: '获取成功', playlist });
});

// 获取歌单详情接口
app.get('/api/playlist/detail', (req, res) => {
  const { id } = req.query;
  
  // 模拟歌单详情数据
  const playlist = {
    id: id || 1,
    name: '歌单详情',
    coverImgUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
    creator: { nickname: '小明' },
    tracks: [
      { id: 1, name: '歌曲1', ar: [{ name: '歌手1' }], al: { name: '专辑1', picUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' } },
      { id: 2, name: '歌曲2', ar: [{ name: '歌手2' }], al: { name: '专辑2', picUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' } }
    ]
  };
  
  res.status(200).json({ code: 200, message: '获取成功', playlist });
});

// 获取每日推荐歌单接口
app.get('/api/recommend/resource', (req, res) => {
  // 模拟每日推荐歌单数据
  const recommend = [
    { id: 1, name: '每日推荐', coverImgUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', playCount: 123456 },
    { id: 2, name: '个性化推荐', coverImgUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', playCount: 789012 }
  ];
  
  res.status(200).json({ code: 200, message: '获取成功', recommend });
});

// 获取新碟接口
app.get('/api/top/album', (req, res) => {
  const { limit = 10 } = req.query;
  res.status(200).json({
    code: 200,
    message: '获取新碟成功',
    albums: [
      { id: 1, name: '专辑1', artist: '艺术家1', picUrl: 'https://example.com/pic1.jpg' },
      { id: 2, name: '专辑2', artist: '艺术家2', picUrl: 'https://example.com/pic2.jpg' }
    ].slice(0, limit)
  });
});

// 歌单分类
app.get('/api/playlist/catlist', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取歌单分类成功',
    categories: { 1: '华语', 2: '欧美', 3: '日语', 4: '韩语' },
    sub: []
  });
});

// 热门歌单分类
app.get('/api/playlist/hot', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取热门歌单分类成功',
    tags: [{ name: '流行', id: 1 }, { name: '摇滚', id: 2 }, { name: '电子', id: 3 }]
  });
});

// 热搜列表
app.get('/api/search/hot/detail', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取热搜列表成功',
    data: [{ searchWord: '热门歌曲1', score: 100 }, { searchWord: '热门歌曲2', score: 90 }]
  });
});

// 电台榜
app.get('/api/dj/toplist', (req, res) => {
  const { limit = 100, offset = 0, type = 'hot' } = req.query;
  res.status(200).json({
    code: 200,
    message: '获取电台榜成功',
    list: [{ id: 1, name: '电台1', dj: 'DJ1', listeners: 10000 }, { id: 2, name: '电台2', dj: 'DJ2', listeners: 8000 }].slice(offset, offset + limit)
  });
});

// 专辑内容
app.get('/api/album', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取专辑内容成功',
    album: { id: 1, name: '专辑1', artist: '艺术家1', songs: [] }
  });
});

// 私人FM
app.get('/api/personal_fm', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取私人FM成功',
    data: []
  });
});

// 心动模式
app.get('/api/playmode/intelligence/list', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取心动模式成功',
    data: []
  });
});

// 喜欢歌曲列表
app.get('/api/likelist', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取喜欢歌曲列表成功',
    ids: []
  });
});

// 用户信息
app.get('/api/user/subcount', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取用户信息成功',
    playlistCount: 0, followedCount: 0, followerCount: 0
  });
});

// 用户播放记录
app.get('/api/user/record', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取用户播放记录成功',
    weekData: [],
    allData: []
  });
});

// 用户动态
app.get('/api/user/event', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取用户动态成功',
    events: []
  });
});

// 用户歌单
app.get('/api/user/playlist', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取用户歌单成功',
    playlist: []
  });
});

// 用户电台
app.get('/api/user/dj', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取用户电台成功',
    createdDjRadio: [],
    subscribedDjRadios: []
  });
});

// 收藏的专辑
app.get('/api/album/sublist', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取收藏的专辑成功',
    data: []
  });
});

// 收藏的歌手
app.get('/api/artist/sublist', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取收藏的歌手成功',
    data: []
  });
});

// 收藏的视频
app.get('/api/mv/sublist', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取收藏的视频成功',
    data: []
  });
});

// 订阅的电台
app.get('/api/dj/sublist', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取订阅的电台成功',
    data: []
  });
});

// 视频标签导航
app.get('/api/video/group/list', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取视频标签导航成功',
    data: []
  });
});

// 视频标签详情
app.get('/api/video/group', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取视频标签详情成功',
    data: []
  });
});

// 视频播放地址
app.get('/api/video/url', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取视频播放地址成功',
    urls: []
  });
});

// 视频详情
app.get('/api/video/detail', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取视频详情成功',
    data: {}
  });
});

// 相关视频
app.get('/api/related/allvideo', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '获取相关视频成功',
    data: []
  });
});

// 签到
app.get('/api/daily_signin', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '签到成功',
    data: { point: 10 }
  });
});

// 退出登录
app.get('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    code: 200,
    message: '退出登录成功'
  });
});

// 查看歌曲是否可用
app.get('/api/check/music', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '检查歌曲成功',
    success: true
  });
});

// 喜欢歌曲
app.get('/api/like', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '喜欢歌曲成功'
  });
});

// 获取新歌接口
app.get('/api/top/song', (req, res) => {
  const { type } = req.query;
  
  // 模拟新歌数据
  const data = [
    { id: 1, name: '新歌1', ar: [{ name: '歌手1' }], album: { name: '专辑1', blurPicUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' } },
    { id: 2, name: '新歌2', ar: [{ name: '歌手2' }], album: { name: '专辑2', blurPicUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' } }
  ];
  
  res.status(200).json({ code: 200, message: '获取成功', data });
});

// 手机号是否被注册接口
app.get('/api/cellphone/existence/check', (req, res) => {
  const { phone } = req.query;
  
  // 查询数据库检查手机号是否被注册
  const sql = 'SELECT * FROM users WHERE phone = ?';
  db.get(sql, [phone], (err, row) => {
    if (err) {
      return res.status(500).json({ code: 500, message: '数据库查询错误' });
    }
    
    res.status(200).json({ code: 200, message: '获取成功', exists: !!row });
  });
});

// 发送验证码接口
app.get('/api/captcha/sent', (req, res) => {
  const { phone } = req.query;
  
  // 生成4位随机验证码
  const captcha = Math.floor(1000 + Math.random() * 9000).toString();
  
  // 存储验证码，有效期5分钟
  captchaStore.set(phone, { captcha, expiresAt: Date.now() + 5 * 60 * 1000 });
  
  res.status(200).json({ code: 200, message: '验证码发送成功', captcha });
});

// 验证验证码接口
app.get('/api/captcha/verify', (req, res) => {
  const { phone, captcha } = req.query;
  
  // 检查验证码
  const captchaData = captchaStore.get(phone);
  
  if (!captchaData) {
    return res.status(400).json({ code: 400, message: '验证码不存在或已过期' });
  }
  
  if (captchaData.captcha !== captcha) {
    return res.status(400).json({ code: 400, message: '验证码错误' });
  }
  
  // 验证码正确，删除验证码
  captchaStore.delete(phone);
  
  res.status(200).json({ code: 200, message: '验证码验证成功' });
});

// 获取每日推荐歌曲接口
app.get('/api/recommend/songs', authenticateToken, (req, res) => {
  // 模拟每日推荐歌曲数据
  const data = { 
    code: 200, 
    message: '获取成功', 
    dailySongs: [
      { id: 1, name: '歌曲1', ar: [{ name: '歌手1' }], al: { name: '专辑1', picUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' } },
      { id: 2, name: '歌曲2', ar: [{ name: '歌手2' }], al: { name: '专辑2', picUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' } }
    ] 
  };
  
  res.status(200).json(data);
});

// 获取歌曲url接口
app.get('/api/song/url', (req, res) => {
  const { id } = req.query;
  
  // 模拟歌曲url数据
  const data = { 
    code: 200, 
    message: '获取成功', 
    data: [{ id: id || 1, url: 'https://music.163.com/song/media/outer/url?id=' + (id || 1) + '.mp3' }] 
  };
  
  res.status(200).json(data);
});

// 获取歌词接口
app.get('/api/lyric', (req, res) => {
  const { id } = req.query;
  
  // 模拟歌词数据
  const lrc = { 
    version: 1, 
    lyric: '[00:00.000] 歌曲' + (id || 1) + '的歌词' 
  };
  
  res.status(200).json({ code: 200, message: '获取成功', lrc });
});

// 验证验证码接口
app.get('/api/captcha/verify', (req, res) => {
  const { phone, captcha } = req.query;
  
  // 检查验证码
  const captchaData = captchaStore.get(phone);
  
  if (!captchaData) {
    return res.status(400).json({ code: 400, message: '验证码不存在或已过期' });
  }
  
  if (captchaData.captcha !== captcha) {
    return res.status(400).json({ code: 400, message: '验证码错误' });
  }
  
  // 验证码正确，删除验证码
  captchaStore.delete(phone);
  
  res.status(200).json({ code: 200, message: '验证码验证成功' });
});

// 手机号注册接口
app.get('/api/register/cellphone', (req, res) => {
  const { phone, captcha, password, nickname } = req.query;
  
  // 简单的验证码验证（实际项目中应使用Redis存储验证码）
  if (!captcha) {
    return res.status(400).json({ code: 400, message: '验证码不能为空' });
  }
  
  // 验证码已经在验证接口中检查过了，这里不需要再次检查
   // 但为了安全起见，还是再检查一次
   const stored = captchaStore.get(phone);
   if (!stored || Date.now() > stored.expiresAt || stored.captcha !== captcha) {
     return res.status(400).json({ code: 400, message: '验证码错误或已过期' });
   }
  
  // 检查手机号是否已经注册
  const checkSql = 'SELECT * FROM users WHERE phone = ?';
  db.get(checkSql, [phone], (err, row) => {
    if (err) {
      return res.status(500).json({ code: 500, message: '数据库查询错误' });
    }
    
    if (row) {
      return res.status(400).json({ code: 400, message: '手机号已经被注册' });
    }
    
    // 密码加密
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // 创建用户
    const insertSql = 'INSERT INTO users (phone, password, nickname) VALUES (?, ?, ?)';
    db.run(insertSql, [phone, hashedPassword, nickname], function(err) {
      if (err) {
        return res.status(500).json({ code: 500, message: '用户创建失败' });
      }
      
      // 生成JWT令牌
      const token = jwt.sign({ userId: this.lastID }, secretKey, { expiresIn: '1h' });
      
      res.status(200).json({ 
        code: 200, 
        message: '注册成功', 
        data: { 
          token, 
          user: { id: this.lastID, phone, nickname } 
        } 
      });
    });
  });
});

// 手机号登录接口
app.get('/api/login/cellphone', (req, res) => {
  const { phone, password } = req.query;
  
  if (!phone || !password) {
    return res.status(400).json({ code: 400, message: '手机号和密码不能为空' });
  }
  
  // 查询用户
  const sql = 'SELECT * FROM users WHERE phone = ?';
  db.get(sql, [phone], (err, user) => {
    if (err) {
      return res.status(500).json({ code: 500, message: '数据库查询错误' });
    }
    
    if (!user) {
      return res.status(400).json({ code: 400, message: '用户名或密码错误' });
    }
    
    // 验证密码
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ code: 400, message: '用户名或密码错误' });
    }
    
    // 生成JWT令牌
    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
    
    res.status(200).json({ 
      code: 200, 
      message: '登录成功', 
      profile: { id: user.id, nickname: user.nickname, phone: user.phone },
      token
    });
  });
});

// 登录状态接口
app.get('/api/login/status', (req, res) => {
  // 模拟登录状态
  res.status(200).json({ code: 200, message: '获取成功', data: { account: { id: 123456 }, profile: { nickname: '模拟用户' } } });
});

// 用户详情接口
app.get('/api/user/detail', (req, res) => {
  const { uid } = req.query;
  
  // 模拟用户详情
  res.status(200).json({ code: 200, message: '获取成功', profile: { id: uid || 123456, nickname: '模拟用户', avatarUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' } });
});

// 签到接口
app.get('/api/daily_signin', (req, res) => {
  // 模拟签到
  res.status(200).json({ code: 200, message: '签到成功' });
});

// 退出登录接口
app.get('/api/logout', (req, res) => {
  // 模拟退出登录
  res.status(200).json({ code: 200, message: '退出登录成功' });
});

// 获取每日推荐歌曲接口
app.get('/api/recommend/songs', (req, res) => {
  // 模拟每日推荐歌曲数据
  const data = { 
    dailySongs: [
      { id: 1, name: '歌曲1', ar: [{ name: '歌手1' }], al: { name: '专辑1', picUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' } },
      { id: 2, name: '歌曲2', ar: [{ name: '歌手2' }], al: { name: '专辑2', picUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' } },
      { id: 3, name: '歌曲3', ar: [{ name: '歌手3' }], al: { name: '专辑3', picUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' } }
    ]
  };
  
  res.status(200).json({ code: 200, message: '获取成功', data });
});

// 获取歌曲URL接口
app.get('/api/song/url', (req, res) => {
  const { id } = req.query;
  
  // 模拟歌曲URL数据
  const data = { 
    data: [
      { id: id || 1, url: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.mp3' }
    ]
  };
  
  res.status(200).json({ code: 200, message: '获取成功', data });
});

// 获取歌曲歌词接口
app.get('/api/lyric', (req, res) => {
  const { id } = req.query;
  
  // 模拟歌曲歌词数据
  const data = { 
    lrc: { lyric: '[00:00.00]歌曲1\n[00:05.00]歌手1' },
    tlyric: { lyric: '' }
  };
  
  res.status(200).json({ code: 200, message: '获取成功', data });
});

// 查看歌曲是否可用接口
app.get('/api/check/music', (req, res) => {
  const { id } = req.query;
  
  // 模拟歌曲检查数据
  const data = { 
    success: true,
    message: '歌曲可用'
  };
  
  res.status(200).json({ code: 200, message: '获取成功', data });
});

// 收藏歌曲接口
app.post('/api/like/music', authenticateToken, (req, res) => {
  const { id, like } = req.body;
  const userId = req.user.userId;
  
  if (like) {
    // 添加收藏
    const insertSql = 'INSERT INTO user_favorites (user_id, song_id) VALUES (?, ?)';
    db.run(insertSql, [userId, id], (err) => {
      if (err) {
        return res.status(500).json({ code: 500, message: '收藏失败' });
      }
      
      res.status(200).json({ code: 200, message: '收藏成功' });
    });
  } else {
    // 取消收藏
    const deleteSql = 'DELETE FROM user_favorites WHERE user_id = ? AND song_id = ?';
    db.run(deleteSql, [userId, id], (err) => {
      if (err) {
        return res.status(500).json({ code: 500, message: '取消收藏失败' });
      }
      
      res.status(200).json({ code: 200, message: '取消收藏成功' });
    });
  }
});

// 获取用户收藏的歌曲接口
app.get('/api/like/music/list', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  
  // 获取用户收藏的歌曲
  const sql = `
    SELECT s.* 
    FROM songs s 
    JOIN user_favorites uf ON s.id = uf.song_id 
    WHERE uf.user_id = ?
  `;
  
  db.all(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ code: 500, message: '获取收藏列表失败' });
    }
    
    // 模拟返回数据格式
    const data = { 
      ids: results.map(song => song.id),
      songs: results.map(song => ({
        id: song.id,
        name: song.name,
        ar: [{ name: song.artist }],
        al: { name: song.album, picUrl: song.cover_img_url || 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' }
      }))
    };
    
    res.status(200).json({ code: 200, message: '获取收藏列表成功', data });
  });
});

// 搜索接口
app.get('/api/search', (req, res) => {
  const { keywords, type } = req.query;
  
  // 模拟搜索结果
  const result = { 
    result: { 
      songs: [
        { id: 1, name: '搜索歌曲1', ar: [{ name: '歌手1' }], al: { name: '专辑1', picUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' } },
        { id: 2, name: '搜索歌曲2', ar: [{ name: '歌手2' }], al: { name: '专辑2', picUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' } }
      ]
    }
  };
  
  res.status(200).json({ code: 200, message: '获取成功', ...result });
});

// 热搜列表接口
app.get('/api/search/hot/detail', (req, res) => {
  // 模拟热搜列表数据
  const data = { 
    data: [
      { searchWord: '热门搜索1', content: '热门搜索1' },
      { searchWord: '热门搜索2', content: '热门搜索2' },
      { searchWord: '热门搜索3', content: '热门搜索3' }
    ]
  };
  
  res.status(200).json({ code: 200, message: '获取成功', data });
});

// 默认搜索关键词接口
app.get('/api/search/default', (req, res) => {
  // 模拟默认搜索关键词数据
  const data = { 
    data: { showKeyword: '默认搜索关键词' }
  };
  
  res.status(200).json({ code: 200, message: '获取成功', data });
});

// 搜索建议接口
app.get('/api/search/suggest', (req, res) => {
  const { keywords } = req.query;
  
  // 模拟搜索建议数据
  const result = { 
    result: { 
      songs: [
        { name: '搜索建议1', artists: [{ name: '歌手1' }] },
        { name: '搜索建议2', artists: [{ name: '歌手2' }] }
      ]
    }
  };
  
  res.status(200).json({ code: 200, message: '获取成功', ...result });
});

// 用户动态接口
app.get('/api/user/event', (req, res) => {
  const { uid } = req.query;
  // 返回模拟的用户动态数据
  res.status(200).json({ 
    code: 200, 
    message: '获取成功', 
    events: [
      { id: 1, time: Date.now(), type: 1, msg: '用户分享了一首歌曲' },
      { id: 2, time: Date.now() - 3600000, type: 2, msg: '用户收藏了一张专辑' },
      { id: 3, time: Date.now() - 7200000, type: 3, msg: '用户创建了一个歌单' }
    ] 
  });
});

// 用户歌单接口
app.get('/api/user/playlist', (req, res) => {
  const { uid } = req.query;
  // 返回模拟的用户歌单数据
  res.status(200).json({
    code: 200,
    message: '获取成功',
    playlists: []
  });
});

// 获取用户信息
app.get('/api/user/info', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  const sql = 'SELECT * FROM users WHERE id = ?';
  db.get(sql, [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ code: 500, message: '服务器错误' });
    }
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    
    // 移除敏感信息
    delete user.password;
    res.status(200).json({ code: 200, message: '获取成功', user });
  });
});

// 更新用户信息
app.put('/api/user/info', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { nickname, avatar, gender, birthday, signature, email, wechat } = req.body;
  
  const sql = 'UPDATE users SET nickname = ?, avatar = ?, gender = ?, birthday = ?, signature = ?, email = ?, wechat = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  db.run(sql, [nickname, avatar, gender, birthday, signature, email, wechat, userId], (err) => {
    if (err) {
      return res.status(500).json({ code: 500, message: '服务器错误' });
    }
    res.status(200).json({ code: 200, message: '更新成功' });
  });
});

// 修改密码
app.put('/api/user/password', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;
  
  // 验证旧密码
  const sql = 'SELECT password FROM users WHERE id = ?';
  db.get(sql, [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ code: 500, message: '服务器错误' });
    }
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    
    // 检查旧密码是否正确
    bcrypt.compare(oldPassword, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ code: 500, message: '服务器错误' });
      }
      if (!isMatch) {
        return res.status(400).json({ code: 400, message: '旧密码错误' });
      }
      
      // 加密新密码
      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ code: 500, message: '服务器错误' });
        }
        
        // 更新密码
        const updateSql = 'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        db.run(updateSql, [hashedPassword, userId], (err) => {
          if (err) {
            return res.status(500).json({ code: 500, message: '服务器错误' });
          }
          res.status(200).json({ code: 200, message: '密码修改成功' });
        });
      });
    });
  });
});

// 检测密码安全性
app.post('/api/user/check-password', (req, res) => {
  const { password } = req.body;
  let strength = 0;
  let message = '';
  
  // 密码长度检查
  if (password.length >= 8) strength += 1;
  // 包含数字检查
  if (/\d/.test(password)) strength += 1;
  // 包含字母检查
  if (/[a-zA-Z]/.test(password)) strength += 1;
  // 包含特殊字符检查
  if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
  
  if (strength <= 1) {
    message = '密码强度：弱';
  } else if (strength === 2) {
    message = '密码强度：中';
  } else if (strength >= 3) {
    message = '密码强度：强';
  }
  
  res.status(200).json({ code: 200, message, strength });
});

// AI智能推荐昵称
app.get('/api/user/recommend-nickname', (req, res) => {
  const nicknames = [
    '音乐爱好者', '旋律使者', '节奏大师', '音浪先锋', '乐符精灵',
    '星空舞者', '月光歌手', '阳光音乐人', '梦幻乐手', '激情鼓手',
    '优雅钢琴家', '摇滚青年', '古典爱好者', '流行达人', '爵士迷'
  ];
  // 随机推荐3个昵称
  const recommended = [];
  const usedIndices = new Set();
  while (recommended.length < 3 && recommended.length < nicknames.length) {
    const index = Math.floor(Math.random() * nicknames.length);
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      recommended.push(nicknames[index]);
    }
  }
  res.status(200).json({ code: 200, message: '获取成功', nicknames: recommended });
});

// 获取积分记录
app.get('/api/points', authenticateToken, (req, res) => {
  const userId = req.user.id;
  // 返回模拟的积分记录
  res.status(200).json({ code: 200, message: '获取成功', points: req.user.points, records: [] });
});

// 获取奖品列表
app.get('/api/prizes', authenticateToken, (req, res) => {
  const sql = 'SELECT * FROM prizes ORDER BY required_level DESC';
  db.all(sql, [], (err, prizes) => {
    if (err) {
      return res.status(500).json({ code: 500, message: '服务器错误' });
    }
    res.status(200).json({ code: 200, message: '获取成功', prizes });
  });
});

// 获取用户已获得奖品
app.get('/api/user/prizes', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT p.*, up.obtained_at FROM user_prizes up
    JOIN prizes p ON up.prize_id = p.id
    WHERE up.user_id = ?
  `;
  db.all(sql, [userId], (err, prizes) => {
    if (err) {
      return res.status(500).json({ code: 500, message: '服务器错误' });
    }
    res.status(200).json({ code: 200, message: '获取成功', prizes });
  });
});

// 兑换奖品
app.post('/api/prizes/redeem', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { prizeId } = req.body;
  
  // 检查奖品是否存在
  const checkPrizeSql = 'SELECT * FROM prizes WHERE id = ? AND stock > 0';
  db.get(checkPrizeSql, [prizeId], (err, prize) => {
    if (err) {
      return res.status(500).json({ code: 500, message: '服务器错误' });
    }
    if (!prize) {
      return res.status(400).json({ code: 400, message: '奖品不存在或已售罄' });
    }
    
    // 检查用户等级是否满足
    const checkUserSql = 'SELECT level FROM users WHERE id = ?';
    db.get(checkUserSql, [userId], (err, user) => {
      if (err) {
        return res.status(500).json({ code: 500, message: '服务器错误' });
      }
      if (user.level < prize.required_level) {
        return res.status(400).json({ code: 400, message: '等级不足，无法兑换' });
      }
      
      // 扣减库存
      const updateStockSql = 'UPDATE prizes SET stock = stock - 1 WHERE id = ?';
      db.run(updateStockSql, [prizeId], (err) => {
        if (err) {
          return res.status(500).json({ code: 500, message: '服务器错误' });
        }
        
        // 记录用户奖品
        const insertPrizeSql = 'INSERT INTO user_prizes (user_id, prize_id) VALUES (?, ?)';
        db.run(insertPrizeSql, [userId, prizeId], (err) => {
          if (err) {
            return res.status(500).json({ code: 500, message: '服务器错误' });
          }
          res.status(200).json({ code: 200, message: '兑换成功' });
        });
      });
    });
  });
});

// 会员等级管理
app.get('/api/admin/users', authenticateToken, (req, res) => {
  const sql = 'SELECT id, phone, nickname, level, points FROM users';
  db.all(sql, [], (err, users) => {
    if (err) {
      return res.status(500).json({ code: 500, message: '服务器错误' });
    }
    res.status(200).json({ code: 200, message: '获取成功', users });
  });
});

// 更新会员等级
app.put('/api/admin/users/:id/level', authenticateToken, (req, res) => {
  const userId = req.params.id;
  const { level } = req.body;
  
  const sql = 'UPDATE users SET level = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  db.run(sql, [level, userId], (err) => {
    if (err) {
      return res.status(500).json({ code: 500, message: '服务器错误' });
    }
    res.status(200).json({ code: 200, message: '等级更新成功' });
  });
});

// 奖品管理接口
app.post('/api/admin/prizes', authenticateToken, (req, res) => {
  const { name, description, required_level, stock } = req.body;
  
  const sql = 'INSERT INTO prizes (name, description, required_level, stock) VALUES (?, ?, ?, ?)';
  db.run(sql, [name, description, required_level, stock], (err) => {
    if (err) {
      return res.status(500).json({ code: 500, message: '服务器错误' });
    }
    res.status(200).json({ code: 200, message: '奖品添加成功' });
  });
});

app.put('/api/admin/prizes/:id', authenticateToken, (req, res) => {
  const prizeId = req.params.id;
  const { name, description, required_level, stock } = req.body;
  
  const sql = 'UPDATE prizes SET name = ?, description = ?, required_level = ?, stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  db.run(sql, [name, description, required_level, stock, prizeId], (err) => {
    if (err) {
      return res.status(500).json({ code: 500, message: '服务器错误' });
    }
    res.status(200).json({ code: 200, message: '奖品更新成功' });
  });
});

app.delete('/api/admin/prizes/:id', authenticateToken, (req, res) => {
  const prizeId = req.params.id;
  
  const sql = 'DELETE FROM prizes WHERE id = ?';
  db.run(sql, [prizeId], (err) => {
    if (err) {
      return res.status(500).json({ code: 500, message: '服务器错误' });
    }
    res.status(200).json({ code: 200, message: '奖品删除成功' });
  });
});

// 用户歌单接口（已修复重复定义）
app.get('/api/user/playlist', (req, res) => {
  const { uid } = req.query;
  // 返回模拟的用户歌单数据
  res.status(200).json({ 
      code: 200, 
      message: '获取成功', 
    playlist: [
      { id: 1, name: '我喜欢的音乐', trackCount: 100, coverImgUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' },
      { id: 2, name: '我的私人FM', trackCount: 50, coverImgUrl: 'https://p2.music.126.net/07e8Z1e7-6e2u8e8e2u8e2u8e8e2u8e2u8e8e2u8e.jpg' },
      { id: 3, name: '每日推荐', trackCount: 30, coverImgUrl: 'https://p2.music.126.net/1234567890abcdefghijklmnopqrstuvwxyz1234.jpg' }
    ] 
  });
});

// 电台页面的轮播图
app.get('/api/dj/banner', (req, res) => {
  // 返回模拟的电台轮播图数据
  res.status(200).json({ 
    code: 200, 
    message: '获取成功', 
    banners: [
      { id: 1, imageUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', targetId: 1, targetType: 1004 },
      { id: 2, imageUrl: 'https://p2.music.126.net/07e8Z1e7-6e2u8e8e2u8e2u8e8e2u8e2u8e8e2u8e.jpg', targetId: 2, targetType: 1004 },
      { id: 3, imageUrl: 'https://p2.music.126.net/1234567890abcdefghijklmnopqrstuvwxyz1234.jpg', targetId: 3, targetType: 1004 }
    ] 
  });
});

// 用户订阅的电台接口
app.get('/api/dj/sublist', (req, res) => {
  // 返回模拟的用户订阅的电台数据
  res.status(200).json({ 
    code: 200, 
    message: '获取成功', 
    djRadios: [
      { id: 1, name: '模拟电台1', dj: { nickname: '电台主播1' }, picUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' },
      { id: 2, name: '模拟电台2', dj: { nickname: '电台主播2' }, picUrl: 'https://p2.music.126.net/07e8Z1e7-6e2u8e8e2u8e2u8e8e2u8e2u8e8e2u8e.jpg' },
      { id: 3, name: '模拟电台3', dj: { nickname: '电台主播3' }, picUrl: 'https://p2.music.126.net/1234567890abcdefghijklmnopqrstuvwxyz1234.jpg' }
    ] 
  });
});

// 用户听歌记录接口
app.get('/api/user/record', (req, res) => {
  const { uid } = req.query;
  // 返回模拟的用户听歌记录数据
  res.status(200).json({ 
    code: 200, 
    message: '获取成功', 
    weekData: [
      { song: { name: '歌曲1' }, playCount: 100 },
      { song: { name: '歌曲2' }, playCount: 80 },
      { song: { name: '歌曲3' }, playCount: 50 }
    ],
    allData: [
      { song: { name: '歌曲A' }, playCount: 1000 },
      { song: { name: '歌曲B' }, playCount: 800 },
      { song: { name: '歌曲C' }, playCount: 500 }
    ]
  });
});

app.listen(port, () => {
  console.log(`后端服务运行在 http://localhost:${port}`);
});