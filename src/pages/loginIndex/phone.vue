<template>
  <div class="wrapper">
    <general-nav @returnPage="returnPage" class="fixed nav-color">
      <span class="text">手机号登录</span>
    </general-nav>
    <div class="container pd23">
      <div class="login-form">
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
        <div class="error-message" v-if="errorMsg">{{ errorMsg }}</div>
        <button class="login-btn" @click="handleLogin" :disabled="!canLogin">登录</button>
        <div class="register-link">
          <span>没有账号？</span>
          <router-link to="/register" class="link">立即注册</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import generalNav from 'base/generalNav'
import api from 'api'

export default {
  name: 'phoneLoginPage',
  components: {
    generalNav
  },
  data () {
    return {
      phone: '',
      password: '',
      errorMsg: ''
    }
  },
  computed: {
    canLogin () {
      return this.phone && this.password
    }
  },
  methods: {
    returnPage () {
      this.$router.go(-1)
    },
    handlePhoneInput () {
      // 简单的手机号格式验证
      const phoneRegex = /^1[3456789]\d{9}$/
      if (!phoneRegex.test(this.phone)) {
        this.errorMsg = '请输入正确的手机号'
      } else {
        this.errorMsg = ''
      }
    },
    handleLogin () {
      // 调用登录接口
      api.phoneLoginFn(this.phone, this.password).then(res => {
        if (res && res.code === 200) {
          // 登录成功，存储token并跳转到首页
          localStorage.setItem('token', res.data.token)
          this.$router.push('/')
          this.$toast('登录成功')
        } else {
          this.errorMsg = res.message || '登录失败'
        }
      }).catch(err => {
        console.error('登录失败:', err)
        this.errorMsg = '登录失败'
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

.login-form {
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

.error-message {
  color: #ff3333;
  font-size: 0.28rem;
  margin-bottom: 0.3rem;
  text-align: center;
}

.login-btn {
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

.register-link {
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