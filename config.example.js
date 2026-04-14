const path = require('path')

module.exports = {
  port: 10086,
  mongoUrl: 'mongodb://127.0.0.1:27017/db_bot',
  dbName: 'db_bot',

  imageSendDir: path.join(__dirname, '..', 'coolq-data', 'cq', 'data', 'image', 'send'),
  recordSendDir: path.join(__dirname, '..', 'coolq-data', 'cq', 'data', 'record', 'send'),

  botSelfIds: new Set([]),
  adminUsers: new Set([]),

  wsPath: '/baibaiws',
}
