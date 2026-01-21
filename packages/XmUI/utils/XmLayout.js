// /utils/XmLayout.js
export function getPanelPath(panel, rootPanels) {
  const path = []

  function search(nodes, targetId) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (node.id === targetId) {
        path.unshift(i + 1)
        return true
      }
      if (node.children && search(node.children, targetId)) {
        path.unshift(i + 1)
        return true
      }
    }
    return false
  }

  search(rootPanels, panel.id)
  return path.join('-')
}
