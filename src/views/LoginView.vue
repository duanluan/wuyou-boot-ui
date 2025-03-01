<template>
  <el-row class="login-container">
    <el-form
        class="login-form"
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginFormRules"
    >
      <div class="form-logo-title">
        <i-mdi-alpha-z-circle class="form-logo"/>
        <Transition>
          <span class="form-title">无尤管理系统</span>
        </Transition>
      </div>

      <el-form-item prop="tenantId">
        <el-dropdown style="margin: 0 auto">
          <span class="el-dropdown-link">
            {{ selectedTenantName || '请选择租户' }}
            <i-ep-arrow-down class="el-icon--right"/>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="item in tenants" :key="item.id" :value="item.id" @click="loginForm.tenantId = item.id; selectedTenantName = item.name">{{ item.name }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-form-item>
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" placeholder="用户名" @keyup.enter="login(loginFormRef)"/>
      </el-form-item>
      <el-form-item prop="password">
        <el-input type="password" v-model="loginForm.password" placeholder="密码" @keyup.enter="login(loginFormRef)"/>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" style="width: 100%" @click="login(loginFormRef)">登录</el-button>
      </el-form-item>
    </el-form>
  </el-row>
</template>

<script setup lang="ts">
import {LoginForm} from "@/api/sys/user.ts";
import {useUserStore} from "@/store/user.ts";
import TenantApi from "@/api/sys/tenant.ts";

// 页面加载时
onMounted(() => {
  getTenants()
})

const tenants = ref([])
// 获取租户列表
const getTenants = async () => {
  tenants.value = await TenantApi.list()
  loginForm.tenantId = tenants.value[0].id
  selectedTenantName.value = tenants.value[0].name
}
const selectedTenantName = ref('');

// 登录表单 ref
const loginFormRef = ref<FormInstance>()
// 登录表单数据
const loginForm = reactive<LoginForm>({
  tenantId: 0,
  username: '',
  password: '',
  remember: false
})
// 登录表单校验规则
const loginFormRules = reactive<FormRules<LoginForm>>({
  tenantId: [{required: true, message: '请选择租户', trigger: 'blur'}],
  username: [{required: true, message: '请输入用户名', trigger: 'blur'}],
  password: [{required: true, message: '请输入密码', trigger: 'blur'}]
})
/**
 * 登录
 * @param formEl 表单实例
 */
const login = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((isValid, invalidFields) => {
    if (isValid) {
      useUserStore().login(loginForm);
    }
  })
}
</script>

<style scoped lang="less">
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #888;

  .login-form {
    width: 350px;
    padding: 10px 25px 0 25px;
    background: white;

    .form-logo-title {
      /* 侧边栏 Logo 标题 */
      height: @elHeaderHeight;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;

      .form-logo {
        font-size: 20px
      }

      .form-title {
        padding-left: 5px;
      }
    }

    .el-dropdown-link {
      cursor: pointer;
      color: var(--el-color-primary);
      display: flex;
      align-items: center;
    }
  }
}
</style>
