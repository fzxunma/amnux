<script setup>
import { computed } from 'vue';
import { useDialogData } from '/store/XmDialogData';
import { loadAsyncPage } from "/utils/XmPageload"; 

const dialogStore = useDialogData();

// 动态计算组件
const CurrentPageComponent = computed(() => {
    const pageName = dialogStore.dialogPage;
    if (!pageName) return null;
    
    // 这里的 loadAsyncPage 是你之前定义好的工具函数
    return loadAsyncPage(pageName);
});

// 计算样式
const modalStyle = computed(() => {
    return {
        width: dialogStore.dialogWidth
    };
});
</script>

<template>
    <!-- 
      核心修改：使用 n-modal
      preset="card": 让模态框拥有卡片样式（白色背景、标题栏、关闭按钮）
      :bordered="false": 可选，去掉边框看起来更现代
      size="huge": 控制内边距大小
    -->
    <n-modal
        v-model:show="dialogStore.dialogShow"
        preset="card"
        :title="dialogStore.dialogTitle"
        :style="modalStyle"
        size="huge"
        :bordered="false"
        :segmented="{ content: true }" 
    >
        <!-- 动态组件区域 -->
        <component 
            :is="CurrentPageComponent" 
            v-if="CurrentPageComponent"
            :key="dialogStore.dialogPage"
            @close="dialogStore.dialogShow = false" 
        />
        
        <!-- 如果页面加载失败或为空时的占位（可选） -->
        <div v-else class="empty-state">
            加载中...
        </div>
    </n-modal>
</template>

<style scoped>
.empty-state {
    padding: 20px;
    text-align: center;
    color: #999;
}
</style>
