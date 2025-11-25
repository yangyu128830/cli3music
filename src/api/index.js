import axios from 'axios'

import {
  albumCollec,
  bannerSwiper,
  recSongList,
  highquality,
  recSongs,
  topList,
  dateRecSongList,
  newDish,
  phoneLogin,
  albumDetail,
  sendVerify,
  verify,
  phoneRegistered,
  loginStatus,
  userRecord,
  userInfo,
  playlist,
  userDj,
  hotSearchList,
  search,
  defaultSearch,
  suggestSearch,
  songUrl,
  checkSong,
  songLyric,
  idxList,
  addOrDeletePlaylist,
  addPlaylist,
  deletePlaylist,
  heartMode,
  favoriteAlbums,
  favoriteArtists,
  favoriteVideos,
  djSublist,
  newSongs,
  getDishInfo,
  personalFm,
  singerClass,
  logout,
  radioRecommendations,
  boutiqueRecommendations,
  djClassification,
  djClassificationInfo,
  djProgram,
  djDetail,
  djPayGift,
  djSub,
  djBanner,
  djToplist,
  djHotToplist,
  likeMusicList,
  likeMusic,
  userDetail,
  signIn,
  friend,
  getVideoTag,
  getVideoGroup,
  commentPlaylist,
  commentLike,
  commentAlbum,
  userEvent,
  pushOrDeleteCom,
  getVideoUrl,
  register,
  commentDj,
  getVideoDetail,
  getVideoRelated,
  getVideoComments,
  resourceLike,
  getUserInfo,
  updateUserInfo,
  changePassword,
  checkPassword,
  recommendNickname,
  getPoints,
  getPrizes,
  getUserPrizes,
  redeemPrize
} from './config'

axios.defaults.withCredentials = true

// 添加请求拦截器
axios.interceptors.request.use(
  config => {
    // 从localStorage中获取token
    const token = localStorage.getItem('token')
    // 如果token存在，则将其添加到请求头中
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 添加响应拦截器
axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    // 对响应错误做点什么
    if (error.response && error.response.status === 401) {
      // 如果token过期或无效，清除token并跳转到登录页面
      localStorage.removeItem('token')
      localStorage.removeItem('loginState')
      localStorage.removeItem('accountUid')
      window.location.href = '/loginIndex'
    }
    return Promise.reject(error)
  }
)

