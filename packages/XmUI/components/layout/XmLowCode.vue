<script setup>
import { reactive, ref, watch, nextTick, shallowRef } from 'vue'
import { NEmpty } from 'naive-ui'
import XmLowCodeUI from '/render/XmLowCodeUI.js'
import { useMenuDataStore } from '/store/XmMenuData.js'
import { defaultMeta } from '/store/XmMetaDefault.js'
import { loadDynamicPage } from "/utils/XmPageload.js"
import { XmMeta } from '/store/XmMeta.js'
import XmLayoutView from './XmLayoutView.vue'  // 改成引入 XmLayoutView

// ⚡️ 接收完整的 Panel 对象，而不是 ID
const props = defineProps({
  panelConfig: { type: Object, required: true }
})

defineOptions({ name: 'XmLowCode' })

const menuStore = useMenuDataStore()
const layoutPanels = ref([])

// 状态控制
const isReady = ref(false)
const hasConfig = ref(false)
const currentMode = ref('default')
const dynamicComponent = shallowRef(null)
const meta = reactive(defaultMeta())

// 防递归深度计数器（解决 menu 模式死循环）
const loadingDepth = ref(0)

// 动态组件加载器
async function loadExternalComponent(pathStr) {
  if (!pathStr) return null
  const cleanPath = pathStr.startsWith('/') ? pathStr.slice(1) : pathStr
  const pathSegments = cleanPath.split('/')
  let pageId = "Index"
  let pagePath = "home"

  if (pathSegments.length > 0) {
    pagePath = pathSegments[0]
    if (pathSegments.length > 1) {
      const lastSegment = pathSegments[pathSegments.length - 1]
      if (lastSegment.length > 0) {
        pageId = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
      }
    }
  }
  const pageName = `Xm${pageId}`
  return loadDynamicPage("Xm", pagePath, pageName)
}

async function loadFromPanel() {
  loadingDepth.value++
  console.log('[XmLowCode DEPTH CHECK]', {
    depth: loadingDepth.value,
    panelId: props.panelConfig?.id || 'no-id',
    view: props.panelConfig?.content?.lowCode?.view || 'no-view',
    viewAddress: props.panelConfig?.content?.lowCode?.viewAddress || 'no-address'
  })

  if (loadingDepth.value > 5) {
    console.warn('[XmLowCode] DEPTH LIMIT REACHED - BLOCKING', loadingDepth.value)
    hasConfig.value = false
    isReady.value = true
    loadingDepth.value--
    return
  }

  const p = props.panelConfig
  isReady.value = false
  currentMode.value = 'default'
  dynamicComponent.value = null
  hasConfig.value = false

  try {
    let newConfig = defaultMeta()

    if (p && p.content && p.content.lowCode) {
      const savedData = JSON.parse(JSON.stringify(p.content.lowCode))
      Object.assign(newConfig, savedData)
    }

    if (newConfig.view === 'menu' && newConfig.viewAddress) {
      const targetItem = menuStore.getMenuItem(newConfig.viewAddress)
      if (targetItem) {
        let keyPath = []
        // 如果没有从 persist 取到，使用 targetItem 的 parents + key 构建
        if (!keyPath.length && targetItem._parents) {
          // 正确拼接：['xm', 'XmLayout', ...parents, key]
          keyPath = ['xm', 'XmLayout', ...targetItem._parents, targetItem.key]
        }

        // 兜底：如果还是没有 parents，就用 viewAddress（但加警告）
        if (!keyPath.length) {
          keyPath = ['xm', 'XmLayout', newConfig.viewAddress]
        }

        try {
          const layoutEntity = await XmMeta.fetchEntity(keyPath)
          const content = layoutEntity && layoutEntity.content
          let nextPanels = []
          if (Array.isArray(content?.rootPanels)) {
            nextPanels = content.rootPanels
          } else if (Array.isArray(content)) {
            nextPanels = content
          }
          if (nextPanels.length > 0) {
            layoutPanels.value = nextPanels
            console.log('[XmLowCode] layoutPanels (all)', layoutPanels.value)
            currentMode.value = 'layout'
            hasConfig.value = true
          } else {
            console.log('[XmLowCode] layout empty for menu', {
              keyPath,
              keyStr: XmMeta.getKeyStr(keyPath),
              subKey: newConfig.viewAddress
            })
          }
        } catch (e) {
          console.error('[XmLowCode] load layout by menu failed', e)
        }
        const targetConfig = targetItem.meta || targetItem.content?.lowCode || targetItem.lowCode || {}
        const { view, viewAddress, ...restConfig } = targetConfig
        Object.assign(newConfig, restConfig)
        if (view) newConfig.view = view
        if (viewAddress) newConfig.viewAddress = viewAddress
        if (!layoutPanels.value.length) {
          hasConfig.value = true
        }
      } else {
        if (menuStore.isLoaded) {
          console.warn(`[XmLowCode] 未找到菜单 Key: ${newConfig.viewAddress}`)
        }
      }
    }

    Object.keys(meta).forEach(k => delete meta[k])
    Object.assign(meta, newConfig)

    if (!meta.data) {
      meta.data = (meta.mode === 'table' || meta.mode === 'cardlist') ? [] : {}
    }

    if (meta.view === 'address' && meta.viewAddress) {
      currentMode.value = 'component'
      dynamicComponent.value = await loadExternalComponent(meta.viewAddress)
      hasConfig.value = !!dynamicComponent.value
    } else if (meta.view === 'webAddress' && meta.viewAddress) {
      currentMode.value = 'iframe'
      hasConfig.value = true
    } else if (meta.view === 'menu') {
      if (layoutPanels.value.length > 0) {
        currentMode.value = 'layout'
        hasConfig.value = true
      } else {
        currentMode.value = 'default'
      }
    } else {
      currentMode.value = 'default'
      hasConfig.value = (p?.content?.lowCode?.fields?.length > 0)
    }

  } catch (e) {
    console.error("[XmLowCode] 加载失败:", e)
    hasConfig.value = false
  } finally {
    loadingDepth.value--
    nextTick(() => {
      isReady.value = true
    })
  }
}

