<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [String, Number], default: 16 },
  color: { type: String, default: 'currentColor' }
})

const svgUrl = computed(() =>
  new URL(`/assets/ionicons/svg/${props.name}.svg`, import.meta.url).href
)

const sizePx = computed(() =>
  typeof props.size === 'number' ? `${props.size}px` : props.size
)
</script>

<template>
  <span
    class="xm-mask-icon"
    :style="{
      width: sizePx,
      height: sizePx,
      backgroundColor: color,
      WebkitMask: `url(${svgUrl}) no-repeat center / contain`,
      mask: `url(${svgUrl}) no-repeat center / contain`
    }"
  />
</template>

<style scoped>
.xm-mask-icon {
  display: inline-block;
}
</style>
