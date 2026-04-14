const express = require('express')
const bodyParser = require('body-parser')
const config = require('../config')
const BotManager = require('./bot/BotManager')
const { registerModule } = require('./core/router')
const { setupAdminRoutes } = require('./admin/index')
const { loadRules } = require('./admin/access')
const { getClient } = require('./db/mongo')

const app = express()
app.use(bodyParser.json({ limit: '10mb' }))

BotManager.setup(app)

setupAdminRoutes(app)

const calcModule = require('./modules/calculator/index')
const phraseModule = require('./modules/phrase/index')
const jrrpModule = require('./modules/jrrp/index')
const jrzzModule = require('./modules/jrzz/index')
const menuModule = require('./modules/menu/index')
const chpModule = require('./modules/chp/index')
const ruaworkModule = require('./modules/ruawork/index')
const calendarHandlers = require('./modules/calendar/index')
const mabinogiHandlers = require('./modules/mabinogi/index')
const drawHandlers = require('./modules/draw/index')

registerModule(jrrpModule)
registerModule(jrzzModule)
registerModule(chpModule)
registerModule(ruaworkModule)
registerModule(menuModule)
registerModule(calendarHandlers)
registerModule(mabinogiHandlers)
registerModule(drawHandlers)
registerModule(calcModule)

registerModule({
  name: 'phrase-answer',
  match() { return true },
  async handle(ctx) {
    if (ctx.messageType !== 'group') return false
    const { answerQuery } = require('./modules/phrase/index')
    const matched = await answerQuery(ctx.content, ctx.userName, ctx.groupName, ctx.groupId, ctx.userId, ctx)
    if (!matched) return false
  }
})
registerModule(phraseModule)

async function start() {
  console.log('[Boot] Connecting to MongoDB...')
  await getClient()
  console.log('[Boot] Loading access rules...')
  await loadRules()

  app.listen(config.port, () => {
    console.log(`[Boot] baibai-next started on port ${config.port}`)
    console.log(`[Boot] WebSocket: ws://0.0.0.0:${config.port}${config.wsPath}/:botId`)
    console.log(`[Boot] Admin panel: http://localhost:${config.port}/admin`)
  })
}

start().catch(err => {
  console.error('[Boot] Fatal:', err)
  process.exit(1)
})