watch(
  () => props.panelConfig?.content?.lowCode,
  loadFromPanel,
  { immediate: true, deep: true }
)

watch(
  () => menuStore.isLoaded,
  (loaded) => {
    if (loaded && meta.view === 'menu' && meta.viewAddress && !hasConfig.value) {
      loadFromPanel()
    }
  }
)
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <template v-if="isReady && hasConfig">
      <template v-if="currentMode === 'component'">
        <component :is="dynamicComponent" />
      </template>

      <template v-else-if="currentMode === 'iframe'">
        <iframe :src="meta.viewAddress" class="w-full h-full border-none block"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>
      </template>

      <template v-else-if="currentMode === 'layout'">
        <div class="flex-1 min-h-0 overflow-auto">
          <!-- 修改为使用 XmLayoutView 渲染 -->
           <XmLayoutView 
            :panels="layoutPanels"
          /> 
        </div>
      </template>

      <template v-else>
        <div class="flex-1 min-h-0 overflow-auto">
          <XmLowCodeUI :meta="meta" :model-value="meta.data" />
        </div>
      </template>
    </template>

    <template v-else-if="isReady && !hasConfig">
      <div class="w-full h-full flex items-center justify-center border-1 border-dashed border-gray-200 rounded-lg">
        <n-empty description="暂无配置">
          <template #extra>
            <div class="text-xs text-gray-400 flex flex-col items-center gap-1">
              <span v-if="meta.view === 'menu'">无法读取菜单元数据</span>
              <span v-else-if="meta.view === 'address'">组件加载失败</span>
              <span v-else-if="meta.view === 'webAddress'">Web地址无效</span>
              <span v-else>请点击右上角 "S" 按钮添加字段</span>
            </div>
          </template>
        </n-empty>
      </div>
    </template>

    <template v-else>
      <div class="p-4 text-center text-gray-400">加载中...</div>
    </template>
  </div>
</template>