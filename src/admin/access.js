const { getCollection } = require('../db/mongo')

let groupRules = null
let userRules = null
let lastLoad = 0
const CACHE_TTL = 60000

async function loadRules() {
  if (groupRules && userRules && Date.now() - lastLoad < CACHE_TTL) return
  try {
    const cl = await getCollection('cl_admin_access')
    const doc = await cl.findOne({ _id: 'access_rules' })
    if (doc) {
      groupRules = {
        mode: doc.groupMode || 'allowAll',
        list: new Set(doc.groupList || [])
      }
      userRules = {
        blockedUsers: new Set(doc.blockedUsers || [])
      }
    } else {
      groupRules = { mode: 'allowAll', list: new Set() }
      userRules = { blockedUsers: new Set() }
    }
    lastLoad = Date.now()
  } catch (e) {
    if (!groupRules) groupRules = { mode: 'allowAll', list: new Set() }
    if (!userRules) userRules = { blockedUsers: new Set() }
  }
}

function isGroupAllowed(groupId) {
  loadRules().catch(() => {})
  if (!groupRules) return true
  if (groupRules.mode === 'allowAll') return !groupRules.list.has(groupId)
  if (groupRules.mode === 'denyAll') return groupRules.list.has(groupId)
  return true
}

function isUserBlocked(userId) {
  loadRules().catch(() => {})
  if (!userRules) return false
  return userRules.blockedUsers.has(userId)
}

async function saveRules() {
  const cl = await getCollection('cl_admin_access')
  await cl.updateOne(
    { _id: 'access_rules' },
    {
      $set: {
        groupMode: groupRules.mode,
        groupList: Array.from(groupRules.list),
        blockedUsers: Array.from(userRules.blockedUsers),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  )
  lastLoad = Date.now()
}

async function setGroupMode(mode) {
  await loadRules()
  groupRules.mode = mode
  await saveRules()
}

async function addGroupToList(groupId) {
  await loadRules()
  groupRules.list.add(parseInt(groupId))
  await saveRules()
}

async function removeGroupFromList(groupId) {
  await loadRules()
  groupRules.list.delete(parseInt(groupId))
  await saveRules()
}

async function blockUser(userId) {
  await loadRules()
  userRules.blockedUsers.add(parseInt(userId))
  await saveRules()
}

async function unblockUser(userId) {
  await loadRules()
  userRules.blockedUsers.delete(parseInt(userId))
  await saveRules()
}

async function getRules() {
  await loadRules()
  return {
    groupMode: groupRules.mode,
    groupList: Array.from(groupRules.list),
    blockedUsers: Array.from(userRules.blockedUsers)
  }
}

module.exports = {
  isGroupAllowed,
  isUserBlocked,
  setGroupMode,
  addGroupToList,
  removeGroupFromList,
  blockUser,
  unblockUser,
  getRules,
  loadRules
}
