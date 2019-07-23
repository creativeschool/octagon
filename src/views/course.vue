<template>
  <v-layout wrap align-content-start>
    <v-flex xs12 class="mb-2">
      <v-card>
        <v-card-text>
          <v-simple-table>
            <tbody>
              <tr>
                <td>总数：</td>
                <td>{{ courseCount }}</td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card-text>
        <v-overlay absolute :value="loading">
          <v-progress-circular indeterminate/>
          等待操作
        </v-overlay>
      </v-card>
    </v-flex>
    <v-flex xs12 class="mb-2">
      <v-card>
        <v-card-text>
          <v-layout row justify-start>
            <v-btn color="error" class="ma-2" @click="loadList">查询</v-btn>
            <v-checkbox v-model="filter" label="启用筛选"></v-checkbox>
          </v-layout>
        </v-card-text>
        <v-divider/>
        <v-fade-transition>
          <v-card-text v-show="filter">
            <v-checkbox label="使用Regex" v-model="useRegex"/>
            <v-text-field label="名称" class="ma-2" v-model="filters.name"></v-text-field>
            <v-divider/>
            <v-text-field label="标签" placeholder="tag1,tag2" v-model="filters.tags"></v-text-field>
          </v-card-text>
        </v-fade-transition>
        <v-divider/>
        <v-data-table dense :headers="headers" :items="courses">
          <template v-slot:item.created="{ item }">
            {{ formatDate(item.created) }}
          </template>
          <template v-slot:item.updated="{ item }">
            {{ formatDate(item.updated) }}
          </template>
          <template v-slot:item.tags="{ item }">
            {{ item.tags.join(', ') }}
          </template>
          <template v-slot:item._actions="{ item }">
            <v-btn icon @click="dialogId = item._id, dialog = true">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </v-flex>
    <v-dialog v-model="dialog">
      <course-edit :id="dialogId" v-if="dialog" @update="loadList"/>
    </v-dialog>
  </v-layout>
</template>

<script>
import { connection } from '@/db/index'
import { formatDate } from '@/plugins/formatter'
import { bus } from '@/plugins/bus'
import courseEdit from '@/components/courseedit.vue'

export default {
  name: 'course',
  components: {
    courseEdit
  },
  data: () => ({
    loading: true,
    courseCount: NaN,
    dialog: false,
    dialogId: null,
    courses: [],
    headers: [
      { text: '名称', value: 'name' },
      { text: '创建', value: 'created' },
      { text: '更新', value: 'updated' },
      { text: '标签', value: 'tags', sortable: false },
      { text: '操作', value: '_actions', sortable: false }
    ],
    filter: false,
    useRegex: false,
    filters: {
      name: null,
      login: null,
      email: null,
      tags: null
    }
  }),
  created () {
    bus.$emit('title', '课程查询')
    connection
      .then(ctx => ctx.courses.countDocuments())
      .then(count => {
        this.courseCount = count
      })
      .finally(() => {
        this.loading = false
      })
  },
  methods: {
    loadList () {
      this.loading = true
      const query = {}
      if (this.filter) {
        ['name', 'login', 'email'].forEach(x => {
          if (this.filters[x]) {
            query[x] = { $regex: this.useRegex ? this.filters[x] : escape(this.filters[x]) }
          }
        })
        if (this.filters.tags) {
          query.tags = {
            $all: this.filters.tags.split(',').map(x => x.trim()).filter(x => x.length)
          }
        }
      }
      connection
        .then(ctx => ctx.courses.find(query).toArray())
        .then(arr => { this.courses = arr })
        .finally(() => { this.loading = false })
    },
    formatDate
  }
}
</script>
