<template>
  <div>
    <el-form :inline="true" :model="searchForm">
      <el-form-item label="昵称">
        <el-input v-model="searchForm.nickName"/>
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="searchForm.username"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">搜索</el-button>
        <el-button @click="searchForm = {}">重置</el-button>
      </el-form-item>
    </el-form>
    <div style="margin-bottom: 8px">
      <el-button type="primary" size="small" @click="add()">
        <i-ep-plus class="el-icon--left"/>
        新增
      </el-button>
      <el-button type="danger" size="small" @click="remove()">
        <i-ep-delete class="el-icon--left"/>
        删除
      </el-button>
    </div>
    <el-table ref="tableRef" :data="tableData" style="width: 100%; margin-bottom: 15px" header-cell-class-name="table-th">
      <el-table-column type="selection" width="55"/>
      <el-table-column fixed prop="username" label="用户名" width="180"/>
      <el-table-column prop="nickName" label="昵称" width="180"/>
      <el-table-column label="角色">
        <template #default="{row}">
          <el-tag v-for="roleName in row.roleNames" :key="roleName" type="primary" style="margin-right: 5px">{{ roleName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="部门">
        <template #default="{row}">
          <template v-for="deptName in row.deptNames" :key="deptName" type="info" style="margin-right: 5px">{{ deptName }}</template>
        </template>
      </el-table-column>
      <el-table-column label="岗位">
        <template #default="{row}">
          <el-tag v-for="postName in row.postNames" :key="postName" type="info" style="margin-right: 5px">{{ postName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="租户" v-if="useUserStore().info.isShowTenant">
        <template #default="{row}">
          <template v-for="tenantName in row.tenantNames" :key="tenantName" type="info" style="margin-right: 5px">{{ tenantName }}</template>
        </template>
      </el-table-column>
      <el-table-column prop="createdTime" label="创建时间" width="220"/>
      <el-table-column fixed="right" label="操作" min-width="120">
        <template #default="{row}">
          <el-button link type="primary" size="small" @click="edit(row)">
            <i-ep-edit style="margin-right: 2px"/>
            修改
          </el-button>
          <el-button link type="primary" size="small" @click="remove(row)">
            <i-ep-delete style="margin-right: 2px"/>
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 50, 100, 200,500]"
        :total="pageTotal"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="search()"
        @current-change="search()"
        style="justify-content: right"
    />

    <el-dialog v-model="editDialogVisible" @close="editFormRef?.resetFields()" :title="isAdd ? '新增' : '修改'" draggable width="600">
      <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editFormRules"
          label-width="80px"
      >
        <el-form-item prop="id" label="ID" style="display: none">
          <el-input v-model="editForm.id"/>
        </el-form-item>
        <el-row :gutter="5">
          <el-col :span="12">
            <el-form-item prop="username" label="用户名">
              <el-input v-model="editForm.username" :disabled="!isAdd"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="nickName" label="昵称">
              <el-input v-model="editForm.nickName"/>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="isAdd">
            <el-form-item prop="password" label="密码">
              <el-input v-model="editForm.password" type="password"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="roleIds" label="角色">
              <el-select v-model="editForm.roleIds" multiple placeholder="请选择角色" @change="changeRole">
                <el-option v-for="item in roles" :key="item.id ?? ''" :label="item.name" :value="item.id ?? ''"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="deptIds" label="部门">
              <!--
              props：节点属性值
              check-strictly：在显示复选框的情况下，是否严格的遵循父子不互相关联的做法
              -->
              <el-tree-select
                  v-model="editForm.deptIds"
                  :data="deptTreeSelectData"
                  :props="{label: 'name', value: 'id'}"
                  :multiple="true"
                  check-strictly
                  style="width: 100% !important"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="postIds" label="岗位">
              <el-select v-model="editForm.postIds" multiple placeholder="请选择岗位">
                <el-option v-for="item in posts" :key="item.id" :label="item.name" :value="item.id"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="useUserStore().info.isShowTenant">
            <el-form-item prop="tenantIds" label="租户">
              <el-select v-model="editForm.tenantIds" multiple placeholder="请选择租户">
                <el-option v-for="item in tenants" :key="item.id" :label="item.name" :value="item.id"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit(editFormRef)">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import UserApi, {UserEditForm} from "@/api/sys/user.ts";
import RoleApi, {RoleEditForm} from "@/api/sys/role.ts";
import PostApi, {PostEditForm} from "@/api/sys/post.ts";
import DeptApi from "@/api/sys/dept.ts";
import {useUserStore} from "@/store/user.ts";
import TenantApi, {TenantEditForm} from "@/api/sys/tenant.ts";

const tableRef = ref()
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const pageTotal = ref(0)
let deptTreeSelectData = ref([])

// 页面加载时
onMounted(async () => {
  search();
  getRoles();
  getPosts();
  deptTreeSelectData.value = await DeptApi.tree({}, {showLoading: false, enableDebounce: false})
  getTenants();
})

interface SearchForm {
  nickName: string // 昵称
  username: string // 用户名
}

const searchForm = ref<Partial<SearchForm>>({})

// 搜索
const search = async () => {
  const response = await UserApi.page({current: currentPage.value, size: pageSize.value, ...searchForm.value}, {loadingOption: {target: '.el-table'}})
  pageTotal.value = response.total
  tableData.value = response.data
}

// 删除
const remove = (row: any) => {
  ElMessageBox.confirm('是否确认删除', '提示', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(() => {
    let ids: string[]
    if (row) {
      ids = [row.id]
    } else {
      ids = tableRef.value.getSelectionRows().map((item: any) => item.id)
    }
    UserApi.remove(ids, {loadingOption: {target: '.el-main'}, showOkMsg: true}).then(() => {
      search()
    })
  })
}

// 修改对话框是否显示
const editDialogVisible = ref(false)
// 编辑表单 ref
const editFormRef = ref<FormInstance>()
// 编辑表单数据
const editForm = reactive<UserEditForm>({
  id: '',
  nickName: '',
  username: '',
  roleIds: [],
})
// 编辑表单校验规则
const editFormRules = reactive<FormRules<UserEditForm>>({
  username: [{required: true, message: '请输入用户名', trigger: 'blur'}],
  nickName: [{required: true, message: '请输入昵称', trigger: 'blur'}],
  password: [{required: true, message: '请输入密码', trigger: 'blur'}],
  roleIds: [{required: true, message: '请选择角色', trigger: 'blur'}],
  deptIds: [{
    validator: (rule, value, callback) => {
      if (Array.isArray(value) && value.length > 1) {
        callback(new Error('只能选择一个部门'));
      } else {
        callback();
      }
    },
    trigger: 'change'
  }]
})
// 是否为新增，用于区分新增和编辑的对话框标题、接口调用
const isAdd = ref(false)

// 编辑
const edit = (row: any) => {
  editDialogVisible.value = true
  // 第一次表单赋值要放在表单显示后和下一个 DOM 更新循环之后，否则后续执行表单初始化一直是第一次赋值的值：https://segmentfault.com/a/1190000043401023#item-4
  nextTick(() => {
    Object.assign(editForm, row)
  })
  isAdd.value = false
}

// 新增
const add = () => {
  editDialogVisible.value = true
  isAdd.value = true
}

// 确认编辑
const confirmEdit = async (editFormEl: FormInstance | undefined) => {
  if (!editFormEl) return
  await editFormEl.validate((isValid, invalidFields) => {
    if (!isValid) return

    const afterEdit = (response) => {
      if (response?.code !== 200) return

      // 关闭对话框
      editDialogVisible.value = false
      // 重置表单
      editFormEl.resetFields()
      // 刷新表格
      search()
    }
    if (isAdd.value) {
      UserApi.save(editForm, {loadingOption: {target: '.el-dialog'}, showOkMsg: true}).then(response => afterEdit(response))
    } else {
      UserApi.update(editForm, {loadingOption: {target: '.el-dialog'}, showOkMsg: true}).then(response => afterEdit(response))
    }
  })
}

// 角色列表
const roles = ref<RoleEditForm[]>([])
// 获取角色列表
const getRoles = async () => {
  roles.value = await RoleApi.list()
}
// 岗位列表
const posts = ref<PostEditForm[]>([])
// 获取岗位列表
const getPosts = async () => {
  posts.value = await PostApi.list()
}
// 租户列表
const tenants = ref<TenantEditForm[]>([])
// 获取租户列表
const getTenants = async () => {
  tenants.value = await TenantApi.list()
}

const changeRole = (val) => {
  // 仅选择一个超级管理员时隐藏租户，清空租户 ID
  if (val.length === 1 && val[0] === '1') {
    editForm.tenantIds = []
  }
}
</script>

<style scoped>

</style>