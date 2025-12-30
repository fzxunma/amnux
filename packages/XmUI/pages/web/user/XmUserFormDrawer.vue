<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="360">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem :label="$t('page.manage.user.userName')" path="userName">
          <NInput v-model:value="model.userName" :placeholder="$t('page.manage.user.form.userName')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.userGender')" path="userGender">
          <NRadioGroup v-model:value="model.userGender">
            <NRadio v-for="item in userGenderOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.nickName')" path="nickName">
          <NInput v-model:value="model.nickName" :placeholder="$t('page.manage.user.form.nickName')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.userPhone')" path="userPhone">
          <NInput v-model:value="model.userPhone" :placeholder="$t('page.manage.user.form.userPhone')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.userEmail')" path="email">
          <NInput v-model:value="model.userEmail" :placeholder="$t('page.manage.user.form.userEmail')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.userStatus')" path="status">
          <NRadioGroup v-model:value="model.status">
            <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.userRole')" path="roles">
          <NSelect
            v-model:value="model.userRoles"
            multiple
            :options="roleOptions"
            :placeholder="$t('page.manage.user.form.userRole')"
          />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { NDrawer, NDrawerContent, NForm, NFormItem, NInput, NRadioGroup, NRadio, NSelect, NButton, NSpace } from 'naive-ui'

const visible = ref(false)
const title = ref('用户操作')
const formRef = ref(null)
const $t  = (value)=>value
const model = reactive({
  userName: '',
  userGender: null,
  nickName: '',
  userPhone: '',
  userEmail: '',
  status: null,
  userRoles: []
})

const rules = {
  userName: [{ required: true, message: '请输入用户名' }],
  userGender: [{ required: true, message: '请选择性别' }],
  nickName: [{ required: false }],
  userPhone: [{ required: false }],
  userEmail: [{ required: false }],
  status: [{ required: true, message: '请选择状态' }],
  userRoles: [{ required: false }]
}

// 下拉选项
const userGenderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '保密', value: 'secret' }
]

const enableStatusOptions = [
  { label: '启用', value: 'enabled' },
  { label: '禁用', value: 'disabled' }
]

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '普通用户', value: 'user' }
]

// 方法
function closeDrawer() {
  visible.value = false
}

function handleSubmit() {
  formRef.value?.validate().then(() => {
    console.log('提交表单', { ...model })
    visible.value = false
  }).catch(() => {
    console.log('表单校验失败')
  })
}
</script>
