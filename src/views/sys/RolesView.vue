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
      <el-table-column fixed prop="name" label="名称" width="180"/>
      <el-table-column prop="code" label="编码" width="180"/>
      <el-table-column prop="description" label="描述"/>
      <el-table-column prop="sort" label="顺序" width="100"/>
      <el-table-column label="启用状态" width="100">
        <template #default="scope">
          <el-switch :active-value="CommonStatus.ENABLE.value" :inactive-value="CommonStatus.DISABLE.value" v-model="scope.row.status" @change="changeStatus(scope.row)" :disabled="scope.row.code === RoleCode.SUPER_ADMIN"/>
        </template>
      </el-table-column>
      <el-table-column prop="createdTime" label="创建时间" width="220"/>
      <el-table-column fixed="right" label="操作" min-width="120">
        <!-- 解构赋值当前行 -->
        <template #default="{row}">
          <el-button link type="primary" size="small" @click="edit(row)">
            <i-ep-edit style="margin-right: 2px"/>
            修改
          </el-button>
          <el-button link type="primary" size="small" @click="remove(row)" v-if="row.code !==  RoleCode.SUPER_ADMIN">
            <i-ep-delete style="margin-right: 2px"/>
            删除
          </el-button>
          <el-button link type="primary" size="small" @click="configMenu(row)" v-if="row.code !==  RoleCode.SUPER_ADMIN">
            <i-mdi-file-tree-outline style="margin-right: 2px"/>
            菜单权限
          </el-button>
          <el-button link type="primary" size="small" @click="configDataScope(row)" v-if="row.code !==  RoleCode.SUPER_ADMIN">
            <i-mdi-database-settings style="margin-right: 2px"/>
            数据权限
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

    <el-dialog v-model="editDialogVisible" @close="editFormRef.resetFields()" :title="isAdd ? '新增' : '修改'" draggable width="600">
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
            <el-form-item prop="status" label="启用状态">
              <el-switch :active-value="CommonStatus.ENABLE.value" :inactive-value="CommonStatus.DISABLE.value" v-model="editForm.status" :disabled="editForm.code === RoleCode.SUPER_ADMIN"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="code" label="编码">
              <el-input v-model="editForm.code" :disabled="editForm.code === RoleCode.SUPER_ADMIN"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="sort" label="顺序">
              <el-input-number v-model="editForm.sort" controls-position="right"/>
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

    <el-dialog v-model="configMenuDialogVisible" title="菜单权限" draggable width="500">
      <el-form
          ref="configMenuFormRef"
          :model="configMenuForm"
          label-width="80px"
      >
        <el-form-item prop="id" label="ID" style="display: none">
          <el-input v-model="configMenuForm.id"/>
        </el-form-item>
        <el-row :gutter="5">
          <el-col :span="24">
            <el-form-item prop="name" label="名称">
              <el-input v-model="configMenuForm.name" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="code" label="编码">
              <el-input v-model="configMenuForm.code" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单">
              <el-tree
                  ref="menuTreeRef"
                  :props="{label: 'name', children: 'children'}"
                  :data="menuTreeData"
                  node-key="id"
                  :default-checked-keys="getTreeCheckedKeys(menuTreeData, item => item.path === dashboardPath)"
                  :default-expanded-keys="menuTreeData.map(item => item.id)"
                  show-checkbox
                  check-strictly
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="configMenuDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmConfigMenu(configMenuFormRef,menuTreeRef)">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="configDataScopeDialogVisible" title="数据权限" draggable width="500">
      <el-form
          ref="configDataScopeFormRef"
          :model="configDataScopeForm"
          :rules="configDataScopeFormRules"
          label-width="80px"
      >
        <el-form-item prop="id" label="ID" style="display: none">
          <el-input v-model="configDataScopeForm.id"/>
        </el-form-item>
        <el-row :gutter="5">
          <el-col :span="24">
            <el-form-item prop="name" label="名称">
              <el-input v-model="configDataScopeForm.name" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="code" label="编码">
              <el-input v-model="configDataScopeForm.code" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="queryDataScope" label="查询">
              <el-col :span="24">
                <el-select v-model="configDataScopeForm.queryDataScope" placeholder="请选择" clearable>
                  <el-option v-for="item in DataScopeType.getOptions()" :label="item.label" :value="item.value"/>
                </el-select>
              </el-col>
              <el-col :span="24" v-if="configDataScopeForm.queryDataScope == 2" style="margin-top: 10px">
                <el-tree
                    ref="queryDataScopeDeptTreeRef"
                    :props="{label: 'name', children: 'children'}"
                    :data="queryDataScopeDeptTreeData"
                    node-key="id"
                    :default-checked-keys="getTreeCheckedKeys(queryDataScopeDeptTreeData)"
                    :default-expanded-keys="queryDataScopeDeptTreeData.map(item => item.id)"
                    show-checkbox
                    check-strictly
                />
              </el-col>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="updateDataScope" label="增删改">
              <el-col :span="24">
                <el-select v-model="configDataScopeForm.updateDataScope" placeholder="请选择" clearable>
                  <el-option v-for="item in DataScopeType.getOptions()" :label="item.label" :value="item.value"/>
                </el-select>
              </el-col>
              <el-col :span="24" v-if="configDataScopeForm.updateDataScope == 2" style="margin-top: 10px">
                <el-tree
                    ref="updateDataScopeDeptTreeRef"
                    :props="{label: 'name', children: 'children'}"
                    :data="updateDataScopeDeptTreeData"
                    node-key="id"
                    :default-checked-keys="getTreeCheckedKeys(updateDataScopeDeptTreeData)"
                    :default-expanded-keys="updateDataScopeDeptTreeData.map(item => item.id)"
                    show-checkbox
                    check-strictly
                />
              </el-col>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="configDataScopeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmConfigDataScope(configDataScopeFormRef, queryDataScopeDeptTreeRef, updateDataScopeDeptTreeRef)">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import RoleApi, {RoleEditForm} from "@/api/sys/role.ts"
