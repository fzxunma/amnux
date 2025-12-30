import { h } from 'vue'

export const XmLayoutEditFormMeta = {
  layout: 'grid',
  groupType: 'step', // tab | step | default
  // Tabs 增强
  tabs: {
    props: {
      type: 'card',
      animated: true
    },
    renderLabel: (groupName, index) =>
      h('span', { class: 'font-bold text-blue-500' }, groupName)
  },

  // Steps 增强
  steps: {
    props: {
      size: 'small',
      status: 'process'
    },
    renderTitle: (groupName, index) =>
      h('span', { class: index === 0 ? 'text-green-500' : '' }, groupName)
  },

  // default 分组增强
  defaultGroup: {
    renderTitle: groupName =>
      h('div', { class: 'text-lg font-semibold text-primary' }, groupName)
  },
  cols: 2,
  gap: 3,
  inline: false,
  showLabel: true,
  actionsAlign: 'center', // left | center | right
  showActions: true,
  actions: [
    { key: 'reset', label: '重置', type: 'default', showActions: true },
    { key: 'cancel', label: '取消', type: 'default', showActions: false },
    { key: 'submit', label: '确定', type: 'primary', showActions: true }
  ],
  fields: [
    // Header 分组
    { key: 'headerTitle', label: 'Header 标题', showCount:true,maxlength: 100, minlength: 0, clearable: true, type: 'XmInput', default: 'Header', group: 'Header', order: 1, width: '500px' },
    { key: 'headerHeight', label: 'Header 高度', type: 'XmInputNumber', default: 60, group: 'Header', order: 2 },

    // 左侧栏分组
    { key: 'leftSiderTitle', label: '左侧栏标题', type: 'XmInput', default: 'Left Sider', group: '左侧栏', order: 1 },
    { key: 'leftSiderWidth', label: '左侧栏宽度', type: 'XmInputNumber', default: 200, group: '左侧栏', order: 2 },

    // 右侧栏分组
    { key: 'rightSiderTitle', label: '右侧栏标题', type: 'XmInput', default: 'Right Sider', group: '右侧栏', order: 1 },
    { key: 'rightSiderWidth', label: '右侧栏宽度', type: 'XmInputNumber', default: 200, group: '右侧栏', order: 2 },

    // 内容分组
    { key: 'contentPadding', label: '内容 Padding', type: 'XmInputNumber', default: 24, span: 2, group: '内容', order: 1 },

    // Footer 分组
    { key: 'footerTitle', label: 'Footer 标题', type: 'XmInput', default: 'Footer', group: 'Footer', order: 1 },
    { key: 'footerHeight', label: 'Footer 高度', type: 'XmInputNumber', default: 50, group: 'Footer', order: 2 }
  ]
}
