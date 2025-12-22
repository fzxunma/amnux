export class XmMeta2Tree {
  static buildTreeNodes(obj, parentPath = []) {
    return Object.entries(obj)
      .filter(([_, v]) => v && typeof v === "object")
      .map(([key, value]) => {
        const currentPath = [...parentPath, key];
        const pathKey = currentPath.join("/");

        const isLeaf = value.id && value.title && value.content !== undefined;

        return {
          key: pathKey,
          label: value.title || key,
          raw: isLeaf
            ? {
              id: value.id,
              data: value,
              path: pathKey,
            }
            : undefined,
          children: isLeaf ? undefined : this.buildTreeNodes(value, currentPath),
          isLeaf,
        };
      });
  }
  static convertMetaToTree(metaData) {
    if (!metaData || typeof metaData !== "object") return [];

    const tree = [];

    // 遍历顶级类型（如 pages, XmForms, XmWorkflows）
    for (const typeKey in metaData) {
      if (!Object.prototype.hasOwnProperty.call(metaData, typeKey)) continue;

      const typeItems = metaData[typeKey];

      // 如果 typeItems 不是对象，直接跳过（防御）
      if (!typeItems || typeof typeItems !== "object") continue;

      const children = [];

      // 遍历该类型下的所有条目（如 home, list, create）
      for (const itemKey in typeItems) {
        if (!Object.prototype.hasOwnProperty.call(typeItems, itemKey)) continue;

        const item = typeItems[itemKey];

        // 递归支持嵌套（如 pages/path/path）
        if (
          item && typeof item === "object" && !item.title && !item.content &&
          !item.id
        ) {
          // 纯嵌套对象，递归构建子树
          const nestedChildren = this.convertMetaToTree({ [itemKey]: item });
          if (nestedChildren.length > 0) {
            children.push(nestedChildren[0]);
          }
          continue;
        }

        // 正常叶子节点
        children.push({
          key: `${typeKey}/${itemKey}`, // 唯一 key
          label: item.title || item.id || itemKey, // 显示标题
          isLeaf: true,
          raw: item, // 保存原始数据，点击时可用
        });
      }
      // 构建该类型节点
      tree.push({
        key: typeKey,
        label: typeKey.replace(/^Xm/, ""), // 可选：美化显示，如 XmWorkflows → Workflows
        children: children.length > 0 ? children : undefined,
        isLeaf: children.length === 0,
      });
    }

    // 可选：按 label 排序顶级节点
    tree.sort((a, b) => a.label.localeCompare(b.label));

    return tree;
  }
  static convertToTreeData(rawData) {
    const treeData = [];

    // 遍历顶级类型（如 pages, XmForms, XmMetaType 等）
    for (const typeKey in rawData) {
      if (!Object.prototype.hasOwnProperty.call(rawData, typeKey)) continue;

      const typeValue = rawData[typeKey];

      // 如果 typeValue 是普通对象（有 title/content/id），视为叶子节点
      if (
        typeValue && typeof typeValue === "object" &&
        (typeValue.title || typeValue.content || typeValue.id)
      ) {
        treeData.push(this.buildNode(typeKey, typeValue, typeKey));
        continue;
      }

      // 否则视为目录，递归构建子节点
      const children = [];
      for (const itemKey in typeValue) {
        if (!Object.prototype.hasOwnProperty.call(typeValue, itemKey)) continue;
        const itemValue = typeValue[itemKey];
        children.push(
          this.buildNode(itemKey, itemValue, `${typeKey}-${itemKey}`),
        );
      }

      treeData.push({
        key: typeKey,
        label: typeKey.replace(/^Xm/, ""), // 可选：去掉 Xm 前缀更美观
        children: children.length > 0 ? children : undefined,
        isLeaf: children.length === 0,
      });
    }

    return treeData;
  }

  /**
   * 递归构建单个节点
   * @param {string} key - 当前键名
   * @param {any} value - 当前值
   * @param {string} uniqueKey - 保证 key 唯一（防止重复）
   * @returns {Object} TreeOption
   */
  static buildNode(key, value, uniqueKey = key) {
    // 如果是基本类型或空对象，直接作为叶子
    if (!value || typeof value !== "object") {
      return {
        key: uniqueKey,
        label: key,
        isLeaf: true,
      };
    }

    // 提取可能存在的子节点（排除常见字段 title/content/id）
    const childEntries = Object.entries(value).filter(
      ([k]) => !["title", "content", "id"].includes(k),
    );

    const children = childEntries.map(([childKey, childValue]) => {
      return this.buildNode(childKey, childValue, `${uniqueKey}-${childKey}`);
    });

    // 显示标签优先级：title > id > key
    const label = value.title || value.id || key;

    return {
      key: uniqueKey,
      label: label,
      isLeaf: children.length === 0,
      children: children.length > 0 ? children : undefined,
      // 附加原始数据，方便点击时使用
      raw: value,
    };
  }
}
