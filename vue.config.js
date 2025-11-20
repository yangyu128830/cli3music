const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('styles', resolve('src/assets/styles'))
      .set('mixins', resolve('src/assets'))
      .set('getInfos', resolve('src/getInfos'))
      .set('base', resolve('src/base'))
      .set('api', resolve('src/api'))
      .set('utils', resolve('src/assets/utils'))
  },

  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        timeout: 30000 // 设置代理超时时间为30秒
      }
    },
    timeout: 30000 // 设置服务器超时时间为30秒
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [path.resolve(__dirname, 'src/assets/styles/global.less')]
    }
  }
}