import {onDebounceMounted} from "@/utils/debounceLifecycle.ts";
import {DataScopeActionType, DataScopeType, RoleCode} from "@/enums/role.ts";
import MenuApi, {MenuTreeItem} from "@/api/sys/menu.ts";
import {FormInstance, TreeInstance} from "element-plus";
import {dashboardPath} from "@/router";
import {CommonStatus} from "@/enums/common.ts";
import DeptApi from "@/api/sys/dept.ts";

const tableRef = ref()
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const pageTotal = ref(0)

// 页面加载时
onDebounceMounted(() => {
  search();
})

interface SearchForm {
  name: string // 名称
  code: string // 编码
}

const searchForm = ref<SearchForm>({})

// 搜索
const search = async () => {
  const response = await RoleApi.page({current: currentPage.value, size: pageSize.value, ...searchForm.value}, {loadingOption: {target: '.el-table'}})
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
  sort: 1,
  status: CommonStatus.ENABLE.value,
  description: ''
})
// 编辑表单校验规则
const editFormRules = reactive<FormRules<RoleEditForm>>({
  name: [{required: true, message: '请输入名称', trigger: 'blur'}],
  code: [{required: true, message: '请输入编码', trigger: 'blur'}],
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
      RoleApi.save(editForm, {loadingOption: {target: '.el-dialog'}, showOkMsg: true}).then(response => afterEdit(response))
    } else {
      RoleApi.update(editForm, {loadingOption: {target: '.el-dialog'}, showOkMsg: true}).then(response => afterEdit(response))
    }
  })
}

// 修改状态
const changeStatus = async (row: any) => {
  if (!await RoleApi.updateStatus(row.id, row.status, {loadingOption: {target: '.el-table'}, showOkMsg: true})) {
    row.status = row.status === 1 ? 0 : 1
  }
}

const configMenuDialogVisible = ref(false)
const configMenuFormRef = ref<FormInstance>()
const configMenuForm = reactive<RoleEditForm>({})
const menuTreeRef = ref<TreeInstance>()
const menuTreeData = ref<MenuTreeItem>([])

