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
      <el-table-column fixed prop="name" label="名称" width="180"/>
      <el-table-column prop="code" label="编码" width="180"/>
      <el-table-column prop="createdTime" label="创建时间" width="220"/>
      <el-table-column prop="description" label="描述"/>
      <el-table-column fixed="right" label="操作" min-width="120">
        <!-- 解构赋值当前行 -->
        <template #default="{row}">
          <el-button link type="primary" size="small" @click="edit(row)">
            <i-ep-edit/>
            修改
          </el-button>
          <el-button link type="primary" size="small" @click="remove(row)">
            <i-ep-delete/>
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
        @size-change="changeSize"
        @current-change="changeCurrent"
        style="justify-content: right"
    />

    <el-dialog v-model="editDialogVisible" @close="editFormRef.resetFields()" :title="isSave ? '新增' : '修改'" width="650">
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
            <el-form-item prop="name" label="名称">
              <el-input v-model="editForm.name"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="code" label="编码">
              <el-input v-model="editForm.code"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="description" label="描述">
              <el-input v-model="editForm.description" type="textarea"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmEdit(editFormRef)">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import RoleApi, {RoleEditForm} from "@/api/sys/role.ts"
import {onDebounceMounted} from "@/utils/debounceLifecycle.ts";

const tableRef = ref()
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
    let ids: number[]
    if (row) {
      ids = [row.id]
    } else {
      ids = tableRef.value.getSelectionRows().map((item: any) => item.id)
    }
    RoleApi.remove(ids, {loadingOption: {target: '.el-main'}, showOkMsg: true}).then(() => {
      search()
    })
  })
}

// 修改对话框是否显示
const editDialogVisible = ref(false)
// 编辑表单 ref
const editFormRef = ref<FormInstance>()
// 编辑表单数据
const editForm = reactive<RoleEditForm>({
  id: '',
  name: '',
  code: '',
  description: ''
})
// 编辑表单校验规则
const editFormRules = reactive<FormRules<RoleEditForm>>({
  name: [{required: true, message: '请输入名称', trigger: 'blur'}],
  code: [{required: true, message: '请输入编码', trigger: 'blur'}],
})
const isSave = ref(false)

const edit = (row: any) => {
  editDialogVisible.value = true
  // 第一次表单赋值要放在表单显示后和下一个 DOM 更新循环之后，否则后续执行表单初始化一直是第一次赋值的值：https://segmentfault.com/a/1190000043401023#item-4
  nextTick(() => {
    Object.assign(editForm, row)
  })
  isSave.value = false
}

const add = () => {
  editDialogVisible.value = true
  isSave.value = true
}

const confirmEdit = async (editFormEl: FormInstance | undefined) => {
  if (!editFormEl) return
  await editFormEl.validate((isValid, invalidFields) => {
    if (isValid) {
      const afterEdit = () => {
        editFormEl.resetFields()
        // 关闭对话框
        editDialogVisible.value = false
        // 刷新表格
        search()
      }
      if (isSave.value) {
        RoleApi.save(editForm, {loadingOption: {target: '.el-dialog'}, showOkMsg: true}).then(afterEdit)
      } else {
        RoleApi.update(editForm, {loadingOption: {target: '.el-dialog'}, showOkMsg: true}).then(afterEdit)
      }
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