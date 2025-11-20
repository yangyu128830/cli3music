<template>
  <div class="wrapper">
    <general-nav @returnPage="returnPage" class="fixed nav-color">
      <span class="text">注册账号</span>
    </general-nav>
    <div class="container pd23">
      <div class="register-form">
        <div class="input-group">
          <input 
            type="text" 
            v-model="phone" 
            placeholder="请输入手机号" 
            class="input" 
            @input="handlePhoneInput"
          >
        </div>
        <div class="input-group">
          <input 
            type="password" 
            v-model="password" 
            placeholder="请输入密码" 
            class="input"
          >
        </div>
        <div class="input-group">
          <input 
            type="password" 
            v-model="confirmPassword" 
            placeholder="请确认密码" 
            class="input"
          >
        </div>
        <div class="input-group">
          <input 
            type="text" 
            v-model="nickname" 
            placeholder="请输入昵称" 
            class="input"
          >
        </div>
        <div class="input-group">
          <input 
            type="text" 
            v-model="captcha" 
            placeholder="请输入验证码" 
            class="input captcha-input"
          >
          <button class="captcha-btn" @click="sendCaptcha" :disabled="captchaDisabled">
            {{ captchaText }}
          </button>
        </div>
        <div class="error-message" v-if="errorMsg">{{ errorMsg }}</div>
        <button class="register-btn" @click="handleRegister" :disabled="!canRegister">注册</button>
        <div class="login-link">
          <span>已有账号？</span>
          <router-link to="/login" class="link">立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import generalNav from 'base/generalNav'
import api from 'api'

export default {
  name: 'registerPage',
  components: {
    generalNav
  },
  data () {
    return {
      phone: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      captcha: '',
      errorMsg: '',
      captchaText: '发送验证码',
      captchaDisabled: false,
      captchaCountdown: 0
    }
  },
  computed: {
    canRegister () {
      return this.phone && this.password && this.confirmPassword && this.nickname && this.captcha && !this.errorMsg
    }
  },
  methods: {
    returnPage () {
      this.$router.go(-1)
    },
    validatePhone () {
      // 手机号格式验证
      const phoneRegex = /^1[3456789]\d{9}$/
      if (!phoneRegex.test(this.phone)) {
        this.errorMsg = '请输入正确的手机号'
        return false
      }
      return true
    },
    validatePassword () {
      // 密码强度校验：至少8位，包含字母和数字
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
      if (!passwordRegex.test(this.password)) {
        this.errorMsg = '密码至少8位，包含字母和数字'
        return false
      }
      return true
    },
    validateConfirmPassword () {
      // 确认密码验证
      if (this.password !== this.confirmPassword) {
        this.errorMsg = '两次输入的密码不一致'
        return false
      }
      return true
    },
    validateNickname () {
      // 昵称验证：2-10个字符
      if (this.nickname.length < 2 || this.nickname.length > 10) {
        this.errorMsg = '昵称长度为2-10个字符'
        return false
      }
      return true
    },
    validateCaptcha () {
      // 验证码验证：6位数字
      const captchaRegex = /^\d{6}$/
      if (!captchaRegex.test(this.captcha)) {
        this.errorMsg = '请输入6位数字验证码'
        return false
      }
      return true
    },
    handlePhoneInput () {
      this.validatePhone()
    },
    sendCaptcha () {
      const phoneRegex = /^1[3456789]\d{9}$/
      if (!phoneRegex.test(this.phone)) {
        this.errorMsg = '请输入正确的手机号'
        return
      }
      
      this.captchaDisabled = true
      this.captchaCountdown = 60
      this.captchaText = `${this.captchaCountdown}s后重新发送`
      
      // 调用发送验证码接口
      api.sendVerify(this.phone).then(res => {
        if (res && res.code === 200) {
          // 验证码发送成功
        } else {
          this.errorMsg = '验证码发送失败'
          this.resetCaptchaTimer()
        }
      }).catch(err => {
        console.error('发送验证码失败:', err)
        this.errorMsg = '验证码发送失败'
        this.resetCaptchaTimer()
      })
      
      // 启动倒计时
      const timer = setInterval(() => {
        this.captchaCountdown--
        this.captchaText = `${this.captchaCountdown}s后重新发送`
        
        if (this.captchaCountdown <= 0) {
          clearInterval(timer)
          this.resetCaptchaTimer()
        }
      }, 1000)
    },
    resetCaptchaTimer () {
      this.captchaDisabled = false
      this.captchaCountdown = 0
      this.captchaText = '发送验证码'
    },
    handleRegister () {
      // 表单验证
      if (!this.validatePhone() || !this.validatePassword() || !this.validateConfirmPassword() || !this.validateNickname() || !this.validateCaptcha()) {
        return
      }
      
      // 调用注册接口
      api.registerFn(this.captcha, this.phone, this.password, this.nickname).then(res => {
        if (res && res.data && res.data.code === 200) {
          // 注册成功，跳转到登录页面
          this.$router.push('/login')
          this.$toast('注册成功')
        } else {
          this.errorMsg = res.data.message || '注册失败'
        }
      }).catch(err => {
        console.error('注册失败:', err)
        this.errorMsg = '注册失败，请稍后重试'
      })
    }
  }
}
</script>

<style lang="less">
@import url("~styles/global.less");

.wrapper {
  padding-top: 1rem;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.register-form {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  background-color: #fff;
  padding: 0.5rem;
  border-radius: 0.2rem;
  box-shadow: 0 0 0.1rem rgba(0, 0, 0, 0.1);
}

.input-group {
  margin-bottom: 0.3rem;
  position: relative;
}

.input {
  width: 100%;
  height: 0.8rem;
  padding: 0 0.2rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.1rem;
  font-size: 0.32rem;
  
  &:focus {
    outline: none;
    border-color: #1db954;
  }
}

.captcha-input {
  width: calc(100% - 2rem);
  float: left;
}

.captcha-btn {
  width: 1.8rem;
  height: 0.8rem;
  margin-left: 0.2rem;
  background-color: #1db954;
  color: #fff;
  border: none;
  border-radius: 0.1rem;
  font-size: 0.28rem;
  cursor: pointer;
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
}

.error-message {
  color: #ff3333;
  font-size: 0.28rem;
  margin-bottom: 0.3rem;
  text-align: center;
}

.register-btn {
  width: 100%;
  height: 0.8rem;
  background-color: #1db954;
  color: #fff;
  border: none;
  border-radius: 0.4rem;
  font-size: 0.36rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 0.3rem;
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
}

.login-link {
  text-align: center;
  font-size: 0.28rem;
  color: #666;
  
  .link {
    color: #1db954;
    text-decoration: none;
    margin-left: 0.1rem;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>