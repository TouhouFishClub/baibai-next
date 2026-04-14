const { getCollection } = require('../db/mongo')
const config = require('../../config')

async function saveChat(gid, uid, name, content, port, messageObjectSource) {
  try {
    const cl = await getCollection('cl_chat')
    const now = new Date()
    const data = { _id: now, gid, uid, n: name, d: content, ts: now.getTime(), port }
    if (messageObjectSource && messageObjectSource.message_id) {
      data.message_id = messageObjectSource.message_id
    }
    await cl.save(data)
  } catch (e) {
    console.error('[Middleware] saveChat error:', e.message)
  }
}

function preprocessContent(content, selfId) {
  if (!content) return ''
  content = content.replace(/&amp;/g, '&').replace(/&#44;/g, ',')
  if (selfId) {
    const pattern = new RegExp(`\\[CQ:at,qq=${selfId}\\]`, 'g')
    content = content.replace(pattern, '百百')
  }
  content = content.replace(/\[CQ:at,qq=981069482\]/g, '百百')
    .replace(/\[CQ:at,qq=3291864216\]/g, '百百')
    .replace(/\[CQ:at,qq=1840239061\]/g, '百百')
    .replace(/\[CQ:at,qq=2375373419\]/g, '百百')
  return content
}

function shouldIgnoreEvent(event) {
  if (config.botSelfIds.has(event.user_id)) return true
  if (event.time && event.time * 1000 + 30000 < Date.now()) return true
  return false
}

module.exports = { saveChat, preprocessContent, shouldIgnoreEvent }
