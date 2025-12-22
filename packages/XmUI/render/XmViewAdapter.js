import { reactive } from 'vue'

export function XmViewAdapter(meta) {
  const state = reactive({
    path: [meta],
    current: meta
  })

  function selectPath(node) {
    state.current = node
    state.path = collectPath(meta, node)
  }

  function jumpTo(idx) {
    state.current = state.path[idx]
    state.path = state.path.slice(0, idx + 1)
  }

  return {
    path: state.path,
    current: state.current,
    selectPath,
    jumpTo
  }
}

function collectPath(root, target, path = []) {
  if (root === target) return [...path, root]
  for (const c of root.children || []) {
    const r = collectPath(c, target, [...path, root])
    if (r) return r
  }
}