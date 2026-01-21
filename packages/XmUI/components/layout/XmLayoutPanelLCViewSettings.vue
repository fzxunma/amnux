<script setup>
import { NForm, NFormItem, NInput, NSelect, NTreeSelect } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useMenuDataStore } from '/store/XmMenuData'

// 直接接收响应式的 meta 对象
defineProps({
    meta: { type: Object, required: true }
})

// 1. 获取菜单 Store
const menuStore = useMenuDataStore()
// 2. 解构出完整的菜单树 (保持响应式)
const { fullMenuTree } = storeToRefs(menuStore)
</script>

<template>
    <NForm label-placement="left" label-width="auto">
        <NFormItem label="视图类型">
            <NSelect 
                v-model:value="meta.view"
                :options="[
                    { label: '默认内容', value: 'default' }, 
                    { label: '关联菜单', value: 'menu' }, 
                    { label: '组件路径', value: 'address' }, 
                    { label: 'Web地址', value: 'webAddress' }
                ]" 
            />
        </NFormItem>
        
        <!-- 情况 A: 选择 'menu' 时，显示菜单树选择器 -->
        <NFormItem v-if="meta.view === 'menu'" label="选择菜单">
            <NTreeSelect
                v-model:value="meta.viewAddress"
                :options="fullMenuTree"
                key-field="key"
                label-field="label"
                children-field="children"
                placeholder="请选择要引用的菜单页面"
                filterable
                clearable
                virtual-scroll
                check-strategy="all"
            />
        </NFormItem>

        <!-- 情况 B: 选择 'address' 时，显示内部组件路径输入框 -->
        <NFormItem v-else-if="meta.view === 'address'" label="组件路径">
            <NInput 
                v-model:value="meta.viewAddress" 
                placeholder="例如: /sys/user/List" 
            />
        </NFormItem>

        <!-- 情况 C: 选择 'webAddress' 时，显示 URL 输入框 -->
        <NFormItem v-else-if="meta.view === 'webAddress'" label="Web链接">
            <NInput 
                v-model:value="meta.viewAddress" 
                placeholder="请输入 http://... 或 https://..." 
            />
        </NFormItem>
        
    </NForm>
</template>
