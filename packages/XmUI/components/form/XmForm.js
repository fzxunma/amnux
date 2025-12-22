// App.js 或 App.vue <script>
import { h } from 'vue'
import { createViewAdapter } from '/render/XmViewAdapter.js'
import renderMeta from '/render/XmMetaRenderer.js'
import XmBreadcrumbRenderer from '/render/XmBreadcrumbRenderer.js'
import { xmMeta } from './xm-meta'

export default {
  name: 'XmForm',

  setup() {
    // 1️⃣ 创建视图适配器
    const view = createViewAdapter(xmMeta)

    // 2️⃣ 注入列表数据（Table / List 用）
    view.list = [
      { username: 'tom', role: 'admin', enable: true },
      { username: 'jack', role: 'user', enable: false }
    ]

    // 3️⃣ 返回渲染函数
    return () =>
      h('div', { class: 'XmForm' }, [
        // Breadcrumb 永远显示
        h(XmBreadcrumbRenderer, { ctx: view }),

        // 当前 Meta 视图（Tree / Form / Table / List）
        renderMeta(view.current, view)
      ])
  }
}
