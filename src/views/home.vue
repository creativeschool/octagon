<template>
  <v-layout wrap align-content-start>
    <v-flex xs12>
      <notice/>
    </v-flex>
    <v-flex xs12>
      <v-card>
        <v-card-text>
          构建时间： {{ build.date }}<br/>
          构建机器： {{ build.machine }}<br/>
        </v-card-text>
      </v-card>
    </v-flex>
    <v-flex xs12>
      <v-card>
        <v-card-text>
          驱动版本： {{ clientInfo.driver }}<br/>
          操作系统： {{ clientInfo.os }}<br/>
          运行平台： {{ clientInfo.platform }}
        </v-card-text>
        <v-overlay absolute :value="loading">
          <v-progress-circular indeterminate/>
          等待数据库连接
        </v-overlay>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { connection } from '@/db/index'
import { bus } from '@/plugins/bus'
import notice from '@/components/notice.vue'

/* global BUILD_DATE, BUILD_MACHINE */

export default {
  name: 'home',
  components: {
    notice
  },
  data: () => ({
    loading: true,
    clientInfo: {},
    build: {
      date: BUILD_DATE,
      machine: BUILD_MACHINE
    }
  }),
  created () {
    bus.$emit('title', '')
    connection.then(ctx => {
      this.loading = false
      this.clientInfo = ctx.db.serverConfig.clientInfo
    }).finally(() => { this.loading = false })
  }
}
</script>
