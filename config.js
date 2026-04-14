const path = require('path')

module.exports = {
  port: 44401,
  mongoUrl: 'mongodb://192.168.17.236:27050/db_bot',
  dbName: 'db_bot',

  imageSendDir: path.join(__dirname, '..', 'coolq-data', 'cq', 'data', 'image', 'send'),
  recordSendDir: path.join(__dirname, '..', 'coolq-data', 'cq', 'data', 'record', 'send'),

  botSelfIds: new Set([
    981069482, 3291864216, 1840239061, 2771362647, 384901015
  ]),

  adminUsers: new Set([
    799018865,
    357474405
  ]),

  wsPath: '/baibaiws',
}
