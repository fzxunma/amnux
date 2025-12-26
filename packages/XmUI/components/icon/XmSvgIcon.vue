<script setup>
import { computed, watch } from 'vue'

// props
const props = defineProps({
  // SVG 文件名（不带 .svg），放在 public/icons/ 目录下
  // 示例：name="apps" → 会加载 /icons/apps.svg
  name: {
    type: String,
    required: true
  },
  // 可选：自定义大小（默认 1em，继承父级字体大小）
  size: {
    type: [String, Number],
    default: '1em'
  },
  // 可选：自定义颜色（默认 currentColor，自动继承主题色）
  color: {
    type: String,
    default: 'currentColor'
  }
})

// 计算 SVG URL
const svgUrl = computed(() => {
  return new URL(`/assets/ionicons/svg/${props.name}.svg`, import.meta.url).href
})

// 监听 SVG 加载错误（开发时友好提示）
watch(svgUrl, (url) => {
  fetch(url).catch(() => {
    console.warn(`[SvgIcon] 图标加载失败: ${props.name}.svg`)
  })
}, { immediate: true })
</script>

<template>
  <img
    :src="svgUrl"
    :alt="`${props.name} icon`"
    class="svg-icon"
    :style="{ width: size, height: size, fill: color }"
  />
</template>

<style scoped>
.svg-icon {
  display: inline-block;
  vertical-align: middle;
  /* 让颜色可继承（重要！支持 Naive UI 主题） */
  color: inherit;
  fill: currentColor;
  /* 防止图片拉伸 */
  object-fit: contain;
}
</style>