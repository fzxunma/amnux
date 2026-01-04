<script setup>
import { ref, watch, computed } from 'vue'
import { useLayoutData } from '/store/XmLayoutData'
import XmLayoutPanelLowCode from "./XmLayoutPanelLowCode.vue"
const layoutStore = useLayoutData()

const panel = computed(() => layoutStore.activePanel)

const local = ref({
    type: 'row',
    count: 1,
    height: '',
    margin: '',
    padding: ''
})

/* 初始化 Drawer 内容 */
watch(panel, (p) => {
    if (!p) return
    local.value = {
        type: p.type === 'leaf' ? 'row' : p.type,
        count: p.children?.length || 1,
        height: p.style?.height || '',
        margin: p.style?.margin || '',
        padding: p.style?.padding || ''
    }
}, { immediate: true })

/* 应用类型 */
const applyType = (type) => {
    if (!panel.value || panel.value.type === 'leaf') return
    panel.value.type = type
}

/* 应用子项数量 */
const applyCount = (count) => {
    const p = panel.value
    if (!p || !Array.isArray(p.children)) return

    const diff = count - p.children.length

    if (diff > 0) {
        for (let i = 0; i < diff; i++) {
            p.children.push({ id: Date.now() + i, type: 'leaf' })
        }
    } else if (diff < 0) {
        p.children.splice(count)
    }
}

/* 样式同步 */
watch(local, (val) => {
    if (!panel.value) return
    panel.value.style ||= {}
    Object.assign(panel.value.style, {
        height: val.height,
        margin: val.margin,
        padding: val.padding
    })
}, { deep: true })

/* 删除 */
const handleDelete = () => {
    layoutStore.deleteActive()
    //   if (!panel.value) return
    //   layoutStore.closeDrawer()
    // 这里只 emit，由父组件真正删除
}
</script>

<template>
    <n-drawer v-model:show="layoutStore.showDrawer" placement="right" width="640">
        <n-drawer-content title="布局设置" closable>
            <n-form size="small" label-placement="left" label-width="80">
                <n-form-item label="类型">
                    <n-select :options="[
                        { label: '行 (row)', value: 'row' },
                        { label: '列 (column)', value: 'column' }
                    ]" v-model:value="local.type" @update:value="applyType" />
                </n-form-item>

                <n-form-item label="子项数">
                    <n-input-number v-model:value="local.count" :min="1" @update:value="applyCount" />
                </n-form-item>

                <n-form-item label="高度">
                    <n-input v-model:value="local.height" />
                </n-form-item>

                <n-form-item label="Margin">
                    <n-input v-model:value="local.margin" />
                </n-form-item>

                <n-form-item label="Padding">
                    <n-input v-model:value="local.padding" />
                </n-form-item>
            </n-form>
            <XmLayoutPanelLowCode></XmLayoutPanelLowCode>
            <template #footer>
                <n-button type="error" block @click="handleDelete">
                    删除此区域
                </n-button>
            </template>
        </n-drawer-content>
    </n-drawer>
</template>
