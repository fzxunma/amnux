// composables/useMenuData.js
import { h } from 'vue';
import { NTag, NSpace, NButton } from 'naive-ui';
import { useClipboard } from '@vueuse/core';

/**
 * 提取图标名称
 */
export function extractIconName(iconField) {
  if (!iconField) return '';
  if (typeof iconField === 'string') return iconField;
  if (typeof iconField === 'function') {
    try {
      const vnode = iconField();
      return vnode.props?.name || '';
    } catch (e) {
      return '';
    }
  }
  return '';
}

/**
 * 数据转换为可编辑格式（深拷贝 + Icon处理）
 */
export function transformToEditable(data) {
  if (Array.isArray(data)) return data.map(item => transformToEditable(item));
  if (data !== null && typeof data === 'object') {
    const newItem = {};
    for (const key in data) {
      if (key === 'icon') newItem[key] = extractIconName(data[key]);
      else if (key === 'children') newItem[key] = transformToEditable(data[key]);
      else newItem[key] = data[key];
    }
    // 【新增】确保 action 对象存在，方便后续编辑，防止 undefined
    if (!newItem.action) {
      newItem.action = { type: '', page: '' };
    }
    return newItem;
  }
  return data;
}

/**
 * 生成最终代码字符串
 */
export function useCodeGenerator() {
  const { copy } = useClipboard();

  const generateAndCopy = (mainMenus, rightMenus, subMenuMap, message) => {
    const iconHelperStr = `import { h } from "vue"\nimport XmSvgIcon from '/components/icon/XmSvgIcon.vue'\n\nfunction renderIcon(icon) {\n    return () => h(XmSvgIcon, { name: icon })\n}\n\n`;

    const processData = (data) => {
      let json = JSON.stringify(data, (key, value) => {
        if (key === '' || value !== null) return value;
        return undefined;
      }, 4);
      json = json.replace(/"icon": "(.*?)"/g, 'icon: renderIcon("$1")');
      json = json.replace(/"(\w+)":/g, '$1:');
      return json;
    };

    let subConsts = '';
    let mapExport = `export const menuOptionsMap = {\n`;

    Object.keys(subMenuMap).forEach(key => {
      const varName = `menu${key.charAt(0).toUpperCase() + key.slice(1)}Options`;
      subConsts += `const ${varName} = ${processData(subMenuMap[key] || [])}\n\n`;
      mapExport += `    ${key}: ${varName},\n`;
    });
    mapExport += `}\n\n`;

    const mainExport = `export const menuOptions = ${processData(mainMenus)}\n\n`;
    const rightExport = `export const menuRightOptions = ${processData(rightMenus)}`;

    const finalCode = iconHelperStr + subConsts + mapExport + mainExport + rightExport;
    
    copy(finalCode);
    message.success('代码已生成并复制到剪贴板！');
    return finalCode;
  };

  return { generateAndCopy };
}

/**
 * 通用表格列配置
 */
export function useMenuColumns(onEdit, onDelete) {
  return [
    { title: '名称', key: 'label', width: 120, fixed: 'left' }, // 稍微固定一下左侧
    { title: 'Key', key: 'key', width: 150 },
    {
      title: '图标',
      key: 'icon',
      width: 80,
      render: (row) => row.icon ? h(NTag, { type: 'info', size: 'small', bordered: false }, { default: () => row.icon }) : '-'
    },
    // 【新增】展示交互类型
    {
      title: '交互类型',
      key: 'action.type',
      width: 120,
      render: (row) => {
        const type = row.action?.type;
        if (!type) return '-';
        // 根据类型给不同的颜色
        return h(NTag, { type: type === 'XmDrawer' ? 'success' : 'warning', size: 'small' }, { default: () => type });
      }
    },
    // 【新增】展示页面路径
    {
      title: '页面路径',
      key: 'action.page',
      width: 150,
      render: (row) => row.action?.page || '-'
    },
    {
      title: '操作',
      key: 'actions',
      width: 130,
      fixed: 'right', // 固定操作列
      render: (row) => h(NSpace, {}, {
        default: () => [
          h(NButton, { size: 'tiny', type: 'primary', onClick: () => onEdit(row) }, { default: () => '编辑' }),
          h(NButton, { size: 'tiny', type: 'error', onClick: () => onDelete(row) }, { default: () => '删除' })
        ]
      })
    }
  ];
}
