// XmDataTableRenderer.js
import { h, reactive, computed, toRaw, ref } from 'vue'
import {
  NDataTable,
  NText,
  NButton,
  NPopconfirm,
  NSwitch,
  NDrawer,
  NDrawerContent,
  NButtonGroup,
  NSpace,
  NCheckbox,
  NPagination
} from 'naive-ui'
import { createGroupMap, getGroupNames } from './XmFormUtils.js'
import XmLowCodeUI from '/render/XmLowCodeUI.js'

export default {
  name: 'XmDataTableRenderer',
  props: {
    meta: { type: Object, default: () => ({ fields: [], data: [] }) },
    modelValue: { type: Array, default: () => [] }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const rows = reactive(toRaw(props.modelValue).map(r => ({ ...r })))
    const updateRows = () => emit('update:modelValue', rows)

    const metaFields = computed(() => props.meta.fields || [])
    const groupMap = computed(() => createGroupMap(metaFields.value))
    const groupNames = computed(() => getGroupNames(groupMap.value))

    const page = ref(1) // 当前页

    const pageSize = computed(() =>props.meta.pageSize)
    const enablePagination = computed(() => !!props.meta.enablePagination)

    const displayRows = computed(() => {
      if (!enablePagination.value) return rows
      const totalPages = Math.ceil(rows.length / pageSize.value)
      if (page.value > totalPages) page.value = 1
      const start = (page.value - 1) * pageSize.value
      const end = start + pageSize.value
      return rows.slice(start, end)
    })

    // 抽屉状态
    const drawerStates = reactive({})
    const getDrawerActive = (rowId, fieldKey) => {
      const key = `${rowId}-${fieldKey}`
      if (!(key in drawerStates)) drawerStates[key] = false
      return drawerStates[key]
    }
    const setDrawerActive = (rowId, fieldKey, value) => {
      drawerStates[`${rowId}-${fieldKey}`] = value
    }

    const removeRowByIndex = (index) => {
      rows.splice(index, 1)
      updateRows()
    }

    const checkboxFieldKey = computed(() => {
      return metaFields.value.find(f => f.type === 'Checkbox')?.checkboxKey || ''
    })
    const getCheckboxStatus = () => {
      const key = checkboxFieldKey.value
      const total = rows.length
      const checkedCount = rows.filter(r => r[key]).length
      return {
        checked: total > 0 && checkedCount === total,
        indeterminate: checkedCount > 0 && checkedCount < total
      }
    }

    const toggleCheckboxAll = (value) => {
      const key = checkboxFieldKey.value;
      if (!key) return;
      rows.forEach(row => {
        row[key] = value; // 仅修改状态字段，不触碰原字段
      })
      updateRows();
    }




    const selectedCount = computed(() => {
      const key = checkboxFieldKey.value
      return rows.filter(r => r[key]).length
    })

    return () => {
      const nodes = []

      groupNames.value.forEach(groupName => {
        const fieldsInGroup = groupMap.value[groupName] || []
        if (!fieldsInGroup.length) return

        if (groupName !== '_default') {
          nodes.push(h('div', { class: 'font-bold my-2' }, () => groupName))
        }

        const columns = fieldsInGroup.map(field => ({
          title: () => {
            if (field.type === 'Checkbox') {
              const { checked, indeterminate } = getCheckboxStatus()
              return h(NCheckbox, {
                checked,
                indeterminate,
                'onUpdate:checked': toggleCheckboxAll
              }, { default: () => field.label })
            }
            return field.label
          },
          key: field.key,
          render: (row, rowIndex) => {
            // 内嵌表格
            if (field.type === 'view') {
              const innerMeta = {
                fields: [
                  { key: 'name', label: '姓名', type: 'XmInput', editable: true },
                  { key: 'age', label: '年龄', type: 'XmInputNumber', editable: true },
                  {
                    key: 'gender',
                    label: '性别',
                    type: 'category',
                    categoryType: 'single',
                    editable: true,
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
                    options: [
                      { label: '篮球', value: 'basketball' },
                      { label: '足球', value: 'football' },
                      { label: '游泳', value: 'swimming' }
                    ]
                  },
                  { key: 'delete', label: '操作', type: 'delect' }
                ],
                data: [
                  { name: '张三1', age: 28, gender: 'M', hobbies: ['basketball'], __id: 0 },
                  { name: '李四', age: 32, gender: 'F', hobbies: ['football', 'swimming'], __id: 1 }
                ],
                groupType: 'cardlist',
                mode: 'cardlist'
              }

              return h(XmLowCodeUI, {
                meta: innerMeta,
                modelValue: innerMeta.data,
                'onUpdate:modelValue': (v) => { innerMeta.data = v }
              })
            }

            // 删除
            if (field.type === 'delect') {
              return h(NPopconfirm, {
                showIcon: false,
                onPositiveClick: () => removeRowByIndex(rowIndex)
              }, {
                trigger: () => h(NButton, { size: 'small' }, { default: () => '删除' }),
                default: () => '是否要删除？'
              })
            }

            // 开关
            if (field.type === 'switch') {
              return h(NSwitch, {
                value: !!row[field.key],
                'onUpdate:value': v => { row[field.key] = v; updateRows() }
              }, {
                checked: () => '已开启',
                unchecked: () => '未开启'
              })
            }

            // 抽屉
            if (field.type === 'drawer') {
              const active = getDrawerActive(row.__id, field.key)
              const activate = () => setDrawerActive(row.__id, field.key, true)
              return h('div', [
                h(NButtonGroup, {}, {
                  default: () => [
                    h(NButton, { onClick: activate }, { default: () => '菜单' })
                  ]
                }),
                h(NDrawer, { show: active, 'onUpdate:show': v => setDrawerActive(row.__id, field.key, v), width: 502 }, {
                  default: () => h(NDrawerContent, {}, {
                    header: () => 'Header',
                    footer: () => h(NButton, {}, { default: () => 'Footer' })
                  })
                })
              ])
            }

            // 复选框
            if (field.type === 'Checkbox') {
              const key = field.checkboxKey || (field.checkboxKey = '__checkbox_' + field.key);
              return h(NSpace, { align: 'center' }, {
                default: () => [
                  // 复选框仅控制 UI 选中状态
                  h(NCheckbox, {
                    checked: !!row[key],
                    'onUpdate:checked': v => {
                      row[key] = v; // 只更新 UI 状态
                      updateRows();
                    }
                  }),
                  // 显示原字段值，不改变
                  h('span', {}, row[field.key] != null ? String(row[field.key]) : '未填写')
                ]
              })
            }





            // 普通文本
            const value = row[field.key]
            return h(NText, { depth: 2 }, { default: () => value != null ? String(value) : '未填写' })
          }
        }))

        nodes.push(
          h(NDataTable, {
            columns,
            data: enablePagination.value ? displayRows.value : rows,
            rowKey: row => row.__id,
            singleLine: false,
            striped: true,
            showSummary: false
          })
        )
      })

      // 底部已选择群 + 查看按钮
      if (checkboxFieldKey.value) {
        nodes.push(
          h('div', { style: 'margin-top: 12px; display: flex; align-items: center; gap: 8px;' }, [
            `已选择 ${selectedCount.value} 个群`,
            h(NButton, {
              tertiary: true,
              onClick: () => {
                const selectedRows = rows.filter(r => r[checkboxFieldKey.value])
                console.log('查看已选择群', selectedRows)
              }
            }, { default: () => '查看' })
          ])
        )
      }

      // table 模式分页
      if (enablePagination.value && props.meta.mode === 'table') {
        nodes.push(
          h('div', { style: 'margin-top: 12px; display: flex; justify-content: flex-end;' }, [
            h(NPagination, {
              page: page.value,
              'onUpdate:page': v => page.value = v,
              pageSize: pageSize.value,
              itemCount: rows.length,
              showQuickJumper: true,
            })
          ])
        )
      }

      return h('div', nodes)
    }
  }
}
