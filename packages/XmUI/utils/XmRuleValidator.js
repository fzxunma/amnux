export function validateByRules(entity, rule) {
  for (const [key, field] of Object.entries(rule.fields)) {
    if(field.required && !entity[key]) throw new Error(`${key} 为必填项`);
    if(field.type === "relation") {
      const value = entity[key]||[];
      if(field.min && value.length<field.min) throw new Error(`${key} 最少 ${field.min} 个`);
      if(field.max && value.length>field.max) throw new Error(`${key} 最多 ${field.max} 个`);
    }
  }
}

export function buildNaiveRules(metaRule) {
  const rules = {};

  for (const [key, field] of Object.entries(metaRule.fields)) {
    const fieldRules = [];

    if (field.required) {
      fieldRules.push({
        required: true,
        message: `${field.label || key} 必填`,
        trigger: ["blur", "change"]
      });
    }

    if (field.type === "relation" && field.min) {
      fieldRules.push({
        validator: (_, value = []) =>
          value.length >= field.min ||
          new Error(`${field.label} 至少选择 ${field.min} 个`)
      });
    }

    rules[key] = fieldRules;
  }

  return rules;
}
