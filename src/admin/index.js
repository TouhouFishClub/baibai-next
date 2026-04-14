const fs = require('fs')
const path = require('path')
const access = require('./access')
const { getAllConnections } = require('../bot/BotManager')

let adminAuth = { username: 'admin', password: 'admin123' }
try {
  const secret = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', '.secret.json'), 'utf8'))
  if (secret.adminUsername && secret.adminPassword) {
    adminAuth = { username: secret.adminUsername, password: secret.adminPassword }
  }
} catch (e) {
  console.warn('[Admin] secret.json not found, using default credentials')
}

function checkAuth(req, res) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Baibai Admin"')
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  const decoded = Buffer.from(authHeader.slice(6), 'base64').toString()
  const [user, pass] = decoded.split(':')
  if (user !== adminAuth.username || pass !== adminAuth.password) {
    res.set('WWW-Authenticate', 'Basic realm="Baibai Admin"')
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}

function setupAdminRoutes(app) {
  app.get('/admin', (req, res) => {
    if (!checkAuth(req, res)) return
    res.sendFile(path.join(__dirname, 'panel.html'))
  })

  app.get('/admin/api/status', (req, res) => {
    if (!checkAuth(req, res)) return
    const conns = getAllConnections()
    const bots = []
    conns.forEach((v, k) => {
      bots.push({ id: k, selfId: v.selfId, connectedAt: v.connectedAt })
    })
    res.json({ ok: true, bots, uptime: process.uptime() })
  })

  app.get('/admin/api/rules', async (req, res) => {
    if (!checkAuth(req, res)) return
    try {
      const rules = await access.getRules()
      res.json({ ok: true, ...rules })
    } catch (e) {
      res.json({ ok: false, error: e.message })
    }
  })

  app.post('/admin/api/group-mode', async (req, res) => {
    if (!checkAuth(req, res)) return
    try {
      await access.setGroupMode(req.body.mode)
      res.json({ ok: true })
    } catch (e) {
      res.json({ ok: false, error: e.message })
    }
  })

  app.post('/admin/api/group-add', async (req, res) => {
    if (!checkAuth(req, res)) return
    try {
      await access.addGroupToList(req.body.groupId)
      res.json({ ok: true })
    } catch (e) {
      res.json({ ok: false, error: e.message })
    }
  })

  app.post('/admin/api/group-remove', async (req, res) => {
    if (!checkAuth(req, res)) return
    try {
      await access.removeGroupFromList(req.body.groupId)
      res.json({ ok: true })
    } catch (e) {
      res.json({ ok: false, error: e.message })
    }
  })

  app.post('/admin/api/user-block', async (req, res) => {
    if (!checkAuth(req, res)) return
    try {
      await access.blockUser(req.body.userId)
      res.json({ ok: true })
    } catch (e) {
      res.json({ ok: false, error: e.message })
    }
  })

  app.post('/admin/api/user-unblock', async (req, res) => {
    if (!checkAuth(req, res)) return
    try {
      await access.unblockUser(req.body.userId)
      res.json({ ok: true })
    } catch (e) {
      res.json({ ok: false, error: e.message })
    }
  })
}

module.exports = { setupAdminRoutes }
