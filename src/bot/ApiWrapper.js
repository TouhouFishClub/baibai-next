const sockets = new Map()
const pendingActions = new Map()
let echoCounter = 0

function _registerSocket(botId, ws) {
  sockets.set(botId, ws)
}

function _unregisterSocket(botId) {
  sockets.delete(botId)
}

function _handleResponse(data) {
  const { echo, status, retcode, data: resData } = data
  if (!echo) return
  const key = typeof echo === 'object' ? echo._echoKey : echo
  if (!key || !pendingActions.has(key)) return
  const { resolve, reject } = pendingActions.get(key)
  pendingActions.delete(key)
  if (status === 'ok' || retcode === 0) {
    resolve(resData)
  } else {
    const err = new Error(`API failed: status=${status}, retcode=${retcode}`)
    err.data = resData
    reject(err)
  }
}

function callApi(botId, action, params = {}, timeout = 15000) {
  const ws = sockets.get(botId)
  if (!ws || ws.readyState !== 1) {
    return Promise.reject(new Error(`Bot ${botId} not connected`))
  }
  const echoKey = `${action}_${++echoCounter}_${Date.now()}`
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingActions.delete(echoKey)
      reject(new Error(`API timeout: ${action}`))
    }, timeout)
    pendingActions.set(echoKey, {
      resolve: (d) => { clearTimeout(timer); resolve(d) },
      reject: (e) => { clearTimeout(timer); reject(e) }
    })
    ws.send(JSON.stringify({
      action,
      params,
      echo: { _echoKey: echoKey, action, ts: Date.now() }
    }))
  })
}

async function sendGroupMsg(botId, groupId, message) {
  return callApi(botId, 'send_msg', {
    message_type: 'group',
    group_id: groupId,
    message
  })
}

async function sendPrivateMsg(botId, userId, message) {
  return callApi(botId, 'send_msg', {
    message_type: 'private',
    user_id: userId,
    message
  })
}

async function getGroupInfo(botId, groupId) {
  return callApi(botId, 'get_group_info', { group_id: groupId })
}

async function getGroupMemberList(botId, groupId) {
  return callApi(botId, 'get_group_member_list', { group_id: groupId })
}

async function getGroupMemberInfo(botId, groupId, userId) {
  return callApi(botId, 'get_group_member_info', { group_id: groupId, user_id: userId })
}

async function getStrangerInfo(botId, userId) {
  return callApi(botId, 'get_stranger_info', { user_id: userId })
}

module.exports = {
  _registerSocket,
  _unregisterSocket,
  _handleResponse,
  callApi,
  sendGroupMsg,
  sendPrivateMsg,
  getGroupInfo,
  getGroupMemberList,
  getGroupMemberInfo,
  getStrangerInfo
}
