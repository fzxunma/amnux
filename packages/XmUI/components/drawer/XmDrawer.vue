<script setup>
import { computed } from 'vue'
import { useDrawerData } from '/store/XmDrawerData'
import { loadAsyncPage } from "/utils/XmPageload"; // 引入新的加载器

const drawerStore = useDrawerData()

// 使用 computed 确保响应式
// 当 drawerStore.drawerPage 变化时，CurrentPageComponent 会重新计算
const CurrentPageComponent = computed(() => {
    const pageName = drawerStore.drawerPage;
    if (!pageName) return null;
    
    console.log(`[Drawer] 切换页面至: ${pageName}`);
    return loadAsyncPage(pageName);
});
</script>

<template>
    <n-drawer v-model:show="drawerStore.drawerShow" placement="right" :default-width="800" resizable>
        <n-drawer-content :title="drawerStore.drawerTitle" closable>
            <!-- 
                使用 keep-alive 可选，视需求而定 
                :is 绑定的是 computed 返回的异步组件定义
                key 强制触发重新渲染（通常不需要，因为组件定义变了，但加上更保险）
            -->
            <component 
                :is="CurrentPageComponent" 
                v-if="CurrentPageComponent"
                :key="drawerStore.drawerPage" 
            />
        </n-drawer-content>
    </n-drawer>
</template>
