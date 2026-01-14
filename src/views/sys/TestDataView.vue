<template>
  <div>
    <el-alert title="数据权限测试说明" type="info" show-icon style="margin-bottom: 15px">
      <template #default>
        <div>1. 请用不同角色的用户登录（如：仅本人权限、本部门权限、全部权限）。</div>
        <div>2. 观察下方表格，不同角色看到的数据行数应不同。</div>
        <div>3. 列表已启用 @DataScope 过滤。</div>
      </template>
    </el-alert>

    <el-form :inline="true" :model="searchForm">
      <el-form-item label="值">
        <el-input v-model="searchForm.value"/>
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
      <el-table-column prop="id" label="ID" width="180"/>
      <el-table-column prop="value" label="值"/>

      <el-table-column prop="deptName" label="归属部门" width="180" align="center">
        <template #default="{row}">
          <el-tag type="info" v-if="row.deptName">{{ row.deptName }}</el-tag>
          <span v-else class="text-gray-400">无</span>
        </template>
      </el-table-column>

      <el-table-column prop="creatorName" label="创建人" width="150" align="center">
        <template #default="{row}">
          <el-tag type="warning" v-if="row.creatorName">{{ row.creatorName }}</el-tag>
          <span v-else class="text-gray-400">系统</span>
        </template>
      </el-table-column>

      <el-table-column prop="createdTime" label="创建时间" width="180"/>
      <el-table-column fixed="right" label="操作" width="150">
        <template #default="{row}">
          <el-button link type="primary" size="small" @click="edit(row)">修改</el-button>
          <el-button link type="danger" size="small" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="pageTotal"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="search()"
        @current-change="search()"
        style="justify-content: right"
    />

    <el-dialog v-model="editDialogVisible" :title="isAdd ? '新增' : '修改'" width="500px">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
        <el-form-item prop="value" label="值">
          <el-input v-model="editForm.value"/>
        </el-form-item>
        <el-form-item prop="deptId" label="归属部门" label-width="80px">
          <el-tree-select
              v-model="editForm.deptId"
              :data="deptTreeSelectData"
              :props="{label: 'name', value: 'id', children: 'children'}"
              check-strictly
              placeholder="请选择归属部门"
              style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit(editFormRef)">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, nextTick } from 'vue'
import { ElMessageBox, FormInstance, FormRules } from 'element-plus'
import TestDataApi, { TestDataEditForm } from "@/api/sys/testData.ts"
import DeptApi from "@/api/sys/dept.ts"

const tableRef = ref()
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const pageTotal = ref(0)
const searchForm = ref<{value?: string}>({})
const deptTreeSelectData = ref([])


const search = async () => {
  const response = await TestDataApi.page({
    current: currentPage.value,
    size: pageSize.value,
    ...searchForm.value
  }, {enableDebounce: false})
  pageTotal.value = response.total
  tableData.value = response.data
}

onMounted(async () => {
  search()
  // 加载部门树（不显示 loading 防止闪烁）
  deptTreeSelectData.value = await DeptApi.tree({}, {showLoading: false, enableDebounce: false})
})

// 删除逻辑
const remove = (row: any) => {
  ElMessageBox.confirm('是否确认删除?', '提示', { type: 'warning' }).then(() => {
    let ids: string[] = row ? [row.id] : tableRef.value.getSelectionRows().map((item: any) => item.id)
    if(ids.length === 0) return;
    TestDataApi.remove(ids, {showOkMsg: true}).then(() => search())
  })
}

// 编辑逻辑
const editDialogVisible = ref(false)
const isAdd = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive<TestDataEditForm>({ id: null, value: '', deptId: null })
const editFormRules = reactive<FormRules>({
  value: [{ required: true, message: '必填', trigger: 'blur' }]
})

const add = () => {
  isAdd.value = true
  editDialogVisible.value = true
  nextTick(() => {
    editForm.id = null
    editForm.value = ''
    editForm.deptId = null
  })
}

const edit = (row: any) => {
  isAdd.value = false
  editDialogVisible.value = true
  nextTick(() => Object.assign(editForm, row))
}

const confirmEdit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      const req = isAdd.value ? TestDataApi.save(editForm) : TestDataApi.update(editForm)
      req.then((res) => {
        if(res?.code === 200) {
          editDialogVisible.value = false
          search()
        }
      })
    }
  })
}
</script>
