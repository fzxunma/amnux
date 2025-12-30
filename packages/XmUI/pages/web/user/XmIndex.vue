<template>
  <NLayout class="h-screen p-16px gap-16px lt-sm:p-8px lt-sm:gap-8px">
    <div class="h-full flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
      <!-- 搜索表单 -->
      <UserSearch v-model:model="searchParams" @search="getDataByPage" />

      <!-- 用户表格卡片 -->
      <NCard :title="$t('page.manage.user.title')"  size="small" class="sm:flex-1-hidden">
        <template #header-extra>
          <TableHeaderOperation v-model:columns="columnChecks" :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading" @add="handleAdd" @delete="handleBatchDelete" @refresh="getData" />
        </template>

        <NDataTable v-model:checked-row-keys="checkedRowKeys" :columns="columns" :data="data" size="small"
          :scroll-x="962" :loading="loading" remote :row-key="row => row.id" :pagination="mobilePagination"
          class="sm:h-full" />

        <UserOperateDrawer v-model:visible="drawerVisible" :operate-type="operateType" :row-data="editingData"
          @submitted="getDataByPage" />
      </NCard>
    </div>
  </NLayout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import UserSearch from './XmUserSearch.vue'
import TableHeaderOperation from './XmTableHeaderOperation.vue'
import UserOperateDrawer from './XmUserFormDrawer.vue'
import { NCard, NDataTable } from 'naive-ui'
const $t = (value) => value
const searchParams = reactive({})
const data = ref([])
const loading = ref(false)
const columns = ref([])
const columnChecks = ref([])
const checkedRowKeys = ref([])
const drawerVisible = ref(false)
const operateType = ref('add')
const editingData = ref({})
const mobilePagination = reactive({ page: 1, pageSize: 10, total: 0 })

// 方法示例
function getDataByPage() {
  console.log('搜索参数', searchParams)
}

function getData() {
  console.log('刷新表格')
}

function handleAdd() {
  drawerVisible.value = true
  operateType.value = 'add'
}

function handleBatchDelete() {
  console.log('批量删除', checkedRowKeys.value)
}
</script>
