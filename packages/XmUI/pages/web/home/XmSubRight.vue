<script setup>
import { ref } from 'vue'
import {
    NLayoutSider,
    NMenu,
} from 'naive-ui'
import { menuRightOptions } from "./XmSubMenu"
import XmLayoutEditor from '/components/layout/XmLayoutEditor.vue'

const drawerVisible = ref(false)
const drawerTitle = ref("设置")
const menuChange = (key, value) => {
    drawerVisible.value = true
    drawerTitle.value = value.label
    console.log(key, value)
}
</script>
<template>
    <NLayoutSider bordered collapse-mode="width" :width="240" :collapsed="true">
         <div class="absolute top-0 left-0 w-px h-full bg-[var(--n-border-color)]" />
        <NMenu :options="menuRightOptions"  :collapsed-icon-size="22"
            @update:value="(key, value) => menuChange(key, value)" />
    </NLayoutSider>
    <n-drawer v-model:show="drawerVisible" width="640">
        <n-drawer-content :title="drawerTitle" closable>
            <XmLayoutEditor />
        </n-drawer-content>
    </n-drawer>
</template>
