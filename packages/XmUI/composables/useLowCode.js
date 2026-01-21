// composables/useLowCode.js
import { reactive, ref, watch, computed, toRaw, unref, nextTick } from 'vue'
import { useLayoutData } from '/store/XmLayoutData'
import { defaultMeta } from '/store/XmMetaDefault'

export function useLowCode(props) {
    const layoutStore = useLayoutData()
    const isRestoring = ref(false)
    const meta = reactive(defaultMeta())
    const selectedField = ref(null)

    // 查找当前 Panel
    const panel = computed(() => {
        const id = props.panelId
        const dfs = (nodes) => {
            for (const n of nodes || []) {
                if (n.id === id) return n
                const hit = dfs(n.children)
                if (hit) return hit
            }
            return null
        }
        return dfs(layoutStore.rootPanels)
    })

    // --- 核心：加载逻辑 ---
    function loadFromPanel() {
        isRestoring.value = true
        try {
            const p = panel.value
            const saved = p?.content?.lowCode
            const next = saved ? JSON.parse(JSON.stringify(saved)) : defaultMeta()

            // 重置 meta
            Object.keys(meta).forEach(k => delete meta[k])
            Object.assign(meta, next)

            // 恢复选中状态
            if (meta.fields && meta.fields.length > 0) {
                selectedField.value = meta.fields[0]
            } else {
                selectedField.value = null
            }
        } finally {
            nextTick(() => {
                isRestoring.value = false
            })
        }
    }

    // --- 核心：保存逻辑 ---
    function saveToPanel() {
        if (isRestoring.value) return
        const p = panel.value
        if (!p) return
        if (!p.content) p.content = {}

        const rawData = toRaw(unref(meta))
        const plain = JSON.parse(JSON.stringify(rawData))
        p.content.lowCode = plain
        // console.log('Saving lowcode to panel:', p.id)
    }

    // --- 字段操作逻辑 ---
    function addField() {
        const newField = {
            key: 'field_' + Date.now().toString().slice(-4),
            label: '新字段',
            type: 'XmInput',
            show: true,
            editable: true,
            required: false,
            validateTrigger: 'both',
            group: '默认分组',
            options: []
        }
        meta.fields = meta.fields || []
        meta.fields.push(newField)
        selectedField.value = newField
    }

    function removeField(index) {
        const isSelected = meta.fields[index] === selectedField.value
        meta.fields.splice(index, 1)
        if (isSelected || !selectedField.value) {
            selectedField.value = meta.fields[0] || null
        }
    }

    // --- Watchers ---
    
    // 1. 监听 PanelID 变化加载
    watch(() => props.panelId, loadFromPanel, { immediate: true })

    // 2. 监听 Meta 变化保存
    watch(meta, saveToPanel, { deep: true })

    // 3. 业务逻辑：Checkbox 自动生成 key
    watch(() => selectedField.value?.type, (newType) => {
        if (!selectedField.value) return
        if (newType === 'Checkbox' && !selectedField.value.checkboxKey) {
            const key = `__checkbox_${selectedField.value.key}_${Date.now().toString().slice(-3)}`
            selectedField.value.checkboxKey = key
            if (!meta.data) meta.data = []
            meta.data.forEach(row => row[key] = false)
        }
    })

    return {
        meta,
        selectedField,
        isRestoring, // 导出以供外部特定逻辑使用
        addField,
        removeField
    }
}
