<script setup>
import { reactive, ref, watch } from 'vue'
import { NForm, NFormItem, NInput, NSelect, NButton, NSwitch, NDivider, NCard } from 'naive-ui'
import XmLowCodeUI from '/render/XmLowCodeUI.js'
import { VueDraggable } from 'vue-draggable-plus'

/* ------------------- Meta 数据 ------------------- */
const meta = reactive({
    fields: [
        { key: 'name', label: '姓名', type: 'XmInput', editable: true, placeholder: '请输入姓名', group: '基本信息', options: [] },
        { key: 'age', label: '年龄', type: 'XmInputNumber', editable: true, placeholder: '请输入年龄', group: '基本信息', options: [] },
        {
            key: 'gender',
            label: '性别',
            type: 'category',
            categoryType: 'single',
            editable: true,
            placeholder: '请选择性别',
            group: '基本信息',
            options: [
                { label: '男', value: 'M' },
                { label: '女', value: 'F' }
            ]
        },
        {
            key: 'hobbies',
            label: '爱好',
            type: 'category',
            categoryType: 'multi',
            editable: true,
            group: '兴趣爱好',
            options: [
                { label: '篮球', value: 'basketball' },
                { label: '足球', value: 'football' },
                { label: '游泳', value: 'swimming' }
            ]
        }
    ],
    data: [
        { name: '张三', age: 28, gender: 'M', hobbies: ['basketball'] },
        { name: '李四', age: 32, gender: 'F', hobbies: ['football', 'swimming'] }
    ],
    groupType: 'tab',
    mode: 'form'
})

/* ------------------- 编辑状态 ------------------- */
const editMode = ref(true)
const selectedField = ref(meta.fields[0])

const types = [
    { label: '文本输入', value: 'XmInput' },
    { label: '数字输入', value: 'XmInputNumber' },
    { label: '分类选择', value: 'category' },
    { label: '穿梭框', value: 'transfer' },
    { label: '树选择', value: 'tree' }
]

const categoryTypes = [
    { label: '单选', value: 'single' },
    { label: '多选', value: 'multi' }
]

/* ------------------- 历史记录 ------------------- */
const history = ref([JSON.parse(JSON.stringify(meta))])
const historyIndex = ref(0)

function saveHistory() {
    history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push(JSON.parse(JSON.stringify(meta)))
    historyIndex.value++
}

function undo() {
    if (historyIndex.value > 0) {
        historyIndex.value--
        Object.assign(meta, JSON.parse(JSON.stringify(history.value[historyIndex.value])))
        selectedField.value = meta.fields[0] || null
    }
}

function redo() {
    if (historyIndex.value < history.value.length - 1) {
        historyIndex.value++
        Object.assign(meta, JSON.parse(JSON.stringify(history.value[historyIndex.value])))
        selectedField.value = meta.fields[0] || null
    }
}

/* ------------------- 操作函数 ------------------- */
function addField() {
    const newField = {
        key: 'new_field_' + (meta.fields.length + 1),
        label: '新字段',
        model: '模型',
        type: 'XmInput',
        editable: true,
        group: '默认分组',
        options: []
    }
    meta.fields.push(newField)
    selectedField.value = newField
    saveHistory()
}

function removeField(index) {
    meta.fields.splice(index, 1)
    selectedField.value = meta.fields[0] || null
    saveHistory()
}

function addOption() {
    if (!selectedField.value.options) selectedField.value.options = []
    selectedField.value.options.push({ label: '', value: '' })
    saveHistory()
}

function removeOption(idx) {
    if (!selectedField.value.options) return
    selectedField.value.options.splice(idx, 1)
    saveHistory()
}

/* ------------------- Group 类型下拉 ------------------- */
const currentGroupType = ref(meta.groupType)

const groupTypeOptions = [
    { label: 'Step 模式', value: 'step' },
    { label: 'Tab 模式', value: 'tab' },
    { label: '普通 Form 模式', value: 'default' },
    { label: 'Table 模式', value: 'table' },
    { label: 'Card 模式', value: 'card' },
    { label: 'CardList 模式', value: 'cardlist' }
]

watch(currentGroupType, (val) => {
    if (val === 'cardlist') {
        meta.mode = 'cardlist'
    } else if (val === 'card') {
        meta.mode = 'card'
    } else if (val === 'table') {
        meta.mode = 'table'
    } else {
        meta.mode = 'form'
        meta.groupType = val
    }
    saveHistory()
})
</script>

