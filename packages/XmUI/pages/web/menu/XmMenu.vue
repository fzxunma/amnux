<script setup>
import { ref, h } from 'vue';
import { 
  NCard, NTabs, NTabPane, NDataTable, NButton, NSpace, NTag, NModal, NForm, NFormItem, NInput, NTree, useMessage, useDialog
} from 'naive-ui';
import { useClipboard } from '@vueuse/core';

// 1. 引入你的数据文件
// 请确保路径正确，指向包含 export const menuOptions... 的文件
import { menuOptions, menuOptionsMap, menuRightOptions } from '/store/XmSubMenu.js';

const message = useMessage();
const dialog = useDialog();
const { copy } = useClipboard();

// ================== 核心修复：数据转换逻辑 ==================

/**
 * 从 renderIcon 函数中提取字符串名称
 * 原理：执行 icon() 得到 VNode，读取 VNode.props.name
 */
function extractIconName(iconField) {
  if (!iconField) return '';
  if (typeof iconField === 'string') return iconField; // 已经是字符串
  if (typeof iconField === 'function') {
    try {
      const vnode = iconField(); // 执行渲染函数
      return vnode.props?.name || ''; // 获取 props.name
    } catch (e) {
      console.warn('Icon提取失败', e);
      return '';
    }
  }
  return '';
}

/**
 * 递归转换数据：将 icon 函数转为字符串，深拷贝对象
 */
function transformToEditable(data) {
  // 处理数组
  if (Array.isArray(data)) {
    return data.map(item => transformToEditable(item));
  }
  // 处理对象
  if (data !== null && typeof data === 'object') {
    const newItem = {};
    for (const key in data) {
      if (key === 'icon') {
        // 特殊处理 icon 字段
        newItem[key] = extractIconName(data[key]);
      } else if (key === 'children') {
        // 递归处理子级
        newItem[key] = transformToEditable(data[key]);
      } else {
        // 其他字段直接复制
        newItem[key] = data[key];
      }
    }
    return newItem;
  }
  return data;
}

// ================== 2. 状态定义 ==================

const activeTab = ref('main'); // main | sub | right

// 使用转换函数初始化数据，而不是简单的 JSON.parse
const mainMenus = ref(transformToEditable(menuOptions)); // 注意这里之前是 map，根据你的数据结构 menuOptions 是数组
const rightMenus = ref(transformToEditable(menuRightOptions));
const subMenuMap = ref(transformToEditable(menuOptionsMap));

// 子菜单编辑器当前选中的一级菜单 Key
const currentSubKey = ref('user');

// 弹窗控制
const modalVisible = ref(false);
const modalType = ref(''); // 'add' | 'edit'
const editTarget = ref(''); // 'main' | 'right' | 'sub'
const editingNode = ref(null); 
const parentNode = ref(null); 

// 表单模型
const formModel = ref({
  label: '',
  key: '',
  icon: ''
});

// 代码预览
const codeModalVisible = ref(false);
const generatedCode = ref('');

// ================== 3. 列配置 ==================
const commonColumns = (editAction, deleteAction) => [
  { title: '名称 (Label)', key: 'label', width: 150 },
  { title: '键值 (Key)', key: 'key', width: 200 },
  { 
    title: '图标 (Icon)', 
    key: 'icon', 
    width: 150,
    render: (row) => h(NTag, { type: 'info', size: 'small', bordered: false }, { default: () => row.icon || '-' }) 
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row) => h(NSpace, {}, {
      default: () => [
        h(NButton, { size: 'tiny', type: 'primary', onClick: () => editAction(row) }, { default: () => '编辑' }),
        h(NButton, { size: 'tiny', type: 'error', onClick: () => deleteAction(row) }, { default: () => '删除' })
      ]
    })
  }
];

// ================== 4. 通用逻辑 ==================

function openAdd(target, parent = null) {
  modalType.value = 'add';
  editTarget.value = target;
  parentNode.value = parent;
  formModel.value = { label: '', key: '', icon: '' };
  modalVisible.value = true;
}

function openEdit(row, target) {
  modalType.value = 'edit';
  editTarget.value = target;
  editingNode.value = row;
  formModel.value = { ...row }; 
  modalVisible.value = true;
}

