<script setup>
import { computed } from 'vue'

const props = defineProps({
  panel: Object,
  parentPanel: Object,   // 新增
  local: Object
})

const emit = defineEmits(["applyPanelLayoutRecursive", "resetSize", "resetBox", "resetBorder", "resetBg",]);
const applyType = (type, targetPanel = props.panel) => {
  if (!targetPanel || targetPanel.type === 'leaf') return
  targetPanel.type = type
  emit('applyPanelLayoutRecursive', targetPanel)
}

const applyCount = (count, targetPanel = props.panel) => {
  if (!targetPanel || targetPanel.type === 'leaf' || !targetPanel.children) return

  const currentCount = targetPanel.children.length
  if (count > currentCount) {
    for (let i = currentCount; i < count; i++) {
      targetPanel.children.push({
        id: Date.now() + i,
        type: 'leaf',
        style: { minHeight: '200px' }
      })
    }
  } else if (count < currentCount) {
    targetPanel.children.length = count
  }
  emit('applyPanelLayoutRecursive', targetPanel)
}
</script>

<template>
  <NForm label-placement="left" label-width="auto" require-mark-placement="right-hanging">
    <n-collapse>
      <!-- 布局折叠 -->
      <n-collapse-item title="布局" name="layout">
        <n-form-item label="布局方向" v-if="props.parentPanel && props.parentPanel.type !== 'leaf'">
          <n-select :options="[
            { label: '横向 (row)', value: 'row' },
            { label: '纵向 (column)', value: 'column' }
          ]" :value="props.parentPanel.type" @update:value="(val) => applyType(val, props.parentPanel)" clearable />
        </n-form-item>

        <n-form-item label="子面板数量" v-if="props.parentPanel && props.parentPanel.type !== 'leaf'">
          <n-input-number :value="props.parentPanel.children?.length || 1" :min="1" :max="20"
            @update:value="(val) => applyCount(val, props.parentPanel)" clearable />
        </n-form-item>
      </n-collapse-item>
      <n-collapse-item title="高度" name="heightSize">

        <n-form-item label="高度模式">
          <n-select v-model:value="local.heightMode" :options="[
            { label: '默认（自动填充）', value: undefined },
            { label: '自适应内容 (auto)', value: 'auto' },
            { label: '固定高度 (fixed)', value: 'fixed' },
            { label: '强制填充 (fill)', value: 'fill' }
          ]" />
        </n-form-item>
        <n-form-item label="高度" v-if="local.heightMode === 'fixed'">
          <n-input v-model:value="local.height" placeholder="400px / 50vh / 30%" clearable />
        </n-form-item>
        <n-form-item label="纵向滚动">
          <n-select v-model:value="local.overflowY" :options="[
            { label: '默认（不设置）', value: undefined },
            { label: '自动 auto', value: 'auto' },
            { label: '显示 scroll', value: 'scroll' },
            { label: '隐藏 hidden', value: 'hidden' },
            { label: '可见 visible', value: 'visible' }
          ]" clearable />
        </n-form-item>

        <n-form-item label="最小高度">
          <n-input v-model:value="local.minHeight" placeholder="100px" clearable />
        </n-form-item>
        <n-form-item label="最大高度">
          <n-input v-model:value="local.maxHeight" placeholder="800px" clearable />
        </n-form-item>
      </n-collapse-item>
      <!-- 尺寸折叠 -->
      <n-collapse-item title="宽度" name="widthSize">
        <n-form-item label="宽度模式">
          <n-select v-model:value="local.widthMode" :options="[
            { label: '默认（自动填充）', value: undefined },
            { label: '自适应内容 (auto)', value: 'auto' },
            { label: '固定宽度 (fixed)', value: 'fixed' },
            { label: '强制填充 (fill)', value: 'fill' }
          ]" />
        </n-form-item>
        <n-form-item label="宽度" v-if="local.widthMode === 'fixed'">
          <n-input v-model:value="local.width" placeholder="400px / 50% / 30vw" clearable />
        </n-form-item>

        <n-form-item label="横向滚动">
          <n-select v-model:value="local.overflowX" :options="[
            { label: '默认（不设置）', value: undefined },
            { label: '自动 auto', value: 'auto' },
            { label: '显示 scroll', value: 'scroll' },
            { label: '隐藏 hidden', value: 'hidden' },
            { label: '可见 visible', value: 'visible' }
          ]" clearable />
        </n-form-item>
        <n-form-item label="最小宽度">
          <n-input v-model:value="local.minWidth" placeholder="200px" clearable />
        </n-form-item>
        <n-form-item label="最大宽度">
          <n-input v-model:value="local.maxWidth" placeholder="800px" clearable />
        </n-form-item>
      </n-collapse-item>

      <!-- 盒模型折叠 -->
      <n-collapse-item title="盒模型与对齐" name="box">
        <n-form-item label="外边距 (margin)">
          <n-input v-model:value="local.margin" placeholder="10px 20px" clearable />
        </n-form-item>
        <n-form-item label="内边距 (padding)">
          <n-input v-model:value="local.padding" placeholder="16px" clearable />
        </n-form-item>

        <n-form-item label="主轴对齐" v-if="panel.type !== 'leaf'">
          <n-select v-model:value="local.justify" :options="[
            { label: '默认', value: undefined },
            { label: '左侧/顶部', value: 'flex-start' },
            { label: '居中', value: 'center' },
            { label: '右侧/底部', value: 'flex-end' },
            { label: '两端对齐', value: 'space-between' },
            { label: '平均分布', value: 'space-around' }
          ]" clearable />
        </n-form-item>

        <n-form-item label="交叉轴对齐" v-if="panel.type !== 'leaf'">
          <n-select v-model:value="local.align" :options="[
            { label: '默认 (stretch)', value: undefined },
            { label: '顶部/左侧', value: 'flex-start' },
            { label: '居中', value: 'center' },
            { label: '底部/右侧', value: 'flex-end' },
            { label: '拉伸填满', value: 'stretch' }
          ]" clearable />
        </n-form-item>

        <n-form-item label="间距 (gap)" v-if="panel.type !== 'leaf'">
          <n-input v-model:value="local.gap" placeholder="20px" clearable />
        </n-form-item>

        <n-divider />
        <n-space justify="end">
          <n-button size="small" tertiary @click="$emit('resetSize')">重置尺寸</n-button>
          <n-button size="small" tertiary @click="$emit('resetBox')">重置盒模型</n-button>
        </n-space>
      </n-collapse-item>
      <!-- 边框与背景 -->
      <n-collapse-item title="边框与背景" name="borderBg">
        <n-form-item label="边框宽度">
          <n-input v-model:value="local.borderWidth" placeholder="1px / 2px" clearable />
        </n-form-item>

        <n-form-item label="边框样式">
          <n-select v-model:value="local.borderStyle" :options="[
            { label: '默认', value: undefined },
            { label: '实线 solid', value: 'solid' },
            { label: '虚线 dashed', value: 'dashed' },
            { label: '点线 dotted', value: 'dotted' },
            { label: '双线 double', value: 'double' },
            { label: '无 none', value: 'none' }
          ]" clearable />
        </n-form-item>

        <n-form-item label="边框颜色">
          <n-color-picker v-model:value="local.borderColor" :modes="['hex', 'rgb', 'hsl']" :show-alpha="true"
            :actions="['confirm', 'clear']"
            @update:value="(v) => local.borderColor = v === null ? 'transparent' : v" />
        </n-form-item>

        <n-form-item label="圆角">
          <n-input v-model:value="local.borderRadius" placeholder="8px / 50% / 8px 8px 0 0" clearable />
        </n-form-item>

        <n-form-item label="背景颜色"> <n-color-picker :value="local.backgroundColor" :modes="['hex', 'rgb', 'hsl']"
            :show-alpha="true" :actions="['confirm', 'clear']"
            @update:value="(v) => local.backgroundColor = v === null ? 'transparent' : v" />
        </n-form-item>

        <n-divider />
        <n-space justify="end">
          <n-button size="small" tertiary @click="$emit('resetBorder')">重置边框</n-button>
          <n-button size="small" tertiary @click="$emit('resetBg')">重置背景</n-button>
        </n-space>
      </n-collapse-item>
    </n-collapse>
  </NForm>
</template>
