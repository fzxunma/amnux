// XmFieldRenderer.js
import { h, computed } from 'vue'
import {
  NInput,
  NInputNumber,
  NSelect,
  NSwitch,
  NDatePicker,
  NCheckbox,
  NCheckboxGroup,
  NRadio,
  NRadioGroup,
  NTreeSelect,
  NTransfer,
  NFormItem
} from 'naive-ui'
import { resolveFieldProps as defaultResolveFieldProps } from './XmFormUtils.js'

/**
 * 低代码字段组件映射
 */
export const XmFormFieldMap = {
  XmInput: NInput,
  XmInputNumber: NInputNumber,
  XmSelect: NSelect,
  XmSwitch: NSwitch,
  XmDatePicker: NDatePicker,
  XmCheckbox: NCheckbox,
  XmCheckboxGroup: NCheckboxGroup,
  XmRadio: NRadio,
  XmRadioGroup: NRadioGroup,
  XmTreeSelect: NTreeSelect,
  XmTransfer: NTransfer
}

/**
 * 渲染单个字段（基础字段 + 分类 + transfer 等）
 */
export function renderField(f, formModel, updateField, exprCtx) {
  const value = computed({
    get: () => formModel[f.key],
    set: v => updateField(f, v)
  })

  const disabled = computed(() => typeof f.disabled === 'function' ? f.disabled(exprCtx) : !!f.disabled)
  const readonly = computed(() => typeof f.readonly === 'function' ? f.readonly(exprCtx) : !!f.readonly)
  const visible = computed(() => typeof f.visible === 'function' ? f.visible(exprCtx) : f.visible !== false)

  if (!visible.value) return null

  // 分类字段
  if (f.type === 'category') {
    if (f.categoryType === 'single') {
      return h(NSelect, {
        value: value.value,
        options: f.options || [],
        placeholder: f.placeholder,
        disabled: disabled.value || readonly.value,
        clearable: f.clearable,
        'onUpdate:value': v => value.value = v
      })
    }
    if (f.categoryType === 'multi') {
      return h(NCheckboxGroup, {
        value: Array.isArray(value.value) ? value.value : [],
        disabled: disabled.value || readonly.value,
        'onUpdate:value': v => value.value = v
      }, () =>
        (f.options || []).map(o =>
          h(NCheckbox, { key: o.value, value: o.value }, () => o.label)
        )
      )
    }
    if (f.categoryType === 'tree') {
      return h(NTreeSelect, {
        value: f.multiple ? (Array.isArray(value.value) ? value.value : []) : value.value,
        multiple: !!f.multiple,
        options: f.treeOptions || [],
        placeholder: f.placeholder,
        disabled: disabled.value || readonly.value,
        'onUpdate:value': v => value.value = v
      })
    }
  }

  // 穿梭框
  if (f.type === 'transfer') {
    return h(NTransfer, {
      value: Array.isArray(value.value) ? value.value : [],
      options: f.options || [],
      titles: f.titles || ['可选', '已选'],
      filterable: f.filterable ?? true,
      disabled: disabled.value || readonly.value,
      'onUpdate:value': v => value.value = v
    })
  }

  // 基础字段
  const Comp = XmFormFieldMap[f.type] || NInput
  return h(Comp, {
    ...f.props,
    modelValue: value.value,
    placeholder: f.placeholder,
    disabled: disabled.value || readonly.value,
    onInput: v => value.value = v,
    'onUpdate:modelValue': v => value.value = v
  })
}

/**
 * 渲染多个字段
 * @param {Array} list 字段列表
 * @param {*} meta 元数据
 * @param {*} formModel 数据对象
 * @param {*} exprCtx 表达式上下文
 * @param {*} updateField 更新回调 function(key, value)
 * @param {*} resolveFieldProps 可选，解析字段 props
 * @param {*} readonly 可选，外层只读开关
 */
export function renderFields({
  list = [],
  meta,
  formModel,
  exprCtx,
  updateField,
  resolveFieldProps = defaultResolveFieldProps,
  readonly
}) {
  return list.map(f => {
    const props = resolveFieldProps(f)
    const isEditable = readonly !== undefined ? !readonly : f.editable !== false
    console.log('render field', f.key, 'isEditable=', isEditable)
    switch (f.type) {
      case 'XmInput':
      case 'XmInputNumber':
      case 'XmSelect':
      case 'XmSwitch':
      case 'XmDatePicker':
        if (!isEditable) {
          // 不可编辑 → 直接渲染文本
          return h(NFormItem, { label: f.label }, {
            default: () => h('span', formModel[f.key] ?? '')
          })
        }
        const Comp = XmFormFieldMap[f.type] || NInput
        return h(Comp, {
          ...props,
          modelValue: formModel[f.key],
          'onUpdate:modelValue': isEditable ? val => updateField(f.key, val) : undefined,
          disabled: !isEditable,
          placeholder: f.placeholder || ''
        })
      case 'category':
        if (f.categoryType === 'single') {
          return h(NRadioGroup, {
            modelValue: formModel[f.key],
            'onUpdate:modelValue': isEditable ? val => updateField(f.key, val) : undefined,
            disabled: !isEditable
          }, {
            default: () => f.options.map(opt =>
              h(NRadio, { value: opt.value }, { default: () => opt.label })
            )
          })
        } else if (f.categoryType === 'multi') {
          return h(NCheckboxGroup, {
            modelValue: formModel[f.key] || [],
            'onUpdate:modelValue': isEditable ? val => updateField(f.key, val) : undefined,
            disabled: !isEditable
          }, {
            default: () => f.options.map(opt =>
              h(NCheckbox, { value: opt.value }, { default: () => opt.label })
            )
          })
        }
        break
      case 'transfer':
        return h(NTransfer, {
          source: f.options || [],
          target: formModel[f.key] || [],
          'onUpdate:target': isEditable ? val => updateField(f.key, val) : undefined,
          disabled: !isEditable,
          titles: f.titles || ['可选', '已选']
        })
      default:
        // 默认文本输入
        return h(NInput, {
          modelValue: formModel[f.key],
          'onUpdate:modelValue': isEditable ? val => updateField(f.key, val) : undefined,
          disabled: !isEditable,
          placeholder: f.placeholder || ''
        })
    }
  })
}