// 配置菜单权限
const configMenu = async (row: any) => {
  configMenuDialogVisible.value = true
  Object.assign(configMenuForm, row)
  // 获取菜单树
  menuTreeData.value = await MenuApi.tree({roleCodes: [row.code], isAllAndChecked: true});
  // 禁用勾选仪表盘
  menuTreeData.value.forEach(item => {
    if (item.path === dashboardPath) {
      item.disabled = true
    }
  })
}

// 获取树的选中项 ID 数组
const getTreeCheckedKeys = (treeData: [], checkedFn?: (item: any) => boolean) => {
  if (!treeData) return []
  const checkedKeys: string[] = []
  const loop = (data: any[]) => {
    for (const item of data) {
      // 判断是否选中的回调函数
      if (checkedFn && checkedFn(item)) {
        checkedKeys.push(item.id)
      }
      // 如果当前项被选中，则将其 ID 添加到 checkedKeys
      if (item.checked) {
        checkedKeys.push(item.id)
      }
      // 如果有子项，继续递归处理
      if (item.children && item.children.length > 0) {
        loop(item.children)
      }
    }
  }
  loop(treeData)
  return checkedKeys
}

// 确认配置菜单权限
const confirmConfigMenu = async (configMenuFormEl, menuTreeEl: TreeInstance) => {
  let checkedKeys = menuTreeEl.getCheckedKeys();
  if (await RoleApi.updateMenus(configMenuForm.id, checkedKeys, {loadingOption: {target: '.el-dialog'}, showOkMsg: true})) {
    configMenuDialogVisible.value = false
    configMenuFormEl.resetFields()
    search()
  }
}

const configDataScopeDialogVisible = ref(false)
const configDataScopeFormRef = ref<FormInstance>()
const configDataScopeForm = reactive<RoleEditForm>({})
const configDataScopeFormRules = reactive<FormRules<RoleEditForm>>({
  queryDataScope: [{required: true, message: '请选择查询数据权限', trigger: 'blur'}],
  updateDataScope: [{required: true, message: '请选择增删改数据权限', trigger: 'blur'}],
})

const queryDataScopeDeptTreeRef = ref<TreeInstance>()
const queryDataScopeDeptTreeData = ref([])
const updateDataScopeDeptTreeRef = ref<TreeInstance>()
const updateDataScopeDeptTreeData = ref([])

// 配置数据权限
const configDataScope = async (row: any) => {
  configDataScopeDialogVisible.value = true
  Object.assign(configDataScopeForm, row)
  // 获取部门树
  const query = {roleCodes: [row.code], isAllAndChecked: true}
  queryDataScopeDeptTreeData.value = await DeptApi.tree({...query, dataScopeActionType: DataScopeActionType.QUERY});
  updateDataScopeDeptTreeData.value = await DeptApi.tree({...query, dataScopeActionType: DataScopeActionType.UPDATE});
}

// 确认配置数据权限
const confirmConfigDataScope = async (configDataScopeFormEl, queryDataScopeDeptTreeEl: TreeInstance, updateDataScopeDeptTreeEl: TreeInstance) => {
  if (!configDataScopeFormEl) return
  await configDataScopeFormEl.validate(async (isValid, invalidFields) => {
    if (!isValid) return

    if (await RoleApi.updateDataScope(
        configDataScopeForm.id,
        configDataScopeForm.queryDataScope, configDataScopeForm.updateDataScope,
        queryDataScopeDeptTreeEl?.getCheckedKeys(), updateDataScopeDeptTreeEl?.getCheckedKeys(),
        {loadingOption: {target: '.el-dialog'}, showOkMsg: true}
    )) {
      configDataScopeDialogVisible.value = false
      configDataScopeFormEl.resetFields()
      search()
    }
  })
}
</script>

<style scoped>
:deep(.table-th) {
  /* 表头背景色：https://github.com/element-plus/element-plus/issues/6540 */
  background: #f8f8f9 !important
}

/* 树“暂无数据”文本 */
:deep(.el-tree__empty-text) {
  position: static;
}
</style>