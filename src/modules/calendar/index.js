const { getCollection } = require('../../db/mongo')
const { renderCalendarImage } = require('./render')

let userHash = {}
let userDelHash = {}

const checkAlias = async (project, groupId) => {
  const cl = await getCollection('cl_calendar_alias')
  const alias = await cl.findOne({ _id: `${groupId}_${project}` })
  return alias && alias.d
}

const strToTs = str => {
  let s = str.trim().replace(/：/g, ':')
  if (s.split('-').length === 2) s = `${new Date().getFullYear()}-${s}`
  if (s.split(':').length === 1) s = `${s} 6:0:0`
  return new Date(s).getTime()
}

const addZero = n => n < 10 ? ('0' + n) : n
const formatTime = ts => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${addZero(d.getMinutes())}:${addZero(d.getSeconds())}`
}

const searchCalendar = async (project, groupId, ctx) => {
  const cl = await getCollection('cl_calendar')
  const data = await cl.find({ project, groupId }).toArray()
  if (data.length > 0) {
    const now = new Date()
    renderCalendarImage(now.getFullYear(), now.getMonth() + 1, ctx, data.map(x => ({
      name: x.activity, start_time: formatTime(x.startTime), end_time: formatTime(x.endTime)
    })), `${project}_${groupId}`)
  } else {
    ctx.reply(`${project}: 没有数据`)
  }
}

const addCalendar = async (author, groupId, ctx, project, activity, st, et) => {
  const cl = await getCollection('cl_calendar')
  if (project.length > 6) { ctx.reply('标题过长'); return }
  if (activity === '引继' && st && st.match(/^\d+$/)) {
    if (st == groupId) { ctx.reply('无法引继此引继码'); return }
    const aliasCol = await getCollection('cl_calendar_alias')
    await aliasCol.updateOne({ _id: `${groupId}_${project}` }, { $set: { d: st } }, { upsert: true })
    ctx.reply('引继成功'); return
  }
  if (activity === '取消引继') {
    const aliasCol = await getCollection('cl_calendar_alias')
    await aliasCol.deleteOne({ _id: `${groupId}_${project}` })
    ctx.reply('取消引继成功'); return
  }
  const startTime = strToTs(st), endTime = strToTs(et)
  if (isNaN(startTime)) { ctx.reply('开始时间错误'); return }
  if (isNaN(endTime)) { ctx.reply('结束时间错误'); return }
  await cl.insertOne({ project, activity, startTime, endTime, author, groupId })
  ctx.reply('设置成功')
}

const setCalendar = async (project, activity, st, et, author, groupId, ctx) => {
  const cl = await getCollection('cl_calendar')
  if (project.length > 6) { ctx.reply('标题过长'); return }
  const startTime = strToTs(st), endTime = strToTs(et)
  if (isNaN(startTime)) { ctx.reply('开始时间错误'); return }
  if (isNaN(endTime)) { ctx.reply('结束时间错误'); return }
  const search = await cl.find({ project, activity, groupId }).toArray()
  if (search.length) {
    if (search.length > 1) {
      userHash[author] = { search, infos: { project, activity, startTime, endTime, author, groupId } }
      ctx.reply(`选择需要设置的位置:\n${search.map((x, i) => `选择日历${i} | ${x.project}-${x.activity} ${formatTime(x.startTime)} ~ ${formatTime(x.endTime)}`).join('\n')}`)
    } else {
      await cl.updateOne({ _id: search[0]._id }, { $set: { project, activity, startTime, endTime, author, groupId } })
      ctx.reply('设置成功')
    }
  } else { ctx.reply('没有相关的记录') }
}

const deleteCalendar = async (project, activity, author, groupId, ctx) => {
  const cl = await getCollection('cl_calendar')
  const search = await cl.find({ project, activity, groupId }).toArray()
  if (search.length) {
    if (search.length > 1) {
      userDelHash[author] = { search }
      ctx.reply(`选择需要删除的位置:\n${search.map((x, i) => `选择删除${i} | ${x.project}-${x.activity} ${formatTime(x.startTime)} ~ ${formatTime(x.endTime)}`).join('\n')}`)
    } else {
      await cl.deleteOne({ _id: search[0]._id })
      ctx.reply('删除成功')
    }
  } else { ctx.reply('没有相关的记录') }
}

const help = ctx => {
  ctx.reply(`使用如下格式设置日历：\n\n日历设置\n【日历名称】\n【日历项目】\n【开始时间】\n【结束时间】\n\n*注：时间使用YYYY-MM-DD HH:MM:SS格式，不输入年份默认当年，不输入时间默认6点\n*可使用【日历修改】修改已存在的日历，【日历删除】删除`)
}

const calendarHandlers = [
  {
    name: 'calendar-set',
    match: c => c.startsWith('日历设置'),
    async handle(ctx) {
      const sp = ctx.content.substr(4).replace(/#/g, '\n').split('\n').map(x => x.trim()).filter(x => x)
      const alias = await checkAlias(sp[0], ctx.groupId)
      if (alias) { ctx.reply(`${sp[0]}日历已引继，无法设置`); return }
      if (userHash[ctx.userId]) delete userHash[ctx.userId]
      if (sp.length >= 4) await addCalendar(ctx.userId, ctx.groupId, ctx, ...sp.slice(0, 4))
      else if (sp.length >= 2 && sp[1].indexOf('引继') > -1) await addCalendar(ctx.userId, ctx.groupId, ctx, ...sp)
      else help(ctx)
    }
  },
  {
    name: 'calendar-modify',
    match: c => c.startsWith('日历修改'),
    async handle(ctx) {
      const sp = ctx.content.substr(4).replace(/#/g, '\n').split('\n').map(x => x.trim()).filter(x => x)
      const alias = await checkAlias(sp[0], ctx.groupId)
      if (alias) { ctx.reply(`${sp[0]}日历已引继，无法设置`); return }
      if (userHash[ctx.userId]) delete userHash[ctx.userId]
      if (sp.length >= 4) await setCalendar(...sp.slice(0, 4), ctx.userId, ctx.groupId, ctx)
      else help(ctx)
    }
  },
  {
    name: 'calendar-select',
    match: c => c.startsWith('选择日历'),
    async handle(ctx) {
      const content = ctx.content.substr(4)
      if (userHash[ctx.userId] && userHash[ctx.userId].search[content]) {
        const cl = await getCollection('cl_calendar')
        await cl.updateOne({ _id: userHash[ctx.userId].search[content]._id }, { $set: userHash[ctx.userId].infos })
        delete userHash[ctx.userId]
        ctx.reply('设置成功')
      } else help(ctx)
    }
  },
  {
    name: 'calendar-delete',
    match: c => c.startsWith('日历删除'),
    async handle(ctx) {
      const sp = ctx.content.substr(4).replace(/#/g, '\n').split('\n').map(x => x.trim()).filter(x => x)
      const alias = await checkAlias(sp[0], ctx.groupId)
      if (alias) { ctx.reply(`${sp[0]}日历已引继，无法设置`); return }
      if (userDelHash[ctx.userId]) delete userDelHash[ctx.userId]
      if (sp.length >= 2) await deleteCalendar(...sp.slice(0, 2), ctx.userId, ctx.groupId, ctx)
      else help(ctx)
    }
  },
  {
    name: 'calendar-delete-select',
    match: c => c.startsWith('选择删除'),
    async handle(ctx) {
      const content = ctx.content.substr(4)
      if (userDelHash[ctx.userId] && userDelHash[ctx.userId].search[content]) {
        const cl = await getCollection('cl_calendar')
        await cl.deleteOne({ _id: userDelHash[ctx.userId].search[content]._id })
        delete userDelHash[ctx.userId]
        ctx.reply('删除成功')
      } else help(ctx)
    }
  },
  {
    name: 'calendar-search',
    match: c => c.endsWith('日历'),
    async handle(ctx) {
      const project = ctx.content.substr(0, ctx.content.length - 2).trim()
      if (project) {
        let gid = ctx.groupId
        const alias = await checkAlias(project, gid)
        if (alias) gid = parseInt(alias)
        await searchCalendar(project, gid, ctx)
      } else help(ctx)
    }
  }
]

module.exports = calendarHandlers
