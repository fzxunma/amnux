import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

let uid = 1
const nextId = () => ++uid

function findPanel(panel, id) {
  if (!panel) return null
  if (panel.id === id) return panel
  if (panel.children) {
    for (const c of panel.children) {
      const r = findPanel(c, id)
      if (r) return r
    }
  }
  return null
}
function removePanel(parent, id) {
  if (!parent?.children) return false

  // 1. 直接在当前层查找并删除
  const idx = parent.children.findIndex(c => c.id === id)
  if (idx !== -1) {
    parent.children.splice(idx, 1)

    // 删除后，如果当前容器变空了，向上通知（由调用者处理坍缩）
    return true
  }

  // 2. 递归到子节点删除
  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i]
    if (removePanel(child, id)) {
      // 删除成功后，检查当前容器是否变空
      if (child.children && child.children.length === 0) {
        // 如果子容器空了，删除这个空容器
        parent.children.splice(i, 1)
      } else if (child.children && child.children.length === 1) {
        // 如果子容器只剩一个子节点，坍缩一层（提升孙子到儿子位置）
        parent.children[i] = child.children[0]
      }
      return true
    }
  }

  return false
}
function buildTree(panel, prefix = '1') {
  const node = {
    label: prefix,
    key: panel.id,
    value: panel.id
  }
  if (panel.children?.length) {
    node.children = panel.children.map((c, i) =>
      buildTree(c, `${prefix}.${i + 1}`)
    )
  }
  return node
}

export const useLayoutData = defineStore('XmLayoutData', () => {
  const rootPanel = ref({
    id: nextId(),
    type: 'row',
    children: [
      { id: nextId(), type: 'leaf' }
    ]
  })

  const activePanelId = ref(null)
  const showDrawer = ref(false)

  const activePanel = computed(() =>
    findPanel(rootPanel.value, activePanelId.value)
  )

  const treeOptions = computed(() => [
    buildTree(rootPanel.value)
  ])

  const selectPanel = (id, show) => {
    activePanelId.value = id
    if (show === true) {
      showDrawer.value = true
    }
  }

  const closeDrawer = () => {
    showDrawer.value = false
    activePanelId.value = null
  }

  const deleteActive = () => {
    if (!activePanelId.value || activePanelId.value === rootPanel.value.id) {
      console.warn('不能删除根节点')
      return
    }

    const deleted = removePanel(rootPanel.value, activePanelId.value)

    if (deleted) {
      activePanelId.value = null
      showDrawer.value = false
      console.log('删除成功')

      // 保底：确保根节点至少有一个 leaf
      if (!rootPanel.value.children || rootPanel.value.children.length === 0) {
        rootPanel.value.children = [{ id: nextId(), type: 'leaf' }]
      }
    } else {
      console.warn('未找到要删除的节点')
    }
  }

  return {
    rootPanel,
    activePanelId,
    activePanel,
    treeOptions,
    showDrawer,
    selectPanel,
    closeDrawer,
    deleteActive
  }
})
