<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia' 
import { NBreadcrumb, NBreadcrumbItem } from 'naive-ui'
import { useMenuDataStore } from '/store/XmMenuData.js'

const menuDataStore = useMenuDataStore()
const { menuOptions, menuOptionsMap, menuKey } = storeToRefs(menuDataStore)

const breadcrumbList = computed(() => {
  const list = []
  
  // 1. 获取一级菜单 Label
  const currentMainKey = menuKey.value
  const mainItem = menuOptions.value.find(item => item.key === currentMainKey)
  
  if (mainItem) {
    list.push(mainItem.label)
  }

  // 2. 获取子菜单路径 (递归查找)
  const currentSubKey = menuDataStore.getMenuSubKey()
  if (!currentSubKey) return list

  const sidebarOptions = menuOptionsMap.value[currentMainKey] || []
  let targetNode = null // 用于临时存储找到的节点对象，以便后续判断是否有 Tab

  function findPath(items) {
    for (const item of items) {
      if (item.key === currentSubKey) {
        targetNode = item // 找到了，存下来
        return [item.label]
      }
      
      if (item.children && item.children.length > 0) {
        const childPath = findPath(item.children)
        if (childPath) {
          return [item.label, ...childPath]
        }
      }
    }
    return null
  }

  const subPath = findPath(sidebarOptions)
  if (subPath) {
    list.push(...subPath)
  }

  // 3. ✅【新增】获取 Tab 级 Label
  // 只有当 store 里记录了 tab，并且该节点确实配置了 tabs 时才显示
  const activeTabTitle = menuDataStore.getMenuTabKey(currentSubKey)
  
  if (activeTabTitle && targetNode && Array.isArray(targetNode.tabs) && targetNode.tabs.length > 0) {
    // 校验一下选中的 tab 是否还在配置列表里 (防止脏数据)
    const isValidTab = targetNode.tabs.some(t => t.title === activeTabTitle)
    if (isValidTab) {
      list.push(activeTabTitle)
    }
  }

  return list
})
</script>

<template>
  <n-breadcrumb>
    <n-breadcrumb-item v-for="(label, index) in breadcrumbList" :key="index">
      {{ label }}
    </n-breadcrumb-item>
  </n-breadcrumb>
</template>
