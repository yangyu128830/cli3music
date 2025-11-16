<template>
  <div class="prizes-management-wrapper">
    <general-nav @returnPage="returnPage" class="fixed nav-color">
      <span class="text">奖品管理</span>
    </general-nav>
    <div class="container pd23">
      <div class="prizes-list">
        <div class="prize-item" v-for="prize in prizes" :key="prize.id">
          <div class="prize-info">
            <div class="prize-name">{{ prize.name }}</div>
            <div class="prize-description">{{ prize.description }}</div>
            <div class="prize-requirement">
              <span class="level-require">等级要求：Lv.{{ prize.required_level }}</span>
              <span class="stock">库存：{{ prize.stock }}</span>
            </div>
          </div>
          <div class="prize-action">
            <button class="redeem-btn" :disabled="parseInt(prize.stock) <= 0" @click="redeemPrize(prize.id)">
              <template v-if="parseInt(prize.stock) <= 0">已售罄</template>
              <template v-else>立即兑换</template>
            </button>
          </div>
        </div>
      </div>

      <div class="my-prizes">
        <div class="section-title">已获得奖品</div>
        <div class="prizes-grid">
          <div class="my-prize-item" v-for="prize in myPrizes" :key="prize.id">
            <div class="prize-name">{{ prize.name }}</div>
            <div class="obtained-time">获得时间：{{ prize.obtained_at }}</div>
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
  name: 'prizes-management',
  components: {
    generalNav
  },
  data () {
    return {
      prizes: [],
      myPrizes: []
    }
  },
  mounted () {
    this.getPrizes()
    this.getMyPrizes()
  },
  methods: {
    returnPage () {
      this.$router.go(-1)
    },
    getPrizes () {
      api.getPrizesFn().then(res => {
        if (res.data.code === 200) {
          this.prizes = res.data.data
        }
      }).catch(err => {
        console.error('获取奖品列表失败:', err)
      })
    },
    getMyPrizes () {
      api.getUserPrizesFn().then(res => {
        if (res.data.code === 200) {
          this.myPrizes = res.data.data
        }
      }).catch(err => {
        console.error('获取已获得奖品失败:', err)
      })
    },
    redeemPrize (prizeId) {
      api.redeemPrizeFn(prizeId).then(res => {
        if (res.data.code === 200) {
          this.$message.success('兑换成功')
          this.getPrizes()
          this.getMyPrizes()
        } else {
          this.$message.error(res.data.message || '兑换失败')
        }
      }).catch(err => {
        console.error('兑换奖品失败:', err)
        this.$message.error('兑换失败，请稍后重试')
      })
    }
  }
}
</script>

<style scoped lang="less">
.prizes-management-wrapper {
  min-height: 100vh;
  background-color: #f5f5f5;

  .prizes-list {
    background-color: #fff;
    border-radius: 0.1rem;
    padding: 0.3rem;
    margin-bottom: 0.3rem;

    .prize-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.2rem 0;
      border-bottom: 1px solid #eee;

      &:last-child {
        border-bottom: none;
      }

      .prize-info {
        flex: 1;

        .prize-name {
          font-size: 0.36rem;
          font-weight: bold;
          margin-bottom: 0.1rem;
        }

        .prize-description {
          font-size: 0.28rem;
          color: #666;
          margin-bottom: 0.1rem;
        }

        .prize-requirement {
          font-size: 0.24rem;
          color: #999;

          .level-require {
            margin-right: 0.3rem;
          }
        }
      }

      .prize-action {
        margin-left: 0.3rem;

        .redeem-btn {
          padding: 0.15rem 0.3rem;
          background-color: #00b42a;
          color: #fff;
          border: none;
          border-radius: 0.05rem;
          font-size: 0.28rem;
          cursor: pointer;

          &:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }
        }
      }
    }
  }

  .my-prizes {
    background-color: #fff;
    border-radius: 0.1rem;
    padding: 0.3rem;

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
  }
}
</style>