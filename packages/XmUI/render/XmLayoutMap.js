// XmLayoutMap.js
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NLayoutSider
} from 'naive-ui'
import { h } from 'vue'
import { XmLayoutRegistryInstance } from './XmLayoutRegistry'

// 组件映射
export const XmLayoutComponentMap = {
  XmLayout: NLayout,
  XmLayoutHeader: NLayoutHeader,
  XmLayoutContent: NLayoutContent,
  XmLayoutFooter: NLayoutFooter,
  XmLayoutSider: NLayoutSider
}

// ===================== Layout Meta =====================

export const XmLayout3_h_c_f = {
  id: 'XmLayout3-h-c-f',
  title: '三行布局(header-content-footer)',
  type: 'XmLayout',
  props: { class: 'h-full' },
  children: [
    {
      type: 'XmLayoutHeader',
      slots: { default: () => 'Header' }
    },
    {
      type: 'XmLayoutContent',
      props: { contentStyle: { padding: '24px' } },
      slots: { default: () => 'Content' }
    },
    {
      type: 'XmLayoutFooter',
      slots: { default: () => 'Footer' }
    }
  ]
}

export const XmLayout3_h_cs_f = {
  id: 'XmLayout3-h-cs-f',
  title: '三行布局(header-content-sider-footer)',
  type: 'XmLayout',
  props: { class: 'h-full' },
  children: [
    {
      type: 'XmLayoutHeader',
      slots: { default: () => 'Header' }
    },
    {
      type: 'XmLayout',
      props: { hasSider: true },
      children: [
        {
          type: 'XmLayoutContent',
          props: { contentStyle: { padding: '24px' } },
          slots: { default: () => 'Content' }
        },
        {
          type: 'XmLayoutSider',
          props: { width: 200 },
          slots: { default: () => 'Sider' }
        }
      ]
    },
    {
      type: 'XmLayoutFooter',
      slots: { default: () => 'Footer' }
    }
  ]
}

export const XmLayout3_h_sc_f = {
  id: 'XmLayout3-h-sc-f',
  title: '三行布局(header-sider-content-footer)',
  type: 'XmLayout',
  props: { class: 'h-full', hasSider: true },
  children: [
    {
      type: 'XmLayoutHeader',
      slots: { default: () => 'Header' }
    },
    {
      type: 'XmLayout',
      props: { hasSider: true },
      children: [
        {
          type: 'XmLayoutSider',
          props: { width: 220 },
          slots: { default: () => 'Sider' }
        },
        {
          type: 'XmLayoutContent',
          props: { contentStyle: { padding: '24px' } },
          slots: { default: () => 'Content' }
        }
      ]
    },
    {
      type: 'XmLayoutFooter',
      slots: { default: () => 'Footer' }
    }
  ]
}

export const XmLayout3_h_scs_f = {
  id: 'XmLayout3-h-scs-f',
  title: '三行布局(header-sider-content-sider-footer)',
  type: 'XmLayout',
  props: { class: 'h-full', hasSider: true },
  children: [
    {
      type: 'XmLayoutHeader',
      slots: { default: () => 'Header' }
    },
    {
      type: 'XmLayout',
      props: { hasSider: true },
      children: [
        {
          type: 'XmLayoutSider',
          props: { width: 200 },
          slots: { default: () => 'Left Sider' }
        },
        {
          type: 'XmLayoutContent',
          props: { contentStyle: { padding: '24px' } },
          slots: { default: () => 'Content' }
        },
        {
          type: 'XmLayoutSider',
          props: { width: 200 },
          slots: { default: () => 'Right Sider' }
        }
      ]
    },
    {
      type: 'XmLayoutFooter',
      slots: { default: () => 'Footer' }
    }
  ]
}

export const XmLayout3_s_hcf = {
  id: 'XmLayout3-s-hcf',
  title: '三行布局(sider-header-content-footer)',
  type: 'XmLayout',
  props: { class: 'h-full', hasSider: true },
  children: [
    {
      type: 'XmLayoutSider',
      props: { width: 220 },
      slots: { default: () => 'Sider' }
    },
    {
      type: 'XmLayout',
      children: [
        {
          type: 'XmLayoutHeader',
          slots: { default: () => 'Header' }
        },
        {
          type: 'XmLayoutContent',
          props: { contentStyle: { padding: '24px' } },
          slots: { default: () => 'Content' }
        },
        {
          type: 'XmLayoutFooter',
          slots: { default: () => 'Footer' } // ✅ 修正 type
        }
      ]
    }
  ]
}


// 工厂函数：生成可动态修改的 layout meta
export function createLayoutMeta(baseMeta, overrideProps = {}, overrideSlots = {}) {
  if (!baseMeta) return null
  const clone = JSON.parse(JSON.stringify(baseMeta)) // 简单深拷贝
  // 遍历 children，根据 overrideProps/overrideSlots 替换 props/slots
  function applyOverrides(node) {
    if (!node) return
    const typeKey = node.type
    if (overrideProps[typeKey]) node.props = { ...node.props, ...overrideProps[typeKey] }
    if (overrideSlots[typeKey]) node.slots = { default: overrideSlots[typeKey] }
    if (Array.isArray(node.children)) node.children.forEach(applyOverrides)
  }
  applyOverrides(clone)
  return clone
}

// base layout meta
export const XmLayout3_h_scs_f_base = {
  id: 'XmLayout3-h-scs-f',
  title: '三行布局(header-sider-content-sider-footer)',
  type: 'XmLayout',
  props: { class: 'h-full', hasSider: true },
  children: [
    { type: 'XmLayoutHeader', slots: { default: () => 'Header' } },
    {
      type: 'XmLayout',
      props: { hasSider: true },
      children: [
        { type: 'XmLayoutSider', props: { width: 200 }, slots: { default: () => 'Left Sider' } },
        { type: 'XmLayoutContent', props: { contentStyle: { padding: '24px' } }, slots: { default: () => 'Content' } },
        { type: 'XmLayoutSider', props: { width: 200 }, slots: { default: () => 'Right Sider' } }
      ]
    },
    { type: 'XmLayoutFooter', slots: { default: () => 'Footer' } }
  ]
}
// ===================== 注册到 Registry =====================

XmLayoutRegistryInstance.registerBatch([
  { id: XmLayout3_h_c_f.id, meta: XmLayout3_h_c_f },
  { id: XmLayout3_h_cs_f.id, meta: XmLayout3_h_cs_f },
  { id: XmLayout3_h_sc_f.id, meta: XmLayout3_h_sc_f },
  { id: XmLayout3_h_scs_f.id, meta: XmLayout3_h_scs_f },
  { id: XmLayout3_s_hcf.id, meta: XmLayout3_s_hcf }
])

export { XmLayoutRegistryInstance }
