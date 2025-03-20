<template>
  <div>
    <el-form :inline="true" :model="searchForm">
      <el-form-item label="名称">
        <el-input v-model="searchForm.name"/>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态">
          <el-option v-for="item in CommonStatus.getOptions()" :label="item.label" :value="item.value"/>
        </el-select>
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
    <el-table ref="tableRef" :data="tableData" row-key="id" default-expand-all style="width: 100%; margin-bottom: 15px" header-cell-class-name="table-th">
      <el-table-column type="selection" width="55"/>
      <el-table-column fixed prop="name" label="名称" width="180"/>
      <el-table-column prop="sort" label="顺序" align="center"width="100"/>
      <el-table-column label="启用状态" align="center" width="100">
        <template #default="{row}">
          <el-switch :active-value="CommonStatus.ENABLE.value" :inactive-value="CommonStatus.DISABLE.value" v-model="row.status" @change="changeStatus(row)"/>
        </template>
      </el-table-column>
      <el-table-column prop="createdTime" label="创建时间" width="220"/>
      <el-table-column fixed="right" label="操作" min-width="120">
        <template #default="{row}">
          <el-button link type="primary" size="small" @click="add(row)">
            <i-ep-plus style="margin-right: 2px"/>
            新增
          </el-button>
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
          <el-col :span="24">
            <el-form-item prop="parentId" label="上级">
              <el-tree-select
                  v-model="editForm.parentId"
                  :data="deptTreeSelectData"
                  :render-after-expand="false"
                  :props="{label: 'name', value: 'id'}"
                  check-strictly
                  style="width: 100% !important"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="name" label="名称">
              <el-input v-model="editForm.name"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="sort" label="顺序">
              <el-input-number v-model="editForm.sort" controls-position="right"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="status" label="启用状态">
              <el-switch :active-value="CommonStatus.ENABLE.value" :inactive-value="CommonStatus.DISABLE.value" v-model="editForm.status"/>
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
import DeptApi, {DeptSearchForm, DeptEditForm} from "@/api/sys/dept.ts"
import {FormInstance} from "element-plus"
import {CommonStatus} from "@/enums/common.ts"

const tableRef = ref()
const tableData = ref([])
let deptTreeSelectData = ref([])

// 页面加载时
onMounted(async () => {
  await search()
  getDeptTreeSelectData(tableData.value)
})

const searchForm = ref<DeptSearchForm>({})

// 搜索
const search = async () => {
  const query = searchForm.value
  // 查询条件如果不是只查了一个状态时，不构建树
  if (query && Object.keys(query).length > 0 && !query.status && !Object.entries(query).some(([key, value]) => key !== 'status' && value)) {
    query.notBuildTree = true
  }
  tableData.value = await DeptApi.tree(query, {loadingOption: {target: '.el-table'}, enableDebounce: false})
}

/**
 * 获取部门树下拉数据，如果有数据则直接使用，否则调用接口获取
 * @param data 部门树数据
 */
const getDeptTreeSelectData = async (data) => {
  if (data) {
    // 深拷贝 tableData 以避免修改引用
    tableData.value = JSON.parse(JSON.stringify(data));
    deptTreeSelectData.value = data
  } else {
    deptTreeSelectData.value = await DeptApi.tree({}, {showLoading: false, enableDebounce: false})
  }
  // 添加一个空选项，值为 0
  deptTreeSelectData.value.unshift({id: 0, name: '根部门'})
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
    DeptApi.remove(ids, {loadingOption: {target: '.el-main'}, showOkMsg: true}).then(() => {
      search()
      getDeptTreeSelectData()
    })
  })
}

// 修改对话框是否显示
const editDialogVisible = ref(false)
// 编辑表单 ref
const editFormRef = ref<FormInstance>()
// 编辑表单数据
const editForm = reactive<DeptEditForm>({
  id: '',
  name: '',
  sort: 1,
  status: CommonStatus.ENABLE.value,
})
// 编辑表单校验规则
const editFormRules = reactive<FormRules<DeptEditForm>>({
  parentId: [{required: true, message: '请选择上级', trigger: 'blur'}],
  name: [{required: true, message: '请输入名称', trigger: 'blur'}],
  sort: [{required: true, message: '请输入顺序', trigger: 'blur'}],
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
const add = (row) => {
  editDialogVisible.value = true
  isAdd.value = true
  if (row) {
    editForm.parentId = row.id
  }
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
      getDeptTreeSelectData()
    }
    if (isAdd.value) {
      DeptApi.save(editForm, {loadingOption: {target: '.el-dialog'}, showOkMsg: true}).then(response => afterEdit(response))
    } else {
      DeptApi.update(editForm, {loadingOption: {target: '.el-dialog'}, showOkMsg: true}).then(response => afterEdit(response))
    }
  })
}

// 修改状态
const changeStatus = async (row: any) => {
  if (!await DeptApi.updateStatus(row.id, row.status, {loadingOption: {target: '.el-table'}, showOkMsg: true})) {
    row.status = row.status === 1 ? 0 : 1
  }
}
</script>

<style scoped>

</style>