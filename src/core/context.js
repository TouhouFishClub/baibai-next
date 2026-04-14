const api = require('../bot/ApiWrapper')
const config = require('../../config')
const fs = require('fs')
const path = require('path')

function replaceImageToBase64(message) {
  return message.split('[CQ:image,file=file:').map((sp, index) => {
    if (index) {
      const tsp = sp.split(']')
      try {
        tsp[0] = fs.readFileSync(tsp[0]).toString('base64')
      } catch (e) {
        console.error('[Context] Failed to read image:', tsp[0])
      }
      return tsp.join(']')
    }
    return sp
  }).join('[CQ:image,file=base64://')
}

function replaceRecordToBase64(message) {
  return message.split('[CQ:record,file=file:').map((sp, index) => {
    if (index) {
      const tsp = sp.split(']')
      try {
        tsp[0] = fs.readFileSync(tsp[0]).toString('base64')
      } catch (e) {
        console.error('[Context] Failed to read record:', tsp[0])
      }
      return tsp.join(']')
    }
    return sp
  }).join('[CQ:record,file=base64://')
}

function formatOutgoingMessage(msg) {
  msg = msg
    .replace(/CQ:image,file=sen/gi, `CQ:image,file=file:${path.join(config.imageSendDir, '..')}${path.sep}sen`)
    .replace(/CQ:cardimage,file=sen/gi, `CQ:cardimage,file=file:${path.join(config.imageSendDir, '..')}${path.sep}sen`)
    .replace(/CQ:record,file=sen/gi, `CQ:record,file=file:${path.join(config.recordSendDir, '..')}${path.sep}sen`)

  if (msg.indexOf('[CQ:image,file=file:') > -1) {
    msg = replaceImageToBase64(msg)
  }
  if (msg.indexOf('[CQ:record,file=file:') > -1) {
    msg = replaceRecordToBase64(msg)
  }
  return msg
}

function createContext(event, botId, ws) {
  const rawMessage = event.raw_message || (typeof event.message === 'string' ? event.message : '')
  const messageType = event.message_type
  const groupId = event.group_id
  const userId = event.user_id
  const sender = event.sender || {}
  const userName = sender.card || sender.nickname || `用户${userId}`
  const selfId = event.self_id

  const ctx = {
    raw: event,
    botId,
    selfId,
    messageType,
    groupId,
    userId,
    userName,
    sender,
    content: rawMessage,
    api,

    reply(msg) {
      if (!msg) return
      msg = formatOutgoingMessage(msg)

      const { saveChat } = require('./middleware')

      if (messageType === 'group') {
        console.log(`[Send][${botId}][${groupId}] ${msg.substring(0, 100)}`)
        saveChat(groupId, 10000, `百百${botId}`, msg, botId)
        ws.send(JSON.stringify({
          action: 'send_msg',
          params: { message_type: 'group', group_id: groupId, message: msg }
        }))
      } else if (messageType === 'private') {
        console.log(`[Send][${botId}][PM:${userId}] ${msg.substring(0, 100)}`)
        ws.send(JSON.stringify({
          action: 'send_msg',
          params: { message_type: 'private', user_id: userId, message: msg }
        }))
      }
    }
  }

  return ctx
}

module.exports = { createContext }
