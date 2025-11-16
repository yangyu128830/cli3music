<template>
  <div class="change-password-wrapper">
    <general-nav @returnPage="returnPage" class="fixed nav-color">
      <span class="text">修改密码</span>
    </general-nav>
    <div class="container pd23">
      <div class="form-item">
        <div class="label">旧密码</div>
        <input
          type="password"
          class="input"
          v-model="oldPassword"
          placeholder="请输入旧密码"
        >
      </div>

      <div class="form-item">
        <div class="label">新密码</div>
        <input
          type="password"
          class="input"
          v-model="newPassword"
          placeholder="请输入新密码"
          @input="checkPasswordStrength"
        >
        <div class="password-strength" v-if="passwordStrength > 0">
          <div class="strength-bar">
            <div class="strength-level" :class="getStrengthClass()"></div>
          </div>
          <div class="strength-text">{{ passwordStrengthText }}</div>
        </div>
      </div>

      <div class="form-item">
        <div class="label">确认新密码</div>
        <input
          type="password"
          class="input"
          v-model="confirmPassword"
          placeholder="请确认新密码"
        >
      </div>

      <button
        class="submit-btn"
        :disabled="!isFormValid"
        @click="changePassword"
      >
        确认修改
      </button>
    </div>
  </div>
</template>

<script>
import generalNav from 'base/generalNav'
import api from 'api'

export default {
  name: 'change-password',
  components: {
    generalNav
  },
  data () {
    return {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      passwordStrength: 0,
      passwordStrengthText: ''
    }
  },
  computed: {
    isFormValid () {
      return this.oldPassword && this.newPassword && this.confirmPassword && this.newPassword === this.confirmPassword
    }
  },
  methods: {
    returnPage () {
      this.$router.go(-1)
    },
    checkPasswordStrength () {
      api.checkPassword(this.newPassword).then(res => {
        if (res.code === 200) {
          this.passwordStrength = res.strength
          this.passwordStrengthText = res.message
        }
      })
    },
    getStrengthClass () {
      if (this.passwordStrength <= 1) {
        return 'weak'
      } else if (this.passwordStrength === 2) {
        return 'medium'
      } else {
        return 'strong'
      }
    },
    changePassword () {
      if (!this.isFormValid) return

      api.changePassword(this.oldPassword, this.newPassword).then(res => {
        if (res.code === 200) {
          this.$toast.success('密码修改成功')
          this.$router.go(-1)
        } else {
          this.$toast.fail(res.message)
        }
      })
    }
  }
}
</script>

<style lang="less">
.change-password-wrapper {
  padding-top: 1rem;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.form-item {
  margin-bottom: 0.3rem;

  .label {
    font-size: 0.32rem;
    font-weight: bold;
    margin-bottom: 0.1rem;
  }

  .input {
    width: 100%;
    height: 0.8rem;
    padding: 0 0.2rem;
    border: 1px solid #ddd;
    border-radius: 0.1rem;
    font-size: 0.32rem;
  }

  .password-strength {
    margin-top: 0.1rem;

    .strength-bar {
      width: 100%;
      height: 0.1rem;
      background-color: #f0f0f0;
      border-radius: 0.05rem;
      overflow: hidden;
      margin-bottom: 0.05rem;

      .strength-level {
        height: 100%;
        transition: width 0.3s;

        &.weak {
          width: 33%;
          background-color: #ff4444;
        }

        &.medium {
          width: 66%;
          background-color: #ffbb33;
        }

        &.strong {
          width: 100%;
          background-color: #00c851;
        }
      }
    }

    .strength-text {
      font-size: 0.24rem;
      color: #666;
    }
  }
}

.submit-btn {
  width: 100%;
  height: 0.8rem;
  background-color: #ff6600;
  color: #fff;
  border: none;
  border-radius: 0.1rem;
  font-size: 0.36rem;
  cursor: pointer;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
}
</style>
