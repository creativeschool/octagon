import Vue from 'vue'
import Router from 'vue-router'
import home from '@/views/home.vue'
import user from '@/views/user.vue'
import userImport from '@/views/userimport.vue'
import course from '@/views/course.vue'
import courseImport from '@/views/courseimport.vue'
import file from '@/views/file.vue'
import ucmap from '@/views/ucmap.vue'
import ucmapImport from '@/views/ucmapimport.vue'

Vue.use(Router)

export default new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: home
    },
    {
      path: '/user',
      component: user
    },
    {
      path: '/user/import',
      component: userImport
    },
    {
      path: '/course',
      component: course
    },
    {
      path: '/course/import',
      component: courseImport
    },
    {
      path: '/file',
      component: file
    },
    {
      path: '/ucmap',
      component: ucmap
    },
    {
      path: '/ucmap/import',
      component: ucmapImport
    }
  ]
})
