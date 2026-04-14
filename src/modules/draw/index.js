/**
 * 绘图模块 (nb / nbp / nbp2)
 * 迁移自 baibaibot/ai/banana/
 */
const { nanoBananaReply, getNanoBananaHelp, getNanoBananaPresets } = require('./banana')

let xiaodoubaoModule = null
try {
  xiaodoubaoModule = require('./xiaodoubao')
} catch (e) {
  console.log('[draw] xiaodoubao module not available:', e.message)
}

const handlers = [
  {
    name: 'draw-nb-presets',
    match(content) {
      const lc = content.toLowerCase().trim()
      return lc === 'banana 词条' || lc === 'nb 词条' || lc === 'banana 内置' || lc === 'nb 内置' ||
             lc === 'banana 内置词条' || lc === 'nb 内置词条' ||
             lc === 'nbp 词条' || lc === 'nbp 内置' || lc === 'nbp 内置词条'
    },
    handle(ctx) {
      getNanoBananaPresets(msg => ctx.reply(msg))
    }
  },
  {
    name: 'draw-nb-help',
    match(content) {
      const lc = content.toLowerCase().trim()
      return lc === 'banana help' || lc === 'nb help' || lc === 'nbp help' || lc === 'banana' || lc === 'nb'
    },
    handle(ctx) {
      getNanoBananaHelp(msg => ctx.reply(msg), ctx.userId, ctx.groupId)
    }
  },
  {
    name: 'draw-nbp2',
    match(content) {
      const lc = content.toLowerCase()
      const isReply = content.includes('[CQ:reply,id=')
      return isReply ? lc.includes('nbp2') : lc.startsWith('nbp2')
    },
    async handle(ctx) {
      if (!xiaodoubaoModule) {
        ctx.reply('[nbp2] 模块未加载，请检查 xiaodoubao.js 依赖')
        return
      }
      const fn = xiaodoubaoModule.xiaodoubaoReply || xiaodoubaoModule.nanoBananaReply
      if (fn) {
        await fn(ctx.content, ctx.userId, ctx.userName, ctx.groupId,
          msg => ctx.reply(msg), ctx.groupName, ctx.userName, ctx.messageType, ctx.botId, {})
      }
    }
  },
  {
    name: 'draw-nbp',
    match(content) {
      const lc = content.toLowerCase()
      const isReply = content.includes('[CQ:reply,id=')
      return (isReply ? lc.includes('nbp') : lc.startsWith('nbp')) && !lc.includes('nbp2')
    },
    async handle(ctx) {
      await nanoBananaReply(ctx.content, ctx.userId, ctx.userName, ctx.groupId,
        msg => ctx.reply(msg), ctx.groupName, ctx.userName, ctx.messageType, ctx.botId, {}, true)
    }
  },
  {
    name: 'draw-nb',
    match(content) {
      const lc = content.toLowerCase()
      const isReply = content.includes('[CQ:reply,id=')
      if (isReply) return lc.includes('banana') || (lc.includes('nb') && !lc.includes('nbp'))
      return (lc.startsWith('banana ') || lc.startsWith('nb ')) && !lc.startsWith('nbp')
    },
    async handle(ctx) {
      await nanoBananaReply(ctx.content, ctx.userId, ctx.userName, ctx.groupId,
        msg => ctx.reply(msg), ctx.groupName, ctx.userName, ctx.messageType, ctx.botId, {}, false)
    }
  }
]

module.exports = handlers
