const { getCollection } = require('../../db/mongo')
const _ = require('lodash')
const path = require('path')
const { htmlToImageFile } = require('../../utils/renderImage')

const renderMenu = async (group, ctx, searchChars = []) => {
  const cl = await getCollection('cl_menu')
  const keywords = await cl.find({ g: parseInt(`${group}`) }).toArray()
  if (!keywords.length) {
    ctx.reply('该群组暂无菜单项，请使用 [菜单 增加 项目名] 添加菜单项')
    return
  }
  const highlightText = (text) => {
    if (!searchChars.length) return text
    let r = ''
    for (const ch of text) {
      r += searchChars.includes(ch) ? `<span style="color:red">${ch}</span>` : ch
    }
    return r
  }
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{border:0;padding:0;margin:0}body{width:1040px;min-height:20px;padding:20px;box-sizing:border-box}
.t{border:1px solid;border-collapse:collapse;width:1000px}.t tr td{border:1px solid;padding:3px 10px;box-sizing:border-box;width:200px}
</style></head><body><table class="t">
${_.chunk(keywords.map(x => highlightText(x.d)), 5).map(tr => `<tr>${tr.map(td => `<td>${td}</td>`).join('')}</tr>`).join('')}
</table></body></html>`
  const imgMsg = await htmlToImageFile(html, path.join('menu', `${group}.png`))
  ctx.reply(imgMsg)
}

module.exports = {
  name: 'menu',
  match(content) {
    return content.startsWith('menu') || content.startsWith('菜单')
  },
  async handle(ctx) {
    const cl = await getCollection('cl_menu')
    const sp = ctx.content.split(' ').filter(x => x && x.indexOf('[CQ') === -1)
    switch (sp[1]) {
      case 'add': case '增加': {
        const items = sp.splice(2)
        for (const item of items) {
          await cl.save({ g: ctx.groupId, d: item })
        }
        ctx.reply('保存成功')
        break
      }
      case 'remove': case '删除':
        await cl.deleteOne({ g: ctx.groupId, d: sp[2] })
        ctx.reply('已删除')
        break
      case 'help':
        ctx.reply(`[menu add xxx xxx] 或 [菜单 增加 xxx xxx]:\n 增加记录\n[menu remove xxx] 或 [菜单 删除 xxx]:\n 删除记录`)
        break
      default: {
        const searchChars = sp[1] ? [...sp[1]] : []
        await renderMenu(ctx.groupId, ctx, searchChars)
      }
    }
  }
}
