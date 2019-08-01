<template>
  <v-card>
    <v-card-title>系统通知({{ notices.length }})</v-card-title>
    <v-card-text v-for="(notice, i) in notices" :key="i">
      <v-card outlined>
        <v-card-text v-html="renderMarkdown(notice.content)"/>
        <v-card-actions>
          <v-chip outlined>
            <v-icon left>mdi-publish</v-icon>
            {{ formatDate(notice.created) }}
          </v-chip>
          <v-chip outlined>
            <v-icon left>mdi-pencil</v-icon>
            {{ formatDate(notice.updated) }}
          </v-chip>
          <v-spacer/>
          <v-btn @click="id = notice._id.toString(); $vuetify.goTo($refs.editor)" outlined color="primary">编辑</v-btn>
        </v-card-actions>
      </v-card>
    </v-card-text>
    <v-card-text ref="editor">
      <v-card outlined>
        <v-card-text>
          <v-text-field v-model="id" label="修改ID，留空新建" readonly clearable/>
          <v-textarea label="内容" v-model="content"/>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn @click="publish" :loading="loading" color="primary">{{ id ? '更新' : '发布' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script>
import { connection } from '@/db'
import { bus } from '@/plugins/bus'
import { formatDate } from '@/plugins/formatter'
import { renderMarkdown } from '@/plugins/marked'
import { ObjectId } from 'mongodb'

export default {
  name: 'notice',
  data: () => ({
    notices: [],
    content: '',
    loading: false,
    id: ''
  }),
  created () {
    this.load()
  },
  methods: {
    load () {
      return connection
        .then(({ notices }) => notices.find().toArray())
        .then(notices => { this.notices = notices })
    },
    publish () {
      this.loading = true
      const now = +new Date()
      let op
      if (this.id) {
        const _id = new ObjectId(this.id)
        op = connection
          .then(({ notices }) => notices.updateOne({ _id }, { $set: { content: this.content, updated: now } }))
          .then(result => bus.$emit('toast', `成功更新${result.modifiedCount}个文档`))
      } else {
        op = connection
          .then(({ notices }) => notices.insertOne({ content: this.content, created: now, updated: now }))
          .then(result => bus.$emit('toast', `成功插入${result.insertedCount}个文档`))
      }
      op
        .then(() => this.load())
        .finally(() => {
          this.loading = false
          this.content = ''
        })
    },
    formatDate,
    renderMarkdown
  }
}
</script>
