// XmFormValidator.js
export function validateField(field, value, formModel) {
  const rules = field.rules || []
  const errors = []

  for (const rule of rules) {
    if (rule.required && (value === null || value === undefined || value === '')) {
      errors.push(rule.message || `${field.label || field.key} 为必填`)
    }
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(rule.message || `${field.label || field.key} 格式不正确`)
    }
    if (rule.validator && typeof rule.validator === 'function') {
      const res = rule.validator(value, formModel)
      if (res !== true) errors.push(res || `${field.label || field.key} 校验失败`)
    }
  }

  return errors
}

export function validateForm(fields, formModel) {
  const allErrors = {}
  fields.forEach(f => {
    const errs = validateField(f, formModel[f.key], formModel)
    if (errs.length) allErrors[f.key] = errs
  })
  return allErrors
}
