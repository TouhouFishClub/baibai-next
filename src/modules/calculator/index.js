function cal(str) {
  str = str.replace(/,/g, '')
  if (str.endsWith('=')) str = str.substring(0, str.length - 1)

  const sa = str.split('^')
  if (sa.length === 2) {
    if (parseFloat(sa[0]) == sa[0] && parseFloat(sa[1]) == sa[1]) {
      return Math.pow(parseFloat(sa[0]), parseFloat(sa[1]))
    }
    return undefined
  }

  if (str.endsWith('!') || str.endsWith('！')) {
    let n = str.indexOf('!')
    if (n < 0) n = str.indexOf('！')
    const num = str.substring(0, n)
    if (parseInt(num) == num) return factorial(num)
    return undefined
  }

  str = str.toLowerCase().trim()
  if (str.length === 3 && str[1] === '-') {
    if (!(/\d/.test(str[0])) || !(/\d/.test(str[2]))) return undefined
  }

  const first = str.substring(0, 1)
  if (first === '√' || first === '0' || first === '(' || first === '（' ||
      first === 's' || first === 'c' || first === 't' || first === 'l' ||
      first === 'p' || first === 'e' || first === 'π' || parseInt(str)) {
    let can = true, willcal = false, z = '', needtail = false

    for (let i = 0; i < str.length; i++) {
      const cha = str[i]
      if (cha >= '0' && cha <= '9') {
        z += cha
      } else if (cha === '+' || cha === '-' || cha === '*' || cha === '/') {
        if (i > 0) willcal = true
        if (needtail) { z += ')'; needtail = false }
        z += cha
      } else if (cha === ' ' || cha === '(' || cha === ')' || cha === '.') {
        z += cha
      } else if (cha === '（') { z += '('
      } else if (cha === '）') { z += ')'
      } else if (cha === '×') {
        if (i > 0) willcal = true
        if (needtail) { z += ')'; needtail = false }
        z += '*'
      } else if (cha === '。') { z += '.'
      } else {
        const f = str.substring(i, i + 3)
        if (f === 'sin' || f === 'cos' || f === 'tan' || f === 'log') {
          z += 'Math.' + (f === 'log' ? 'log10' : f)
          if (str[i + 3] !== '(' && str[i + 3] !== '（') { z += '('; needtail = true }
          willcal = true; i += 2
        } else if (f.substring(0, 2) === 'ln') {
          z += 'Math.log'
          if (str[i + 2] !== '(' && str[i + 2] !== '（') { z += '('; needtail = true }
          willcal = true; i += 1
        } else if (f.substring(0, 1) === '√') {
          z += 'Math.sqrt'
          if (str[i + 1] !== '(' && str[i + 1] !== '（') { z += '('; needtail = true }
          willcal = true
        } else if (f === 'pow') {
          willcal = true
          const s = str.substring(i)
          const n1 = s.indexOf('('), n2 = s.indexOf(')')
          if (n1 > 0 && n2 > 0 && n2 > n1) {
            const powstr = s.substring(n1 + 1, n2)
            const pa = powstr.split(',')
            if (pa.length === 2) { z += `Math.pow(${pa[0]},${pa[1]})`; i += 3 + n2 - n1 }
            else { can = false; break }
          } else { can = false; break }
        } else if (f.substring(0, 2) === 'pi') { z += 'Math.PI'; i += 1
        } else if (f.substring(0, 1) === 'π') { z += 'Math.PI'
        } else if (f.substring(0, 1) === 'e') { z += 'Math.E'
        } else { can = false; break }
      }
    }
    if (needtail) z += ')'
    if (can && willcal) {
      try {
        let ret = eval(z)
        const xstr = ret + ''
        if (xstr.indexOf('.') > 0 && xstr.length > 10) {
          const u = ret.toFixed(15)
          const usub = Math.abs(u - ret)
          if (usub < Math.exp(-15) && usub > 0) {
            for (let i = 1; i < 15; i++) {
              if (Math.abs(ret.toFixed(i) - ret) < Math.exp(-15)) { ret = ret.toFixed(i); break }
            }
          }
        }
        return ret
      } catch (e) { /* ignore */ }
    }
  }
}

function factorial(x) {
  if (x > 200) return '∞'
  const arr = [1], n = 10000
  for (let i = 1; i <= x; i++) {
    for (let j = 0; j < arr.length; j++) arr[j] *= i
    for (let j = 0; j < arr.length; j++) {
      if (arr[j] > n) {
        const u = Math.floor(arr[j] / n)
        arr[j] = arr[j] % n
        arr[j + 1] = (arr[j + 1] || 0) + u
      }
    }
  }
  let r = ''
  for (let i = 0; i < arr.length; i++) {
    const px = arr[arr.length - i - 1]
    if (i === 0) { r += px }
    else {
      if (px < 10) r += '000' + px
      else if (px < 100) r += '00' + px
      else if (px < 1000) r += '0' + px
      else r += px
    }
  }
  return r
}

module.exports = {
  name: 'calculator',
  match(content) {
    return cal(content) !== undefined
  },
  handle(ctx) {
    const result = cal(ctx.content)
    if (result !== undefined) {
      ctx.reply(`${ctx.content}=${result}`)
    }
  }
}
