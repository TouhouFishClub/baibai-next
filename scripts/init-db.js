/**
 * 数据库初始化脚本
 * 用于初始化 baibai-next 所需的 MongoDB 集合与索引
 * 
 * 使用: node scripts/init-db.js
 */
const { MongoClient } = require('mongodb')
const config = require('../config')

async function initDb() {
  console.log(`Connecting to: ${config.mongoUrl}`)
  const client = await MongoClient.connect(config.mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  const db = client.db(config.dbName)

  const collections = [
    'cl_chat',
    'cl_txt',
    'cl_menu',
    'cl_calendar',
    'cl_calendar_alias',
    'cl_admin_access',
    'cl_mabinogi_gacha',
    'cl_mabinogi_gacha_info',
    'cl_mabinogi_smuggler',
    'cl_mabinogi_bosswork',
    'cl_mabinogi_tv',
    'cl_mabinogi_cd',
    'cl_mabinogi_zz'
  ]

  const existing = (await db.listCollections().toArray()).map(c => c.name)

  for (const name of collections) {
    if (!existing.includes(name)) {
      await db.createCollection(name)
      console.log(`  Created: ${name}`)
    } else {
      console.log(`  Exists:  ${name}`)
    }
  }

  console.log('\nCreating indexes...')

  await db.collection('cl_chat').createIndex({ gid: 1, ts: -1 })
  await db.collection('cl_chat').createIndex({ ts: -1 })
  console.log('  cl_chat indexes created')

  await db.collection('cl_txt').createIndex({ gid: 1 })
  console.log('  cl_txt indexes created')

  await db.collection('cl_menu').createIndex({ g: 1 })
  console.log('  cl_menu indexes created')

  await db.collection('cl_calendar').createIndex({ project: 1, groupId: 1 })
  console.log('  cl_calendar indexes created')

  await db.collection('cl_mabinogi_gacha').createIndex({ customId: 1 })
  console.log('  cl_mabinogi_gacha indexes created')

  console.log('\nDone! Database initialized successfully.')
  await client.close()
  process.exit(0)
}

initDb().catch(err => {
  console.error('Init failed:', err)
  process.exit(1)
})
