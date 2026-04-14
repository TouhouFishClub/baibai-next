const { getCollection } = require('../../db/mongo')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const config = require('../../../config')

async function saveTxt(ask, answer, name, groupName, from, groupId, ctx) {
  const cl = await getCollection('cl_txt')
  ask = ask.trim()

  if (ask === 'ss') {
    return searchss(answer, groupId, ctx)
  }

  let banIds = [], banall = false
  if (answer.indexOf('--banall') >= 0) {
    banall = true
    answer = answer.split('--banall')[0]
  } else if (answer.indexOf('--ban') >= 0) {
    const sp = answer.split('--ban')
    answer = sp[0]
    if (sp[1] && sp[1].length) {
      banIds = sp[1].trim().replace(/[， ]/g, ',').split(',')
        .map(x => x.trim().startsWith('qq=') ? x.substring(x.indexOf('qq=') + 3, x.indexOf(']')) : x)
        .filter(id => id.match(/^\d+$/))
    }
  }
  answer = answer.trim()

  let ra = ''
  let s1 = answer
  let n = s1.indexOf('[CQ:image')
  while (n >= 0) {
    const n1 = s1.indexOf(']')
    const head = s1.substring(0, n)
    const tail = s1.substring(n1 + 1)
    let image = s1.substring(n, n1 + 1)
    let n2 = image.indexOf('https://gchat.qpic.cn')
    if (n2 < 0) n2 = image.indexOf('http://gchat.qpic.cn')
    if (n2 < 0) n2 = image.indexOf('https://multimedia.nt.qq.com.cn')
    if (n2 > 0) {
      let url = image.substring(n2, n1).split(',')[0].replace(/&amp;/g, '&')
      try {
        const now = Date.now()
        const rd = Math.floor(Math.random() * 8888 + 1000)
        const filename = path.join(config.imageSendDir, 'save', `${now}${rd}.png`)
        await fs.promises.mkdir(path.dirname(filename), { recursive: true })
        const resp = await axios.get(url, { responseType: 'arraybuffer' })
        await fs.promises.writeFile(filename, resp.data)
        image = `[CQ:image,file=send/save/${now}${rd}.png]`
      } catch (e) {
        console.error('[Phrase] save image error:', e.message)
      }
    }
    s1 = tail
    n = s1.indexOf('[CQ:image')
    ra += head + image
  }
  ra += s1

  const query = { _id: `${groupId}_${ask}` }
  const existing = await cl.findOne(query)
  if (existing) {
    if (existing.banall && from != existing.f) { ctx.reply('你不能操作这个词条哦~'); return }
    if (existing.ban && new Set(existing.ban).has(from)) { ctx.reply('你不能操作这个词条哦~'); return }
    if (existing.lock && from != 0) { ctx.reply(`记住 "${ask}" 了哇`); return }
  }

  if (ask.length > 0) {
    if (answer === '') {
      await cl.deleteOne(query)
      ctx.reply(`忘记 "${ask}" 了哇`)
    } else {
      const data = { _id: `${groupId}_${ask}`, d: ra, n: name, g: groupName, gid: groupId, f: from, ask_count: 0 }
      data.banall = !!banall
      if (banIds.length) data.ban = banIds.map(x => parseInt(x))
      if (from == 0) { data.lock = 1; data.all = 1 }
      await cl.updateOne(query, { $set: data }, { upsert: true })
      ctx.reply(`记住 "${ask}" 了哇`)
    }
  }
}

async function searchss(keyword, groupId, ctx) {
  const cl = await getCollection('cl_txt')
  const query = { _id: { $gt: `${groupId}_`, $lt: `${groupId}~` } }
  if (keyword.length > 0) query._id.$regex = new RegExp(keyword)
  const list = await cl.find(query).limit(15).toArray()
  const frontLen = (`${groupId}`).length + 1
  let ret = '已记录词条\n'
  for (const item of list) {
    ret += item._id.substring(frontLen) + '\n'
  }
  ctx.reply(ret.trim())
}

const answerMem = {}

async function answerQuery(ask, name, groupName, groupId, from, ctx) {
  if (!ask || ask.length === 0) return false
  try {
    const cl = await getCollection('cl_txt')
    const query = { _id: `${groupId}_${ask}` }
    const result = await cl.findOneAndUpdate(query, { $inc: { ask_count: 1 } })
    const value = result.value || result
    if (!value || !value.d) return false
    if (!(value.all || value.g === groupName || value.gid === groupId)) return false

    const now = Date.now()
    const thend = answerMem[name]
    if (thend) {
      if (now - thend.ts > 60000) {
        answerMem[name] = { ts: now, c: 1 }
      } else if (now - thend.ts > 2000 * thend.c - 1000) {
        answerMem[name] = { ts: now, c: thend.c + 1 }
      } else {
        return false
      }
    } else {
      answerMem[name] = { ts: now, c: 1 }
    }
    ctx.reply(value.d)
    return true
  } catch (e) {
    console.error('[Phrase] answer error:', e.message)
    return false
  }
}

module.exports = {
  saveTxt,
  answerQuery,

  name: 'phrase',
  match(content) {
    const ca = content.split('|')
    return ca.length === 2 && ca[0].length < 300 && ca[0].split(' ').length < 2
  },
  async handle(ctx) {
    const ca = ctx.content.split('|')
    await saveTxt(ca[0], ca[1], ctx.userName, ctx.groupName, ctx.userId, ctx.groupId, ctx)
  }
}
