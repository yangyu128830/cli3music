<template>
  <div class="register-wrapper">
    <general-nav @returnPage="returnPage" class="fixed nav-color">
      <span class="text">注册账号</span>
    </general-nav>
    <div class="container pd23">
      <div class="register-form">
        <div class="form-item border-bottom">
          <span class="prefix">+86</span>
          <input type="text" v-model.trim="phone" placeholder="请输入手机号" @input="handlePhoneInput">
          <i v-show="phone && isShowClear1" class="iconfont icon-guanbi" @click="clearPhone"></i>
        </div>

        <div class="form-item border-bottom">
          <input type="text" v-model.trim="code" placeholder="请输入验证码" @input="handleCodeInput">
          <button class="send-code-btn" :disabled="isCodeDisabled" @click="sendCode">
            {{ codeBtnText }}
          </button>
          <i v-show="code && isShowClear2" class="iconfont icon-guanbi" @click="clearCode"></i>
        </div>

        <div class="form-item border-bottom">
          <input type="password" v-model.trim="password" placeholder="请设置密码（6-16位）" @input="handlePasswordInput">
          <i v-show="password && isShowClear3" class="iconfont icon-guanbi" @click="clearPassword"></i>
        </div>

        <div class="form-item border-bottom">
          <input type="password" v-model.trim="confirmPassword" placeholder="请确认密码" @input="handleConfirmPasswordInput">
          <i v-show="confirmPassword && isShowClear4" class="iconfont icon-guanbi" @click="clearConfirmPassword"></i>
        </div>

        <button class="register-btn" :disabled="!isFormValid" @click="register">注册</button>
      </div>
    </div>
    <alert :is-alert="alertVisible" :alert="alertMessage" :type="alertType"></alert>
    <loading :is-loading="loading"></loading>
  </div>
</template>

<script>
import generalNav from 'base/generalNav'
import alert from 'base/alert'
import loading from 'base/loading'
import api from 'api'

