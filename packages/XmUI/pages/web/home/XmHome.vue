<script setup>
import { ref, onMounted } from 'vue'
import XmSvgIcon from '/components/icon/XmSvgIcon.vue'  // 注意别名 @

console.log('home page loaded')

// 可选：测试动态图标
const iconName = ref('bar-chart-outline')

onMounted(() => {
  console.log('Home component mounted')
})
</script>

<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold underline flex items-center">
      首页
      <!-- 正确使用 XmSvgIcon -->
      <XmSvgIcon
        :name="iconName"
        class="inline-block ml-3 w-8 h-8 text-green-600"
      />
    </h1>

    <!-- 示例：多个图标 -->
    <div class="mt-8 flex items-center gap-6 text-lg">
      <span>进程</span>
      <XmSvgIcon name="apps-outline" class="w-6 h-6 text-blue-600" />

      <span>性能</span>
      <XmSvgIcon name="trending-up-outline" class="w-6 h-6 text-orange-600" />

      <span>用户</span>
      <XmSvgIcon name="people-outline" class="w-6 h-6 text-purple-600" />

      <span>服务</span>
      <XmSvgIcon name="cog-outline" class="w-6 h-6 text-gray-600" />
    </div>

    <!-- 测试图标不存在的情况（控制台会警告） -->
    <!-- <XmSvgIcon name="not-exist-icon" class="w-10 h-10" /> -->
  </div>
</template>

<style scoped>
/* 可选：让 SVG 图标颜色继承当前文本色 */
h1 :deep(.svg-icon) {
  fill: currentColor;
}
</style>