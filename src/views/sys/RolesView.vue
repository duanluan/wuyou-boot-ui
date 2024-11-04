<template>
  <div>
    <el-form :inline="true" :model="searchForm">
      <el-form-item label="名称">
        <el-input v-model="searchForm.name"/>
      </el-form-item>
      <el-form-item label="编码">
        <el-input v-model="searchForm.code"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">搜索</el-button>
        <el-button @click="reset">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" style="width: 100%; margin-bottom: 15px" header-cell-class-name="table-th">
      <el-table-column fixed prop="name" label="名称" width="180"/>
      <el-table-column prop="code" label="编码" width="180"/>
      <el-table-column prop="createdTime" label="创建时间" width="220"/>
      <el-table-column prop="description" label="描述"/>
      <el-table-column fixed="right" label="操作" min-width="120">
        <!-- 解构赋值当前行 -->
        <template #default="{row}">
          <el-button link type="primary" size="small" @click="update(row)">修改</el-button>
          <el-button link type="primary" size="small" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 50, 100, 200,500]"
        :total="pageTotal"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="changeSize"
        @current-change="changeCurrent"
        style="justify-content: right"
    />

    <el-dialog v-model="updateDialogVisible" title="修改" width="650">
      <el-form
          ref="updateFormRef"
          :model="updateForm"
          :rules="updateFormRules"
          label-width="80px"
      >
        <el-form-item prop="id" label="ID" style="display: none">
          <el-input v-model="updateForm.id"/>
        </el-form-item>
        <el-row :gutter="5">
          <el-col :span="12">
            <el-form-item prop="name" label="名称">
              <el-input v-model="updateForm.name"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="code" label="编码">
              <el-input v-model="updateForm.code"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="description" label="描述">
              <el-input v-model="updateForm.description" type="textarea"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="updateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUpdate(updateFormRef)">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import RoleApi, {RoleUpdateForm} from "@/api/sys/role.ts"
import {onDebounceMounted} from "@/utils/debounceLifecycle.ts";
import {FormInstance} from "element-plus";

const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const pageTotal = ref(0)

onDebounceMounted(() => {
  search();
})

interface SearchForm {
  // 名称
  name: string
  // 编码
  code: string
}

const searchForm = ref<SearchForm>({})

const search = async () => {
  const response = await RoleApi.page({current: currentPage.value, size: pageSize.value, ...searchForm.value}, {loadingOption: {target: '.el-table'}})
  pageTotal.value = response.total
  tableData.value = response.data
}

const reset = () => {
  searchForm.value = {}
}

const changeSize = (val: number) => {
  search()
}
const changeCurrent = (val: number) => {
  search()
}

const remove = (row: any) => {
  ElMessageBox.confirm('是否确认删除', '提示', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(() => {
    RoleApi.remove(row.id, {loadingOption: {target: '.el-main'}}).then(() => {
      search()
    })
  })
}

// 修改对话框是否显示
const updateDialogVisible = ref(false)
// 修改表单 ref
const updateFormRef = ref<FormInstance>()
// 修改表单数据
const updateForm = reactive<RoleUpdateForm>({
  id: '',
  name: '',
  code: '',
  description: ''
})
// 修改表单校验规则
const updateFormRules = reactive<FormRules<RoleUpdateForm>>({
  name: [{required: true, message: '请输入名称', trigger: 'blur'}],
  code: [{required: true, message: '请输入编码', trigger: 'blur'}],
})

const update = (row: any) => {
  updateDialogVisible.value = true
  Object.assign(updateForm, row)
}

const confirmUpdate = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((isValid, invalidFields) => {
    if (isValid) {
      RoleApi.update(updateForm, {loadingOption: {target: '.el-dialog'}}).then(() => {
        // 关闭对话框
        updateDialogVisible.value = false
        // 刷新表格
        search()
        // 清空表单
        formEl.resetFields()
      })
    }
  })
}
</script>

<style scoped>
:deep(.table-th) {
  /* 表头背景色：https://github.com/element-plus/element-plus/issues/6540 */
  background: #f8f8f9 !important
}
</style>