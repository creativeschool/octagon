<template>
  <v-system-bar app window dark style="-webkit-app-region: drag" :color="errored ? 'error' : ''">
    <v-avatar size="32" class="mr-2">
      <img src="@/../public/icon.png"/>
    </v-avatar>
    <v-menu offset-y>
      <template v-slot:activator="{ on }">
        <v-btn text color="primary" v-on="on" style="-webkit-app-region: no-drag">文件</v-btn>
      </template>
      <v-list dense>
        <v-list-item @click="devTools">
          <v-list-item-title>开发者工具</v-list-item-title>
        </v-list-item>
        <v-list-item @click="restart">
          <v-list-item-title>重启</v-list-item-title>
        </v-list-item>
        <v-list-item @click="close">
          <v-list-item-title>退出</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-menu offset-y>
      <template v-slot:activator="{ on }">
        <v-btn text v-on="on" style="-webkit-app-region: no-drag">用户</v-btn>
      </template>
      <v-list dense>
        <v-list-item to="/user" exact>
          <v-list-item-title>用户查询</v-list-item-title>
        </v-list-item>
        <v-list-item to="/user/import" exact>
          <v-list-item-title>导入用户</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-menu offset-y>
      <template v-slot:activator="{ on }">
        <v-btn text v-on="on" style="-webkit-app-region: no-drag">课程</v-btn>
      </template>
      <v-list dense>
        <v-list-item to="/course" exact>
          <v-list-item-title>课程查询</v-list-item-title>
        </v-list-item>
        <v-list-item to="/course/import" exact>
          <v-list-item-title>导入课程</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-menu offset-y>
      <template v-slot:activator="{ on }">
        <v-btn text v-on="on" style="-webkit-app-region: no-drag">关联</v-btn>
      </template>
      <v-list dense>
        <v-list-item to="/ucmap" exact>
          <v-list-item-title>用户课程关联信息</v-list-item-title>
        </v-list-item>
        <v-list-item to="/ucmap/import" exact>
          <v-list-item-title>导入</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-menu offset-y>
      <template v-slot:activator="{ on }">
        <v-btn text v-on="on" style="-webkit-app-region: no-drag">文件</v-btn>
      </template>
      <v-list dense>
        <v-list-item to="/file" exact>
          <v-list-item-title>文件系统信息</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-menu offset-y>
      <template v-slot:activator="{ on }">
        <v-btn text v-on="on" style="-webkit-app-region: no-drag">帮助</v-btn>
      </template>
      <v-list dense>
        <v-list-item @click="openUrl('https://github.com/creativeschool/octagon')">
          <v-list-item-title>开源项目</v-list-item-title>
        </v-list-item>
        <v-list-item @click="openUrl('https://github.com/creativeschool/octagon/blob/master/LICENSE')">
          <v-list-item-title>开源许可</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-spacer></v-spacer>
    {{title}}{{ title ? ' - ' : '' }}{{ appName }}{{ errored ? '(出现错误)' : '' }}
    <v-spacer></v-spacer>
    <v-icon icon @click="minimize" style="-webkit-app-region: no-drag">mdi-minus</v-icon>
    <v-icon icon @click="maximize" style="-webkit-app-region: no-drag">mdi-plus</v-icon>
    <v-icon icon @click="close" style="-webkit-app-region: no-drag">mdi-close</v-icon>
  </v-system-bar>
</template>

<script>
import { minimize, maximize, close, devTools, restart, openUrl } from '@/plugins/electron'
import { bus } from '@/plugins/bus'

/* global APP_NAME */

export default {
  name: 'systemBar',
  data: () => ({
    title: '',
    errored: false,
    appName: APP_NAME
  }),
  methods: {
    minimize,
    maximize,
    close,
    devTools,
    restart,
    openUrl
  },
  created () {
    bus.$on('title', title => {
      this.title = document.title = title
    })
    bus.$on('error', () => { this.errored = true })
  }
}
</script>
