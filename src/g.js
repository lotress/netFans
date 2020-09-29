const Zero = _ => 0
const newArray = _ => []
const concat = (a, b) => a && a.concat(b)
const reverseG = (g, r = null) => {
  var gr = (r || g).map(newArray)
  g.forEach((es, u) => es.forEach(v => gr[v].push(u)))
  return gr
}
const topoSort = g => {
  var gr = reverseG(g),
    o = [[]],
    w = g.map(Zero)
  s = 0
  g.forEach((es, u) => es.length || o[0].push(u))
  while (o[s].length) {
    let t = []
    o[s].forEach(u =>
      gr[u].forEach(v => ++w[v] && w[v] === g[v].length && t.push(v))
    )
    o[++s] = t
  }
  return [o, s]
}
const cycle = (g, u, w) => {
  var r
  w[u] = 1
  for (let v of g[u])
    if (w[v]) return [v]
    else if ((r = concat(cycle(g, v, w), [v]))) return r
  w[u] = 0
}
const addEdge = (g, u, v) => g[u].push(v)
const remainG = (g, ss, m, ib, n) => {
  var rg = []
  for (let i = n; i--; rg[i] = []);
  g.forEach(
    (es, u) => ss[u] || es.forEach(v => rg[m[u]].push(ss[v] ? n : m[v]))
  )
  rg[n] = ib.reduce(concat, [])
  return [m, rg, cycle(rg, n, rg.map(Zero))]
}
const sub = (g, s, cut = false) => {
  var ss = g.map(Zero),
    m = ss.slice()
  s.forEach(u => (ss[u] = 1))
  for (
    let i = m.length, j = s.length, k = i - j;
    i--;
    m[i] = cut ? (ss[i] ? --j : --k) : i
  );
  let sg = s.map(newArray),
    ib = s.map(newArray),
    ob = s.map(newArray)
  g.map(es => es.map(v => ss[v])).forEach((es, u) =>
    es.forEach((w, i) =>
      ss[u]
        ? addEdge(w ? sg : ib, m[u], m[g[u][i]])
        : ss[g[u][i]] && addEdge(ob, m[g[u][i]], m[u])
    )
  )
  return [sg, ib, ob].concat(
    cut ? remainG(g, ss, m, ib, m.length - s.length) : []
  )
}
const mutex = (ob, rg) => {
  var gr = reverseG(ob, rg),
    os = ob.reduce((acc, es, i) => (es.length ? acc.concat([i]) : acc), [])
  if (os.length < 2) return false
  let m = ob.map(Zero)
  os.forEach((u, i) => (m[u] = i))
  return gr.map(es => es.map(u => m[u]))
}
var g = [[], [0], [0], [1, 2], [1, 2], [3, 4], [3, 4]]
let [_sg, _ib, ob, _m, rg, cc] = sub(g, [1, 3], true)
console.log(cc || mutex(ob, rg))