function handleSubmit() {
  if (!formModel.value.label || !formModel.value.key) {
    message.warning('名称和Key为必填项');
    return;
  }

  const newData = { ...formModel.value };
  
  if (modalType.value === 'edit') {
    Object.assign(editingNode.value, newData);
    message.success('更新成功');
  } else {
    let targetList = null;
    
    if (editTarget.value === 'main') targetList = mainMenus.value;
    else if (editTarget.value === 'right') targetList = rightMenus.value;
    else if (editTarget.value === 'sub') {
      if (parentNode.value) {
         if (!parentNode.value.children) parentNode.value.children = [];
         targetList = parentNode.value.children;
      } else {
         if (!subMenuMap.value[currentSubKey.value]) subMenuMap.value[currentSubKey.value] = [];
         targetList = subMenuMap.value[currentSubKey.value];
      }
    }

    if (targetList) {
      targetList.push(newData);
      message.success('添加成功');
    }
  }
  modalVisible.value = false;
}

function handleDelete(row, list) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除 "${row.label}" 吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      const index = list.indexOf(row);
      if (index > -1) {
        list.splice(index, 1);
        message.success('删除成功');
      }
    }
  });
}

// 子菜单操作按钮
const subMenuActions = {
  render: ({ option }) => h(NSpace, {}, {
    default: () => [
      h(NButton, { size: 'tiny', secondary: true, onClick: (e) => { e.stopPropagation(); openAdd('sub', option); } }, { default: () => '加子' }),
      h(NButton, { size: 'tiny', type: 'primary', onClick: (e) => { e.stopPropagation(); openEdit(option, 'sub'); } }, { default: () => '改' }),
      h(NButton, { size: 'tiny', type: 'error', onClick: (e) => { e.stopPropagation(); removeSubNode(option); } }, { default: () => '删' })
    ]
  })
};

function removeSubNode(node) {
  const list = subMenuMap.value[currentSubKey.value];
  const traverseAndRemove = (items) => {
    const idx = items.findIndex(i => i.key === node.key);
    if (idx > -1) {
      items.splice(idx, 1);
      return true;
    }
    for (const item of items) {
      if (item.children && item.children.length) {
        if (traverseAndRemove(item.children)) return true;
      }
    }
    return false;
  };
  dialog.warning({
    title: '删除',
    content: '确定删除此菜单及其子菜单吗？',
    onPositiveClick: () => {
      traverseAndRemove(list);
      // 强制更新视图
      subMenuMap.value = { ...subMenuMap.value }; 
    }
  });
}

// ================== 5. 代码生成逻辑 ==================

function generateCode() {
  const iconHelperStr = `import { h } from "vue"\nimport XmSvgIcon from '/components/icon/XmSvgIcon.vue'\n\nfunction renderIcon(icon) {\n    return () => h(XmSvgIcon, { name: icon })\n}\n\n`;
  
  const processData = (data) => {
    // 过滤掉 Vue 的响应式包装和空字段
    let json = JSON.stringify(data, (key, value) => {
      if (key === '' || value !== null) return value;
      return undefined;
    }, 4);
    
    // 替换 "icon": "xxx" -> icon: renderIcon("xxx")
    json = json.replace(/"icon": "(.*?)"/g, 'icon: renderIcon("$1")');
    // 去掉 key 的引号
    json = json.replace(/"(\w+)":/g, '$1:'); 
    return json;
  };

  let code = iconHelperStr;

  // 1. menuOptionsMap
  let mapExport = `export const menuOptionsMap = {\n`;
  let subConsts = '';
  
  Object.keys(subMenuMap.value).forEach(key => {
    const varName = `menu${key.charAt(0).toUpperCase() + key.slice(1)}Options`; 
    const dataStr = processData(subMenuMap.value[key] || []);
    subConsts += `const ${varName} = ${dataStr}\n\n`;
    mapExport += `    ${key}: ${varName},\n`;
  });
  mapExport += `}\n\n`;

  // 2. menuOptions (修正：这里对应 menuOptions 数组)
  const mainStr = processData(mainMenus.value);
  const mainExport = `export const menuOptions = ${mainStr}\n\n`;

  // 3. menuRightOptions
  const rightStr = processData(rightMenus.value);
  const rightExport = `export const menuRightOptions = ${rightStr}`;

  generatedCode.value = code + subConsts + mapExport + mainExport + rightExport;
  codeModalVisible.value = true;
}

function handleCopy() {
  copy(generatedCode.value);
  message.success('代码已复制');
}
</script>

