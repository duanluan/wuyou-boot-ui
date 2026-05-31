<template>
  <div>
    <el-form :inline="true" :model="searchForm">
      <el-form-item label="名称">
        <el-input v-model="searchForm.name"/>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态">
          <el-option v-for="item in statusOptions" :label="item.label" :value="item.value"/>
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
      <el-button type="warning" size="small" @click="refreshMenuTreeCache">
        <i-ep-refresh-right class="el-icon--left"/>
        刷新菜单树缓存
      </el-button>
    </div>
    <el-table ref="tableRef" :data="tableData" row-key="id" default-expand-all style="width: 100%; margin-bottom: 15px" header-cell-class-name="table-th">
      <el-table-column type="selection" width="55"/>
      <el-table-column fixed prop="name" label="名称" width="250">
        <template #default="{row}">
          <Iconify :icon="row.icon" v-if="row.icon"/>&nbsp;
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed prop="type" label="类型" align="center" width="100">
        <template #default="{row}">
          <el-tag v-if="getMenuTypeTagType(row.type)" :type="getMenuTypeTagType(row.type)">{{ getMenuTypeLabel(row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed prop="method" label="请求方法" align="center" width="80"/>
      <el-table-column fixed prop="path" label="请求路径" width="180"/>
      <el-table-column fixed prop="permission" label="权限标识" width="100"/>
      <el-table-column prop="sort" label="顺序" align="center" width="70"/>
      <el-table-column label="启用状态" align="center" width="100">
        <template #default="{row}">
          <el-switch :active-value="statusEnabledValue" :inactive-value="statusDisabledValue" v-model="row.status" @change="changeStatus(row)"/>
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
                  :data="parentSelectData"
                  :render-after-expand="false"
                  :props="{label: 'name', value: 'id'}"
                  check-strictly
                  style="width: 100% !important"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="name" label="名称">
              <el-input v-model="editForm.name"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="type" label="类型">
              <el-select v-model="editForm.type" placeholder="请选择类型">
                <el-option v-for="item in menuTypeOptions" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item prop="icon" label="图标">
              <IconSelector v-model="editForm.icon" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item prop="method" label="请求方法">
              <el-select v-model="editForm.method" placeholder="请选择请求方法" clearable>
                <el-option v-for="item in menuMethodOptions" :label="item.label" :value="String(item.value)"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="permission" label="权限标识">
              <el-input v-model="editForm.permission"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="path" label="请求路径">
              <el-input v-model="editForm.path"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="sort" label="顺序">
              <el-input-number v-model="editForm.sort" controls-position="right"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="status" label="启用状态">
              <el-switch :active-value="statusEnabledValue" :inactive-value="statusDisabledValue" v-model="editForm.status"/>
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
import {useMenuStore} from "@/store/menu.ts";
import MenuApi, {MenuSearchForm, MenuEditForm, MenuTreeItem} from "@/api/sys/menu.ts";
import Iconify from "@/components/Iconify.vue";
import IconSelector from "@/components/IconSelector.vue"; // 引入新组件
import {DICT_KEYS, getMenuTypeTagType, useDictOptions} from "@/utils/dict.ts";

const tableRef = ref<{ getSelectionRows: () => MenuTreeItem[] } | null>(null)
const tableData = ref<MenuTreeItem[]>([])
const parentSelectData = ref<MenuTreeItem[]>([])
const {options: statusOptions, load: loadStatusOptions, getValueByItemValue: getStatusValueByItemValue} = useDictOptions<number>(DICT_KEYS.COMMON_STATUS, 'number')
const {options: menuTypeOptions, load: loadMenuTypeOptions, getLabel: getMenuTypeLabel, getValueByItemValue: getMenuTypeValueByItemValue} = useDictOptions<number>(DICT_KEYS.MENU_TYPE, 'number')
const {options: menuMethodOptions, load: loadMenuMethodOptions} = useDictOptions<string>(DICT_KEYS.MENU_METHOD)
const statusEnabledValue = computed(() => getStatusValueByItemValue('1', 1))
const statusDisabledValue = computed(() => getStatusValueByItemValue('0', 0))
const defaultMenuTypeValue = computed(() => getMenuTypeValueByItemValue('2', 2))

// 页面加载时
onMounted(async () => {
  await Promise.all([
    loadStatusOptions({showLoading: false}),
    loadMenuTypeOptions({showLoading: false}),
    loadMenuMethodOptions({showLoading: false}),
  ])
  await search()
  getMenuTreeSelectData(tableData.value)
})

const searchForm = ref<Partial<MenuSearchForm>>({})

// 搜索
const search = async () => {
  const query = searchForm.value
  // 查询条件如果不是只查了一个状态时，不构建树
  if (query && Object.keys(query).length > 0 && !query.status && !Object.entries(query).some(
      ([key, value]) => key !== 'status' && value
  )) {
    query.notBuildTree = true
  }
  tableData.value = await MenuApi.treeTable(query, {loadingOption: {target: '.el-table'}, enableDebounce: false})
}

/**
 * 获取菜单树下拉数据，如果有数据则直接使用，否则调用接口获取
 * @param data 菜单树数据
 */
const getMenuTreeSelectData = async (data?: MenuTreeItem[]) => {
  if (data && data.length > 0) {
    // 深拷贝 tableData 以避免修改引用
    parentSelectData.value = JSON.parse(JSON.stringify(data));
  } else {
    parentSelectData.value = await MenuApi.treeTable({}, {showLoading: false, enableDebounce: false})
  }
  // 添加一个空选项，值为 0
  parentSelectData.value.unshift({id: '0', name: '根菜单'} as MenuTreeItem)
}

// 删除
const remove = (row?: MenuTreeItem) => {
  ElMessageBox.confirm('是否确认删除', '提示', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(() => {
    let ids: string[]
    if (row) {
      ids = [String(row.id)]
    } else {
      ids = tableRef.value?.getSelectionRows().map((item) => String(item.id)) ?? []
    }
    const req = MenuApi.remove(ids, {loadingOption: {target: '.el-main'}, showOkMsg: true})
    if (!req) return
    req.then(() => {
      search()
      getMenuTreeSelectData()
    })
  })
}

// 修改对话框是否显示
const editDialogVisible = ref(false)
// 编辑表单 ref
const editFormRef = ref<FormInstance>()
// 编辑表单数据
const editForm = reactive<MenuEditForm>({
  id: '',
  parentId: 0,
  name: '',
  type: defaultMenuTypeValue.value,
  method: '',
  path: '',
  permission: '',
  sort: 1,
  status: statusEnabledValue.value,
  icon: ''
})
// 编辑表单校验规则
const editFormRules = reactive<FormRules<MenuEditForm>>({
  parentId: [{required: true, message: '请选择上级', trigger: 'blur'}],
  name: [{required: true, message: '请输入名称', trigger: 'blur'}],
  type: [{required: true, message: '请输入类型', trigger: 'blur'}],
  sort: [{required: true, message: '请输入顺序', trigger: 'blur'}],
})
// 是否为新增，用于区分新增和编辑的对话框标题、接口调用
const isAdd = ref(false)

// 编辑
const edit = (row?: MenuTreeItem) => {
  editDialogVisible.value = true
  // 第一次表单赋值要放在表单显示后和下一个 DOM 更新循环之后，否则后续执行表单初始化一直是第一次赋值的值：https://segmentfault.com/a/1190000043401023#item-4
  nextTick(() => {
    Object.assign(editForm, row)
  })
  isAdd.value = false
}

// 新增
const add = (row?: MenuTreeItem) => {
  editDialogVisible.value = true
  isAdd.value = true
  if (row) {
    editForm.parentId = row.id
  }
}

// 确认编辑
const confirmEdit = async (editFormEl: FormInstance | undefined) => {
  if (!editFormEl) return
  await editFormEl.validate((isValid) => {
    if (!isValid) return

    const afterEdit = (response?: { code?: number }) => {
      if (response?.code !== 200) return

      // 关闭对话框
      editDialogVisible.value = false
      // 重置表单
      editFormEl.resetFields()
      // 刷新表格
      search()
      getMenuTreeSelectData()
    }
    if (isAdd.value) {
      MenuApi.save(editForm, {loadingOption: {target: '.el-dialog'}, showOkMsg: true}).then(response => afterEdit(response))
    } else {
      MenuApi.update(editForm, {loadingOption: {target: '.el-dialog'}, showOkMsg: true}).then(response => afterEdit(response))
    }
  })
}

// 修改状态
const changeStatus = async (row: MenuTreeItem) => {
  if (!row.id || !await MenuApi.updateStatus(String(row.id), row.status, {loadingOption: {target: '.el-table'}, showOkMsg: true})) {
    row.status = row.status === statusEnabledValue.value ? statusDisabledValue.value : statusEnabledValue.value
  }
}

// 刷新菜单树缓存
const refreshMenuTreeCache = () => {
  const menuStore = useMenuStore();
  menuStore.refreshTreeCache({loadingOption: {target: '.el-aside'}, showOkMsg: true, okMsgOption: {message: "刷新成功"}});
}
</script>

<style scoped>

</style>
