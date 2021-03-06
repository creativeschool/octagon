<template>
  <v-layout>
    <v-flex xs12>
      <v-card>
        <v-card-text>
          <strong>说明：</strong><br/>
          请先下载样表，根据样表中的说明生成表格，然后点击导入按钮进行导入。<br/>
          样表中含有示范数据，导入时务必删除。样表中请勿包含无关数据。<br/>
          导入过程中，无法导入的行将在下面显示。<br/>
          导入过程中，出现的错误将结果表格中记录。<br/>
          选择导入表格后请等待结果表格保存对话框并检查。<br/>
          重新导入后将覆盖原数据。<br/>
          若有需要，请事先备份数据库。<br/>
          确认无误后请点击提交按钮，操作将立即提交至数据库。<br/>
        </v-card-text>
        <v-divider/>
        <v-card-text>
          <div class="subheader-1">访问控制</div>
          <v-text-field v-model.number="meta.stickyLogin" type="number" label="粘滞登录时间(毫秒)"/>
          <v-layout wrap justify-space-around>
            <v-checkbox v-model="meta.singleLogin" label="单一登录"/>
            <v-checkbox v-model="meta.viewerHighRes" label="阅读器高分辨率"/>
            <v-checkbox v-model="meta.viewerOfflineOff" label="禁用离线阅读器"/>
          </v-layout>
          <v-btn text @click="meta = { stickyLogin: 7 * 24 * 60 * 60 * 1000, singleLogin: true, viewerHighRes: false, viewerOfflineOff: false }">学生预设</v-btn>
          <v-btn text @click="meta = { stickyLogin: 0, singleLogin: false, viewerHighRes: true, viewerOfflineOff: false }">教师预设</v-btn>
        </v-card-text>
        <v-divider/>
        <v-card-actions>
          <v-btn color="success" outlined @click="openUrl('https://github.com/creativeschool/octagon/raw/master/example/%E7%94%A8%E6%88%B7%E5%AF%BC%E5%85%A5%E6%A0%B7%E8%A1%A8.xlsx')">下载导入样表</v-btn>
          <v-btn color="primary" outlined @click="loadFile">{{ data.length ? `重新导入` : '导入' }}</v-btn>
          <v-btn outlined @click="openUrl(store)" :disabled="!store">打开结果文件</v-btn>
          <v-btn color="primary" @click="verify">验证数据冲突</v-btn>
          <v-btn color="error" @click="submit" :disabled="!!errors.length">提交</v-btn>
          <v-spacer/>
          <strong>已缓存{{ data.length }}条数据</strong>
        </v-card-actions>
        <v-simple-table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>冲突登录号</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(e, i) in errors" :key="i">
              <th>{{ e.name }}</th>
              <th>{{ e.login }}</th>
            </tr>
          </tbody>
        </v-simple-table>
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
import { parseUserImport, saveUserImport, xlsxFilters } from '@/plugins/xlsx'
import { connection } from '@/db'
import { bus } from '@/plugins/bus'

export default {
  name: 'userImport',
  data: () => ({
    loading: false,
    data: [],
    errors: [],
    store: null,
    meta: {
      stickyLogin: 0,
      singleLogin: false,
      viewerHighRes: true,
      viewerOfflineOff: true
    }
  }),
  methods: {
    openUrl,
    loadFile () {
      remote.dialog.showOpenDialog(currentWindow, { filters: xlsxFilters }, paths => {
        if (!paths || !paths.length) return
        const data = parseUserImport(paths[0], this.meta)
        remote.dialog.showSaveDialog(currentWindow, { filters: xlsxFilters, defaultPath: paths[0] + '结果.xlsx' }, path => {
          if (!path) return
          saveUserImport(path, data)
          this.store = path
          this.data = data.filter(x => x.success).map(x => x.obj)
        })
      })
    },
    verify () {
      this.errors = []
      this.loading = true
      connection
        .then(ctx => Promise.all(this.data.map(o => ctx.users.findOne({ login: o.login }))))
        .then(exists => {
          for (let i = 0; i < exists.length; i++) {
            if (exists[i]) {
              this.errors.push({ name: this.data[i].name, login: this.data[i].login })
            }
          }
          bus.$emit('toast', `验证成功！发现${this.errors.length}个冲突文档`)
        })
        .finally(() => {
          this.loading = false
        })
    },
    submit () {
      this.loading = true
      connection
        .then(ctx => ctx.users.insertMany(this.data))
        .then(result => {
          console.log(result)
          bus.$emit('toast', `导入成功！共导入${result.insertedCount}个文档`)
        }).finally(() => {
          this.loading = false
          this.data = []
          this.errors = []
          this.store = null
        })
    }
  }
}
</script>
