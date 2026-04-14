const { MongoClient } = require('mongodb')
const config = require('../../config')

let client = null

async function getClient() {
  if (client) return client
  try {
    client = await MongoClient.connect(config.mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10
    })
    console.log('[DB] MongoDB connected')
    return client
  } catch (e) {
    console.error('[DB] MongoDB connection failed:', e.message)
    throw e
  }
}

async function getDb(name) {
  const c = await getClient()
  return c.db(name || config.dbName)
}

async function getCollection(collectionName, dbName) {
  const db = await getDb(dbName)
  return db.collection(collectionName)
}

module.exports = { getClient, getDb, getCollection }
