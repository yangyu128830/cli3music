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
`;

db.exec(createTables, (err) => {
  if (err) {
    console.error('创建表失败:', err);
    return;
  }
  console.log('数据库表创建成功');
});

// 中间件
app.use(cors());
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

// 注册接口
app.post('/api/register', (req, res) => {
  const { captcha, phone, password, nickname } = req.body;
  
  // 简单的验证码验证（实际项目中应使用Redis存储验证码）
  if (captcha !== '1234') {
    return res.status(400).json({ code: 400, message: '验证码错误' });
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

// 登录接口
app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  
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
    { id: 1, imageUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', targetId: 1, targetType: 1000 },
    { id: 2, imageUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', targetId: 2, targetType: 1000 },
    { id: 3, imageUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', targetId: 3, targetType: 1000 }
  ];
  
  res.status(200).json({ code: 200, message: '获取成功', banners });
});

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
  const recommends = [
    { id: 1, name: '每日推荐', coverImgUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', playCount: 123456 },
    { id: 2, name: '个性化推荐', coverImgUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg', playCount: 789012 }
  ];
  
  res.status(200).json({ code: 200, message: '获取成功', recommends });
});

// 获取新碟接口
app.get('/api/top/album', (req, res) => {
  // 模拟新碟数据
  const albums = [
    { id: 1, name: '新专辑1', artist: { name: '歌手1' }, picUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' },
    { id: 2, name: '新专辑2', artist: { name: '歌手2' }, picUrl: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' }
  ];
  
  res.status(200).json({ code: 200, message: '获取成功', albums });
});

// 手机号是否被注册接口
app.get('/api/cellphone/existence/check', (req, res) => {
  const { phone } = req.query;
  
  // 模拟手机号检查，这里简单返回未注册
  res.status(200).json({ code: 200, message: '获取成功', exists: false });
});

// 发送验证码接口
app.get('/api/captcha/sent', (req, res) => {
  const { phone } = req.query;
  
  // 生成4位随机验证码
  const captcha = Math.floor(1000 + Math.random() * 9000).toString();
  
  // 存储验证码，有效期5分钟
  captchaStore.set(phone, { captcha, expiresAt: Date.now() + 5 * 60 * 1000 });
  
  // 这里应该调用短信服务API发送验证码，现在只是模拟
  console.log(`向手机号 ${phone} 发送验证码: ${captcha}`);
  
  res.status(200).json({ code: 200, message: '验证码发送成功', captcha });
});

// 验证验证码接口
app.get('/api/captcha/verify', (req, res) => {
  const { phone, captcha } = req.query;
  
  // 检查验证码是否存在
  const stored = captchaStore.get(phone);
  if (!stored) {
    return res.status(400).json({ code: 400, message: '验证码已过期或未发送' });
  }
  
  // 检查验证码是否过期
  if (Date.now() > stored.expiresAt) {
    captchaStore.delete(phone);
    return res.status(400).json({ code: 400, message: '验证码已过期' });
  }
  
  // 检查验证码是否正确
  if (stored.captcha !== captcha) {
    return res.status(400).json({ code: 400, message: '验证码错误' });
  }
  
  // 验证成功后删除验证码
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