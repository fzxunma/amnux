<script setup>
import { ref, computed } from 'vue'
import { 
    NForm, NFormItem, NSelect, NButton, NCollapse, NCollapseItem 
} from 'naive-ui'
import { groupTypeOptions } from '/store/XmMetaDefault' // 假设这里包含了所有模式的 Label/Value

// 引入逻辑 Hook
import { useLowCode } from '/composables/useLowCode.js'

// 引入子组件
import ViewSettings from './XmLayoutPanelLCViewSettings.vue'
import FormSettings from './XmLayoutPanelLCFormSettings.vue'
import FieldManager from './XmLayoutPanelLCFieldManager.vue'
import StyleSettings from './XmLayoutPanelStyleSettings.vue'

const props = defineProps({
    panelId: { type: [String, Number], required: true }
})

// 1. 初始化核心逻辑
const { 
    meta, 
    selectedField, 
    // isRestoring, // ❌ 优化后不再需要这个 flag 来防止 watch 冲突
    addField, 
    removeField 
} = useLowCode(props)

// 2. 界面状态
const editMode = ref(true)

// 定义非表单模式的集合 (View Modes)
const NON_FORM_MODES = ['cardlist', 'card', 'table', 'chart', 'view', 'address', 'webAddress', 'menu'];

// 3. 🔥【核心优化】使用 Computed Get/Set 替代 Watcher
// 这种方式天然解决了 "数据回显" 和 "用户修改" 的双向同步问题，不需要 isRestoring 锁
const currentGroupType = computed({
    get() {
        // 读取逻辑：如果 mode 是 form (或空)，则返回 groupType；否则返回 mode
        if (!meta.mode || meta.mode === 'form') {
            return meta.groupType || 'tab'
        }
        return meta.mode
    },
    set(val) {
        // 写入逻辑：根据选择的值，决定是更新 mode 还是 groupType
        if (NON_FORM_MODES.includes(val)) {
            meta.mode = val
            // 切换到视图模式时，建议重置 groupType 这里的逻辑视业务而定
        } else {
            meta.mode = 'form'
            meta.groupType = val
        }
    }
})

// 4. 辅助计算属性，简化模板中的 v-if
const isViewMode = computed(() => currentGroupType.value === 'view')
const isFormMode = computed(() => {
    // 只要不是视图模式集合里的，通常就是表单类的 (default, tab, accordion, step 等)
    return !NON_FORM_MODES.includes(currentGroupType.value)
})

</script>

<template>
    <div class="h-full flex flex-col overflow-hidden ">
        <!-- 头部设置 -->
        <div class="px-4 py-3 border-b  flex items-center justify-between gap-2">
            <div class="flex-1 ">
                <NSelect 
                    v-model:value="currentGroupType" 
                    :options="groupTypeOptions" 
                    placeholder="请选择模式"
                    size="small"
                />
            </div>
            
            <div class="flex items-end">
                <NButton size="small" @click="editMode = !editMode">
                    {{ editMode ? '切换预览' : '切换编辑' }}
                </NButton>
            </div>
        </div>

        <!-- 内容区域 -->
        <div class="flex-1 overflow-auto p-4 scrollbar-thin">
            <NCollapse :default-expanded-names="['form', 'fields', 'view']" arrow-placement="right">
                
                <!-- 1. 视图设置模块 -->
                <NCollapseItem v-if="isViewMode" title="视图设置" name="view">
                    <ViewSettings :meta="meta" />
                </NCollapseItem>
                <n-collapse-item title="样式" name="styletSize">
                 <StyleSettings :meta="meta"/>
                </n-collapse-item>

                <!-- 2. 表单设置模块 -->
                <NCollapseItem v-if="isFormMode" title="表单设置" name="form">
                    <FormSettings :meta="meta" />
                </NCollapseItem>
                <!-- 3. 字段管理模块 -->
                <NCollapseItem title="字段管理" name="fields">
                    <FieldManager v-model:selectedField="selectedField" :meta="meta" :edit-mode="editMode"
                        :current-group-type="currentGroupType" @add-field="addField" @remove-field="removeField" />
                </NCollapseItem>

            </NCollapse>
        </div>
    </div>
</template>

<style scoped>
/* 可选：简单的滚动条样式优化 */
.scrollbar-thin::-webkit-scrollbar {
    width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #e5e7eb;
    border-radius: 3px;
}
</style>
