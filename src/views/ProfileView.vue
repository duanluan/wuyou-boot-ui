<template>
  <el-row :gutter="20">
    <el-col :span="8">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>个人信息</span>
          </div>
        </template>
        <el-row>
          <el-table :data="tableData" :show-header="false" style="width: 100%">
            <el-table-column prop="name" label="名称" width="120">
              <template #default="{row}">
                <div style="display: flex; align-items: center;">
                  <Iconify :icon="row.icon" :size="20" style="margin-right: 5px"/>
                  {{ row.name }}：
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="value" label="值">
              <template #default="{row}">
                <template v-if="row.prop === 'roleNames' || row.prop === 'postNames'">
                  <el-tag
                      v-for="value1 in row.value"
                      :key="value1"
                      :type="row.prop === 'roleNames' ? 'primary' : 'info'"
                      style="margin-right: 5px"
                  >
                    {{ value1 }}
                  </el-tag>
                </template>
                <template v-else>
                  {{ row.value }}
                </template>
              </template>
            </el-table-column>
          </el-table>
        </el-row>
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>修改资料</span>
          </div>
        </template>
        <el-form
            id="editForm"
            ref="editFormRef"
            :model="editForm"
            :rules="editFormRules"
            label-width="80px"
        >
          <el-form-item prop="id" label="ID" style="display: none">
            <el-input v-model="editForm.id"/>
          </el-form-item>
          <el-row :gutter="5">
            <el-col :span="24">
              <el-form-item prop="nickName" label="昵称">
                <el-input v-model="editForm.nickName"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template #footer>
          <el-button @click="editFormRef?.resetFields()">重置</el-button>
          <el-button type="primary" @click="confirmEdit(editFormRef)">确认</el-button>
        </template>
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>修改密码</span>
          </div>
        </template>
        <el-form
            id="editPwdForm"
            ref="editPwdFormRef"
            :model="editPwdForm"
            :rules="editPwdFormRules"
            label-width="80px"
        >
          <el-form-item prop="id" label="ID" style="display: none">
            <el-input v-model="editPwdForm.id"/>
          </el-form-item>
          <el-row :gutter="5">
            <el-col :span="24">
              <el-form-item prop="oldPassword" label="旧密码">
                <el-input type="password" v-model="editPwdForm.oldPassword"/>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="newPassword" label="新密码">
                <el-input type="password" v-model="editPwdForm.newPassword"/>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="confirmPassword" label="确认密码">
                <el-input type="password" v-model="editPwdForm.confirmPassword"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template #footer>
          <el-button @click="editPwdFormRef?.resetFields()">重置</el-button>
          <el-button type="primary" @click="confirmEditPwd(editPwdFormRef)">确认</el-button>
        </template>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import {useUserStore} from "@/store/user.ts";
import Iconify from "@/components/Iconify.vue";
import UserApi from "@/api/sys/user.ts";

const userStore = useUserStore()
const tableData = ref()

onMounted(() => {
  loadTableData()
})

function loadTableData() {
  // 从 store 访问的 ref 会自动解包
  const userInfo = userStore.info

  tableData.value = [
    {icon: 'mdi:account', prop: 'username', name: '用户名', value: userInfo.username},
    {icon: 'mdi:face-man-profile', prop: 'nickName', name: '昵称', value: userInfo.nickName},
    {icon: 'mdi:account-eye', prop: 'roleNames', name: '角色', value: userInfo.roleNames},
    {icon: 'mdi:family-tree', prop: 'deptName', name: '部门', value: userInfo.deptName},
    {icon: 'mdi:account-tag', prop: 'postNames', name: '岗位', value: userInfo.postNames},
    {icon: 'mdi:calendar-month', prop: 'createdTime', name: '创建时间', value: userInfo.createdTime}
  ]
}

// 编辑表单 ref
const editFormRef = ref<FormInstance>()
const userInfo = userStore.info
// 编辑表单数据
const editForm = reactive({
  id: userInfo.id,
  nickName: userInfo.nickName
})
// 编辑表单校验规则
const editFormRules = reactive<FormRules>({
  nickName: [{required: true, message: '请输入昵称', trigger: 'blur'}]
})
// 确认编辑
const confirmEdit = async (editFormEl: FormInstance | undefined) => {
  if (!editFormEl) return
  await editFormEl.validate((isValid, invalidFields) => {
    if (!isValid) return

    UserApi.updateProfile(editForm, {loadingOption: {target: '#editForm'}, showOkMsg: true}).then((response) => {
      if (response?.code !== 200) return

      // 更新用户信息
      Object.assign(userStore.info, editForm)
      loadTableData()
    })
  })
}

const editPwdFormRef = ref<FormInstance>()
const editPwdForm = reactive({
  id: userInfo.id,
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const editPwdFormRules = reactive<FormRules>({
  oldPassword: [{required: true, message: '请输入旧密码', trigger: 'blur'}],
  newPassword: [{required: true, message: '请输入新密码', trigger: 'blur'}],
  confirmPassword: [
    {required: true, message: '请输入确认密码', trigger: 'blur'},
    {
      validator: (rule, value, callback) => {
        if (value !== editPwdForm.newPassword) {
          callback(new Error('新密码和确认密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
})
const confirmEditPwd = async (editPwdFormEl: FormInstance | undefined) => {
  if (!editPwdFormEl) return
  await editPwdFormEl.validate((isValid, invalidFields) => {
    if (!isValid) return

    UserApi.updatePwd(editPwdForm, {loadingOption: {target: '#editPwdForm'}, showOkMsg: true}).then((response) => {
      if (response?.code !== 200) return

      // 重置表单
      editPwdFormEl.resetFields()
    })
  })
}
</script>

<style scoped>
:deep(.el-card__footer) {
  text-align: right;
}
</style>