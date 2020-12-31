const newExpr = (code, priority = +Infinity) => new Object({ code, priority })
const NullExpr = newExpr('')
const symbols = {}
;[
  [':'],
  ['and', 'or'],
  ['not'],
  ['&', '^'],
  ['+', '-'],
  ['@', '*', '/'],
  ['**'],
  ['[', ']', '.'],
  ['(', ')']
].forEach((arr, i) => arr.forEach(op => (symbols[op] = newExpr(op, i))))
const gcd = (p, q, t) => {
  if (p < q) {
    t = p
    p = q
    q = t
  }
  while (p % q) {
    t = p % q
    q = p
    p = t
  }
  return q
}
const arrayEqual = (a1, a2) => {
  if (a1.length !== a2.length) return false
  for (let i = a1.length; i-- && a1[i] === a2[i]; );
  return a1[i] === a2[i]
}
const ccArr = (a1, a2) => a1.concat(a2).sort()
const newTerm = (p = 1, q = 1, fac = [], denom = []) =>
  Object.assign({ p, q, fac, denom }, symbols['*'])
const simplifyTerm = (
  term,
  t,
  fac = [],
  denom = [],
  i,
  j,
  a1 = term.fac,
  a2 = term.denom
) => {
  if (!term.p) return
  t = gcd(term.p, term.q)
  for (
    i = a1.length, j = a2.length;
    i-- && j--;
    a1[i] > a2[j] ? fac.push(a1[i]) : a1[i] < a2[j] && denom.push(a2[j])
  );
  return Object.assign(term, {
    p: term.p / t,
    q: term.q / t,
    fac: a1.slice(0, i).concat(fac.reverse()),
    denom: a2.slice(0, j).concat(denom.reverse)
  })
}
const newPolynomial = (terms = []) => Object.assign({ terms }, symbols['+'])
const divideTerm = (term1, term2) =>
  simplifyTerm(
    newTerm(
      term1.p * term2.q,
      term1.q * term2.p,
      ccArr(term1.fac, term2.denom),
      ccArr(term1.denom, term2.fac)
    )
  )
const multipleTerm = (term1, term2) =>
  simplifyTerm(
    newTerm(
      term1.p * term2.p,
      term1.q * term2.q,
      ccArr(term1.fac, term2.fac),
      ccArr(term1.denom, term2.denom)
    )
  )
const regexSpaces = /  +/g
const regexIdentifiers = /[a-zA-Z_$][0-9a-zA-Z_$]*/
symbols['('].pair = symbols[')']
symbols['['].pair = symbols[']']
const parenthese = expr => newExpr(`(${expr.code})`, symbols['('].priority)
const associate = op => expr =>
  expr && op.priority > expr.priority ? parenthese(expr) : expr
const toString = x => (x ? x.code : '')
const concatOp = (expr1, op, expr2 = NullExpr, lazy = false, a, res) => {
  typeof op === 'string' && (op = symbols[op])
  a = associate(op)
  if (lazy) {
    res = newExpr(op.code, op.priority)
    res.expr1 = expr1
    res.expr2 = expr2
    return res
  }
  return newExpr(
    [a(expr1), op, a(expr2), op.pair]
      .map(toString)
      .join(' ')
      .trim()
      .replace(regexSpaces, ' '),
    op.priority
  )
}
const concatAll = (exprs, op) =>
  exprs.reduce((acc, expr) => concatOp(acc, op, expr))
