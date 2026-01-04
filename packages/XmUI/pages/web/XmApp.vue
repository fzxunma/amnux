<script setup>
import { computed, ref, onMounted, watchEffect } from 'vue'
import {
  NConfigProvider,
  NLoadingBarProvider,
  NDialogProvider,
  NNotificationProvider,
  NMessageProvider,
  darkTheme,
  useOsTheme,
  useDialog,
  useLoadingBar,
  useMessage,
  useNotification
} from 'naive-ui'
import { createTextVNode, defineComponent, h } from 'vue'
import { ThemePresets } from '/theme/index.js'

defineOptions({
  name: 'XmApp'
})
const osTheme = useOsTheme()
const theme = computed(() => (osTheme.value === 'dark' ? darkTheme : null))

watchEffect(() => {
  document.documentElement.setAttribute(
    'data-theme',
    osTheme.value === 'dark' ? 'dark' : 'light'
  )
})

const msg = "Hello Xunma!"
const time = ref(new Date().toLocaleTimeString())

onMounted(() => {
  setInterval(() => {
    time.value = new Date().toLocaleTimeString()
  }, 1000)
})

const watermarkProps = computed(() => ({
  content: `${msg} ${time.value}`,
  cross: true,
  fullscreen: true,
  fontSize: 16,
  lineHeight: 16,
  width: 384,
  height: 384,
  xOffset: 12,
  yOffset: 60,
  rotate: -15,
  zIndex: 9999
}))

// 全局注册 $message、$dialog 等（供非组合式 API 场景使用）
const ContextHolder = defineComponent({
  name: 'ContextHolder',
  setup() {
    window.$loadingBar = useLoadingBar()
    window.$dialog = useDialog()
    window.$message = useMessage()
    window.$notification = useNotification()
    return () => h('div') // 必须返回一个 VNode，createTextVNode 也可以
  }
})

</script>

<template>
  <!-- 外层 wrapper 负责全屏背景渐变 -->
  <div class="app-wrapper">
    <NConfigProvider class="h-full" :theme="theme" :theme-overrides="ThemePresets.default">
      <NLoadingBarProvider>
        <NDialogProvider>
          <NNotificationProvider>
            <NMessageProvider>
              <ContextHolder />
              <router-view />
              <!-- 可选水印 -->
              <!-- <n-watermark v-bind="watermarkProps" /> -->
            </NMessageProvider>
          </NNotificationProvider>
        </NDialogProvider>
      </NLoadingBarProvider>
    </NConfigProvider>
  </div>
</template>
