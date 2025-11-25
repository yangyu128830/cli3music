<template>
  <div class="member-center-wrapper">
    <general-nav @returnPage="returnPage" class="fixed nav-color">
      <span class="text">会员中心</span>
    </general-nav>
    <div class="container pd23">
      <!-- 用户信息卡片 -->
      <div class="user-info-card">
        <div class="avatar-wrapper">
          <img :src="userInfo.avatar" alt="用户头像" class="avatar">
        </div>
        <div class="user-info">
          <h3 class="nickname">{{ userInfo.nickname }}</h3>
          <div class="level-info">
            <span class="level-tag">Lv.{{ userInfo.level }}</span>
            <span class="points-info">积分：{{ userInfo.points }}</span>
          </div>
          <div class="level-name">
            <span class="name-tag">{{ getLevelName(userInfo.points) }}</span>
          </div>
        </div>
      </div>

      <!-- 功能菜单 -->
      <div class="function-menu">
        <div class="menu-group">
          <div class="menu-item ripple" @click="goToPoints">
            <div class="item-icon">
              <i class="iconfont icon-jifen"></i>
            </div>
            <div class="item-info">
              <span class="item-title">积分管理</span>
              <span class="item-desc">查看积分明细和规则</span>
            </div>
            <i class="iconfont icon-jiantou item-arrow"></i>
          </div>
          <div class="menu-item ripple" @click="goToPrizes">
            <div class="item-icon">
              <i class="iconfont icon-jiangpin"></i>
            </div>
            <div class="item-info">
              <span class="item-title">奖品管理</span>
              <span class="item-desc">兑换精美好礼</span>
            </div>
            <i class="iconfont icon-jiantou item-arrow"></i>
          </div>
          <div class="menu-item ripple" @click="goToEditProfile">
            <div class="item-icon">
              <i class="iconfont icon-gerenxinxi"></i>
            </div>
            <div class="item-info">
              <span class="item-title">个人资料</span>
              <span class="item-desc">完善个人信息</span>
            </div>
            <i class="iconfont icon-jiantou item-arrow"></i>
          </div>
          <div class="menu-item ripple" @click="goToChangePassword">
            <div class="item-icon">
              <i class="iconfont icon-mima"></i>
            </div>
            <div class="item-info">
              <span class="item-title">修改密码</span>
              <span class="item-desc">安全设置</span>
            </div>
            <i class="iconfont icon-jiantou item-arrow"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import generalNav from 'base/generalNav'
import api from 'api'
import { mapGetters } from 'vuex'

export default {
  name: 'member-center',
  components: {
    generalNav
  },
  data () {
    return {
      userInfo: {
        nickname: '未登录',
        avatar: 'http://p1.music.126.net/86ildkNdYbtpJZLyGGsOSg==/109951163982316131.jpg',
        level: 1,
        points: 0
      }
    }
  },
  computed: {
    ...mapGetters({ loginState: 'LOGIN_STATE' })
  },
  mounted () {
    if (this.loginState) {
      this.getUserInfo()
    }
  },
  methods: {
    returnPage () {
      this.$router.go(-1)
    },
    getUserInfo () {
      api.getUserInfo().then(res => {
        if (res.code === 200) {
          this.userInfo = res.user
        }
      }).catch(err => {
        console.error('获取用户信息失败:', err)
      })
    },
    getLevelName (points) {
      if (points >= 90) {
        return '皇冠会员'
      } else if (points >= 80) {
        return '钻石会员'
      } else if (points >= 60) {
        return '黄金会员'
      } else if (points >= 40) {
        return '白银会员'
      } else if (points >= 20) {
        return '青铜会员'
      } else {
        return '新手会员'
      }
    },
    goToPoints () {
      this.$router.push('/points-management')
    },
    goToPrizes () {
      this.$router.push('/prizes-management')
    },
    goToEditProfile () {
      this.$router.push('/edit-profile')
    },
    goToChangePassword () {
      this.$router.push('/change-password')
    }
  }
}
</script>

<style lang="less">
@import url("~styles/global.less");
@import url("//at.alicdn.com/t/font_1322300_t3s39ptd6ao.css");

.member-center-wrapper {
  padding-top: 1rem;
  background-color: #f7f8fa;
  min-height: 100vh;
}

.user-info-card {
  background: linear-gradient(135deg, #dd001b 0%, #ff6a13 100%);
  border-radius: @imgBorderRadius;
  padding: 0.4rem;
  margin-bottom: 0.3rem;
  display: flex;
  align-items: center;
  box-shadow: 0 0.05rem 0.2rem rgba(0, 0, 0, 0.15);
  color: #fff;

  .avatar-wrapper {
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 0.3rem;
    border: 3px solid rgba(255, 255, 255, 0.3);

    .avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .user-info {
    flex: 1;

    .nickname {
      font-size: 0.36rem;
      font-weight: bold;
      margin-bottom: 0.15rem;
    }

    .level-info {
      font-size: 0.26rem;
      margin-bottom: 0.15rem;
      display: flex;
      align-items: center;

      .level-tag {
        background-color: rgba(255, 255, 255, 0.3);
        padding: 0.05rem 0.15rem;
        border-radius: 0.2rem;
        margin-right: 0.2rem;
        font-weight: 500;
      }

      .points-info {
        opacity: 0.9;
      }
    }

    .level-name {
      .name-tag {
        background-color: rgba(255, 255, 255, 0.2);
        padding: 0.03rem 0.12rem;
        border-radius: 0.15rem;
        font-size: 0.22rem;
        font-weight: 500;
      }
    }
  }
}

.function-menu {
  .menu-group {
      background-color: #fff;
      border-radius: @imgBorderRadius;
      box-shadow: 0 0.05rem 0.1rem rgba(0, 0, 0, 0.1);

      .menu-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.3rem;
        border-bottom: 1px solid #f0f0f0;
        position: relative;
        overflow: hidden;
        cursor: pointer;

        &:last-child {
          border-bottom: none;
        }

      .item-icon {
        width: 0.8rem;
        height: 0.8rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 0.3rem;
        background: linear-gradient(135deg, #dd001b 0%, #ff6a13 100%);
        color: #fff;

        .iconfont {
          font-size: 0.4rem;
        }
      }

      .item-info {
        flex: 1;

        .item-title {
          display: block;
          font-size: 0.32rem;
          color: #333;
          margin-bottom: 0.08rem;
          font-weight: 500;
        }

        .item-desc {
          display: block;
          font-size: 0.24rem;
          color: #999;
        }
      }

      .item-arrow {
        font-size: 0.28rem;
        color: #ccc;
      }
    }
  }
}
</style>
