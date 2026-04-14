const path = require('path')
const gm = require('gm')
const imageMagick = gm.subClass({ imageMagick: true })
const { sendGmImage, renderGmImage } = require('./sendImage')

const STATIC_DIR = path.join(__dirname, '..', '..', 'static')

function drawTxtImage(words, txt, callback, options = {}) {
  const wa = txt.split('\n')
  let maxwd = 0
  const uwd = 29
  let uw = ''
  for (let i = 0; i < wa.length; i++) {
    let lw = wa[i]
    let ud = ''
    while (lw.length > uwd) {
      ud = ud + lw.substring(0, uwd) + '\n'
      lw = lw.substring(uwd)
    }
    if (lw.length > 0) {
      uw = uw + ud + lw + '\n'
    } else {
      uw = uw + ud
    }
  }
  const ua = uw.split('\n')
  for (let i = 0; i < ua.length; i++) {
    if (ua[i].length > maxwd) {
      maxwd = ua[i].length
    }
  }
  const len = ua.length
  let lh = 21
  switch (options.font) {
    case 'dfgw.ttf': lh = 21; break
    case 'STXIHEI.TTF': lh = 31; break
    default: lh = 21
  }
  const img1 = new imageMagick(path.join(STATIC_DIR, 'blank.png'))
  img1.resize(maxwd * 19 + 29, len * lh + 29, '!')
    .autoOrient()
    .fontSize(20)
    .fill(options.color || 'blue')
    .font(path.join(STATIC_DIR, options.font || 'dfgw.ttf'))
    .drawText(0, 0, uw, 'NorthWest')
  sendGmImage(img1, words, callback)
}

async function renderTxtImage(txt, options = {}) {
  const wa = txt.split('\n')
  let maxwd = 0
  const uwd = 29
  let uw = ''
  for (let i = 0; i < wa.length; i++) {
    let lw = wa[i]
    let ud = ''
    while (lw.length > uwd) {
      ud = ud + lw.substring(0, uwd) + '\n'
      lw = lw.substring(uwd)
    }
    if (lw.length > 0) {
      uw = uw + ud + lw + '\n'
    } else {
      uw = uw + ud
    }
  }
  const ua = uw.split('\n')
  for (let i = 0; i < ua.length; i++) {
    if (ua[i].length > maxwd) {
      maxwd = ua[i].length
    }
  }
  const len = ua.length
  let lh = 21
  switch (options.font) {
    case 'dfgw.ttf': lh = 21; break
    case 'STXIHEI.TTF': lh = 31; break
    default: lh = 21
  }
  const img1 = new imageMagick(path.join(STATIC_DIR, 'blank.png'))
  img1.resize(maxwd * 19 + 29, len * lh + 29, '!')
    .autoOrient()
    .fontSize(20)
    .fill(options.color || 'blue')
    .font(path.join(STATIC_DIR, options.font || 'dfgw.ttf'))
    .drawText(0, 0, uw, 'NorthWest')
  return await renderGmImage(img1)
}

module.exports = {
  drawTxtImage,
  renderTxtImage
}
