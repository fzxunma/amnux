<script setup>
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'

const message = useMessage()
const API_BASE = '/api/meta'

async function metaRequest(payload) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const result = await response.json()
    if (result.status === 200) return result.data
    throw new Error(result.message || '操作失败')
  } catch (err) {
    console.error('Meta API Error:', err)
    throw err
  }
}

// 页面数据
const pageData = ref(null) // 当前编辑页面
const pageList = ref([])   // 所有页面列表
const newPageId = ref('')
const newPageTitle = ref('')

// ======================== API 操作 ========================

async function loadPage(id) {
  try {
    const data = await metaRequest({
      opt: 'get',
      keyPath: `pages/${id}`
    })
    pageData.value = data
    message.success('加载成功')
  } catch (err) {
    message.error(err.message || '加载失败')
    pageData.value = null
  }
}

async function loadAllPages() {
  try {
    const data = await metaRequest({
      opt: 'get',
      keyPath: 'pages'
    })
    pageList.value = Object.keys(data || {})
    message.success('加载所有页面成功')
  } catch (err) {
    message.error(err.message || '加载失败')
  }
}

async function savePage(id, content) {
  try {
    await metaRequest({
      opt: 'set',
      keyPath: `pages/${id}`,
      value: content
    })
    message.success('保存成功')
    loadAllPages() // 更新列表
  } catch (err) {
    message.error(err.message || '保存失败')
    throw err
  }
}

async function updatePageField(id, fieldPath, newValue) {
  try {
    await metaRequest({
      opt: 'update',
      keyPath: `pages/${id}`,
      path: fieldPath,
      value: newValue
    })
    message.success('更新成功')
    if (pageData.value) {
      const parts = fieldPath.split('/')
      let cur = pageData.value
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]]
      cur[parts[parts.length - 1]] = newValue
    }
  } catch (err) {
    message.error(err.message || '更新失败')
  }
}

async function deletePage(id) {
  if (!confirm(`确定要删除页面 "${id}" 吗？`)) return
  try {
    await metaRequest({ opt: 'del', keyPath: `pages/${id}` })
    message.success('删除成功')
    if (pageList.value.includes(id)) pageList.value = pageList.value.filter(i => i !== id)
    if (pageData.value && pageData.value.id === id) pageData.value = null
  } catch (err) {
    message.error(err.message || '删除失败')
  }
}

async function addNewPage() {
  const id = newPageId.value.trim()
  if (!id) return message.error('请输入页面 ID')
  const title = newPageTitle.value.trim() || '新页面'
  const content = { title, content: '' }
  try {
    await savePage(id, content)
    newPageId.value = ''
    newPageTitle.value = ''
    loadPage(id)
  } catch {}
}

// ======================== 生命周期 ========================
onMounted(() => {
  loadAllPages()
})
</script>

<template>
  <div class="meta-editor">
    <h2>页面管理器</h2>

    <n-space vertical>
      <!-- 新增页面 -->
      <n-space>
        <n-input v-model:value="newPageId" placeholder="页面 ID" />
        <n-input v-model:value="newPageTitle" placeholder="页面标题" />
        <n-button type="primary" @click="addNewPage">添加页面</n-button>
      </n-space>

      <!-- 页面列表 -->
      <div class="page-list">
        <h3>所有页面</h3>
        <n-list bordered>
          <n-list-item v-for="id in pageList" :key="id">
            <n-space>
              <span>{{ id }}</span>
              <n-button size="tiny" @click="loadPage(id)">编辑</n-button>
              <n-button size="tiny" type="error" @click="deletePage(id)">删除</n-button>
            </n-space>
          </n-list-item>
        </n-list>
      </div>
    </n-space>

    <!-- 当前页面编辑区 -->
    <div v-if="pageData" class="page-content">
      <h3>编辑页面: {{ pageData.title || '未命名' }}</h3>
      <n-input
        v-model:value="pageData.title"
        placeholder="标题"
        @blur="updatePageField(pageData.id || pageData.title, 'title', pageData.title)"
      />
      <n-input
        type="textarea"
        v-model:value="pageData.content"
        placeholder="内容"
        :rows="10"
        @blur="updatePageField(pageData.id || pageData.title, 'content', pageData.content)"
      />
      <n-button type="primary" @click="savePage(pageData.id || pageData.title, pageData)">
        完整保存
      </n-button>
    </div>
    <n-empty v-else description="请选择或添加页面" />
  </div>
</template>

<style scoped>
.meta-editor {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}
.page-list {
  margin: 20px 0;
}
.page-content {
  margin-top: 20px;
}
</style>