export default {
  /**
   * 请求发现页面首页轮播图
   */
  bannerSwiperFn () {
    return axios.get(bannerSwiper)
  },
  /**
   * 调用此接口 , 可获得每日推荐歌曲 ( 需要登录 )
   */
  recSongsFn () {
    return axios.get(recSongs)
  },
  /**
   * 调用此接口 , 传入歌单 id, 可以获取对应歌单内的所有的音乐
   * @param {*} id 歌单 id
   * @param {*} s 歌单最近的 s 个收藏者,默认5个
   */
  albumDetailFn (id, s = 5) {
    return axios.get(albumDetail, {
      params: {
        id,
        s
      }
    })
  },
  /**
   * 调用此接口,可获取所有榜单内容摘要
   */
  topListFn () {
    return axios.get(topList)
  },
  /**
   * 请求 可获取推荐歌单
   * ?limit=10&order=hot
   * @param {*} limit 取出数量，默认是30
   * @param {*} order 分别对应最新和最热,可选值为 'new' 和 'hot'
   * @param {*} cat tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为 "全部",
   *  :( 页数 -1)*30, 其中 30 为 limit 的值 , 默认 为 0
   */
  recSongListFn (limit = 30, order = 'hot') {
    return axios.get(recSongList, {
      params: {
        limit,
        order
      }
    })
  },
  /**
   * 获取精品歌单
   * @param {*} limit 取出歌单数量 , 默认为 30
   * @param {*} before 分页参数,取上一页最后一个歌单的 updateTime 获取下一页数据
   * @param {*} cat cat: tag
   */
  highqualityFn (limit = 30, before, cat) {
    return axios.get(highquality, {
      params: {
        limit,
        before,
        cat
      }
    })
  },
  /**
   * 调用此接口 , 传入数字 idx, 可获取不同排行榜
   * @param {*} idx 排行榜 idx
   */
  idxListFn (idx) {
    return axios.get(idxList, {
      params: {
        idx
      }
    })
  },
  /**
   * 可获得每日推荐歌单 ( 需要登录 )
   */
  dateRecSongListFn () {
    return axios.get(dateRecSongList)
  },
  /**
   * 调用此接口 , 可获取新碟上架列表
   */
  newDishFn () {
    return axios.get(newDish)
  },
  /**
   * 调用此接口 , 传入专辑 id, 可获得专辑内容
   * @param {*} id 专辑 id
   */
  getDishInfoFn (id) {
    return axios.get(getDishInfo, {
      params: {
        id
      }
    })
  },
  /**
   * 调用此接口 , 可获取新歌速递
   * @param {*} type 地区类型 id,对应以下:
   * 全部:0
   * 华语:7
   * 欧美:96
   * 日本:8
   * 韩国:16
   */
  newSongsFn (type = 0) {
    return axios.get(newSongs, {
      params: {
        type
      }
    })
  },
  /**
   * 调用此接口 , 可获取私人 FM
   */
  personalFmFn () {
    return axios.get(personalFm)
  },
  /**
   * 调用此接口 , 传入歌手 id, 可获得歌手单曲、专辑、MV 信息
   * @param {*} id 歌手 id
   * @param {*} limit 取出数量 , 默认为 30
   */
  singerClassFn (id, limit = 30) {
    return axios.get(singerClass, {
      params: {
        id,
        limit
      }
    })
  },
  /**
   * 手机号登录
   * @param {*} phone 手机号
   * @param {*} password 密码
   */
  phoneLoginFn (phone, password) {
    return axios.get(phoneLogin, {
      params: {
        phone,
        password
      }
    })
  },
  /**
   * 检查手机号是否被注册
   * @param {*} phone 手机号
   */
  phoneRegisteredFn (phone) {
    return axios.get(phoneRegistered, {
      params: {
        phone
      }
    })
  },
  /**
   * 发送验证码
   * @param {*} phone 手机号
   */
  sendVerifyFn (phone) {
    return axios.get(sendVerify, {
      params: {
        phone
      }
    })
  },
  /**
   * 验证验证码
   * @param {*} phone 手机号
   * @param {*} captcha 验证码
   */
  verifyFn (phone, captcha) {
    return axios.get(verify, {
      params: {
        phone,
        captcha
      }
    })
  },
  /**
   * 获取登录状态
   */
  loginStatusFn () {
    return axios.get(loginStatus)
  },
  /**
   * 退出登录
   */
  logoutFn () {
    return axios.get(logout)
  },
  /**
   * 签到
   */
  signInFn () {
    return axios.get(signIn)
  },
  /**
   * 注册
   * @param {*} phone 手机号
   * @param {*} password 密码
   * @param {*} captcha 验证码
   */
  registerFn (phone, password, captcha) {
    return axios.get(register, {
      params: {
        phone,
        password,
        captcha
      }
    })
  },
  /**
   * 获取用户播放记录
   * @param {*} uid 用户 id
   * @param {*} type 类型: 1 代表最近一周，0 代表所有时间
   */
  userRecordFn (uid, type = 0) {
    return axios.get(userRecord, {
      params: {
        uid,
        type
      }
    })
  },
  /**
   * 获取用户信息
   */
  userInfoFn () {
    return axios.get(userInfo)
  },
  /**
   * 获取用户详情
   * @param {*} uid 用户 id
   */
  userDetailFn (uid) {
    return axios.get(userDetail, {
      params: {
        uid
      }
    })
  },
  /**
   * 获取用户动态
   * @param {*} uid 用户 id
   * @param {*} limit 取出数量 , 默认为 30
   * @param {*} lasttime 上次返回的时间戳,默认-1
   */
  userEventFn (uid, limit = 30, lasttime = -1) {
    return axios.get(userEvent, {
      params: {
        uid,
        limit,
        lasttime
      }
    })
  },
  /**
   * 获取用户歌单
   * @param {*} uid 用户 id
   * @param {*} limit 取出数量 , 默认为 30
   */
  playlistFn (uid, limit = 30) {
    return axios.get(playlist, {
      params: {
        uid,
        limit
      }
    })
  },
  /**
   * 获取用户电台
   * @param {*} uid 用户 id
   */
  userDjFn (uid) {
    return axios.get(userDj, {
      params: {
        uid
      }
    })
  },
  /**
   * 获取收藏的专辑
   */
  favoriteAlbumsFn () {
    return axios.get(favoriteAlbums)
  },
  /**
   * 获取收藏的歌手
   */
  favoriteArtistsFn () {
    return axios.get(favoriteArtists)
  },
  /**
   * 获取收藏的视频
   */
  favoriteVideosFn () {
    return axios.get(favoriteVideos)
  },
  /**
   * 获取订阅的电台
   */
  djSublistFn () {
    return axios.get(djSublist)
  },
  /**
   * 获取视频标签导航
   */
  getVideoTagFn () {
    return axios.get(getVideoTag)
  },
  /**
   * 获取对应标签的视频详情
   * @param {*} id 标签 id
   * @param {*} offset 偏移量 , 用于分页
   */
  getVideoGroupFn (id, offset = 0) {
    return axios.get(getVideoGroup, {
      params: {
        id,
        offset
      }
    })
  },
  /**
   * 获取视频播放地址
   * @param {*} id 视频 id
   */
  getVideoUrlFn (id) {
    return axios.get(getVideoUrl, {
      params: {
        id
      }
    })
  },
  /**
   * 获取视频详情
   * @param {*} id 视频 id
   */
  getVideoDetailFn (id) {
    return axios.get(getVideoDetail, {
      params: {
        id
      }
    })
  },
  /**
   * 获取相关视频
   * @param {*} id 视频 id
   */
  getVideoRelatedFn (id) {
    return axios.get(getVideoRelated, {
      params: {
        id
      }
    })
  },
  /**
   * 获取视频评论
   * @param {*} id 视频 id
   * @param {*} limit 取出数量 , 默认为 30
   * @param {*} offset 偏移量 , 用于分页
   */
  getVideoCommentsFn (id, limit = 30, offset = 0) {
    return axios.get(getVideoComments, {
      params: {
        id,
        limit,
        offset
      }
    })
  },
  /**
   * 搜索关键词
   * @param {*} keywords 关键词
   * @param {*} type 搜索类型;
   * 1: 单曲,
   * 10: 专辑,
   * 100: 歌手,
   * 1000: 歌单,
   * 1002: 用户,
   * 1004: MV,
   * 1006: 歌词,
   * 1009: 电台,
   * 1014: 视频,
   * 默认为 1
   * @param {*} limit 取出数量 , 默认为 30
   * @param {*} offset 偏移量 , 用于分页
   */
  searchFn (keywords, type = 1, limit = 30, offset = 0) {
    return axios.get(search, {
      params: {
        keywords,
        type,
        limit,
        offset
      }
    })
  },
  /**
   * 默认搜索关键词
   */
  defaultSearchFn () {
    return axios.get(defaultSearch)
  },
  /**
   * 搜索建议
   * @param {*} keywords 关键词
   */
  suggestSearchFn (keywords) {
    return axios.get(suggestSearch, {
      params: {
        keywords
      }
    })
  },
  /**
   * 热搜列表
   */
  hotSearchListFn () {
    return axios.get(hotSearchList)
  },
  /**
   * 获取朋友页面的动态
   * @param {*} uid 用户 id
   * @param {*} limit 取出数量 , 默认为 30
   * @param {*} lasttime 上次返回的时间戳,默认-1
   */
  friendFn (uid, limit = 30, lasttime = -1) {
    return axios.get(friend, {
      params: {
        uid,
        limit,
        lasttime
      }
    })
  },
  /**
   * 收藏/取消收藏歌单
   * @param {*} id 歌单 id
   * @param {*} t 类型, 1: 收藏, 2: 取消收藏
   */
  addOrDeletePlaylistFn (id, t) {
    return axios.get(addOrDeletePlaylist, {
      params: {
        id,
        t
      }
    })
  },
  /**
   * 添加歌单
   * @param {*} name 歌单名称
   */
  addPlaylistFn (name) {
    return axios.get(addPlaylist, {
      params: {
        name
      }
    })
  },
  /**
   * 删除歌单
   * @param {*} ids 歌单 id, 多个用逗号分隔
   */
  deletePlaylistFn (ids) {
    return axios.get(deletePlaylist, {
      params: {
        ids
      }
    })
  },
  /**
   * 心动模式播放
   * @param {*} id 歌曲 id
   */
  heartModeFn (id) {
    return axios.get(heartMode, {
      params: {
        id
      }
    })
  },
  /**
   * 喜欢歌曲列表
   * @param {*} uid 用户 id
   */
  likeMusicListFn (uid) {
    return axios.get(likeMusicList, {
      params: {
        uid
      }
    })
  },
  /**
   * 喜欢歌曲
   * @param {*} id 歌曲 id
   * @param {*} like 类型, 1: 喜欢, 0: 取消喜欢
   */
  likeMusicFn (id, like) {
    return axios.get(likeMusic, {
      params: {
        id,
        like
      }
    })
  },
  /**
   * 获取电台页面的轮播图
   */
  djBannerFn () {
    return axios.get(djBanner)
  },
  /**
   * 获取电台推荐数据
   */
  radioRecommendationsFn () {
    return axios.get(radioRecommendations)
  },
  /**
   * 获取电台精品推荐
   */
  boutiqueRecommendationsFn () {
    return axios.get(boutiqueRecommendations)
  },
  /**
   * 获取电台分类
   */
  djClassificationFn () {
    return axios.get(djClassification)
  },
  /**
   * 获取电台分类推荐
   * @param {*} type 分类 id
   */
  djClassificationInfoFn (type) {
    return axios.get(djClassificationInfo, {
      params: {
        type
      }
    })
  },
  /**
   * 获取电台节目
   * @param {*} rid 电台 id
   * @param {*} limit 取出数量 , 默认为 30
   * @param {*} offset 偏移量 , 用于分页
   */
  djProgramFn (rid, limit = 30, offset = 0) {
    return axios.get(djProgram, {
      params: {
        rid,
        limit,
        offset
      }
    })
  },
  /**
   * 获取电台详情
   * @param {*} rid 电台 id
   */
  djDetailFn (rid) {
    return axios.get(djDetail, {
      params: {
        rid
      }
    })
  },
  /**
   * 获取电台付费精选
   */
  djPayGiftFn () {
    return axios.get(djPayGift)
  },
  /**
   * 订阅/取消订阅电台
   * @param {*} rid 电台 id
   * @param {*} t 类型, 1: 订阅, 2: 取消订阅
   */
  djSubFn (rid, t) {
    return axios.get(djSub, {
      params: {
        rid,
        t
      }
    })
  },
  /**
   * 获取最热节目
   * @param {*} limit 取出数量 , 默认为 30
   * @param {*} offset 偏移量 , 用于分页
   */
  djToplistFn (limit = 30, offset = 0) {
    return axios.get(djToplist, {
      params: {
        limit,
        offset
      }
    })
  },
  /**
   * 获取电台榜
   * @param {*} limit 取出数量 , 默认为 30
   * @param {*} offset 偏移量 , 用于分页
   */
  djHotToplistFn (limit = 30, offset = 0) {
    return axios.get(djHotToplist, {
      params: {
        limit,
        offset
      }
    })
  },
  /**
   * 获取歌单的评论
   * @param {*} id 歌单 id
   * @param {*} limit 取出数量 , 默认为 30
   * @param {*} offset 偏移量 , 用于分页
   */
  commentPlaylistFn (id, limit = 30, offset = 0) {
    return axios.get(commentPlaylist, {
      params: {
        id,
        limit,
        offset
      }
    })
  },
  /**
   * 获取专辑的评论
   * @param {*} id 专辑 id
   * @param {*} limit 取出数量 , 默认为 30
   * @param {*} offset 偏移量 , 用于分页
   */
  commentAlbumFn (id, limit = 30, offset = 0) {
    return axios.get(commentAlbum, {
      params: {
        id,
        limit,
        offset
      }
    })
  },
  /**
   * 获取电台节目评论
   * @param {*} id 电台节目 id
   * @param {*} limit 取出数量 , 默认为 30
   * @param {*} offset 偏移量 , 用于分页
   */
  commentDjFn (id, limit = 30, offset = 0) {
    return axios.get(commentDj, {
      params: {
        id,
        limit,
        offset
      }
    })
  },
  /**
   * 给评论点赞
   * @param {*} id 评论 id
   * @param {*} cid 评论的 id
   * @param {*} t 类型, 1: 点赞, 0: 取消点赞
   * @param {*} type 资源类型, 0: 歌曲, 1: 歌单, 2: 专辑, 3: 电台, 4: 视频
   */
  commentLikeFn (id, cid, t, type) {
    return axios.get(commentLike, {
      params: {
        id,
        cid,
        t,
        type
      }
    })
  },
  /**
   * 发送删除评论
   * @param {*} id 资源 id
   * @param {*} content 评论内容
   * @param {*} commentId 回复的评论 id
   * @param {*} t 类型, 1: 发送评论, 2: 删除评论
   * @param {*} type 资源类型, 0: 歌曲, 1: 歌单, 2: 专辑, 3: 电台, 4: 视频
   */
  pushOrDeleteComFn (id, content, commentId, t, type) {
    return axios.get(pushOrDeleteCom, {
      params: {
        id,
        content,
        commentId,
        t,
        type
      }
    })
  },
  /**
   * 资源点赞
   * @param {*} id 资源 id
   * @param {*} t 类型, 1: 点赞, 0: 取消点赞
   * @param {*} type 资源类型, 0: 歌曲, 1: 歌单, 2: 专辑, 3: 电台, 4: 视频
   */
  resourceLikeFn (id, t, type) {
    return axios.get(resourceLike, {
      params: {
        id,
        t,
        type
      }
    })
  },
  /**
   * 获取用户信息
   */
  getUserInfoFn () {
    return axios.get(getUserInfo)
  },
  /**
   * 更新用户信息
   * @param {*} data 用户信息
   */
  updateUserInfoFn (data) {
    return axios.put(updateUserInfo, data)
  },
  /**
   * 修改密码
   * @param {*} oldPassword 旧密码
   * @param {*} newPassword 新密码
   */
  changePasswordFn (oldPassword, newPassword) {
    return axios.put(changePassword, {
      oldPassword,
      newPassword
    })
  },
  /**
   * 检测密码安全性
   * @param {*} password 密码
   */
  checkPasswordFn (password) {
    return axios.post(checkPassword, {
      password
    })
  },
  /**
   * AI智能推荐昵称
   */
  recommendNicknameFn () {
    return axios.get(recommendNickname)
  },
  /**
   * 获取积分记录
   * @param {*} limit 取出数量 , 默认为 30
   * @param {*} offset 偏移量 , 用于分页
   */
  getPointsFn (limit = 30, offset = 0) {
    return axios.get(getPoints, {
      params: {
        limit,
        offset
      }
    })
  },
  /**
   * 获取奖品列表
   * @param {*} limit 取出数量 , 默认为 30
   * @param {*} offset 偏移量 , 用于分页
   */
  getPrizesFn (limit = 30, offset = 0) {
    return axios.get(getPrizes, {
      params: {
        limit,
        offset
      }
    })
  },
  /**
   * 获取用户已获得奖品
   * @param {*} limit 取出数量 , 默认为 30
   * @param {*} offset 偏移量 , 用于分页
   */
  getUserPrizesFn (limit = 30, offset = 0) {
    return axios.get(getUserPrizes, {
      params: {
        limit,
        offset
      }
    })
  },
  /**
   * 兑换奖品
   * @param {*} prizeId 奖品 id
   */
  redeemPrizeFn (prizeId) {
    return axios.post(redeemPrize, {
      prizeId
    })
  }
}
