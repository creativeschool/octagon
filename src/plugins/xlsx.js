import XLSX from 'xlsx'
import { isRawUser, isRawCourse } from './ajv'
import { connection } from '@/db'

const { randomBytes, pbkdf2Sync } = require('crypto')
const cryptoRandomString = require('crypto-random-string')

export const xlsxFilters = [{ name: '表格文件', extensions: ['xlsx'] }]

export const parseUserImport = (path, meta) => {
  const book = XLSX.readFile(path)
  const sheet = book.Sheets[book.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json(sheet)
  const data = []
  const now = +new Date()
  for (const row of raw) {
    if (isRawUser(row)) {
      const pass = cryptoRandomString({ length: 10 })
      const salt = randomBytes(16).toString('hex')
      const hash = pbkdf2Sync(pass, salt, 1000, 64, 'sha512').toString('hex')
      data.push({
        obj: {
          name: row.姓名,
          login: row.登录号,
          email: row.邮箱,
          tags: row.标签.split(',').map(x => x.trim()).filter(x => x.length),
          hash,
          salt,
          created: now,
          updated: now,
          meta
        },
        pass,
        row: row.__rowNum__,
        success: true
      })
    } else {
      data.push({
        obj: {},
        row: row.__rowNum__,
        success: false,
        comment: '不合法的格式'
      })
    }
  }
  console.log(`+${+new Date() - now}ms, ${data.length} rows`)
  return data
}

export const saveUserImport = (path, data) => {
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(data.map(x => ({
    姓名: x.obj.name,
    登录号: x.obj.login,
    邮箱: x.obj.email,
    标签: x.obj.tags.join(', '),
    密码: x.pass,
    解析结果: x.success ? '成功' : '失败',
    备注: x.comment,
    源行标: x.row
  }))), '导出')
  console.log(`Export to ${path}`)
  XLSX.writeFile(book, path)
}

export const parseCourseImport = path => {
  const book = XLSX.readFile(path)
  const sheet = book.Sheets[book.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json(sheet)
  const data = []
  const now = +new Date()
  for (const row of raw) {
    if (isRawCourse(row)) {
      data.push({
        obj: {
          name: row.课程名,
          tags: row.标签.split(',').map(x => x.trim()).filter(x => x.length),
          created: now,
          updated: now
        },
        row: row.__rowNum__,
        success: true
      })
    } else {
      data.push({
        obj: {},
        row: row.__rowNum__,
        success: false,
        comment: '不合法的格式'
      })
    }
  }
  console.log(`+${+new Date() - now}ms, ${data.length} rows`)
  return data
}

export const saveCourseImport = (path, data) => {
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(data.map(x => ({
    课程名: x.obj.name,
    标签: x.obj.tags.join(', '),
    解析结果: x.success ? '成功' : '失败',
    备注: x.comment,
    源行标: x.row
  }))), '导出')
  console.log(`Export to ${path}`)
  XLSX.writeFile(book, path)
}

export const parseUCmapImport = async (path, present) => {
  const { users, courses } = await connection
  const book = XLSX.readFile(path)
  const sheet = book.Sheets[book.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 })
  const userIds = new Map()
  const courseIds = new Map()
  const data = []
  for (const row of raw) {
    if (row.length < 2) continue
    const now = +new Date()
    const login = row[0]
    if (!userIds.has(login)) {
      userIds.set(login, await users.findOne({ login }))
    }
    const user = userIds.get(login)._id
    for (let i = 1; i < row.length; i++) {
      const name = row[i]
      if (!courseIds.has(name)) {
        courseIds.set(name, await courses.findOne({ name }))
      }
      const course = courseIds.get(name)._id
      const priv = { scope: '', msg: false }
      switch (present) {
        case '学生': priv.scope = '/' + userIds.get(login).name; break
        case '教师': priv.scope = '/'; priv.msg = true; break
      }
      data.push({ user, course, priv, created: now, updated: now })
    }
  }
  return data
}
