<template>
  <div class="prizes-management-wrapper">
    <general-nav @returnPage="returnPage">
      <span class="text">我的奖品</span>
    </general-nav>

    <div class="prizes-content pd23">
      <div class="section-title">已获得的奖品</div>
      <div class="prizes-grid">
        <div class="my-prize-item" v-for="(prize, index) in myPrizes" :key="index">
          <div class="prize-name">{{ prize.name }}</div>
          <div class="obtained-time">获得时间: {{ prize.obtainedTime }}</div>
        </div>
      </div>

      <div class="section-title" style="margin-top: 0.5rem;">兑换记录</div>
      <div class="exchange-history">
        <div class="exchange-item" v-for="(record, index) in exchangeHistory" :key="index">
          <div class="record-info">
            <span class="record-name">{{ record.prizeName }}</span>
            <span class="record-time">{{ record.exchangeTime }}</span>
          </div>
          <div class="record-status">{{ record.status }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import generalNav from 'base/generalNav'
import api from 'api'

export default {
  name: 'prizes-management',
  components: {
    generalNav
  },
  data () {
    return {
      myPrizes: [],
      exchangeHistory: []
    }
  },
  mounted () {
    this.getMyPrizes()
    this.getExchangeHistory()
  },
  methods: {
    returnPage () {
      this.$router.go(-1)
    },
    getMyPrizes () {
      // 调用API获取我的奖品
      api.getUserPrizes().then(res => {
        if (res.data && res.data.code === 200) {
          this.myPrizes = res.data.prizes.map(prize => ({
            name: prize.name,
            obtainedTime: new Date(prize.obtained_at).toLocaleDateString()
          }))
        }
      }).catch(err => {
        console.error('获取我的奖品失败:', err)
      })
    },
    getExchangeHistory () {
      // 调用API获取兑换记录
      api.getExchangeHistory().then(res => {
        if (res.data && res.data.code === 200) {
          this.exchangeHistory = res.data.records.map(record => ({
            prizeName: record.prize_name,
            exchangeTime: new Date(record.exchange_time).toLocaleDateString(),
            status: record.status
          }))
        }
      }).catch(err => {
        console.error('获取兑换记录失败:', err)
      })
    }
  }
}
</script>

<style lang="less">
.prizes-management-wrapper {
  padding-top: 1rem;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.prizes-content {
  .section-title {
    font-size: 0.36rem;
    font-weight: bold;
    margin-bottom: 0.3rem;
  }

  .prizes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(2rem, 1fr));
    grid-gap: 0.2rem;

    .my-prize-item {
      padding: 0.2rem;
      border: 1px solid #eee;
      border-radius: 0.05rem;
      box-shadow: 0 0 0.1rem rgba(0, 0, 0, 0.1);

      .prize-name {
        font-size: 0.32rem;
        font-weight: bold;
        margin-bottom: 0.1rem;
      }

      .obtained-time {
        font-size: 0.24rem;
        color: #999;
      }
    }
  }

  .exchange-history {
    .exchange-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.2rem 0;
      border-bottom: 1px solid #eee;

      .record-info {
        .record-name {
          font-size: 0.3rem;
        }

        .record-time {
          font-size: 0.24rem;
          color: #999;
          margin-left: 0.2rem;
        }
      }

      .record-status {
        font-size: 0.28rem;
        color: #1890ff;
      }
    }
  }
}
</style>
