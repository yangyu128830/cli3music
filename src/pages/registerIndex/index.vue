<template>
  <div class="register-container">
    <general-nav />
    <div class="register-content">
      <div class="register-form-wrapper">
        <h2 class="register-title">注册音乐平台</h2>
        <el-form ref="registerForm" :model="registerForm" :rules="registerRules" class="register-form">
          <el-form-item prop="phone">
            <el-input
              v-model="registerForm.phone"
              placeholder="请输入手机号码"
              class="form-input"
              @blur="checkPhoneUnique"
            >
              <template slot="prefix">
                <span class="iconfont icon-phone"></span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              class="form-input"
            >
              <template slot="prefix">
                <span class="iconfont icon-password"></span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              class="form-input"
            >
              <template slot="prefix">
                <span class="iconfont icon-password"></span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="captcha">
            <div class="captcha-wrapper">
              <el-input
                v-model="registerForm.captcha"
                placeholder="请输入验证码"
                class="form-input captcha-input"
              >
                <template slot="prefix">
                  <span class="iconfont icon-code"></span>
                </template>
              </el-input>
              <el-button
                type="primary"
                :disabled="sendBtnDisabled"
                @click="sendCaptcha"
                class="send-captcha-btn"
              >
                {{ sendBtnText }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="submitForm"
              class="register-btn"
              :loading="loading"
            >
              注册
            </el-button>
          </el-form-item>
        </el-form>
        <div class="login-link">
          已有账号？<router-link to="/login">立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import api from '@/api'
import { SET_USER_INFO, LOGIN_STATE } from '@/store/mutation-types'
import generalNav from '@/base/generalNav.vue'

export default {
  name: 'RegisterIndex',
  components: {
    generalNav
  },
  data () {
    return {
      loading: false,
      sendBtnDisabled: false,
      sendBtnText: '发送验证码',
      countdown: 60,
      registerForm: {
        phone: '',
        password: '',
        confirmPassword: '',
        captcha: ''
      },
      registerRules: {
        phone: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.registerForm.password) {
                callback(new Error('两次输入密码不一致'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        captcha: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 4, message: '验证码长度为 4 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    ...mapMutations([SET_USER_INFO, LOGIN_STATE]),
    async sendCaptcha () {
      if (!this.registerForm.phone) {
        this.$message.warning('请先输入手机号码')
        return
      }
      if (!/^1[3-9]\d{9}$/.test(this.registerForm.phone)) {
        this.$message.warning('请输入正确的手机号码')
        return
      }
      try {
        this.sendBtnDisabled = true
        await api.sendVerifyFn(this.registerForm.phone)
        this.$message.success('验证码发送成功')
        this.startCountdown()
      } catch (err) {
        this.$message.error('验证码发送失败: ' + err.message)
        this.sendBtnDisabled = false
      }
    },
    startCountdown () {
      if (this.countdown > 0) {
        this.sendBtnText = `${this.countdown}s后重新发送`
        this.countdown--
        setTimeout(this.startCountdown, 1000)
      } else {
        this.sendBtnText = '发送验证码'
        this.sendBtnDisabled = false
        this.countdown = 60
      }
    },
    async checkPhoneUnique () {
      if (!this.registerForm.phone) return
      try {
        const res = await api.registerFn(this.registerForm.captcha, this.registerForm.phone, this.registerForm.password)
        if (res.code === 200) {
          this.$message.success('注册成功')
          this.LOGIN_STATE(true)
          this.SET_USER_INFO(res.profile)
          this.$router.push('/member-center')
        } else {
          this.$message.error(res.message || '注册失败')
        }
      } catch (err) {
        this.$message.error('注册失败: ' + err.message)
      }
    },
    async submitForm () {
      this.$refs.registerForm.validate(async (valid) => {
        if (valid) {
          this.loading = true
          try {
            const res = await api.registerFn(this.registerForm.captcha, this.registerForm.phone, this.registerForm.password)
            if (res.code === 200) {
              this.$message.success('注册成功')
              this.LOGIN_STATE(true)
              this.SET_USER_INFO(res.profile)
              this.$router.push('/member-center')
            } else {
              this.$message.error(res.message || '注册失败')
            }
          } catch (err) {
            this.$message.error('注册失败: ' + err.message)
          } finally {
            this.loading = false
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.register-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.register-form-wrapper {
  background-color: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.register-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 30px;
  text-align: center;
  color: #333;
}

.register-form {
  margin-bottom: 20px;
}

.form-input {
  width: 100%;
  height: 48px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  padding: 0 15px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.captcha-wrapper {
  display: flex;
  align-items: center;
}

.captcha-input {
  flex: 1;
  margin-right: 10px;
}

.send-captcha-btn {
  width: 120px;
  height: 48px;
  border-radius: 4px;
}

.register-btn {
  width: 100%;
  height: 48px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
}

.login-link {
  text-align: center;
  color: #666;
}

.login-link a {
  color: #409eff;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>