var g = [[], [0], [0], [1, 2], [1, 2]]
const reverseG = g => {
  var gr = g.map(_ => [])
  g.forEach((es, i) => es.forEach(v => gr[v].push(i)))
  return gr
}
const topoSort = g => {
  var gr = reverseG(g),
    o = [[]],
    w = g.map(_ => 0)
  s = 0
  g.forEach((es, i) => es.length || o[0].push(i))
  while (o[s].length) {
    let t = []
    o[s].forEach(i =>
      gr[i].forEach(v => ++w[v] && w[v] === g[v].length && t.push(v))
    )
    s++
    o[s] = t
  }
  return [o, s]
}
console.log(topoSort(g))
