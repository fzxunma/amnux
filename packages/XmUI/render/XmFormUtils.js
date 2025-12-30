// XmFormUtils.js
export function createGroupMap(fields) {
  const map = {}
  fields.forEach(f => {
    const g = f.group || '_default'
    if (!map[g]) map[g] = []
    map[g].push(f)
  })
  return map
}

export function getGroupNames(groupMap) {
  return Object.keys(groupMap)
}

export function resolveFieldProps(f, exprCtx) {
  const p = {}
  ;[
    'clearable', 'placeholder', 'maxlength', 'minlength', 'showCount',
    'min', 'max', 'step', 'size', 'precision',
    'showPassword', 'allowInput'
  ].forEach(k => f[k] !== undefined && (p[k] = f[k]))

  if (typeof f.disabled === 'function') p.disabled = f.disabled(exprCtx)
  else if (f.disabled !== undefined) p.disabled = f.disabled

  if (typeof f.readonly === 'function') p.readonly = f.readonly(exprCtx)
  else if (f.readonly !== undefined) p.readonly = f.readonly

  return p
}
