// XmLayoutRegistry.js
class XmLayoutRegistry {
  constructor() {
    /** @type {Map<string, any>} id -> layoutMeta */
    this.registry = new Map()
  }

  /**
   * 注册单个 layout meta
   * @param {string} id
   * @param {object} meta
   */
  register(id, meta) {
    if (!id || !meta) throw new Error('id and meta are required')
    const key = id.replace(/-/g, "_") // "XmLayout3_h_c_f"
    this.registry.set(key, meta)
  }

  /**
   * 批量注册
   * @param {Array<{id: string, meta: object}>} list
   */
  registerBatch(list) {

    list.forEach(item => {
      const key = item.id.replace(/-/g, "_") // "XmLayout3_h_c_f"
      this.registry.set(key, item.meta || item)
    })
    console.log('Registered layouts:', Array.from(this.registry.keys()))
  }

  /**
   * 获取 layout meta
   * @param {string} id
   */
  get(id) {
    if (!id) return null
    const key = id.replace(/-/g, "_") // "XmLayout3_h_c_f"
    return this.registry.get(key) || null
  }

  /**
   * 获取全部注册的 layout meta
   */
  getAll() {
    return Array.from(this.registry.values())
  }

  /**
   * 是否存在
   * @param {string} id
   */
  has(id) {
    const key = id.replace(/-/g, "_") // "XmLayout3_h_c_f"
    return this.registry.has(key)
  }

  /**
   * 删除 layout meta
   * @param {string} id
   */
  remove(id) {
    const key = id.replace(/-/g, "_") // "XmLayout3_h_c_f"  
    return this.registry.delete(key)
  }
}

// 单例导出
export const XmLayoutRegistryInstance = new XmLayoutRegistry()
