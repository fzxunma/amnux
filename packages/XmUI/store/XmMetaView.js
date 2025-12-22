export class XmMetaView {
  /* ================= 基础 ================= */

  static isEntity(node) {
    return (
      node &&
      typeof node === "object" &&
      node.id !== undefined &&
      node.title !== undefined
    );
  }

  static getNodeByPath(fullData, path = []) {
    let cur = fullData;
    for (const p of path) {
      if (!cur || typeof cur !== "object") return null;
      cur = cur[p];
    }
    return cur;
  }

  static formatLabel(key, node) {
    return node?.title || key;
  }

  /* ================= Tree ================= */

  static buildTree(node, basePath = [], options = {}) {
    const { predicate } = options;

    return Object.entries(node || {})
      .filter(([key, value]) => {
        if (!value || typeof value !== "object") return false;
        if (!predicate) return true;
        return predicate({ key, value, path: [...basePath, key] });
      })
      .map(([key, value]) => {
        const currentPath = [...basePath, key];
        const keyStr = currentPath.join("/");

        const isLeaf = this.isEntity(value);

        return {
          key: keyStr,
          label: this.formatLabel(key, value),
          isLeaf,
          raw: isLeaf
            ? { id: value.id, data: value, path: currentPath }
            : undefined,
          children: isLeaf
            ? undefined
            : this.buildTree(value, currentPath, options),
        };
      });
  }

  static buildTreeView(fullData, options = {}) {
    const {
      basePath = [],
      includeRoot = true,
      rootLabel,
      predicate,
    } = options;

    const subTree = this.getNodeByPath(fullData, basePath);
    if (!subTree) return [];

    const children = this.buildTree(subTree, basePath, { predicate });

    if (!includeRoot) return children;

    return [
      {
        key: basePath.join("/"),
        label: rootLabel || basePath.at(-1) || "ROOT",
        isLeaf: false,
        children,
      },
    ];
  }

  /* ================= List ================= */

  static buildListView(fullData, options = {}) {
    const { basePath = [], predicate } = options;
    const node = this.getNodeByPath(fullData, basePath);
    if (!node) return [];

    return Object.entries(node)
      .filter(([key, value]) => {
        if (!this.isEntity(value)) return false;
        if (!predicate) return true;
        return predicate({ key, value, path: [...basePath, key] });
      })
      .map(([key, value]) => ({
        key: [...basePath, key].join("/"),
        id: value.id,
        title: value.title,
        data: value,
      }));
  }

  /* ================= Breadcrumb ================= */

  static buildBreadcrumb(fullData, path = []) {
    const crumbs = [];
    let cur = fullData;
    const acc = [];

    for (const segment of path) {
      if (!cur || typeof cur !== "object") break;
      cur = cur[segment];
      acc.push(segment);

      crumbs.push({
        key: acc.join("/"),
        label: this.formatLabel(segment, cur),
        path: [...acc],
        isLeaf: this.isEntity(cur),
      });
    }

    return crumbs;
  }
}