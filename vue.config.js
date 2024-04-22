//判断是否为生产环境
const isProd = process.env.NODE_ENV === 'production'

const devServerPort = 8334 // TODO: get this variable from setting.ts

const publicPath = process.env.VUE_APP_PUBLIC_PATH

const mockServer = 'http://127.0.0.1:4523/m1/1378048-0-default/project/'
// const mockServer = 'http://172.17.20.211:25021/project'
// const mockServer = 'http://172.17.20.211:25002/project'
// const mockServer = 'http://172.17.20.211:25003/project'
// const mockServer = ' http://172.25.4.131:25002/project'
// const mockServer = 'http://172.25.4.134:25002/project'

module.exports = {
  publicPath: publicPath,
  lintOnSave: false,
  outputDir: 'dist',
  assetsDir: 'static',
  productionSourceMap: false,
  devServer: {
    port: devServerPort,
    open: false,
    overlay: {
      warnings: false,
      errors: true,
    },
    proxy: {
      [process.env.VUE_APP_BASE_API]: {
        target: mockServer,
        changeOrigin: true, // needed for virtual hosted sites
        ws: true, // proxy websockets
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API]: '',
        },
      },
    },
  },
  css: {
    requireModuleExtension: true,
    loaderOptions: {
      css: {
        modules: {
          localIdentName: '[name]_[hash:base64:8]',
        },
        localsConvention: 'camelCaseOnly',
      },
    },
  },
  pluginOptions: {
    // 'style-resources-loader': {
    //   preProcessor: 'scss',
    //   patterns: [path.resolve(__dirname, 'src/styles/_variables.scss'), path.resolve(__dirname, 'src/styles/_mixins.scss')]
    // }
  },
  configureWebpack(cfg) {
    if (isProd) {
      cfg.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
    }
    cfg.devtool = 'source-map'
  },
  chainWebpack() {},
}
