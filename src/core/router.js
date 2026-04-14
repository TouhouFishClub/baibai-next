const { createContext } = require('./context')
const { saveChat, preprocessContent, shouldIgnoreEvent } = require('./middleware')
const config = require('../../config')
const { getCollection } = require('../db/mongo')

const modules = []

function registerModule(mod) {
  if (Array.isArray(mod)) {
    mod.forEach(m => modules.push(m))
  } else {
    modules.push(mod)
  }
}

function isGroupAllowed(groupId) {
  const adminModule = require('../admin/access')
  return adminModule.isGroupAllowed(groupId)
}

function isUserBlocked(userId) {
  const adminModule = require('../admin/access')
  return adminModule.isUserBlocked(userId)
}

async function onEvent(event, botId, ws) {
  if (shouldIgnoreEvent(event)) return

  switch (event.post_type) {
    case 'message':
      await handleMessage(event, botId, ws)
      break
    case 'meta_event':
      console.log(`[Router][${botId}] meta: ${event.meta_event_type}`)
      break
    default:
      break
  }
}

async function handleMessage(event, botId, ws) {
  if (event.message_type !== 'group' && event.message_type !== 'private') return

  const ctx = createContext(event, botId, ws)
  ctx.content = preprocessContent(ctx.content, ctx.selfId)

  if (!ctx.content) return

  let groupName = ''
  if (event.message_type === 'group') {
    try {
      const info = await require('../bot/ApiWrapper').getGroupInfo(botId, ctx.groupId)
      groupName = info?.group_name || `群${ctx.groupId}`
    } catch {
      groupName = `群${ctx.groupId}`
    }
  }
  ctx.groupName = groupName

  console.log(`[Recv][${botId}][${groupName}(${ctx.groupId})][${ctx.userName}(${ctx.userId})] ${ctx.content}`)

  saveChat(ctx.groupId || ctx.userId, ctx.userId, ctx.userName, ctx.content, botId, event)

  if (event.message_type === 'group') {
    if (!isGroupAllowed(ctx.groupId)) return
  }
  if (isUserBlocked(ctx.userId)) return

  for (const mod of modules) {
    try {
      if (mod.match(ctx.content, ctx)) {
        const result = await mod.handle(ctx)
        if (result !== false) return
      }
    } catch (e) {
      console.error(`[Router] Module ${mod.name} error:`, e)
    }
  }
}

module.exports = { registerModule, onEvent }
