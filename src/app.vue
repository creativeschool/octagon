<template>
  <v-app>
    <system-bar></system-bar>

    <v-app-bar app>
      <v-toolbar-title>{{ appName }}</v-toolbar-title>
      <v-spacer />
      <v-toolbar-items>
        <v-btn text to="/">首页</v-btn>
      </v-toolbar-items>
    </v-app-bar>

    <v-content>
      <v-container fluid fill-height grid-list-md>
        <router-view></router-view>
      </v-container>
    </v-content>

    <v-footer app padless>
      <v-flex text-center xs12>
        Ver {{ build.version }}.{{ build.hash }}-{{ build.branch }}
      </v-flex>
    </v-footer>

    <v-snackbar v-model="snackbar" bottom right :timeout="5000">
      {{ toast }}
      <v-btn text @click="snackbar = false">关闭</v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import { bus } from '@/plugins/bus'
import systemBar from '@/components/systembar'
import { remote } from '@/plugins/electron'
import { version } from '@/../package.json'

/* global APP_NAME, GIT_HASH, GIT_BRANCH */

export default {
  name: 'App',
  components: {
    systemBar
  },
  data: () => ({
    loading: true,
    loggedIn: false,
    loadLog: [],
    toast: '',
    snackbar: false,
    appName: APP_NAME,
    build: {
      version,
      hash: GIT_HASH,
      branch: GIT_BRANCH
    }
  }),
  methods: {
    showToast (text) {
      this.snackbar = true
      this.toast = text
    }
  },
  created () {
    bus.$on('toast', msg => this.showToast(msg))
    bus.$on('error', e => remote.dialog.showErrorBox('出现错误', e.message))
  },
  errorCaptured (err, vm, info) {
    bus.$emit('error', err)
  }
}
</script>
