const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')
const config = require('../../../config')

const GLOBAL_MARGIN = 10, TITLE_HEIGHT = 50, TABLE_WIDTH = 150
const TABLE_HEADER_HEIGHT = 30, TABLE_TITLE_HEIGHT = 30
const TABLE_ITEM_HEIGHT = 20, TABLE_ITEM_MARGIN = 3, TABLE_ITEM_MARGIN_TOP = 20
const TABLE_INSET_MARGIN = 5, fontFamily = 'STXIHEI'
const COLOR_GROUP = [
  'rgba(244,67,54,.7)','rgba(244,106,54,.7)','rgba(251,192,99,.7)',
  'rgba(33,130,142,.7)','rgba(16,201,154,.7)','rgba(0,104,183,.7)',
  'rgba(0,169,244,.7)','rgba(0,188,212,.7)','rgba(158,158,158,.7)',
  'rgba(97,97,97,.7)','rgba(66,66,66,.7)'
]
const addZero = n => n < 10 ? ('0' + n) : n

const getDayEnd = ts => {
  const d = new Date(ts)
  return new Date(`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} 0:0:0`).getTime() + 86400000 - 1
}

const renderCalendarImage = (year, month, ctx, todos = [], fileTip = '') => {
  const now = new Date()
  if (!year || !month || year < 1970 || year > 2050 || month < 1 || month > 12) {
    year = now.getFullYear(); month = now.getMonth() + 1
  }
  const ms = new Date(`${year}-${month}-1 0:0:0`), msw = ms.getDay()
  let dateInfo = []
  for (let i = 0; i < msw; i++) dateInfo.unshift({ startTs: ms.getTime() - 86400000 * (i + 1) })
  for (let i = 0; i < 42 - msw; i++) dateInfo.push({ startTs: ms.getTime() + 86400000 * i })

  const st = dateInfo[0].startTs, et = dateInfo[dateInfo.length - 1].startTs + 86400000 - 1
  let todoFilter = todos.map(t => ({
    name: t.name, st: new Date(t.start_time).getTime(), et: new Date(t.end_time).getTime(),
    etd: new Date(t.end_time), de: getDayEnd(new Date(t.end_time).getTime())
  })).filter(t => (t.et >= st && t.st <= et) || (t.st <= et && t.et >= st))
    .sort((a, b) => a.st - b.st).map((m, i) => ({ ...m, index: i }))

  const todoGroup = [], groupEnd = []
  todoFilter.forEach(tf => {
    let flag = false
    groupEnd.forEach((ge, gi) => {
      if (ge < tf.st && !flag) { flag = true; todoGroup[gi].push(tf); groupEnd[gi] = tf.de }
    })
    if (!flag) { todoGroup.push([tf]); groupEnd.push(tf.de) }
  })

  dateInfo = dateInfo.map(d => ({ ...d, endTs: d.startTs + 86400000 - 1, todos: [] }))
  const todoGroupIndex = todoGroup.map(() => 0)
  dateInfo = dateInfo.map((date, idx) => {
    const dtodos = []
    todoGroup.forEach((tg, tgi) => {
      const tt = tg[todoGroupIndex[tgi]]
      if (tt && tt.st <= date.endTs && tt.et >= date.startTs) {
        dtodos[tgi] = { ...tt }
        if (tt.st >= date.startTs || idx === 0) dtodos[tgi].isStart = true
        if (tt.et <= date.endTs) { dtodos[tgi].isEnd = true; todoGroupIndex[tgi]++ }
      }
    })
    return { ...date, todos: dtodos }
  })

  const width = GLOBAL_MARGIN * 2 + (TABLE_WIDTH + TABLE_INSET_MARGIN * 2) * 7
  const rowH = TABLE_TITLE_HEIGHT + TABLE_INSET_MARGIN * 2 + todoGroup.length * (TABLE_ITEM_HEIGHT + TABLE_ITEM_MARGIN_TOP)
  const height = GLOBAL_MARGIN * 2 + rowH * 6 + TITLE_HEIGHT + TABLE_HEADER_HEIGHT

  const canvas = createCanvas(width, height)
  const c = canvas.getContext('2d')
  c.fillStyle = '#fff'; c.fillRect(0, 0, width, height)

  let offsetTop = GLOBAL_MARGIN
  c.font = `30px ${fontFamily}`; c.fillStyle = '#000'
  c.fillText(`${year}年${month}月`, GLOBAL_MARGIN, offsetTop + 30)
  offsetTop += TITLE_HEIGHT

  c.font = `20px ${fontFamily}`;
  ['周日','周一','周二','周三','周四','周五','周六'].forEach((m, i) => {
    c.fillText(m, GLOBAL_MARGIN + i * (TABLE_WIDTH + TABLE_INSET_MARGIN * 2), offsetTop + 20)
  })
  offsetTop += TABLE_HEADER_HEIGHT

  c.strokeStyle = '#000'
  c.strokeRect(GLOBAL_MARGIN, offsetTop, width - 2 * GLOBAL_MARGIN, height - GLOBAL_MARGIN - offsetTop)

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      c.fillStyle = (row + col) % 2 ? '#eee' : '#fff'
      const x = GLOBAL_MARGIN + col * (TABLE_WIDTH + TABLE_INSET_MARGIN * 2)
      const y = offsetTop + row * rowH
      c.fillRect(x, y, TABLE_WIDTH + TABLE_INSET_MARGIN * 2, rowH)

      const data = dateInfo[row * 7 + col], dn = new Date(data.startTs)
      c.fillStyle = dn.getMonth() === month - 1 ? '#000' : '#aaa'
      c.font = `20px ${fontFamily}`
      c.fillText(`${dn.getFullYear()}-${addZero(dn.getMonth()+1)}-${addZero(dn.getDate())}`, x + TABLE_INSET_MARGIN, y + (TABLE_TITLE_HEIGHT - 20) / 2 + 20)

      data.todos.forEach((todo, index) => {
        if (todo) {
          c.fillStyle = COLOR_GROUP[todo.index % COLOR_GROUP.length]
          c.fillRect(
            x + (todo.isStart ? TABLE_INSET_MARGIN : 0),
            y + TABLE_TITLE_HEIGHT + index * TABLE_ITEM_HEIGHT + (index + 1) * TABLE_ITEM_MARGIN_TOP,
            TABLE_WIDTH + (todo.isStart ? 0 : TABLE_INSET_MARGIN) + (todo.isEnd ? 0 : TABLE_INSET_MARGIN),
            TABLE_ITEM_HEIGHT
          )
        }
      })

      const nowD = new Date()
      if (dn.getFullYear() === nowD.getFullYear() && dn.getMonth() === nowD.getMonth() && dn.getDate() === nowD.getDate()) {
        c.strokeStyle = 'rgba(0,120,215,1)'; c.fillStyle = 'rgba(0,120,215,.1)'; c.lineWidth = 3
        c.strokeRect(x, y, TABLE_WIDTH + TABLE_INSET_MARGIN * 2, rowH)
        c.fillRect(x, y, TABLE_WIDTH + TABLE_INSET_MARGIN * 2, rowH)
      }

      data.todos.forEach((todo, index) => {
        if (todo && todo.isStart) {
          c.font = `22px ${fontFamily}`; c.fillStyle = '#fff'; c.strokeStyle = '#333'; c.lineWidth = 3; c.lineCap = 'round'
          const ty = y + TABLE_TITLE_HEIGHT + index * TABLE_ITEM_HEIGHT + (index + 1) * TABLE_ITEM_MARGIN_TOP + (TABLE_ITEM_HEIGHT - 22) / 2 + 22 - 15
          c.strokeText(todo.name, x + TABLE_INSET_MARGIN + 2, ty)
          c.fillText(todo.name, x + TABLE_INSET_MARGIN + 2, ty)
        }
        if (todo && todo.isEnd) {
          c.font = `16px ${fontFamily}`; c.fillStyle = '#fff'; c.strokeStyle = '#666'; c.lineWidth = 1
          const time = `${todo.etd.getHours()}:${addZero(todo.etd.getMinutes())}:${addZero(todo.etd.getSeconds())}`
          const wf = c.measureText(time).width
          const ty2 = y + TABLE_TITLE_HEIGHT + index * TABLE_ITEM_HEIGHT + (index + 1) * TABLE_ITEM_MARGIN_TOP + (TABLE_ITEM_HEIGHT - 16) / 2 + 16 - 3
          c.strokeText(time, x + TABLE_INSET_MARGIN + TABLE_WIDTH - wf - 2, ty2)
          c.fillText(time, x + TABLE_INSET_MARGIN + TABLE_WIDTH - wf - 2, ty2)
        }
      })
    }
  }

  const imgData = canvas.toDataURL()
  const base64Data = imgData.replace(/^data:image\/\w+;base64,/, '')
  const outPath = path.join(config.imageSendDir, 'other', `${year}_${month}${fileTip}.png`)
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'))
  ctx.reply(`[CQ:image,file=${path.join('send', 'other', `${year}_${month}${fileTip}.png`)}]`)
}

module.exports = { renderCalendarImage }
