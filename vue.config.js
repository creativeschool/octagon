const os = require('os')
const { DefinePlugin } = require('webpack')
const gitRevision = require('git-revision')
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')

module.exports = {
  configureWebpack: {
    plugins: [
      new VuetifyLoaderPlugin(),
      new DefinePlugin({
        'GIT_HASH': JSON.stringify(gitRevision('short')),
        'GIT_BRANCH': JSON.stringify(gitRevision('branch')),
        'APP_NAME': JSON.stringify('教学资源开放平台管理'),
        'BUILD_DATE': JSON.stringify((new Date()).toLocaleString()),
        'BUILD_MACHINE': JSON.stringify(os.hostname())
      })
    ]
  },
  pluginOptions: {
    electronBuilder: {
      externals: ['mongodb']
    }
  }
}
