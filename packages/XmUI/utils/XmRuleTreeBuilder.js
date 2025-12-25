// /utils/XmRuleTreeBuilder.js
export function buildRelationTree(entity, fieldKey, meta) {
  const tree = meta?.xmMetaTreeData?.value || [];
  const selected = new Set(entity[fieldKey] || []);

  function mark(nodes) {
    return nodes.map(n => ({
      ...n,
      checked: selected.has(n.key),
      children: n.children ? mark(n.children) : undefined
    }));
  }

  return mark(tree);
}
