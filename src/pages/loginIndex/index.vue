<template>
  <div class="wrapper">
    <div class="logo-container">
      <img src="@/assets/logo.png" alt="音乐平台" class="logo">
      <h1 class="title">音乐平台</h1>
    </div>
    <div class="login-buttons">
      <router-link to="phone"
                   tag="button"
                   class="phoneLogin">手机号登陆</router-link>
      <router-link to="register"
                   tag="button"
                   class="registerBtn">注册账号</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'loginPage'
}
</script>

<style lang="less" scoped>
@import url("~styles/global.less");

.wrapper {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, @bgcolor 0%, #ff9a6a 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 1rem;
}

.logo-container {
  text-align: center;
  margin-bottom: 3rem;

  .logo {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 4px solid rgba(255, 255, 255, 0.3);
    margin-bottom: 0.5rem;
    box-shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.2);
  }

  .title {
    color: #fff;
    font-size: 0.5rem;
    font-weight: bold;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    margin: 0;
  }
}

.login-buttons {
  width: 100%;
  max-width: 5.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  .phoneLogin {
    width: 100%;
    height: 0.8rem;
    border-radius: 0.4rem;
    background-color: #fff;
    color: @bgcolor;
    font-weight: 600;
    letter-spacing: 3px;
    border: none;
    font-size: 0.32rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 0.1rem 0.3rem rgba(0, 0, 0, 0.2);

    &:active {
      transform: translateY(2px);
      box-shadow: 0 0 0 rgba(0, 0, 0, 0.2);
    }
  }

  .registerBtn {
    width: 100%;
    height: 0.8rem;
    border-radius: 0.4rem;
    background-color: rgba(255, 255, 255, 0.3);
    color: #fff;
    font-weight: 600;
    letter-spacing: 3px;
    border: 2px solid rgba(255, 255, 255, 0.5);
    font-size: 0.32rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      background-color: rgba(255, 255, 255, 0.4);
      transform: translateY(2px);
    }
  }
}
</style>
