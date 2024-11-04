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

// 登录表单 ref
const loginFormRef = ref<FormInstance>()
// 登录表单数据
const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
  remember: false
})
// 登录表单校验规则
const loginFormRules = reactive<FormRules<LoginForm>>({
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

  .login-form {
    width: 350px;
    padding: 10px 25px 0 25px;
    background: white;
  }
}
</style>
