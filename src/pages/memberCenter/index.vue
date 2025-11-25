<template>
  <div class="member-center-wrapper">
    <general-nav @returnPage="returnPage" class="fixed nav-color">
      <span class="text">会员中心</span>
    </general-nav>
    <div class="container pd23">
      <div class="member-card">
        <div class="member-info">
          <div class="avatar">
            <img :src="userInfo.avatar" alt="用户头像">
          </div>
          <div class="info">
            <div class="nickname">{{ userInfo.nickname }}</div>
            <div class="level">
              <span class="level-text">等级：Lv.{{ userInfo.level }}</span>
              <span class="points">积分：{{ userInfo.points }}</span>
            </div>
            <div class="level-name">
              <span>{{ getLevelName(userInfo.points) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="member-menu">
        <div class="menu-item ripple" @click="goToPoints">
          <i class="home icon-jifen"></i>
          <span>积分管理</span>
          <i class="home icon-jiantou"></i>
        </div>
        <div class="menu-item ripple" @click="goToPrizes">
          <i class="home icon-jiangpin"></i>
          <span>奖品管理</span>
          <i class="home icon-jiantou"></i>
        </div>
        <div class="menu-item ripple" @click="goToEditProfile">
          <i class="home icon-gerenxinxi"></i>
          <span>个人资料</span>
          <i class="home icon-jiantou"></i>
        </div>
        <div class="menu-item ripple" @click="goToChangePassword">
          <i class="home icon-mima"></i>
          <span>修改密码</span>
          <i class="home icon-jiantou"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import generalNav from 'base/generalNav'
import api from 'api'

export default {
  name: 'member-center',
  components: {
    generalNav
  },
  data () {
    return {
      userInfo: {
        nickname: '',
        avatar: '',
        level: 1,
        points: 0
      }
    }
  },
  mounted () {
    this.getUserInfo()
  },
  methods: {
    returnPage () {
      this.$router.go(-1)
    },
    getUserInfo () {
      api.getUserInfo().then(res => {
        if (res.data && res.data.code === 200) {
          this.userInfo = res.data.data.user
          this.userLevel = this.userInfo.level
          this.userPoints = this.userInfo.points
        } else {
          console.error('获取用户信息失败:', res.data.message)
        }
      }).catch(err => {
        console.error('获取用户信息失败:', err)
      })
    },
    getLevelName (points) {
      if (points >= 90) {
        return '优秀'
      } else if (points >= 80) {
        return '良好'
      } else if (points >= 60) {
        return '一般'
      } else {
        return '较差'
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
  background-color: @bgcolor;
  min-height: 100vh;
}

.member-card {
  background-color: #fff;
  border-radius: 0.2rem;
  padding: 0.3rem;
  margin-bottom: 0.3rem;
  box-shadow: 0 0 0.1rem rgba(0, 0, 0, 0.1);

  .member-info {
    display: flex;
    align-items: center;

    .avatar {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 0.3rem;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .info {
      .nickname {
        font-size: 0.36rem;
        font-weight: bold;
        margin-bottom: 0.1rem;
      }

      .level {
        font-size: 0.28rem;
        color: #666;
        margin-bottom: 0.1rem;

        .level-text {
          margin-right: 0.3rem;
        }
      }

      .level-name {
        font-size: 0.24rem;
        color: @bgcolor;
      }
    }
  }
}

.member-menu {
  background-color: #fff;
  border-radius: 0.2rem;
  box-shadow: 0 0 0.1rem rgba(0, 0, 0, 0.1);

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.3rem;
    border-bottom: 1px solid #f5f5f5;
    position: relative;
    overflow: hidden;

    &:last-child {
      border-bottom: none;
    }

    .home {
      font-size: 0.36rem;
      margin-right: 0.2rem;
      color: @bgcolor;
    }

    span {
      flex: 1;
      font-size: 0.32rem;
    }

    &:active {
      background-color: #f5f5f5;
    }
  }
}
</style>
