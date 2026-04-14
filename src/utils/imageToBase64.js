const fs = require('fs')

function localImageToBase64(localPath) {
  const data = fs.readFileSync(localPath)
  return data.toString('base64')
}

function localAssetsToBase64(localPath) {
  const data = fs.readFileSync(localPath)
  return data.toString('base64')
}

module.exports = { localImageToBase64, localAssetsToBase64 }
