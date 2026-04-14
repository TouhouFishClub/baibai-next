const fs = require('fs')
const path = require('path')
const { imageSendDir: IMAGE_DATA } = require('../../config')

function sendGmImage(gmObj, words = '', callback, order) {
  const imgname2 = new Date().getTime() + ''
  const now = new Date()
  const year = now.getFullYear()
  const mon = now.getMonth() < 9 ? ('0' + (now.getMonth() + 1)) : now.getMonth()
  const dat = now.getDate() < 10 ? ('0' + now.getDate()) : now.getDate()
  const folder = '' + year + mon + dat
  const dir = path.join(IMAGE_DATA, folder, 'card')
  if (!fs.existsSync(path.join(IMAGE_DATA, folder))) {
    fs.mkdirSync(path.join(IMAGE_DATA, folder), { recursive: true })
  }
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  gmObj.write(path.join(dir, imgname2 + '.jpg'), function (err) {
    const imgname = path.join('send', folder, 'card', imgname2 + '.jpg')
    let ret
    if (order == 1) {
      ret = '[CQ:image,file=' + imgname + ']\n' + words
    } else {
      ret = words + '\n[CQ:image,file=' + imgname + ']'
    }
    callback(ret.trim())
  })
}

function renderGmImage(gmObj) {
  return new Promise(resolve => {
    const imgname2 = new Date().getTime() + ''
    const now = new Date()
    const year = now.getFullYear()
    const mon = now.getMonth() < 9 ? ('0' + (now.getMonth() + 1)) : now.getMonth()
    const dat = now.getDate() < 10 ? ('0' + now.getDate()) : now.getDate()
    const folder = '' + year + mon + dat
    const dir = path.join(IMAGE_DATA, folder, 'card')
    if (!fs.existsSync(path.join(IMAGE_DATA, folder))) {
      fs.mkdirSync(path.join(IMAGE_DATA, folder), { recursive: true })
    }
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    gmObj.write(path.join(dir, imgname2 + '.jpg'), function (err) {
      const imgname = path.join('send', folder, 'card', imgname2 + '.jpg')
      resolve('[CQ:image,file=' + imgname + ']')
    })
  })
}

const sendImageMsgBuffer = (imgBuffer, imgName, dir, callback, msg = '', order = 'IF') => {
  const imageName = imgName.split('/').join('_')
  const outDir = path.join(IMAGE_DATA, dir)
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }
  fs.writeFile(path.join(outDir, `${imageName}.png`), imgBuffer, err => {
    if (err) {
      console.log(err)
    } else {
      console.log(`保存${imageName}.png成功！`)
      const imgMsg = `[CQ:image,file=${path.join('send', dir, `${imageName}.png`)}]`
      let mixMsg = ''
      switch (order) {
        case 'IF':
          mixMsg = `${imgMsg}${msg.length ? `\n${msg}` : ''}`
          break
        case 'MF':
          mixMsg = `${msg.length ? `${msg}\n` : ''}${imgMsg}`
          break
      }
      callback(mixMsg)
    }
  })
}

module.exports = {
  renderGmImage,
  sendGmImage,
  sendImageMsgBuffer
}
