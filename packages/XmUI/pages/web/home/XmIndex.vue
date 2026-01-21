<script setup>
import { onMounted } from 'vue' 
import { NLayout } from 'naive-ui'
import { useMenuDataStore } from '/store/XmMenuData.js' 
import XmSubIndex from './XmSubIndex.vue'
import XmSubRight from './XmSubRight.vue'
import XmSubSider from './XmSubSider.vue'
import XmDrawer from '/components/drawer/XmDrawer.vue'
import XmDialog from '/components/dialog/XmDialog.vue'

const menuStore = useMenuDataStore()

onMounted(() => {
    menuStore.initMenuData()
})
</script>

<template>
    <NLayout bordered has-sider>
        <XmSubSider />
        <XmSubIndex />
        <XmSubRight />
        <XmDrawer />
        <XmDialog />
    </NLayout>
</template>
