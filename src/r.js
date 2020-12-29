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
const regexSpaces = /  +/g
const regexIdentifiers = /[a-zA-Z_$][0-9a-zA-Z_$]*/
symbols['('].pair = symbols[')']
symbols['['].pair = symbols[']']
const parenthese = expr => newExpr(`(${expr.code})`, symbols['('].priority)
const associate = op => expr =>
  expr && op.priority > expr.priority ? parenthese(expr) : expr
const toString = x => (x ? x.code : '')
const concatOp = (expr1, op, expr2 = NullExpr, a) => {
  typeof op === 'string' && (op = symbols[op])
  a = associate(op)
  return newExpr(
    [a(expr1), op, a(expr2), op.pair]
      .map(toString)
      .join(' ')
      .trim()
      .replace(regexSpaces, ' '),
    op.priority
  )
}
