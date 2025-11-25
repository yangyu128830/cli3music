<template>
  <div class="edit-profile-wrapper">
    <general-nav @returnPage="returnPage" class="fixed nav-color">
      <span class="text">编辑个人资料</span>
    </general-nav>
    <div class="container pd23">
      <div class="form-item">
        <div class="label">头像</div>
        <div class="avatar-upload">
          <img :src="userInfo.avatar" alt="用户头像" class="avatar">
          <div class="upload-btn">更换头像</div>
        </div>
      </div>

      <div class="form-item">
        <div class="label">昵称</div>
        <div class="nickname-container">
          <input
            type="text"
            class="input"
            v-model="userInfo.nickname"
            placeholder="请输入昵称"
          >
          <button class="recommend-btn" @click="recommendNickname">推荐</button>
        </div>
        <div class="nickname-recommendations" v-if="nicknameRecommendations.length > 0">
          <div class="recommendation-item" v-for="nickname in nicknameRecommendations" :key="nickname">
            <span @click="selectNickname(nickname)">{{ nickname }}</span>
          </div>
        </div>
      </div>

      <div class="form-item">
        <div class="label">性别</div>
        <div class="gender-select">
          <label class="radio-item">
            <input type="radio" v-model="userInfo.gender" :value="0">
            <span>保密</span>
          </label>
          <label class="radio-item">
            <input type="radio" v-model="userInfo.gender" :value="1">
            <span>男</span>
          </label>
          <label class="radio-item">
            <input type="radio" v-model="userInfo.gender" :value="2">
            <span>女</span>
          </label>
        </div>
      </div>

      <div class="form-item">
        <div class="label">生日</div>
        <input
          type="text"
          class="input"
          v-model="userInfo.birthday"
          placeholder="请输入生日（格式：YYYY-MM-DD）"
        >
      </div>

      <div class="form-item">
        <div class="label">个人签名</div>
        <textarea
          class="textarea"
          v-model="userInfo.signature"
          placeholder="请输入个人签名"
          rows="3"
        ></textarea>
      </div>

      <div class="form-item">
        <div class="label">邮箱</div>
        <input
          type="email"
          class="input"
          v-model="userInfo.email"
          placeholder="请输入邮箱"
        >
      </div>

      <div class="form-item">
        <div class="label">微信</div>
        <input
          type="text"
          class="input"
          v-model="userInfo.wechat"
          placeholder="请输入微信"
        >
      </div>

      <button class="submit-btn" @click="saveProfile">保存修改</button>
    </div>
  </div>
</template>

<script>
import generalNav from 'base/generalNav'
import api from 'api'

export default {
  name: 'edit-profile',
  components: {
    generalNav
  },
  data () {
    return {
      userInfo: {
        nickname: '',
        avatar: '',
        gender: 0,
        birthday: '',
        signature: '',
        email: '',
        wechat: ''
      },
      nicknameRecommendations: []
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
        if (res.code === 200) {
          this.userInfo = res.user
        }
      })
    },
    recommendNickname () {
      api.recommendNickname().then(res => {
        if (res.code === 200) {
          this.nicknameRecommendations = res.nicknames
        }
      })
    },
    selectNickname (nickname) {
      this.userInfo.nickname = nickname
      this.nicknameRecommendations = []
    },
    saveProfile () {
      api.updateUserInfo(this.userInfo).then(res => {
        if (res.code === 200) {
          this.$toast.success('保存成功')
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
.edit-profile-wrapper {
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

  .textarea {
    width: 100%;
    padding: 0.2rem;
    border: 1px solid #ddd;
    border-radius: 0.1rem;
    font-size: 0.32rem;
    resize: none;
  }

  .avatar-upload {
    display: flex;
    align-items: center;

    .avatar {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      margin-right: 0.3rem;
    }

    .upload-btn {
      padding: 0.15rem 0.3rem;
      background-color: #ff6600;
      color: #fff;
      border-radius: 0.1rem;
      font-size: 0.28rem;
      cursor: pointer;
    }
  }

  .nickname-container {
    display: flex;

    .input {
      flex: 1;
      margin-right: 0.2rem;
    }

    .recommend-btn {
      padding: 0 0.3rem;
      background-color: #fff;
      border: 1px solid #ff6600;
      color: #ff6600;
      border-radius: 0.1rem;
      font-size: 0.32rem;
      cursor: pointer;
    }
  }

  .nickname-recommendations {
    margin-top: 0.1rem;

    .recommendation-item {
      display: inline-block;
      padding: 0.05rem 0.15rem;
      margin-right: 0.1rem;
      margin-bottom: 0.1rem;
      background-color: #f0f0f0;
      border-radius: 0.1rem;
      font-size: 0.28rem;
      cursor: pointer;

      &:hover {
        background-color: #ff6600;
        color: #fff;
      }
    }
  }

  .gender-select {
    .radio-item {
      margin-right: 0.3rem;
      font-size: 0.32rem;
      cursor: pointer;

      input {
        margin-right: 0.05rem;
      }
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
}
</style>
