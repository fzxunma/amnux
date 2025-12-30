<template>
  <NSpace :align="itemAlign" wrap justify="end" class="lt-sm:w-200px">
    <!-- 前缀插槽 -->
    <slot name="prefix"></slot>

    <!-- 默认按钮组 -->
    <slot name="default">
      <NButton size="small" ghost type="primary" @click="add">
        {{ $t('common.add') }}
      </NButton>

      <NPopconfirm @positive-click="batchDelete">
        <template #trigger>
          <NButton size="small" ghost type="error" :disabled="disabledDelete">
            {{ $t('common.batchDelete') }}
          </NButton>
        </template>
        {{ $t('common.confirmDelete') }}
      </NPopconfirm>
    </slot>

    <!-- 刷新按钮 -->
    <NButton size="small" @click="refresh">
      {{ $t('common.refresh') }}
    </NButton>

    <!-- 列设置 -->
    <TableColumnSetting v-model:columns="columns" />

    <!-- 后缀插槽 -->
    <slot name="suffix"></slot>
  </NSpace>
</template>

<script setup>
import { ref } from 'vue'
import { NSpace, NButton, NPopconfirm } from 'naive-ui'
import TableColumnSetting from './XmTableColumnSetting.vue'
import XmSvgIcon from '/components/icon/XmSvgIcon.vue'
const $t  = (value)=>value
// 动态生成图标函数
// props
const props = defineProps({
  disabledDelete: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  itemAlign: { type: String, default: 'center' },
  columns: { type: Array, default: () => [] }
})

// emit
const emit = defineEmits(['update:columns', 'add', 'batchDelete', 'refresh'])

// 方法
function add() {
  emit('add')
}

function batchDelete() {
  emit('batchDelete')
}

function refresh() {
  emit('refresh')
}
const columns = ref([
  { key: 'name', title: '用户名', visible: true, checked: true },
  { key: 'gender', title: '性别', visible: true, checked: true },
  { key: 'email', title: '邮箱', visible: true, checked: true },
  { key: 'status', title: '状态', visible: true, checked: true }
])
</script>
