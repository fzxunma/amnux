<script setup>
import { h } from "vue"
import { NTree, NPopconfirm } from "naive-ui"
import { useXmMeta } from '/composables/useXmMeta'

const {
  xmMetaTreeData,
  deleteMetaData,
  reloadMetaDataList
} = useXmMeta([])
let treePath = ""
// 删除节点逻辑（保持不变，只优化了参数解析）
const deleteNode = async (node) => {
  if (!node.raw || node.isLeaf === false){
     //await deleteMetaData([treePath])
     return
  } 

  // 假设 node.raw 中有 type 和 id（你转换树时附加的）
  // 示例：raw: { type: 'XmWorkflows', id: 'create', title: '创建流程' }
  const { path } = node.raw
  console.log( node.raw)
  if (!path) {
    window.$message.warning("无法获取节点信息")
    return
  }
  try {
    // 根据你的实际存储路径调整
    console.log([path])
    await deleteMetaData([path])  // 或 ["xm", type, id]，看你的 deleteMetaData 实现
    window.$message.success("删除成功")
    await reloadMetaDataList()
  } catch (err) {
    console.error(err)
    window.$message.error("删除失败")
  }
}

// 关键：自定义 label，里面放文字 + 删除按钮
const renderLabel = ({ option: node }) => {
  // 只对叶子节点显示删除按钮

  return h(
    "div",
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingRight: '8px'
      }
    },
    [
      // 节点名称
      h("span", node.label+'['+node.key+']'),

      // 删除按钮（用 Popconfirm 包裹）
      h(
        NPopconfirm,
        {
          onPositiveClick: () => deleteNode(node),
          positiveText: "确认",
          negativeText: "取消"
        },
        {
          trigger: () =>
            h(
              "span",
              {
                class: "delete-icon",
                title: "删除此项"
              },
              "×"  // 简单用 ×，或换成图标
            ),
          default: () => `确定删除「${node.label}」吗？此操作不可恢复`
        }
      )
    ]
  )
}

const handleSelect = (keys, { node }) => {
  console.log('选中:',keys, node)
  treePath = keys[0]
  // 打开编辑等逻辑
}
</script>

<template>
  <div class="meta-tree-container">
    <n-tree
      :data="xmMetaTreeData"
      block-line
      expandable
      selectable
      default-expand-all
      :render-label="renderLabel"
      @update:selected-keys="handleSelect"
    />
  </div>
</template>

<style scoped>
.meta-tree-container {
  padding: 10px 0;
}

.delete-icon {
  cursor: pointer;
  color: #f56c6c;
  font-size: 16px;
  font-weight: bold;
  padding: 0 6px;
  border-radius: 50%;
  transition: all 0.2s;
}

.delete-icon:hover {
  background: #fee;
  color: #f00;
  transform: scale(1.2);
}
</style>