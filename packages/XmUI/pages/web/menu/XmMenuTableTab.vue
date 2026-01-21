<script setup>
import { NDataTable, NButton, useDialog, useMessage } from 'naive-ui';
import { useMenuColumns } from '/store/XmMenuEditData';
import XmMenuEditModal from './XmMenuEditModal.vue';
import { ref } from 'vue';

const props = defineProps({
  dataList: { type: Array, required: true }, // 绑定的数据源 (MainMenus 或 RightMenus)
  title: String
});
const emit = defineEmits(['trigger-save']);
const dialog = useDialog();
const message = useMessage();

// 编辑弹窗状态
const modalVisible = ref(false);
const currentEditRow = ref(null); // 如果为null则为新增

// 列定义
const columns = useMenuColumns(
  (row) => openEdit(row),
  (row) => handleDelete(row)
);

// --- Action Handlers ---

function openAdd() {
  currentEditRow.value = null;
  modalVisible.value = true;
}

function openEdit(row) {
  currentEditRow.value = row;
  modalVisible.value = true;
}

function handleSave(newData) {
  if (currentEditRow.value) {
    // 编辑：原地更新对象
    Object.assign(currentEditRow.value, newData);
    message.success('更新成功');
  } else {
    // 新增：推入数组
    props.dataList.push(newData);
    message.success('添加成功');
  }
  emit('trigger-save');
}

function handleDelete(row) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除 "${row.label}" 吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      const index = props.dataList.indexOf(row);
      if (index > -1) {
        props.dataList.splice(index, 1);
        message.success('删除成功');
        emit('trigger-save');
      }
    }
  });
}
</script>

<template>
  <div class="flex flex-col h-full gap-4">
    <div class="flex justify-between items-center bg-white p-2 rounded">
      <span class="text-gray-500 text-xs">{{ title }}</span>
      <NButton type="primary" size="small" dashed @click="openAdd">+ 新增项</NButton>
    </div>
    <NDataTable :columns="columns" :data="dataList" class="flex-1" />

    <!-- 引入拆分出去的弹窗 -->
    <XmMenuEditModal v-model:show="modalVisible" :editing-data="currentEditRow" @submit="handleSave" />
  </div>
</template>