export default {
  name: 'register',
  components: {
    generalNav,
    alert,
    loading
  },
  data () {
    return {
      phone: '',
      code: '',
      password: '',
      confirmPassword: '',
      isCodeDisabled: false,
      codeBtnText: '发送验证码',
      codeCountdown: 60,
      isShowClear1: false,
      isShowClear2: false,
      isShowClear3: false,
      isShowClear4: false,
      alertVisible: false,
      alertMessage: '',
      alertType: 'error',
      loading: false,
      flag: true
    }
  },
  computed: {
    isFormValid () {
      const phoneReg = /^1[345789]\d{9}$/
      const passwordReg = /^.{6,16}$/
      const codeReg = /^\d{4}$/
      
      return (
        phoneReg.test(this.phone) &&
        passwordReg.test(this.password) &&
        this.password === this.confirmPassword &&
        codeReg.test(this.code)
      )
    }
  },
  methods: {
    returnPage () {
      this.$router.go(-1)
    },
    handlePhoneInput () {
      this.isShowClear1 = !!this.phone
    },
    handleCodeInput () {
      this.isShowClear2 = !!this.code
    },
    handlePasswordInput () {
      this.isShowClear3 = !!this.password
    },
    handleConfirmPasswordInput () {
      this.isShowClear4 = !!this.confirmPassword
    },
    clearPhone () {
      this.phone = ''
      this.isShowClear1 = false
    },
    clearCode () {
      this.code = ''
      this.isShowClear2 = false
    },
    clearPassword () {
      this.password = ''
      this.isShowClear3 = false
    },
    clearConfirmPassword () {
      this.confirmPassword = ''
      this.isShowClear4 = false
    },
    sendCode () {
      const phoneReg = /^1[345789]\d{9}$/
      if (!phoneReg.test(this.phone)) {
        this.showAlert('请输入有效的手机号码', 'error')
        return
      }

      this.isCodeDisabled = true
      this.codeBtnText = `${this.codeCountdown}秒后重发`
      
      // 发送验证码API请求
      api.sendVerify(this.phone).then(res => {
        if (res.code === 200) {
          this.showAlert('验证码发送成功，请查收', 'success')
          // 开始倒计时
          this.startCountdown()
        } else {
          this.showAlert(res.message || '验证码发送失败', 'error')
          this.resetCodeBtn()
        }
      }).catch(err => {
        console.error('发送验证码失败:', err)
        this.showAlert('验证码发送失败，请重试', 'error')
        this.resetCodeBtn()
      })
    },
    startCountdown () {
      const timer = setInterval(() => {
        this.codeCountdown--
        this.codeBtnText = `${this.codeCountdown}秒后重发`
        
        if (this.codeCountdown <= 0) {
          clearInterval(timer)
          this.resetCodeBtn()
        }
      }, 1000)
    },
    resetCodeBtn () {
      this.isCodeDisabled = false
      this.codeBtnText = '发送验证码'
      this.codeCountdown = 60
    },
    register () {
      if (!this.isFormValid) {
        this.showAlert('请检查表单信息是否正确', 'error')
        return
      }

      if (this.flag) {
        this.flag = false
        this.loading = true
        
        // 注册API请求
        api.register({
          phone: this.phone,
          password: this.password,
          captcha: this.code,
          nickname: '用户' + this.phone.slice(-4)
        }).then(res => {
          if (res.code === 200) {
            this.showAlert('注册成功，正在登录...', 'success')
            
            // 存储登录状态和token
            localStorage.setItem('loginState', 1)
            localStorage.setItem('token', res.data.token)
            
            // 更新Vuex状态
            this.$store.commit('LOGIN_STATE', 1)
            
            // 延迟跳转到首页
            setTimeout(() => {
              this.$router.push('/find')
            }, 1500)
          } else {
            this.showAlert(res.message || '注册失败', 'error')
            this.resetRegisterState()
          }
        }).catch(err => {
          console.error('注册失败:', err)
          this.showAlert('注册失败，请重试', 'error')
          this.resetRegisterState()
        })
      }
    },
    resetRegisterState () {
      this.loading = false
      this.flag = true
    },
    showAlert (message, type = 'error') {
      this.alertMessage = message
      this.alertType = type
      this.alertVisible = true
      
      // 3秒后自动隐藏
      setTimeout(() => {
        this.alertVisible = false
      }, 3000)
    }
  }
}
</script>

<style lang="less" scoped>
@import url("~styles/global.less");

.register-wrapper {
  padding-top: 1rem;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.register-form {
  background-color: #fff;
  border-radius: 0.2rem;
  padding: 0.4rem;
  box-shadow: 0 0.1rem 0.3rem rgba(0, 0, 0, 0.1);
}

.form-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.2rem 0;
  margin-bottom: 0.2rem;

  .prefix {
    font-size: 0.32rem;
    color: #666;
    margin-right: 0.1rem;
  }

  input {
    flex: 1;
    height: 0.6rem;
    padding: 0 0.1rem;
    font-size: 0.32rem;
    border: none;
    outline: none;
    background-color: transparent;
  }

  .send-code-btn {
    font-size: 0.28rem;
    color: @bgcolor;
    padding: 0.1rem 0.2rem;
    border: none;
    background-color: transparent;
    cursor: pointer;
    border-radius: 0.15rem;
    transition: all 0.3s ease;

    &:disabled {
      color: #999;
      cursor: not-allowed;
    }

    &:active:not(:disabled) {
      background-color: rgba(255, 99, 0, 0.1);
    }
  }

  .iconfont {
    font-size: 0.24rem;
    color: #999;
    cursor: pointer;
    padding: 0.05rem;
    border-radius: 50%;
    transition: all 0.3s ease;

    &:hover {
      background-color: #f5f5f5;
    }
  }
}

.register-btn {
  width: 100%;
  height: 0.8rem;
  background-color: @bgcolor;
  color: #fff;
  border: none;
  border-radius: 0.4rem;
  font-size: 0.36rem;
  font-weight: bold;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.4rem;

  &:disabled {
    background-color: #ffcc00;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: translateY(2px);
  }
}
</style>