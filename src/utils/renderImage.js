const nodeHtmlToImage = require('node-html-to-image')
const path = require('path')
const fs = require('fs-extra')
const config = require('../../config')

async function htmlToImageFile(html, outputRelative) {
  const output = path.join(config.imageSendDir, outputRelative)
  await fs.ensureDir(path.dirname(output))
  await nodeHtmlToImage({ output, html })
  return `[CQ:image,file=${path.join('send', outputRelative)}]`
}

async function htmlToBase64(html) {
  const buffer = await nodeHtmlToImage({ html, encoding: 'base64' })
  return `[CQ:image,file=base64://${buffer}]`
}

module.exports = { htmlToImageFile, htmlToBase64 }
