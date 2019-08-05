<template>
  <v-card>
    <v-card-title>编辑用户</v-card-title>
    <v-alert type="error" v-model="showError" dismissible>{{ error }}</v-alert>
    <v-card-text>
      <v-text-field :disabled="loading" v-model="user.name" label="姓名"/>
      <v-text-field :disabled="loading" v-model="user.login" label="登录号"/>
      <v-combobox :disabled="loading" v-model="user.tags" multiple chips label="标签"/>
      <v-text-field :disabled="loading" v-model="password" label="新密码" placeholder="不更改请留空"/>
    </v-card-text>
    <template v-if="user.meta">
      <v-divider/>
      <v-card-text>
        <v-text-field v-model.number="user.meta.stickyLogin" type="number" label="粘滞登录时间(毫秒)"/>
        <v-layout wrap justify-space-around>
          <v-checkbox v-model="user.meta.singleLogin" label="单一登录"/>
          <v-checkbox v-model="user.meta.viewerHighRes" label="阅读器高分辨率"/>
          <v-checkbox v-model="user.meta.viewerOfflineOff" label="禁用离线阅读器"/>
        </v-layout>
        <v-btn text @click="user.meta = { stickyLogin: 7 * 24 * 60 * 60 * 1000, singleLogin: true, viewerHighRes: false, viewerOfflineOff: false }">学生预设</v-btn>
        <v-btn text @click="user.meta = { stickyLogin: 0, singleLogin: false, viewerHighRes: true, viewerOfflineOff: false }">教师预设</v-btn>
      </v-card-text>
    </template>
    <v-card-actions>
      <v-spacer/>
      <v-btn color="error" outlined @click="load" :disabled="loading">重置</v-btn>
      <v-btn color="primary" @click="apply" :loading="loading">更新</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { connection } from '@/db'
import { bus } from '@/plugins/bus'
import { ObjectId } from 'mongodb'
import { pbkdf2Sync } from 'crypto'

export default {
  name: 'courseEdit',
  props: ['id'],
  data: () => ({
    user: {},
    loading: false,
    showError: false,
    error: '',
    password: ''
  }),
  created () {
    this.load()
  },
  methods: {
    async load () {
      try {
        this.loading = true
        const { users } = await connection
        this.user = await users.findOne({ _id: new ObjectId(this.id) })
      } catch (e) {
        this.showError = true
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    async apply () {
      try {
        this.loading = true
        if (this.password) {
          this.user.hash = pbkdf2Sync(this.password, this.user.salt, 1000, 64, 'sha512').toString('hex')
        }
        const { users } = await connection
        await users.save(this.user)
        this.$emit('update')
        bus.$emit('toast', '成功')
      } catch (e) {
        this.showError = true
        this.error = e.message
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