<template>
  <div class="h-full flex flex-col p-4 bg-gray-50">
    <NCard title="菜单数据配置器" class="h-full shadow-sm" content-style="height: 100%; display: flex; flex-direction: column;">
      <template #header-extra>
        <NButton type="success" @click="generateCode">
          <template #icon>
            <div class="i-mdi-code-json" />
          </template>
          生成并导出代码
        </NButton>
      </template>

      <NTabs v-model:value="activeTab" type="line" animated class="flex-1 h-0">
        <!-- Tab 1: 一级菜单 -->
        <NTabPane name="main" tab="① 一级侧栏 (Main)">
          <div class="flex flex-col h-full gap-4">
            <div class="flex justify-between items-center bg-white p-2 rounded">
               <span class="text-gray-500 text-xs">对应 export const menuOptions</span>
               <NButton type="primary" size="small" dashed @click="openAdd('main')">+ 新增一级菜单</NButton>
            </div>
            <NDataTable 
              :columns="commonColumns(
                (row) => openEdit(row, 'main'), 
                (row) => handleDelete(row, mainMenus)
              )" 
              :data="mainMenus" 
              class="flex-1"
            />
          </div>
        </NTabPane>

        <!-- Tab 2: 子菜单配置 -->
        <NTabPane name="sub" tab="② 子菜单 (Sub Menu Map)">
           <div class="flex h-full border rounded border-gray-200">
             <!-- 左侧 -->
             <div class="w-240px border-r p-2 bg-gray-50 flex flex-col gap-2">
               <div class="font-bold text-gray-700 px-2 py-1">所属一级菜单</div>
               <div 
                  v-for="m in mainMenus" 
                  :key="m.key"
                  class="p-2 cursor-pointer rounded hover:bg-gray-200 flex items-center justify-between"
                  :class="{'bg-blue-100 text-blue-600': currentSubKey === m.key}"
                  @click="currentSubKey = m.key"
               >
                 <span>{{ m.label }}</span>
                 <span class="text-xs opacity-50">{{ m.key }}</span>
               </div>
               <div class="mt-auto text-xs text-gray-400 p-2">
                 * 点击切换不同的一级菜单
               </div>
             </div>

             <!-- 右侧 -->
             <div class="flex-1 p-4 flex flex-col bg-white overflow-hidden">
               <div class="flex justify-between mb-4">
                 <h3 class="font-bold">
                   {{ mainMenus.find(m => m.key === currentSubKey)?.label || currentSubKey }} 的子菜单
                 </h3>
                 <NButton size="small" type="primary" dashed @click="openAdd('sub')">+ 添加根节点</NButton>
               </div>
               
               <div class="flex-1 overflow-auto">
                 <NTree
                   block-line
                   expand-on-click
                   :data="subMenuMap[currentSubKey] || []"
                   key-field="key"
                   label-field="label"
                   children-field="children"
                   :node-props="() => ({ class: 'py-1' })"
                   :render-suffix="subMenuActions.render"
                 />
                 <div v-if="!subMenuMap[currentSubKey]?.length" class="text-center text-gray-400 mt-10">
                   当前无数据
                 </div>
               </div>
             </div>
           </div>
        </NTabPane>

        <!-- Tab 3: 右侧菜单 -->
        <NTabPane name="right" tab="③ 右侧栏 (Right Options)">
          <div class="flex flex-col h-full gap-4">
            <div class="flex justify-between items-center bg-white p-2 rounded">
               <span class="text-gray-500 text-xs">对应 export const menuRightOptions</span>
               <NButton type="primary" size="small" dashed @click="openAdd('right')">+ 新增右侧项</NButton>
            </div>
            <NDataTable 
              :columns="commonColumns(
                (row) => openEdit(row, 'right'),
                (row) => handleDelete(row, rightMenus)
              )" 
              :data="rightMenus" 
              class="flex-1"
            />
          </div>
        </NTabPane>
      </NTabs>
    </NCard>

    <!-- 弹窗部分 -->
    <NModal v-model:show="modalVisible" preset="card" :title="modalType === 'add' ? '新增' : '编辑'" class="w-500px">
      <NForm :model="formModel" label-placement="left" label-width="80px">
        <NFormItem label="名称" path="label" required>
          <NInput v-model:value="formModel.label" />
        </NFormItem>
        <NFormItem label="Key" path="key" required>
          <NInput v-model:value="formModel.key" />
        </NFormItem>
        <NFormItem label="图标" path="icon">
          <NInput v-model:value="formModel.icon" placeholder="例如: person" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="modalVisible = false">取消</NButton>
          <NButton type="primary" @click="handleSubmit">确定</NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- 代码生成弹窗 -->
    <NModal v-model:show="codeModalVisible" preset="card" title="生成的代码" class="w-800px h-600px">
      <div class="relative h-full">
         <NInput v-model:value="generatedCode" type="textarea" class="h-full font-mono text-xs" readonly />
      </div>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="codeModalVisible = false">关闭</NButton>
          <NButton type="primary" @click="handleCopy">复制</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
:deep(.n-tabs-pane-wrapper) {
  height: 100%;
}
</style>
