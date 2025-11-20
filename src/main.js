import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import axios from 'axios'
import fastclick from 'fastclick'
import VueLazyload from 'vue-lazyload'
import topTip from '@/components/top-tip'
import smoothscroll from 'smoothscroll-polyfill'
import 'styles/waves.min.css'
import {
  Search,
  ActionSheet,
  Swipe,
  SwipeItem,
  Button,
  Checkbox,
  CheckboxGroup,
  PasswordInput,
  NumberKeyboard,
  PullRefresh,
  Tab,
  Tabs
} from 'vant'
import 'styles/reset.css'
import 'styles/border.css'
import VueAwesomeSwiper from 'vue-awesome-swiper'

// require styles
import 'swiper/dist/css/swiper.css'

// 配置axios默认baseURL
axios.defaults.baseURL = '/api'

// 请求拦截器
axios.interceptors.request.use(config => {
  // 从localStorage获取token
  const token = localStorage.getItem('token')
  // 如果token存在，添加到请求头
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器
axios.interceptors.response.use(response => {
  return response
}, error => {
  // 处理401错误
  if (error.response && error.response.status === 401) {
    // 清除本地存储的token
    localStorage.removeItem('token')
    // 跳转到登录页
    router.push('/login')
  }
  return Promise.reject(error)
})

Vue.use(VueAwesomeSwiper /* { default global options } */)
smoothscroll.polyfill()

fastclick.attach(document.body)
// import ""
Vue.use(Search)
Vue.use(Button)
Vue.use(ActionSheet)
Vue.use(PullRefresh)
Vue.use(Swipe).use(SwipeItem)
Vue.use(Checkbox).use(CheckboxGroup)
Vue.use(PasswordInput).use(NumberKeyboard)
Vue.use(Tab).use(Tabs)

Vue.config.productionTip = false

Vue.use(VueLazyload, {
  preLoad: 1.3,
  error: './assets/load.gif',
  loading: 'https://s2.ax1x.com/2019/09/08/n8qAAS.gif',
  attempt: 5,
  listenEvents: ['scroll', 'wheel', 'mousewheel', 'resize', 'animationend', 'transitionend', 'touchmove']
})

Vue.component('top-tip', topTip)
// eslint-disable-next-line
Vue.prototype.$wave = (Waves)
Vue.prototype.$axios = (axios)
/* eslint-disable no-new */
// eslint-disable-next-line no-unused-vars
var vm = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
window.vm = vm
