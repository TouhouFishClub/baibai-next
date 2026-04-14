const md5 = require('md5')
const path = require('path')
const fs = require('fs-extra')
const { htmlToImageFile } = require('../../utils/renderImage')

const createUserRp = id => {
  const str = `${id}${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
  const md = md5(str)
  let rp = parseInt(md.substring(0, 15), 16).toString().split('').reduce((p, c) => p + parseInt(c), 0)
  const rpFixType = parseInt(md.substring(15, 16), 16) % 3
  const rpFix = parseInt(md.substring(16, 20), 16).toString().split('').reduce((p, c) => p + parseInt(c), 0)
  if (rpFixType === 0) rp += rpFix
  else if (rpFixType === 1) rp -= rpFix
  if (rp < 0) rp = Math.abs(rp)
  if (rp > 100) rp = rp > 105 ? 100 - (rp - 105) : 100
  return rp
}

module.exports = {
  name: 'jrrp',
  match(content) {
    const c = content.trim().toLowerCase()
    return c.startsWith('jrrp') || c.startsWith('今日运势')
  },
  async handle(ctx) {
    const target = ctx.userId
    const nid = ctx.raw?.sender?.card || ctx.raw?.sender?.nickname || 'unknown'
    const rp = createUserRp(target)

    let progressColor = '#b20000'
    if (rp > 30) progressColor = '#ffd500'
    if (rp > 60) progressColor = '#007aa6'
    if (rp > 90) progressColor = '#008200'

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{border:0;padding:0;margin:0}
body{width:800px;min-height:20px;box-sizing:border-box;font-family:'Microsoft YaHei',sans-serif;overflow:hidden}
.main{padding:10px 20px;position:relative}
.nick{font-size:32px;font-weight:bold;color:#333}
.bar-wrap{margin-top:20px;width:100%;height:30px;border:1px solid #333;position:relative}
.bar{position:absolute;left:0;top:0;height:30px}
</style></head><body><div class="main">
<div class="nick">${nid} 今天的运势指数是: ${rp} %</div>
<div class="bar-wrap"><div class="bar" style="background-color:${progressColor};width:${rp}%"></div></div>
</div></body></html>`

    const imgMsg = await htmlToImageFile(html, path.join('rp', `${target}_jrrp.png`))
    ctx.reply(imgMsg)
  }
}
