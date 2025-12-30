<script setup>
import { ref } from 'vue'
import {
    NLayoutSider,
    NMenu,
} from 'naive-ui'
import XmSubDrawer from './XmSubDrawer.vue'
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
    <NLayoutSider bordered collapse-mode="width" :collapsed-width="64" :width="240" :collapsed="true">
        <NMenu :options="menuOptions" :collapsed-width="64" :collapsed-icon-size="22"
            @update:value="(key, value) => menuChange(key, value)" />
    </NLayoutSider>
    <n-drawer v-model:show="drawerVisible" width="640">
        <n-drawer-content :title="drawerTitle" closable>
            <XmLayoutEditor />
            <XmSubDrawer></XmSubDrawer>
        </n-drawer-content>
    </n-drawer>
</template>
