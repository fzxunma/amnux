<script setup>
import { ref } from 'vue'
import { NCard, NInput, NButton } from 'naive-ui'
const model = ref({ phone: '', code: '', password: '', confirmPassword: '' })
</script>

<template>
  <div class="flex h-screen items-center justify-center bg-[#f0f0ff]">
    <div class="w-[360px] z-10">
      <n-card :bordered="false" class="rounded-[12px] bg-white shadow-lg" style="padding: 20px 24px">
        <header class="flex items-center justify-between mb-[18px]">
          <div class="flex items-center gap-[10px]">
            <div class="w-[36px] h-[36px] rounded-[10px]" style="background:linear-gradient(135deg,#7b7cff,#5b5cf6)" />
            <h1 class="text-[18px] font-semibold text-[#5b5cf6]">Soybean 管理系统</h1>
          </div>
          <div class="flex flex-col text-[12px] text-[#333] leading-none text-center">
            <span>A</span><span>文</span>
          </div>
        </header>

        <div class="flex flex-col gap-[14px]">
          <div class="text-[14px] font-medium text-[#5b5cf6]">重置密码</div>

          <n-input v-model:value="model.phone" placeholder="请输入手机号" class="!h-[36px] rounded-[6px]" />

          <n-input v-model:value="model.code" placeholder="请输入验证码" class="!h-[36px] rounded-[6px]" />

          <n-input v-model:value="model.password" type="password" show-password-on="click" placeholder="请输入新密码"
            class="!h-[36px] rounded-[6px]" />

          <n-input v-model:value="model.confirmPassword" type="password" show-password-on="click" placeholder="请再次输入新密码"
            class="!h-[36px] rounded-[6px]" />

          <n-button type="primary" block class="h-[40px] rounded-[20px]"
            style="background:#6c6ff5;border-color:#6c6ff5">
            确认
          </n-button>
          <RouterLink to="../home/Login" class="block w-full">
            <n-button block class="w-full h-[32px] px-0
           border border-[#dcdcdc] text-[#666]
           hover:border-[#1677ff] hover:text-[#1677ff]
           transition-colors">
              返回
            </n-button>
          </RouterLink>

        </div>
      </n-card>
    </div>
  </div>
</template>