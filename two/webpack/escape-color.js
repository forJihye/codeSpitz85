function color(query) {
  const self = color
  return (str) => self['reset'](query.split(',').reduce((a, v) => {
    return self[v](a)
  }, str))
}
Object.assign(color, {
  green: (v) => '\u001b[32;1m' + v,
  yellow: (v) => '\u001b[33;1m' + v,

  underline: (v) => '\u001b[4m' + v,
  
  reset: (v) => v + '\u001b[0m',
})
const clear = () => console.clear() //console.log(`\\033[H\\033[2J`),

module.exports = color
