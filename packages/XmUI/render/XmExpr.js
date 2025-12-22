// expr.js
export function createExprContext(model, extra = {}) {
  return {
    model,
    get(key) {
      return model[key]
    },
    ...extra
  }
}

export function resolveExpr(expr, ctx) {
  if (expr === undefined) return true
  if (typeof expr === 'boolean') return expr
  if (typeof expr === 'function') {
    return !!expr(ctx)
  }
  return true
}
