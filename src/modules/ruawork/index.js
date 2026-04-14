module.exports = {
  name: 'ruawork',
  match(content) {
    const c = content.trim()
    return c === 'ruawork' || (c.indexOf('茹娅') + 1 && c.indexOf('上班') + 1)
  },
  handle(ctx) {
    const dsp = v => v < 10 ? '0' + v : v
    const chDay = (date, next, adj2) => (Math.floor(((date.getTime() + adj2 * 1000) / (1000 * 60)) / 36) + next) * 36
    let msg = ''
    const adjust_value = 0
    const adjust_value2 = Math.floor(adjust_value * 1.5)

    const date = new Date()
    date.setUTCHours(date.getUTCHours() + 8)

    const second_source = Math.floor((date.getTime() % 2160000) / 1500) + adjust_value
    const ETHours = Math.floor(second_source / 60)
    const ETMinutes = Math.floor(second_source % 60)
    msg += `爱琳时间：${dsp(ETHours)}:${dsp(ETMinutes)}\n`

    const now = new Date()
    msg += `现实时间：${dsp(now.getHours())}:${dsp(now.getMinutes())}\n`

    const rua = '0010001000010010110111000000010100100010001'
    const mg_count = 43, mg_rag = 10, mg_time = 17 * 1.5
    const e_hour = Math.floor(second_source / 60) % 24
    const eweca = (e_hour >= 17 || e_hour < 6)

    for (let i = 0; i < 5; i++) {
      const aaa = chDay(date, i - (e_hour < 6 ? 1 : 0), adjust_value2)
      const min = Math.floor(aaa + mg_time) % 60
      const hour = Math.floor((aaa + mg_time) / 60) % 24
      const mgNo = (Math.floor(aaa / 36) + mg_rag) % mg_count

      const w_sec = Math.floor((aaa + mg_time + (eweca ? 13 * 1.5 : 0)) * 60)
      const n_sec = Math.floor(date.getTime() / 1000) + adjust_value2
      const status = rua.substr(mgNo, 1) == 1 ? '上班' : '休息'
      const extra = i === 0
        ? `${eweca ? '酒馆营业中，距离关店还有' : '酒馆准备中，距离开店还有'}${parseInt((w_sec - n_sec) / 60) % 60}分${dsp((w_sec - n_sec) % 60)}秒`
        : ''
      msg += `${dsp(hour)}:${dsp(min)}   ${status}   ${extra}\n`
    }
    ctx.reply(msg.trim())
  }
}
