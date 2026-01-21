<script setup>
import { ref, h, computed } from 'vue';
import { NButton, NTree, NSpace, useDialog, useMessage } from 'naive-ui';
import XmMenuEditModal from './XmMenuEditModal.vue';

const props = defineProps({
  mainMenus: Array,     // 左侧列表源
  subMenuMap: Object    // 核心数据源 Map
});
const emit = defineEmits(['trigger-save']);
const dialog = useDialog();
const message = useMessage();

const currentSubKey = ref('user'); // 当前选中的一级Key

// 弹窗状态
const modalVisible = ref(false);
const editingNode = ref(null);
const parentNode = ref(null); // 如果是新增子节点，需要知道父节点

// 当前右侧显示的树数据
const currentTreeData = computed(() => {
  // 确保数据存在
  if (!props.subMenuMap[currentSubKey.value]) {
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    props.subMenuMap[currentSubKey.value] = [];
  }
  return props.subMenuMap[currentSubKey.value];
});

// --- 树操作按钮渲染 ---
const renderSuffix = ({ option }) => h(NSpace, {}, {
  default: () => [
    h(NButton, { size: 'tiny', secondary: true, onClick: (e) => { e.stopPropagation(); openAdd(option); } }, { default: () => '加子' }),
    h(NButton, { size: 'tiny', type: 'primary', onClick: (e) => { e.stopPropagation(); openEdit(option); } }, { default: () => '改' }),
    h(NButton, { size: 'tiny', type: 'error', onClick: (e) => { e.stopPropagation(); removeNode(option); } }, { default: () => '删' })
  ]
});

// --- Handlers ---

function openAdd(parent = null) {
  editingNode.value = null; // null 表示新增
  parentNode.value = parent; // 记录父节点（如果是根节点则为null）
  modalVisible.value = true;
}

function openEdit(node) {
  parentNode.value = null;
  editingNode.value = node;
  modalVisible.value = true;
}

function handleSave(newData) {
  if (editingNode.value) {
    // 编辑模式
    Object.assign(editingNode.value, newData);
    message.success('更新成功');
  } else {
    // 新增模式
    const targetList = parentNode.value ? (parentNode.value.children || (parentNode.value.children = [])) : currentTreeData.value;
    targetList.push(newData);
    message.success('添加成功');
  }
  emit('trigger-save');
}

function removeNode(node) {
  dialog.warning({
    title: '删除',
    content: '确定删除此菜单及其子菜单吗？',
    onPositiveClick: () => {
      // 递归删除查找
      const removeFromList = (list) => {
        const idx = list.findIndex(i => i.key === node.key);
        if (idx > -1) {
          list.splice(idx, 1);
          return true;
        }
        for (const item of list) {
          if (item.children && removeFromList(item.children)) return true;
        }
        return false;
      };
      removeFromList(currentTreeData.value);
      message.success('删除成功'); // 建议补个提示    
      emit('trigger-save');
    }
  });
}
</script>

<template>
  <div class="flex h-full border rounded border-gray-200">
    <!-- 左侧：一级菜单选择器 -->
    <div class="w-240px border-r p-2 bg-gray-50 flex flex-col gap-2 overflow-y-auto">
      <div class="font-bold text-gray-700 px-2 py-1">所属一级菜单</div>
      <div v-for="m in mainMenus" :key="m.key"
        class="p-2 cursor-pointer rounded hover:bg-gray-200 flex items-center justify-between"
        :class="{ 'bg-blue-100 text-blue-600': currentSubKey === m.key }" @click="currentSubKey = m.key">
        <span>{{ m.label }}</span>
        <span class="text-xs opacity-50">{{ m.key }}</span>
      </div>
    </div>

    <!-- 右侧：树形编辑器 -->
    <div class="flex-1 p-4 flex flex-col bg-white overflow-hidden">
      <div class="flex justify-between mb-4">
        <h3 class="font-bold">
          {{mainMenus.find(m => m.key === currentSubKey)?.label || currentSubKey}} 的子菜单
        </h3>
        <NButton size="small" type="primary" dashed @click="openAdd(null)">+ 添加根节点</NButton>
      </div>

      <div class="flex-1 overflow-auto">
        <NTree block-line expand-on-click :data="currentTreeData" key-field="key" label-field="label"
          children-field="children" :node-props="() => ({ class: 'py-1' })" :render-suffix="renderSuffix" />
        <div v-if="!currentTreeData.length" class="text-center text-gray-400 mt-10">
          当前无数据，请添加
        </div>
      </div>
    </div>

    <XmMenuEditModal v-model:show="modalVisible" :editing-data="editingNode" @submit="handleSave" />
  </div>
</template>
