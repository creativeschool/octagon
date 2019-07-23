<template>
  <v-layout>
    <v-flex xs12>
      <v-card>
        <v-card-text>
          <strong>说明：</strong><br/>
          请先下载样表，根据样表中的说明生成表格，然后点击导入按钮进行导入。<br/>
          样表中含有示范数据，导入时务必删除。样表中请勿包含无关数据。<br/>
          重新导入后将覆盖原数据。<br/>
          若有需要，请事先备份数据库。<br/>
          确认无误后请点击提交按钮，操作将立即提交至数据库。<br/>
          导入过程中出现关联重复情况将在下面显示。<br/>
        </v-card-text>
        <v-card-text>
          <v-select :items="presents" v-model="present" label="权限预设"/>
        </v-card-text>
        <v-card-actions>
          <v-btn color="success" outlined @click="openUrl('https://github.com/creativeschool/octagon/raw/master/example/%E8%AF%BE%E7%A8%8B%E5%AF%BC%E5%85%A5%E6%A0%B7%E8%A1%A8.xlsx')">下载导入样表</v-btn>
          <v-btn color="primary" outlined @click="loadFile">{{ data.length ? `重新导入` : '导入' }}</v-btn>
          <v-btn color="error" @click="submit">提交</v-btn>
          <v-spacer/>
          <strong>已缓存{{ data.length }}条数据</strong>
        </v-card-actions>
        <v-overlay absolute :value="loading">
          <v-progress-circular indeterminate/>
          操作中
        </v-overlay>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { openUrl, remote, currentWindow } from '@/plugins/electron'
import { bus } from '@/plugins/bus'
import { xlsxFilters, parseUCmapImport } from '@/plugins/xlsx'
import { connection } from '@/db'

export default {
  name: 'ucmapImport',
  data: () => ({
    loading: false,
    data: [],
    present: '学生',
    presents: ['学生', '教师']
  }),
  methods: {
    openUrl,
    loadFile () {
      remote.dialog.showOpenDialog(currentWindow, { filters: xlsxFilters }, paths => {
        if (!paths || !paths.length) return
        this.loading = true
        parseUCmapImport(paths[0], this.present)
          .then(data => {
            this.data = data
          })
          .catch(err => {
            bus.$emit('toast', err.message)
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
    submit () {
      this.loading = true
      connection
        .then(ctx => ctx.ucmap.insertMany(this.data, { ordered: false }))
        .then(result => {
          bus.$emit('toast', `导入成功！共导入${result.insertedCount}个文档`)
        })
        .catch(err => {
          bus.$emit('toast', `导入成功！导入${err.result.nInserted}个文档，${err.writeErrors.length}个重复`)
        })
        .finally(() => {
          this.loading = false
          this.data = []
        })
    }
  },
  created () {
    bus.$emit('title', '课程导入')
  }
}
</script>