<template>
    <div class="p-4">
        <!-- 编辑模式开关 -->
        <div class="flex gap-2 mb-4">
            <NButton @click="editMode = !editMode">{{ editMode ? '切换展示模式' : '切换编辑模式' }}</NButton>
            <NButton @click="undo" :disabled="historyIndex === 0">撤销</NButton>
            <NButton @click="redo" :disabled="historyIndex === history.length - 1">重做</NButton>
        </div>

        <!-- ------------- Meta 编辑模式 ------------- -->
        <div v-if="editMode" class="flex gap-4">
            <!-- 左侧字段列表（可拖拽排序） -->
            <div class="w-1/4 border p-2">
                <NButton size="small" @click="addField">添加字段</NButton>
                <NList clickable hoverable>
                    <VueDraggable v-model="meta.fields" item-key="key" :animation="150" class="mt-2">
                        <NListItem style="min-height:36px" @click="selectedField = element"
                            v-for="element in meta.fields" :key="element.key">
                            <div class="flex justify-between items-center">
                                <span>{{ element.label }} </span>
                                <NButton size="tiny" @click.stop="removeField(index)">删除</NButton>
                            </div>
                        </NListItem>
                    </VueDraggable>
                </NList>
            </div>

            <!-- 右侧字段属性编辑 -->
            <div class="flex-1 border p-2">
                <template v-if="selectedField">
                    <NForm :model="selectedField">
                        <NFormItem label="模型">
                            <NInput v-model:value="selectedField.model" @input="saveHistory" />
                        </NFormItem>
                        <NFormItem label="字段 Key">
                            <NInput v-model:value="selectedField.key" @input="saveHistory" />
                        </NFormItem>
                        <NFormItem label="字段 Label">
                            <NInput v-model:value="selectedField.label" @input="saveHistory" />
                        </NFormItem>
                        <NFormItem label="类型">
                            <NSelect v-model:value="selectedField.type" :options="types" @update:value="saveHistory" />
                        </NFormItem>
                        <NFormItem v-if="selectedField.type === 'category'" label="Category 类型">
                            <NSelect v-model:value="selectedField.categoryType" :options="categoryTypes"
                                @update:value="saveHistory" />
                        </NFormItem>
                        <NFormItem label="分组">
                            <NInput v-model:value="selectedField.group" @input="saveHistory" />
                        </NFormItem>
                        <NFormItem label="Placeholder" v-if="selectedField.type !== 'transfer'">
                            <NInput v-model:value="selectedField.placeholder" @input="saveHistory" />
                        </NFormItem>
                        <NFormItem label="可编辑" v-if="selectedField.type !== 'transfer'">
                            <NSwitch v-model:checked="selectedField.editable" @update:checked="saveHistory" />
                        </NFormItem>

                        <!-- options 编辑 -->
                        <template v-if="selectedField.type === 'category' || selectedField.type === 'transfer'">
                            <NDivider>选项</NDivider>
                            <div v-for="(opt, idx) in selectedField.options || []" :key="idx" class="flex gap-2 mb-1">
                                <NInput v-model:value="opt.label" placeholder="label" @input="saveHistory" />
                                <NInput v-model:value="opt.value" placeholder="value" @input="saveHistory" />
                                <NButton size="tiny" @click="removeOption(idx)">删除</NButton>
                            </div>
                            <NButton size="small" @click="addOption">添加选项</NButton>
                        </template>
                    </NForm>
                </template>
                <template v-else>
                    <div>请选择左侧字段进行编辑</div>
                </template>
            </div>
        </div>

        <!-- ------------- 展示模式 / 表单渲染 ------------- -->
        <div v-else class="mt-4">
            <NCard title="预览">
                <XmLowCodeUI :meta="meta" :model-value="meta.data" />
            </NCard>
        </div>

        <!-- 全局 meta 配置 -->
        <div v-if="editMode" class="mt-4 border p-2">
            <NForm :model="meta">
                <NFormItem label="Group 类型">
                    <NSelect v-model:value="currentGroupType" :options="groupTypeOptions" />
                </NFormItem>
                <NFormItem label="Mode">
                    <NSelect v-model:value="meta.mode" :options="[
                        { label: 'Form', value: 'form' },
                        { label: 'Table', value: 'table' },
                        { label: 'Card', value: 'card' },
                        { label: 'CardList', value: 'cardlist' }
                    ]" @update:value="saveHistory" />
                </NFormItem>
            </NForm>
        </div>
    </div>
</template>
