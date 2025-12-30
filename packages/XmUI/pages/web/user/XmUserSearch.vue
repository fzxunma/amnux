
<script setup>
import { ref, reactive } from 'vue'
import { NButton, NInput, NSelect, NForm, NFormItem, NCard, NSpace, NGrid, NCollapse, NCollapseItem } from 'naive-ui'


// 表单引用
const formRef = ref(null)

// 表单模型
const model = reactive({
  userName: '',
  userGender: null,
  nickName: '',
  userPhone: '',
  userEmail: '',
  status: null
})

// 表单校验规则
const rules = {
  userName: [{ required: false, message: '请输入用户名' }],
  userGender: [{ required: false, message: '请选择性别' }],
  nickName: [{ required: false, message: '请输入昵称' }],
  userPhone: [{ required: false, message: '请输入手机号' }],
  userEmail: [{ required: false, message: '请输入邮箱' }],
  status: [{ required: false, message: '请选择状态' }]
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

// 将本地选项映射为 NSelect 可用格式
function translateOptions(options) {
  return options.map(opt => ({ label: opt.label, value: opt.value }))
}

// 重置表单
function reset() {
  Object.keys(model).forEach(key => {
    model[key] = key === 'userGender' || key === 'status' ? null : ''
  })
  formRef.value?.resetValidation()
}

// 执行搜索
function search() {
  formRef.value?.validate().then(() => {
    console.log('搜索参数：', { ...model })
    // 在这里调用接口或触发查询
  }).catch(() => {
    console.log('表单校验失败')
  })
}
const $t  = (value)=>value
</script>

<template>
  <NCard  size="small"  embedded class="mb-2">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="user-search">
        <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.user.userName')" path="userName" class="pr-24px">
              <NInput v-model:value="model.userName" :placeholder="$t('page.manage.user.form.userName')" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.user.userGender')"
              path="userGender"
              class="pr-24px"
            >
              <NSelect
                v-model:value="model.userGender"
                :placeholder="$t('page.manage.user.form.userGender')"
                :options="translateOptions(userGenderOptions)"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.user.nickName')" path="nickName" class="pr-24px">
              <NInput v-model:value="model.nickName" :placeholder="$t('page.manage.user.form.nickName')" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.user.userPhone')" path="userPhone" class="pr-24px">
              <NInput v-model:value="model.userPhone" :placeholder="$t('page.manage.user.form.userPhone')" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.user.userEmail')" path="userEmail" class="pr-24px">
              <NInput v-model:value="model.userEmail" :placeholder="$t('page.manage.user.form.userEmail')" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.user.userStatus')"
              path="userStatus"
              class="pr-24px"
            >
              <NSelect
                v-model:value="model.status"
                :placeholder="$t('page.manage.user.form.userStatus')"
                :options="translateOptions(enableStatusOptions)"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi span="24 m:12" class="pr-24px">
              <NSpace class="w-full" justify="end">
                <NButton @click="reset">
                  {{ $t('common.reset') }}
                </NButton>
                <NButton type="primary" ghost @click="search">
                  {{ $t('common.search') }}
                </NButton>
              </NSpace>
            </NFormItemGi>
          </NGrid>
        </NForm>
      </NCollapseItem>
    </NCollapse>
  </NCard>
</template>