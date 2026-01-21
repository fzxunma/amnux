<script setup>
import { computed, ref } from "vue";
import { NButton } from "naive-ui";
// 请确保路径与你项目配置一致，通常建议使用 @/store
import { useLayoutData, generateId } from "@/store/XmLayoutData.js";
import XmLowCode from "./XmLowCode.vue";

// 定义组件名称，用于递归调用
defineOptions({ name: "XmLayoutPanel" });

const props = defineProps({
  // 当前节点的数据对象
  panel: { type: Object, required: true },
  // 当前选中的节点 ID (仅编辑模式用)
  selectedId: { type: [Number, String, null], default: null },
  // 递归层级前缀，用于调试或显示
  prefix: { type: String, default: "" },
  // 模式: 'edit' (编辑布局) | 'view' (仅展示)
  mode: { type: String, default: "edit" }, 
});

const emit = defineEmits(["select"]);

const layoutStore = useLayoutData();
const hovered = ref(false);

// --- 计算属性 ---

const isEdit = computed(() => props.mode === "edit");
const isSelected = computed(() => props.selectedId === props.panel.id);

// 计算 Flex 样式: 处理固定宽/高的情况
const getFlexClass = computed(() => {
  // 容器节点默认 flex-1
  if (props.panel.type !== "leaf") return "flex-1";
  
  const userStyle = props.panel.style?.user || {};
  // 如果用户设置了 fixed 或 auto，则不伸缩(flex-none)，否则填满剩余空间(flex-1)
  if (
    ["fixed", "auto"].includes(userStyle.heightMode) || 
    ["fixed", "auto"].includes(userStyle.widthMode)
  ) {
    return "flex-none";
  }
  return "flex-1";
});

// 获取最终渲染样式 (通常由 Store 计算好放在 panel.style.calc 中，或者直接用 panel.style)
const finalStyle = computed(() => props.panel.style?.calc || props.panel.style || {});

// --- 事件处理 ---

// 向上冒泡选择事件
const forwardSelect = ($event) => emit("select", $event);

// 鼠标交互 (仅编辑模式)
const onEnter = () => { if (isEdit.value) hovered.value = true; };
const onLeave = () => { if (isEdit.value) hovered.value = false; };
const onClick = () => { if (isEdit.value) emit("select", props.panel.id); };

// 打开设置抽屉
const openSetting = () => layoutStore.selectPanel(props.panel.id, true);

// 拆分面板 (Split)
const handleSplit = (direction) => {
  // 直接修改对象，利用 Vue 的响应式更新视图
  props.panel.type = direction; // 'row' or 'column'
  if (!props.panel.style) props.panel.style = {};
  
  // 创建两个新的子叶子节点
  props.panel.children = [
    { 
      id: generateId(), 
      type: "leaf", 
      style: { minHeight: "100px", minWidth: "100px" },
      content: { lowCode: {} } // 初始化 content
    },
    { 
      id: generateId(), 
      type: "leaf", 
      style: { minHeight: "100px", minWidth: "100px" },
      content: { lowCode: {} }
    },
  ];
};

// 合并面板 (Merge/Delete)
const handleMerge = () => {
  // 选中当前面板，然后调用 Store 的删除方法
  layoutStore.selectPanel(props.panel.id);
  layoutStore.deleteActive();
};
</script>

<template>
  <div 
    class="min-w-0 min-h-0 transition-all duration-300 relative" 
    :class="getFlexClass"
  >
    
    <!-- 1. 容器节点 (Row / Column) -->
    <div
      v-if="panel.type !== 'leaf'"
      class="flex w-full h-full items-stretch gap-1"
      :class="panel.type === 'row' ? 'flex-row' : 'flex-col'"
      :style="finalStyle"
    >
      <!-- 递归渲染子节点 -->
      <!-- 注意：必须传递 mode 属性，确保子节点状态一致 -->
      <XmLayoutPanel
        v-for="(child, index) in panel.children"
        :key="child.id"
        :panel="child"
        :prefix="prefix ? `${prefix}-${index + 1}` : String(index + 1)"
        :mode="mode"
        :selected-id="selectedId"
        @select="forwardSelect"
      />
    </div>

    <!-- 2. 叶子节点 (Leaf) -->
    <div
      v-else
      class="relative w-full h-full flex flex-col overflow-hidden  box-border"
      :class="[
        // 编辑模式下显示边框，选中时高亮
        isEdit ? 'border-dashed border' : 'border-none',
        isSelected && isEdit ? 'border-blue-600 ring-1 ring-blue-600 z-10' : 'border-gray-300'
      ]"
      :style="finalStyle"
    >
      <div class="flex-1 w-full h-full min-w-0 min-h-0 overflow-hidden relative">
        <XmLowCode class="w-full h-full" :panel-config="panel" />
      </div>

      <!-- 🌟 编辑模式遮罩层 (仅 mode='edit' 时显示) -->
      <div
        v-if="isEdit"
        class="absolute inset-0 z-20 cursor-pointer transition-colors duration-200"
        :class="hovered || isSelected ? 'bg-blue-500/5' : 'bg-transparent'"
        @mouseenter="onEnter"
        @mouseleave="onLeave"
        @click.stop="onClick"
      >
        <!-- 操作按钮组 (Hover 或 选中时显示) -->
        <div
          v-if="hovered || isSelected"
          class="absolute top-1 right-1 flex flex-wrap justify-end gap-1 p-1 bg-white/90 rounded shadow-sm border backdrop-blur-sm"
        >
          <n-button size="tiny" type="success" secondary @click.stop="openSetting">S</n-button>
          <n-button size="tiny" type="primary" secondary @click.stop="() => handleSplit('row')">R</n-button>
          <n-button size="tiny" type="info" secondary @click.stop="() => handleSplit('column')">C</n-button>
          <n-button size="tiny" type="warning" secondary @click.stop="handleMerge">M</n-button>
        </div>
        
        <!-- 底部 ID 标识 -->
        <div 
          v-if="isSelected" 
          class="absolute bottom-1 right-1 text-xs text-gray-400 bg-white/80 px-1 rounded pointer-events-none"
        >
           {{ prefix }}
        </div>
      </div>
    </div>
  </div>
</template>
