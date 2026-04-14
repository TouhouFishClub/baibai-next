/**
 * 洛奇相关模块 - 路由分发
 * 子模块的实际实现从旧版 baibaibot/ai/mabinogi/ 迁移并调整了 require 路径
 */
const { op: optSearch } = require('./optionset')
const { searchMabiRecipe } = require('./recipeRebuild/searchRecipe')
const { searchEquipUpgrade } = require('./ItemUpgrade/index')
const { mabiTelevision, mabiTelevisionStats } = require('./Television/newMbtv')
const { mabiGachaTv, mabiMbcdStats } = require('./Television/newMbcd')
const { mabiCraftTv, mabiCraftTvStats } = require('./Television/newMbzz')
const { BossWork } = require('./BossWork/BossWork')
const { mabiGacha, selectGachaGroup } = require('./gacha/index')
const { mabiSmuggler } = require('./smuggler/newSmuggler')
const { LiveInspect, LiveAnalyzer } = require('./live-inspect')

const handlers = [
  {
    name: 'mabi-gacha-pool',
    match: c => c.startsWith('洛奇蛋池'),
    async handle(ctx) {
      const select = parseInt(ctx.content.replace('洛奇蛋池', '').trim()) || 0
      await selectGachaGroup(ctx.userId, ctx.groupId, msg => ctx.reply(msg), select)
    }
  },
  {
    name: 'mabi-gacha-1',
    match: c => c === '洛奇来一发',
    async handle(ctx) {
      await mabiGacha(ctx.userId, ctx.groupId, msg => ctx.reply(msg), 1, null, true)
    }
  },
  {
    name: 'mabi-gacha-11',
    match: c => c === '洛奇来十连',
    async handle(ctx) {
      await mabiGacha(ctx.userId, ctx.groupId, msg => ctx.reply(msg), 11, null, true)
    }
  },
  {
    name: 'mabi-gacha-60',
    match: c => c === '洛奇来一单',
    async handle(ctx) {
      await mabiGacha(ctx.userId, ctx.groupId, msg => ctx.reply(msg), 60, null, true)
    }
  },
  {
    name: 'mabi-gacha-600',
    match: c => c === '洛奇来十单',
    async handle(ctx) {
      await mabiGacha(ctx.userId, ctx.groupId, msg => ctx.reply(msg), 600, null, true)
    }
  },
  {
    name: 'mabi-smuggler',
    match: c => c.trim() === '走私查询',
    async handle(ctx) {
      await mabiSmuggler(msg => ctx.reply(msg))
    }
  },
  {
    name: 'mabi-live-inspect',
    match: c => c === '洛奇查房' || c === '洛奇涨粉榜' || c === '洛奇掉粉榜',
    async handle(ctx) {
      if (ctx.content === '洛奇涨粉榜' || ctx.content === '洛奇掉粉榜') {
        await LiveAnalyzer(ctx.userId, ctx.groupId, ctx.content, msg => ctx.reply(msg))
      } else {
        await LiveInspect(ctx.userId, ctx.groupId, ctx.content, msg => ctx.reply(msg))
      }
    }
  },
  {
    name: 'mabi-release-query',
    match: c => c.substring(0, 4) === '释放查询',
    async handle(ctx) {
      const keyword = ctx.content.substring(4).trim()
      await optSearch(ctx.userId, ctx.userName, keyword, 'html', msg => ctx.reply(msg))
    }
  },
  {
    name: 'mabi-mbtvs',
    match: c => c.length >= 5 && c.toLowerCase().startsWith('mbtvs'),
    async handle(ctx) {
      const content = ctx.content.substring(5).trim()
      await mabiTelevisionStats(content, ctx.userId, msg => ctx.reply(msg))
    }
  },
  {
    name: 'mabi-mbtv',
    match: c => c.substring(0, 4).toLowerCase() === 'mbtv' && !c.toLowerCase().startsWith('mbtvs'),
    async handle(ctx) {
      const content = ctx.content.substring(4).trim()
      await mabiTelevision(content, ctx.userId, msg => ctx.reply(msg))
    }
  },
  {
    name: 'mabi-mbcds',
    match: c => c.length >= 5 && c.toLowerCase().startsWith('mbcds'),
    async handle(ctx) {
      const content = ctx.content.substring(5).trim()
      await mabiMbcdStats(content, ctx.userId, msg => ctx.reply(msg))
    }
  },
  {
    name: 'mabi-mbcd',
    match: c => c.substring(0, 4).toLowerCase() === 'mbcd' && !c.toLowerCase().startsWith('mbcds'),
    async handle(ctx) {
      const content = ctx.content.substring(4).trim()
      await mabiGachaTv(content, ctx.userId, msg => ctx.reply(msg))
    }
  },
  {
    name: 'mabi-mbzzs',
    match: c => c.length >= 5 && c.toLowerCase().startsWith('mbzzs'),
    async handle(ctx) {
      const content = ctx.content.substring(5).trim()
      await mabiCraftTvStats(content, ctx.userId, msg => ctx.reply(msg))
    }
  },
  {
    name: 'mabi-mbzz',
    match: c => c.substring(0, 4).toLowerCase() === 'mbzz' && !c.toLowerCase().startsWith('mbzzs'),
    async handle(ctx) {
      const content = ctx.content.substring(4).trim()
      await mabiCraftTv(content, ctx.userId, msg => ctx.reply(msg))
    }
  },
  {
    name: 'mabi-optw',
    match: c => c.substring(0, 4) === 'optw',
    async handle(ctx) {
      const keyword = 'w' + ctx.content.substring(4).trim()
      await optSearch(ctx.userId, ctx.userName, keyword, 'html', msg => ctx.reply(msg))
    }
  },
  {
    name: 'mabi-opts',
    match: c => c.substring(0, 4) === 'opts',
    async handle(ctx) {
      const keyword = ctx.content.substring(4).trim()
      await optSearch(ctx.userId, ctx.userName, keyword, 'html', msg => ctx.reply(msg))
    }
  },
  {
    name: 'mabi-opt',
    match: c => { const f = c.substring(0, 3); return f === 'opt' && c.substring(0, 4) !== 'opts' && c.substring(0, 4) !== 'optw' },
    async handle(ctx) {
      const keyword = ctx.content.substring(3).trim()
      await optSearch(ctx.userId, ctx.userName, keyword, 'html', msg => ctx.reply(msg))
    }
  },
  {
    name: 'mabi-meu',
    match: c => c.substring(0, 3) === 'meu',
    async handle(ctx) {
      const keyword = ctx.content.substring(3).trim()
      await searchEquipUpgrade(keyword, msg => ctx.reply(msg))
    }
  },
  {
    name: 'mabi-mbi',
    match: c => c.substring(0, 3) === 'mbi',
    async handle(ctx) {
      const keyword = ctx.content.substring(3).trim()
      await searchMabiRecipe(keyword, msg => ctx.reply(msg), false)
    }
  },
  {
    name: 'mabi-mbd',
    match: c => c.substring(0, 3) === 'mbd',
    async handle(ctx) {
      const keyword = ctx.content.substring(3).trim()
      await searchMabiRecipe(keyword, msg => ctx.reply(msg), true)
    }
  },
  {
    name: 'mabi-bosswork',
    match: c => { const l = c.toLowerCase(); return l === 'bosswork' || l === 'boss时间表' },
    async handle(ctx) {
      BossWork(ctx.userId, ctx.groupId, msg => ctx.reply(msg))
    }
  }
]

module.exports = handlers
