/**
 * 兼容层 - 为从旧版迁移的模块提供 baibaiConfigs 和 mongo 的兼容接口
 * 迁移的模块只需要将 require 路径改为指向此文件即可
 */
const config = require('../../../config')
const { getClient } = require('../../db/mongo')

module.exports = {
  IMAGE_DATA: config.imageSendDir,
  mongourl: config.mongoUrl,
  myip: '127.0.0.1',
  LOCALE_IP: '127.0.0.1',
  getClient
}
