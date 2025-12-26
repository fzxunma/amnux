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

defineOptions({
  name: 'XmApp'
})

const osTheme = useOsTheme()
const theme = computed(() => (osTheme.value === 'light' ? darkTheme : null))

watchEffect(() => {
  document.documentElement.setAttribute(
    'data-theme',
    osTheme.value === 'dark' ? 'light' : 'light'
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
    <n-config-provider class="h-full" :theme="theme">
      <n-loading-bar-provider>
        <n-dialog-provider>
          <n-notification-provider>
            <n-message-provider>
              <ContextHolder />
              <router-view />
              <!-- 可选水印 -->
              <!-- <n-watermark v-bind="watermarkProps" /> -->
            </n-message-provider>
          </n-notification-provider>
        </n-dialog-provider>
      </n-loading-bar-provider>
    </n-config-provider>
  </div>
</template>
