<template>

  <NPopover placement="bottom-end" trigger="click">
    <!-- 触发按钮 -->
    <template #trigger>
      <NButton size="small">
        {{ $t('common.columnSetting') }}
      </NButton>
    </template>

    <!-- 拖拽列面板 -->
    <VueDraggable v-model="columns" :animation="150" filter=".none_draggable">
      <div
        v-for="item in columns"
        :key="item.key"
        class="h-36px flex-y-center rd-4px hover:(bg-primary bg-opacity-20)"
        :class="{ hidden: !item.visible }"
      >
      <span>la </span>
        <NCheckbox v-model:checked="item.checked" class="none_draggable flex-1">
          <template v-if="typeof item.title === 'function'">
            <component :is="item.title" />
          </template>
          <template v-else>{{ item.title }}</template>
        </NCheckbox>
      </div>
    </VueDraggable>
  </NPopover>
</template>

<script setup>
import { ref } from 'vue'
import { NPopover, NButton, NCheckbox } from 'naive-ui'
import { VueDraggable } from 'vue-draggable-plus'
import XmSvgIcon from '/components/icon/XmSvgIcon.vue'
const $t  = (value)=>value
// 列配置示例
const columns = ref([
  { key: 'name', title: '用户名', visible: true, checked: true },
  { key: 'gender', title: '性别', visible: true, checked: true },
  { key: 'email', title: '邮箱', visible: true, checked: true },
  { key: 'status', title: '状态', visible: true, checked: true }
])
</script>
