const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

// 暂时使用模拟数据，不连接数据库
const db = null;
console.log('暂时使用模拟数据，不连接数据库');

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// JWT密钥
const secretKey = 'your_secret_key'; // 请修改为安全的密钥

// 注册接口
app.post('/api/register', (req, res) => {
  const { captcha, phone, password, nickname } = req.body;
  
  // 简单的验证码验证
  if (captcha !== '1234') {
    return res.status(400).json({ code: 400, message: '验证码错误' });
  }
  
  // 模拟用户创建
  const mockUserId = Date.now();
  
  // 生成JWT令牌
  const token = jwt.sign({ userId: mockUserId }, secretKey, { expiresIn: '1h' });
  
  res.status(200).json({ 
    code: 200, 
    message: '注册成功', 
    data: { 
      token, 
      user: { id: mockUserId, phone, nickname } 
    } 
  });
});

// 登录接口
app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  
  // 模拟登录验证
  if (phone && password) {
    const mockUserId = Date.now();
    
    // 生成JWT令牌
    const token = jwt.sign({ userId: mockUserId }, secretKey, { expiresIn: '1h' });
    
    res.status(200).json({ 
      code: 200, 
      message: '登录成功', 
      data: { 
        token, 
        user: { id: mockUserId, phone, nickname: '模拟用户' } 
      } 
    });
  } else {
    res.status(400).json({ code: 400, message: '用户名或密码错误' });
  }
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
  
  // 模拟发送验证码
  res.status(200).json({ code: 200, message: '验证码发送成功', captcha: '1234' });
});

// 手机号登录接口
app.get('/api/login/cellphone', (req, res) => {
  const { phone, password } = req.query;
  
  // 模拟手机号登录
  const mockUserId = Date.now();
  const token = jwt.sign({ userId: mockUserId }, secretKey, { expiresIn: '1h' });
  
  res.status(200).json({ 
    code: 200, 
    message: '登录成功', 
    profile: { id: mockUserId, nickname: '模拟用户', phone },
    token
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

app.listen(port, () => {
  console.log(`后端服务运行在 http://localhost:${port}`);
});