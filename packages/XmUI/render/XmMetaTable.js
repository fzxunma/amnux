// XmMetaTable.js
import { h, computed } from 'vue'
import { NDataTable, NButton } from 'naive-ui'

export function XmMetaTable({ meta, data, onEdit, onDelete }) {
  const columns = computed(() =>
    (meta.fields || []).map(f => ({
      title: f.label,
      key: f.key,
      render(row) {
        if (f.type === 'XmSwitch') {
          return h('span', row[f.key] ? '是' : '否')
        }
        return row[f.key]
      }
    }))
  )

  return h(NDataTable, {
    columns: columns.value,
    data: data || [],
    rowKey: 'id',
    renderRowActions: row =>
      h('div', { class: 'flex gap-2' }, [
        onEdit &&
          h(NButton, { size: 'small', onClick: () => onEdit(row) }, () => '编辑'),
        onDelete &&
          h(NButton, { size: 'small', type: 'error', onClick: () => onDelete(row) }, () => '删除')
      ])
  })
}
