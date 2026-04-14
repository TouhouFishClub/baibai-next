const expressWs = require('express-ws')
const config = require('../../config')
const ApiWrapper = require('./ApiWrapper')

const connections = new Map()

function setup(app) {
  expressWs(app)

  app.ws(`${config.wsPath}/:botId`, (ws, req) => {
    const botId = req.params.botId
    const selfId = req.headers['x-self-id'] || botId
    console.log(`[Bot] Connected: botId=${botId}, selfId=${selfId}`)
    console.log(`[Bot] Headers: ${JSON.stringify(req.headers)}`)

    connections.set(botId, { ws, selfId, connectedAt: Date.now() })
    ApiWrapper._registerSocket(botId, ws)

    ws.on('message', (raw) => {
      try {
        const data = JSON.parse(raw.toString())
        if (data.post_type) {
          const { onEvent } = require('../core/router')
          onEvent(data, botId, ws)
        } else if (data.status !== undefined && data.echo) {
          ApiWrapper._handleResponse(data)
        } else if (data.meta_event_type) {
          console.log(`[Bot][${botId}] meta: ${data.meta_event_type}`)
        } else {
          console.log(`[Bot][${botId}] unknown message: ${JSON.stringify(data).substring(0, 200)}`)
        }
      } catch (e) {
        console.error(`[Bot][${botId}] message parse error:`, e.message)
      }
    })

    ws.on('close', () => {
      console.log(`[Bot] Disconnected: botId=${botId}`)
      connections.delete(botId)
      ApiWrapper._unregisterSocket(botId)
    })

    ws.on('error', (err) => {
      console.error(`[Bot][${botId}] ws error:`, err.message)
    })
  })
}

function getConnection(botId) {
  return connections.get(botId)
}

function getAllConnections() {
  return connections
}

module.exports = { setup, getConnection, getAllConnections }
