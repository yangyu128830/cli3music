<template>
  <div class="points-management-wrapper">
    <general-nav @returnPage="returnPage" class="fixed nav-color">
      <span class="text">积分管理</span>
    </general-nav>
    <div class="container pd23">
      <div class="points-info">
        <div class="total-points">
          <div class="points-number">{{ totalPoints }}</div>
          <div class="points-text">我的积分</div>
        </div>
        <div class="level-info">
          <div class="level-text">等级：Lv.{{ userLevel }}</div>
          <div class="level-name">{{ getLevelName(totalPoints) }}</div>
        </div>
      </div>

      <div class="points-rule">
        <div class="rule-title">积分规则</div>
        <div class="rule-content">
          <p>1. 每天登录获得5积分</p>
          <p>2. 播放歌曲获得1积分/首</p>
          <p>3. 分享歌曲获得10积分/次</p>
          <p>4. 购买会员获得额外积分</p>
        </div>
      </div>

      <div class="points-record">
        <div class="record-title">积分记录</div>
        <div class="record-list">
          <div class="record-item" v-for="item in pointsRecords" :key="item.id">
            <div class="record-info">
              <div class="record-name">{{ item.name }}</div>
              <div class="record-time">{{ item.time }}</div>
            </div>
            <div class="record-points">+{{ item.points }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import generalNav from 'base/generalNav'
import api from 'api'

export default {
  name: 'points-management',
  components: {
    generalNav
  },
  data () {
    return {
      totalPoints: 0,
      userLevel: 1,
      pointsRecords: []
    }
  },
  mounted () {
    this.getPointsInfo()
  },
  methods: {
    returnPage () {
      this.$router.go(-1)
    },
    getPointsInfo () {
      api.getPoints().then(res => {
        if (res && res.code === 200) {
          this.totalPoints = res.points
          this.pointsRecords = res.records
        }
      }).catch(err => {
        console.error('获取积分信息失败:', err)
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
    }
  }
}
</script>

<style lang="less">
.points-management-wrapper {
  padding-top: 1rem;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.points-info {
  background-color: #fff;
  border-radius: 0.2rem;
  padding: 0.3rem;
  margin-bottom: 0.3rem;
  box-shadow: 0 0 0.1rem rgba(0, 0, 0, 0.1);

  .total-points {
    text-align: center;
    margin-bottom: 0.2rem;

    .points-number {
      font-size: 0.6rem;
      font-weight: bold;
      color: #ff6600;
    }

    .points-text {
      font-size: 0.28rem;
      color: #666;
    }
  }

  .level-info {
    text-align: center;
    font-size: 0.32rem;

    .level-name {
      color: #ff6600;
    }
  }
}

.points-rule {
  background-color: #fff;
  border-radius: 0.2rem;
  padding: 0.3rem;
  margin-bottom: 0.3rem;
  box-shadow: 0 0 0.1rem rgba(0, 0, 0, 0.1);

  .rule-title {
    font-size: 0.36rem;
    font-weight: bold;
    margin-bottom: 0.2rem;
  }

  .rule-content {
    font-size: 0.28rem;
    color: #666;

    p {
      margin-bottom: 0.1rem;
    }
  }
}

.points-record {
  background-color: #fff;
  border-radius: 0.2rem;
  padding: 0.3rem;
  box-shadow: 0 0 0.1rem rgba(0, 0, 0, 0.1);

  .record-title {
    font-size: 0.36rem;
    font-weight: bold;
    margin-bottom: 0.2rem;
  }

  .record-list {
    .record-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.2rem 0;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .record-info {
        .record-name {
          font-size: 0.32rem;
          margin-bottom: 0.05rem;
        }

        .record-time {
          font-size: 0.24rem;
          color: #999;
        }
      }

      .record-points {
        font-size: 0.32rem;
        color: #00b42a;
        font-weight: bold;
      }
    }
  }
}
</style>
