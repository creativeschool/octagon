<template>
  <v-card>
    <v-card-title>编辑课程</v-card-title>
    <v-card-text>
      <v-alert type="error" v-model="showError" dismissible>{{ error }}</v-alert>
      <v-text-field :disabled="loading" v-model="course.name" label="课程名"/>
      <v-combobox :disabled="loading" v-model="course.tags" multiple chips label="标签"/>
    </v-card-text>
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

export default {
  name: 'courseEdit',
  props: ['id'],
  data: () => ({
    course: {},
    loading: false,
    showError: false,
    error: ''
  }),
  created () {
    this.load()
  },
  methods: {
    async load () {
      try {
        this.loading = true
        const { courses } = await connection
        this.course = await courses.findOne({ _id: new ObjectId(this.id) })
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
        const { courses } = await connection
        await courses.save(this.course)
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
