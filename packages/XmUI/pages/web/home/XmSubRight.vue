<script setup>
import { ref } from 'vue' // 引入 ref 控制折叠状态
import {
    NLayoutSider,
    NMenu,
} from 'naive-ui'
import { useMenuDataStore } from '/store/XmMenuData.js'
import { storeToRefs } from 'pinia' 
import { useDrawerData } from '/store/XmDrawerData'
import { useDialogData } from '/store/XmDialogData';

const menuDataStore = useMenuDataStore()
const { menuRightOptions } = storeToRefs(menuDataStore)
const dialogStore = useDialogData();
const drawerStore = useDrawerData()

// ✅ 新增：本地控制折叠状态，默认为 true (折叠)
// 注意：如果你的菜单项没有 icon，折叠后将什么都看不到
const collapsed = ref(true)

const menuChange = (_key, value) => {
    // 点击后自动展开或处理逻辑
    if (value.action) {
        const width = value?.action?.width || "800px";
        switch (value.action.type) {
            case "XmDrawer":
                drawerStore.show(value.label, value.action.page)
                break;
            case "XmDailog":
                dialogStore.show(
                    value.label,
                    value.action.page,
                    width
                );
                break;
        }
    }
}
</script>

<template>
    <!-- ✅ 修复：使用 v-model:collapsed 控制折叠，并添加 show-trigger="arrow-circle" -->
    <!-- 如果 menuRightOptions 数据里没有 icon，请暂时将 :collapsed-width 改为 0 或者不折叠 -->
    <NLayoutSider 
        bordered 
        collapse-mode="width" 
        :width="240" 
        :collapsed-width="48"
        show-trigger="arrow-circle"
        v-model:collapsed="collapsed"
    >
        <div class="absolute top-0 left-0 w-px h-full bg-[var(--n-border-color)]" />
        
        <NMenu 
            :options="menuRightOptions" 
            :collapsed-icon-size="22"
            @update:value="(key, value) => menuChange(key, value)" 
        />
    </NLayoutSider>
</template>
