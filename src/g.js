const Zero = _ => 0
const True = _ => true
const False = _ => false
const identity = x => x
const newArray = _ => []
const concat = (a, b) => a && a.concat(b)
const flatten = a => a.reduce(concat, [])
const putObj = (o, u, v, val = 1) =>
  o[u] ? (o[u][v] = val) : (o[u] = { v: val })
const delObj = (o, u, v) => {
  if (o[u]) delete o[u][v]
}
const [newStage, setStage, getStage] = (s => [
  _ => ++s,
  f => t => f(t) && (t.stage = s),
  f => t => t.stage === s && f(t)
])(0)
const warpStage = h => (f, hp = h(setStage(f))) => (...args) => {
  newStage()
  return hp(...args)
}
const climb = f => (t, r = t, self = 1) => {
  for (self && (r = f(t, r)); r && t; (r = f(t, r)) && (t = t.p));
  return t
}
const sieve = f => q => {
  for (; q.length; q = q.map(f).filter(identity));
}
const visited = getStage(u => u.v)
const visit = setStage(u => (visited(u) ? 0 : (u.v = 1)))
const lift = climb(visit)
const lifted = t => u => ((u = lift(u)) && u.p === t ? u : 0)
const markVisit = warpStage(climb)(u => (u.v = 1) && (!u.p || (u.p.from = u)))
const lca = (a, b) => markVisit(a) || lift(b)
const abf = (t, uid) => (b, es) =>
  es.filter(v => us[v].p !== t).map(v => putObj(b, uid, v) && v)
const ab = (t, u, f = abf(t, u.uid)) =>
  ((u.ie = f(t.ia, u.ie)).length || (u.oe = f(t.oa, u.oe)).length) && u
const moveIn = warpStage(climb)(
  (t, s) => (s = s.map(u => ab(t, u)).filter(identity)) && s.length && s
)
const dbf = (t, uid) => (b, es) =>
  es.filter(v => (us[v].p === t ? delObj(b, uid, v) : 1))
const setPos = (u, f = dbf(u.pos, u.uid)) => {
  u.pos = u.pos.p
  return ((u.ie = f(t.ia, u.ie)).length || (u.oe = f(t.oa, u.oe)).length) && u
}
const moveOut = (s, t, fp = u => u.pos && !visit(u.pos) && setPos(u)) =>
  s.forEach(u => (u.pos = u.p)) || markVisit(t) || sieve(fp)(s)
const connected = (t, s, cf, w = {}, r, a, lf) => {
  s = (a = (t = lca(s, t)).p).from
  lf = lifted(a)
  cf = u => {
    w[u.name] = 1
    for (let v, i = u.oe.length; i--; )
      if ((v = lf(u.oe[i])))
        if (v === s) return [v]
        else if (!w[v.name] && (r = cf(v))) return concat(r, [u])
  }
  return cf(t)
}
const reverseG = (g, r = null, gr = (r || g).map(newArray)) => {
  g.forEach((es, u) => es.forEach(v => gr[v].push(u)))
  return gr
}
const topoSort = (g, gr = reverseG(g), o = [[]], s = 0, w = g.map(Zero)) => {
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
const sortNodes = (nodes, o) => flatten(o).map(u => nodes[u])
const cycle = (g, u, w, r) => {
  w[u] = 1
  for (let v of g[u])
    if (w[v]) return [v]
    else if ((r = concat(cycle(g, v, w), [v]))) return r
  w[u] = 0
}
const addEdge = (g, u, v) => g[u].push(v)
const remainG = (g, ss, m, ib, n, rg = []) => {
  for (let i = n; i--; rg[i] = []);
  g.forEach(
    (es, u) => ss[u] || es.forEach(v => rg[m[u]].push(ss[v] ? n : m[v]))
  )
  rg[n] = flatten(ib)
  return [m, rg, cycle(rg, n, rg.map(Zero))]
}
const sub = (g, s, cut = false, ss = g.map(Zero), m = ss.slice()) => {
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
const mutex = (ob, rg, gr = reverseG(ob, rg)) => {
  var os = ob.reduce((acc, es, i) => (es.length ? acc.concat([i]) : acc), [])
  if (os.length < 2) return false
  let m = ob.map(Zero)
  os.forEach((u, i) => (m[u] = i))
  return gr.map(es => es.map(u => m[u]))
}
const dt = (f, acc, cf = False, d = True, h) =>
  (h = t => (acc = f(t, d(t) && t.nodes && cf(t.nodes.map(h)), acc)))
const checked = dt(
  (t, s) => (t.checked = t.checked || s),
  0,
  a => a.every(p => p),
  t => !t.checked
)
const reverseT = dt(t => t.gr || (t.gr = reverseG(t.g)))
const treeOrder = dt((t, _, o) => (t.o = o + 1), 0)
const compare = (p, d) => node => d * (p - node.o) > 0
const scon = (
  nodes,
  g,
  cp,
  w = g.map(Zero),
  q = [[], []],
  cur = 0,
  flag = 1
) => {
  for (
    nodes.forEach(
      (node, u) => !cp(node) && node.checked && (w[u] = 1) && q[0].push(u)
    );
    flag && q[cur].length;
    cur ^= 1
  ) {
    q[cur ^ 1] = []
    q[cur].forEach(u =>
      g[u].forEach(
        v =>
          (flag =
            w[v] ||
            ((w[v] = 1) &&
              (cp(nodes[v]) || nodes[v].checked) &&
              (q[cur ^ 1].push(v) || 1)))
      )
    )
  }
  return flag
}
var node_example = {
  uid: 'node',
  ie: [], // node ref
  oe: [], // node ref
  ia: { a: { b: 1 } }, // node name: {node name: 1}
  oa: { b: { c: 1 } }, // node name: {node name: 1}
  p: null // node ref
}
/* var g = [[], [0], [0], [1, 2], [1, 2], [3, 4], [3, 4]]
let [_sg, _ib, ob, _m, rg, cc] = sub(g, [1, 3], true)
console.log(cc || mutex(ob, rg))
 */
const printTree = (
  t,
  indent = '',
  o = Object.assign({}, t),
  ni = indent + '  '
) => {
  delete o.nodes
  console.log(indent, o)
  t.nodes && t.nodes.forEach(node => printTree(node, ni))
}
var t = {
    nodes: [
      { nodes: [{}, { checked: 1 }] },
      {
        nodes: [
          { nodes: [{ checked: 1 }, {}, { checked: 1 }] },
          { nodes: [{ checked: 1 }, { checked: 1 }] }
        ]
      }
    ]
  },
  o = t.nodes[1].nodes[0].nodes[1],
  us = {}
var g = [[], [0], [0], [1, 2], [1, 2], [3, 4], [3, 4]],
  nodes = [
    { o: 0 },
    { o: 1, checked: 1 },
    { o: 2 },
    { o: 3, checked: 1 },
    { o: 4 },
    { o: 5, checked: 1 },
    { o: 6 }
  ]
console.log(scon(nodes, reverseG(g), compare(3, -1)))
