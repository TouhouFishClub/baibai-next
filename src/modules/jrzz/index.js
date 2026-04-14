const md5 = require('md5')
const path = require('path')
const fs = require('fs-extra')
const { htmlToImageFile } = require('../../utils/renderImage')

const pigResults = [
  { id:"human",name:"人类",emoji:"👤",description:"检测不出猪元素，是人类吗？",analysis:"你拥有人类的思维和情感，保持着理性和智慧。不过有时候适当放松一下，学学猪的简单快乐也不错哦！" },
  { id:"pig",name:"猪",emoji:"🐷",description:"普通小猪",analysis:"你性格温和，喜欢简单的生活，容易满足。在别人眼中可能有些慵懒，但你知道如何享受生活的美好。" },
  { id:"black-pig",name:"小黑猪",emoji:"🐖",description:"小黑猪，卤出猪脚了",analysis:"你有着独特的魅力，外表低调但内心丰富。" },
  { id:"wild-boar",name:"野猪",emoji:"🐗",description:"你是一只勇猛的野猪！",analysis:"你性格刚强，充满活力和冒险精神。" },
  { id:"zhuge-liang",name:"猪葛亮",emoji:"🐷🧠",description:"猪里最聪明的一个",analysis:"你聪明绝顶，机智过人，有着非凡的智慧和谋略。" },
  { id:"pig-stamp",name:"猪圆章",emoji:"🐷🔴",description:"《猪圈那些事》",analysis:"你做事认真负责，注重细节，有着强烈的责任感。" },
  { id:"zombie-pig",name:"僵尸猪",emoji:"🧟🐷",description:"喜欢的食物是猪脑",analysis:"你有着独特的个性和思维方式，常常让人捉摸不透。" },
  { id:"skeleton-pig",name:"骷髅猪",emoji:"💀🐷",description:"资深不死族",analysis:"你外表看起来有些冷酷，但内心温暖。" },
  { id:"pig-human",name:"猪人",emoji:"🐷👤",description:"你是猪还是人？",analysis:"你兼具猪的可爱和人的智慧，能够在不同的环境中灵活适应。" },
  { id:"demon-pig",name:"恶魔猪",emoji:"😈🐷",description:"满肚子坏心眼",analysis:"你活泼好动，喜欢恶作剧，充满了恶作剧的精神。" },
  { id:"heaven-pig",name:"天堂猪",emoji:"😇🐷",description:"似了喵~",analysis:"你性格善良，心灵纯洁，总是愿意帮助他人。" },
  { id:"explosive-pig",name:"爆破小猪",emoji:"💣🐷",description:"我跟你爆了！",analysis:"你精力充沛，热情似火，有着强烈的感染力。" },
  { id:"black-white-pig",name:"黑白猪",emoji:"⚫⚪🐷",description:"串子",analysis:"你有着矛盾而统一的性格，追求平衡和和谐。" },
  { id:"pork-skewer",name:"猪肉串",emoji:"🍢",description:"真正的串子",analysis:"你性格开朗，善于与人交往，有着很强的亲和力。" },
  { id:"magic-pig",name:"魔法少猪",emoji:"🪄🐷",description:"马猪烧酒",analysis:"你有着丰富的想象力和创造力。" },
  { id:"mechanical-pig",name:"机械猪",emoji:"🤖🐷",description:"人机",analysis:"你思维逻辑清晰，做事有条理。" },
  { id:"pig-ball",name:"猪猪球",emoji:"🏀🐷",description:"滚了",analysis:"你性格活泼好动，充满了青春活力。" },
  { id:"doll-pig",name:"玩偶猪",emoji:"🧸🐷",description:"fufu小猪",analysis:"你外表可爱，性格温柔，让人忍不住想要亲近。" },
  { id:"soul-pig",name:"灵魂猪",emoji:"👻🐷",description:"从冥界归来的猪",analysis:"你有着丰富的内心世界和深刻的思想。" },
  { id:"crystal-pig",name:"水晶猪",emoji:"💎🐷",description:"珍贵又脆弱的小猪",analysis:"你有着纯洁透明的心灵和高雅的气质。" },
  { id:"snow-pig",name:"雪猪",emoji:"❄️🐷",description:"洁白的雪猪",analysis:"你性格纯真，心灵洁净。" },
  { id:"pig-cat",name:"猪咪",emoji:"🐷🐱",description:"你是一只可爱的猪咪！",analysis:"你兼具猪的可爱和猫的优雅。" }
]

const createPigIndex = id => {
  const str = `${id}${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}_pig`
  return parseInt(md5(str).substring(0, 8), 16) % pigResults.length
}

module.exports = {
  name: 'jrzz',
  match(content) {
    const c = content.trim().toLowerCase()
    return c.startsWith('jrzz') || c.startsWith('今日猪猪')
  },
  async handle(ctx) {
    const target = ctx.userId
    const nid = ctx.raw?.sender?.card || ctx.raw?.sender?.nickname || 'unknown'
    const pig = pigResults[createPigIndex(target)]

    const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><style>
*{border:0;padding:0;margin:0;box-sizing:border-box}
body{width:500px;min-height:20px;font-family:'Microsoft YaHei',sans-serif;overflow:hidden;background:linear-gradient(135deg,#FFE4E9 0%,#FFF5F7 50%,#FFE8EC 100%)}
.main{padding:30px;position:relative}
.header{text-align:center;margin-bottom:20px}
.header h1{font-size:32px;color:#FF69B4;text-shadow:2px 2px 4px rgba(255,105,180,.3);margin-bottom:8px}
.user-info{font-size:18px;color:#666;background:rgba(255,255,255,.7);padding:8px 16px;border-radius:20px;display:inline-block}
.card{background:white;border-radius:24px;padding:30px;box-shadow:0 8px 32px rgba(255,105,180,.2);text-align:center}
.emoji-circle{width:140px;height:140px;margin:0 auto 20px;background:linear-gradient(135deg,#FFB6C1,#FFC0CB);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:60px;box-shadow:0 4px 16px rgba(255,105,180,.3)}
.pig-name{font-size:36px;font-weight:bold;color:#FF69B4;margin-bottom:12px}
.pig-emoji{font-size:28px;margin-bottom:16px}
.pig-desc{font-size:20px;color:#888;margin-bottom:20px;padding:12px 20px;background:linear-gradient(135deg,#FFF0F5,#FFE4E9);border-radius:16px;display:inline-block}
.pig-analysis{font-size:16px;color:#666;line-height:1.8;text-align:left;padding:16px;background:#FAFAFA;border-radius:12px;border-left:4px solid #FFB6C1}
.footer{text-align:center;margin-top:20px;font-size:14px;color:#AAA}
</style></head><body><div class="main">
<div class="header"><h1>🐷 今日猪猪 🐷</h1><div class="user-info">${nid} 的今日猪猪</div></div>
<div class="card">
<div class="emoji-circle">${pig.emoji}</div>
<div class="pig-name">${pig.name}</div>
<div class="pig-desc">${pig.description}</div>
<div class="pig-analysis">${pig.analysis}</div>
</div>
<div class="footer"><p>每日结果固定，明天再来看看吧~ 🐽</p></div>
</div></body></html>`

    const imgMsg = await htmlToImageFile(html, path.join('rp_pig', `${target}_jrzz.png`))
    ctx.reply(imgMsg)
  }
}
