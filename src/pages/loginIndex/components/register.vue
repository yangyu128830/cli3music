<template>
  <div class="wrapper">
    <div class="title">注册</div>
    <div class="inp border-bottom">
      <input type="text"
             v-model.trim="phone"
             placeholder="请输入手机号"
             @input="onPhoneInput" />
    </div>
    <div class="inp border-bottom">
      <input type="password"
             v-model="password"
             placeholder="请输入密码"
             @input="onPasswordInput" />
    </div>
    <div class="inp border-bottom">
      <input type="password"
             v-model="confirmPassword"
             placeholder="请确认密码"
             @input="onConfirmPasswordInput" />
    </div>
    <div class="inp border-bottom">
      <input type="text"
             v-model="nickname"
             placeholder="请输入昵称"
             @input="onNicknameInput" />
      <button class="recommend-btn" @click="getRecommendNicknames">AI推荐</button>
    </div>
    <div class="nickname-recommendations" v-if="nicknameRecommendations.length > 0">
      <div class="recommendation-item"
           v-for="(item, index) in nicknameRecommendations"
           :key="index"
           @click="selectNickname(item)">
        {{ item }}
      </div>
    </div>
    <login-btn @click.native="register"
               :title="'注册'"
               :disabled="!isFormValid"></login-btn>
    <alert :is-alert="alert"
           :alert="alertText"></alert>
    <div class="login-link">
      <span>已有账号？</span>
      <router-link to="/phone">立即登录</router-link>
    </div>
  </div>
</template>

<script>
import loginBtn from 'base/button'
import alert from 'base/alert'
import api from 'api'

export default {
  name: 'register',
  data () {
    return {
      phone: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      alert: false,
      alertText: '',
      nicknameRecommendations: [],
      timer: null
    }
  },
  components: {
    loginBtn,
    alert
  },
  computed: {
    isFormValid () {
      return this.phone && this.password && this.confirmPassword && this.nickname && this.password === this.confirmPassword
    }
  },
  methods: {
    onPhoneInput () {
      this.clearAlert()
    },
    onPasswordInput () {
      this.clearAlert()
    },
    onConfirmPasswordInput () {
      this.clearAlert()
    },
    onNicknameInput () {
      this.clearAlert()
    },
    clearAlert () {
      this.alert = false
      this.alertText = ''
    },
    alertEvent (message) {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
      this.alert = true
      this.alertText = message
      this.timer = setTimeout(() => {
        this.alert = false
      }, 5000)
    },
    // 获取AI推荐昵称
    getRecommendNicknames () {
      api.recommendNickname().then(res => {
        if (res.code === 200) {
          this.nicknameRecommendations = res.nicknames
        }
      }).catch(err => {
        console.log(err)
      })
    },
    // 选择推荐的昵称
    selectNickname (nickname) {
      this.nickname = nickname
      this.nicknameRecommendations = []
    },
    // 注册
    register () {
      if (!this.isFormValid) return

      // 验证手机号格式
      let exp = /^1[345789]\d{9}$/
      if (!exp.test(this.phone)) {
        this.alertEvent('请输入有效的手机号')
        return
      }

      // 验证密码强度
      api.checkPassword(this.password).then(res => {
        if (res.code === 200) {
          if (res.strength < 2) {
            this.alertEvent('密码强度不足，请使用更强的密码')
            return
          }

          // 调用注册API
          api.register({ phone: this.phone, password: this.password, nickname: this.nickname })
            .then(res => {
              if (res.code === 200) {
                // 注册成功，保存用户信息
                localStorage.setItem('loginState', 1)
                localStorage.setItem('avatarUrl', res.data.user.avatar || '')
                localStorage.setItem('nickname', res.data.user.nickname)
                localStorage.setItem('accountUid', res.data.user.id)
                localStorage.setItem('token', res.data.token)
                this.$store.commit('LOGIN_STATE', 1)
                this.$store.commit('ACCOUNT_UID', res.data.user.id)
                this.$router.push('/home')
              } else {
                this.alertEvent(res.message || '注册失败')
              }
            }).catch(err => {
              this.alertEvent('注册失败，请稍后重试')
            })
        }
      }).catch(err => {
        console.log(err)
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import url("~styles/global.less");

.wrapper {
  box-sizing: border-box;
  padding: 0.23rem;
}

.title {
  font-size: 0.4rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  text-align: center;
}

.inp {
  position: relative;
  margin-bottom: 0.2rem;
  input {
    width: 100%;
    height: 0.8rem;
    font-size: 0.3rem;
    border: none;
    background-color: transparent;
    &:focus {
      outline: none;
    }
  }
}

.recommend-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.1rem 0.2rem;
  font-size: 0.24rem;
  color: #1890ff;
  border: 1px solid #1890ff;
  border-radius: 0.15rem;
  background-color: transparent;
  cursor: pointer;
}

.nickname-recommendations {
  margin: 0.2rem 0;
  padding: 0.1rem;
  background-color: rgba(24, 144, 255, 0.1);
  border-radius: 0.1rem;
}

.recommendation-item {
  padding: 0.1rem 0;
  font-size: 0.28rem;
  color: #333;
  cursor: pointer;
  &:hover {
    color: #1890ff;
  }
}

.login-link {
  margin-top: 0.3rem;
  text-align: center;
  font-size: 0.28rem;
  color: #666;
  router-link {
    color: #1890ff;
    text-decoration: none;
    margin-left: 0.1rem;
  }
}
</style>
