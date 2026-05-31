<template>
  <el-row :gutter="12">
    <el-col :span="10">
      <el-card shadow="never" class="dict-panel">
        <template #header>
          <div class="panel-header">
            <span>字典管理</span>
          </div>
        </template>
        <el-form :inline="true" :model="dictSearchForm">
          <el-form-item label="字典类型">
            <el-input v-model="dictSearchForm.keyword" placeholder="请输入名称或标识"/>
          </el-form-item>
          <el-form-item label="列表视图">
            <el-radio-group v-model="dictSearchForm.effectiveOnly" @change="searchDicts">
              <el-radio-button :value="true">生效字典</el-radio-button>
              <el-radio-button :value="false">全部明细</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="来源" v-if="dictSearchForm.effectiveOnly === false">
            <el-select v-model="dictSearchForm.sourceScope" placeholder="全部来源" clearable style="width: 140px" @change="searchDicts">
              <el-option label="公共系统" value="PUBLIC_SYSTEM"/>
              <el-option label="租户覆盖" value="TENANT_OVERRIDE"/>
              <el-option label="租户自定义" value="TENANT_CUSTOM"/>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchDicts">搜索</el-button>
            <el-button @click="resetDictSearch">重置</el-button>
          </el-form-item>
        </el-form>
        <el-alert
            v-if="dictSearchForm.effectiveOnly"
            type="info"
            :closable="false"
            show-icon
            class="dict-view-alert"
            :title="dictViewAlertTitle"
        />
        <div style="margin-bottom: 8px">
          <el-button type="primary" size="small" @click="addDict()">
            <i-ep-plus class="el-icon--left"/>
            新增
          </el-button>
          <el-button type="danger" size="small" @click="removeDict()" :disabled="dictSelections.length === 0 || hasBuiltinSelection">
            <i-ep-delete class="el-icon--left"/>
            删除
          </el-button>
        </div>
        <el-table
            ref="dictTableRef"
            :data="dictTableData"
            highlight-current-row
            @current-change="handleDictCurrentChange"
            @selection-change="handleDictSelectionChange"
            style="width: 100%; margin-bottom: 15px"
            header-cell-class-name="table-th"
        >
          <el-table-column type="selection" width="55"/>
          <el-table-column prop="name" label="字典名称" min-width="140" show-overflow-tooltip/>
          <el-table-column prop="key" label="字典标识" min-width="160" show-overflow-tooltip/>
          <el-table-column prop="sourceScope" label="来源" width="110">
            <template #default="{row}">
              <el-tag size="small" :type="getSourceScopeTagType(row.sourceScope)">{{ getSourceScopeLabel(row.sourceScope) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="tenantName" label="租户" width="120" show-overflow-tooltip v-if="isSuperAdmin">
            <template #default="{row}">
              {{ row.tenantId === 0 || row.tenantId === '0' ? '公共' : row.tenantName || `租户 ${row.tenantId}` }}
            </template>
          </el-table-column>
          <el-table-column prop="remarks" label="备注" min-width="180" show-overflow-tooltip/>
          <el-table-column prop="createdTime" label="创建时间" width="180"/>
          <el-table-column fixed="right" label="操作" width="120">
            <template #default="{row}">
              <div class="action-buttons">
                <el-button link type="primary" size="small" @click="editDict(row)" :disabled="isDictReadOnly(row)">
                  <i-ep-edit style="margin-right: 2px"/>
                  修改
                </el-button>
                <el-button link type="primary" size="small" @click="removeDict(row)" :disabled="isDictProtected(row)">
                  <i-ep-delete style="margin-right: 2px"/>
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
            v-model:current-page="dictCurrentPage"
            v-model:page-size="dictPageSize"
            :page-sizes="[10, 50, 100, 200, 500]"
            :total="dictPageTotal"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="searchDicts()"
            @current-change="searchDicts()"
            style="justify-content: right"
        />
      </el-card>
    </el-col>

    <el-col :span="14">
      <el-card shadow="never" class="item-panel">
        <template #header>
          <div class="panel-header">
            <span>字典项管理</span>
            <span class="panel-desc">
              {{ selectedDict?.id ? `当前字典：${selectedDict.name} (${selectedDict.key})` : '请先选择左侧字典' }}
            </span>
          </div>
        </template>
        <el-form :inline="true" :model="itemSearchForm">
          <el-form-item label="字典项名称">
            <el-input v-model="itemSearchForm.label"/>
          </el-form-item>
          <el-form-item label="字典项值">
            <el-input v-model="itemSearchForm.itemValue"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchItems">搜索</el-button>
            <el-button @click="itemSearchForm = {}">重置</el-button>
          </el-form-item>
        </el-form>
        <div style="margin-bottom: 8px">
          <el-button type="primary" size="small" @click="addItem()" :disabled="!selectedDict?.id || isSelectedBuiltinDict">
            <i-ep-plus class="el-icon--left"/>
            新增
          </el-button>
          <el-button type="danger" size="small" @click="removeItem()" :disabled="!selectedDict?.id || itemSelections.length === 0 || isSelectedBuiltinDict || hasBuiltinItemSelection">
            <i-ep-delete class="el-icon--left"/>
            删除
          </el-button>
        </div>
        <el-table
            ref="itemTableRef"
            :data="itemTableData"
            @selection-change="handleItemSelectionChange"
            style="width: 100%; margin-bottom: 15px"
            header-cell-class-name="table-th"
        >
          <el-table-column type="selection" width="55"/>
          <el-table-column prop="label" label="字典项名称" min-width="140" show-overflow-tooltip/>
          <el-table-column prop="itemValue" label="字典项值" min-width="140" show-overflow-tooltip/>
          <el-table-column prop="sortOrder" label="排序" width="90" align="center"/>
          <el-table-column prop="description" label="描述" min-width="160" show-overflow-tooltip/>
          <el-table-column prop="createdTime" label="创建时间" width="180"/>
          <el-table-column fixed="right" label="操作" width="120">
            <template #default="{row}">
              <div class="action-buttons">
                <el-button link type="primary" size="small" @click="editItem(row)" :disabled="isSelectedDictReadOnly">
                  <i-ep-edit style="margin-right: 2px"/>
                  修改
                </el-button>
                <el-button link type="primary" size="small" @click="removeItem(row)" :disabled="isItemProtected(row)">
                  <i-ep-delete style="margin-right: 2px"/>
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
            v-model:current-page="itemCurrentPage"
            v-model:page-size="itemPageSize"
            :page-sizes="[10, 50, 100, 200, 500]"
            :total="itemPageTotal"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="searchItems()"
            @current-change="searchItems()"
            style="justify-content: right"
        />
      </el-card>
    </el-col>
  </el-row>

  <el-dialog v-model="dictDialogVisible" @close="resetDictForm" :title="dictIsAdd ? '新增字典' : '修改字典'" draggable width="600">
    <el-form
        ref="dictFormRef"
        :model="dictForm"
        :rules="dictFormRules"
        label-width="90px"
    >
      <el-form-item prop="id" label="ID" style="display: none">
        <el-input v-model="dictForm.id"/>
      </el-form-item>
      <el-row :gutter="8">
        <el-col :span="12">
          <el-form-item prop="name" label="字典名称">
            <el-input v-model="dictForm.name"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="key" label="字典标识">
            <el-tooltip :disabled="dictIsAdd" :content="dictKeyReadonlyReason" placement="top">
              <span class="readonly-field-tip" :title="dictIsAdd ? '' : dictKeyReadonlyReason" :data-tip="dictIsAdd ? '' : dictKeyReadonlyReason">
                <el-input v-model="dictForm.key" :disabled="!dictIsAdd"/>
                <span
                    v-if="!dictIsAdd"
                    class="readonly-tip-icon"
                    :title="dictKeyReadonlyReason"
                    :data-tip="dictKeyReadonlyReason"
                    aria-label="字典标识不可修改原因"
                    tabindex="0"
                >?</span>
              </span>
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item prop="remarks" label="备注">
            <el-input v-model="dictForm.remarks" type="textarea"/>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dictDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmDictEdit(dictFormRef)">确认</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="itemDialogVisible" @close="resetItemForm" :title="itemIsAdd ? '新增字典项' : '修改字典项'" draggable width="680">
    <el-form
        ref="itemFormRef"
        class="dict-item-edit-form"
        :model="itemForm"
        :rules="itemFormRules"
        label-width="104px"
    >
      <el-form-item prop="id" label="ID" style="display: none">
        <el-input v-model="itemForm.id"/>
      </el-form-item>
      <el-row :gutter="8">
        <el-col :span="12">
          <el-form-item prop="dictKey" label="字典标识">
            <el-tooltip :content="itemDictKeyReadonlyReason" placement="top">
              <span class="readonly-field-tip" :title="itemDictKeyReadonlyReason" :data-tip="itemDictKeyReadonlyReason">
                <el-input v-model="itemForm.dictKey" disabled/>
                <span
                    class="readonly-tip-icon"
                    :title="itemDictKeyReadonlyReason"
                    :data-tip="itemDictKeyReadonlyReason"
                    aria-label="字典标识不可修改原因"
                    tabindex="0"
                >?</span>
              </span>
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="sortOrder" label="排序">
            <el-input-number v-model="itemForm.sortOrder" controls-position="right" :min="1"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="label" label="字典项名称">
            <el-input v-model="itemForm.label"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="itemValue" label="字典项值">
            <el-tooltip :disabled="!isItemValueReadonly" :content="itemValueReadonlyReason" placement="top">
              <span class="readonly-field-tip" :title="isItemValueReadonly ? itemValueReadonlyReason : ''" :data-tip="isItemValueReadonly ? itemValueReadonlyReason : ''">
                <el-input v-model="itemForm.itemValue" :disabled="isItemValueReadonly"/>
                <span
                    v-if="isItemValueReadonly"
                    class="readonly-tip-icon"
                    :title="itemValueReadonlyReason"
                    :data-tip="itemValueReadonlyReason"
                    aria-label="字典项值不可修改原因"
                    tabindex="0"
                >?</span>
              </span>
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item prop="description" label="描述">
            <el-input v-model="itemForm.description"/>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item prop="remarks" label="备注">
            <el-input v-model="itemForm.remarks" type="textarea"/>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="itemDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmItemEdit(itemFormRef)">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import DictApi, {DictEditForm} from "@/api/sys/dict.ts"
import DictItemApi, {DictItemEditForm} from "@/api/sys/dictItem.ts"
import {DICT_KEYS} from "@/utils/dict.ts"
import {useUserStore} from "@/store/user.ts"

type DictTableItem = DictEditForm
type DictItemTableItem = DictItemEditForm

const dictTableRef = ref<{
  getSelectionRows: () => DictTableItem[]
  setCurrentRow: (row?: DictTableItem) => void
} | null>(null)
const dictTableData = ref<DictTableItem[]>([])
const dictCurrentPage = ref(1)
const dictPageSize = ref(10)
const dictPageTotal = ref(0)
const selectedDict = ref<DictTableItem | null>(null)

const itemTableRef = ref<{ getSelectionRows: () => DictItemTableItem[] } | null>(null)
const itemTableData = ref<DictItemTableItem[]>([])
const itemCurrentPage = ref(1)
const itemPageSize = ref(10)
const itemPageTotal = ref(0)
const builtinDictKeys = new Set<string>(Object.values(DICT_KEYS) as string[])
const dictSelections = ref<DictTableItem[]>([])
const itemSelections = ref<DictItemTableItem[]>([])
const SOURCE_SCOPE_LABELS: Record<string, string> = {
  PUBLIC_SYSTEM: '公共系统',
  TENANT_OVERRIDE: '租户覆盖',
  TENANT_CUSTOM: '租户自定义',
}

onMounted(() => {
  searchDicts()
})

interface DictSearchForm {
  keyword: string
  effectiveOnly: boolean
  sourceScope: 'PUBLIC_SYSTEM' | 'TENANT_OVERRIDE' | 'TENANT_CUSTOM' | ''
}

interface ItemSearchForm {
  label: string
  itemValue: string
}

const defaultDictSearchForm = (): Partial<DictSearchForm> => ({effectiveOnly: true})
const dictSearchForm = ref<Partial<DictSearchForm>>(defaultDictSearchForm())
const itemSearchForm = ref<Partial<ItemSearchForm>>({})
const isSuperAdmin = computed(() => !!useUserStore().info.isShowTenant)
const dictViewAlertTitle = computed(() => {
  if (isSuperAdmin.value) {
    return '当前展示公共系统字典；如需查看租户覆盖副本，请切换到“全部明细”。'
  }
  return '当前展示本租户最终生效的字典；若存在租户覆盖则优先显示覆盖版本，否则显示公共系统字典。'
})
const isBuiltinDict = (dictKey?: string) => !!dictKey && builtinDictKeys.has(dictKey)
const isDictProtected = (dict?: DictTableItem | null) => Boolean(dict?.codeReferenced)
const isDictReadOnly = (dict?: DictTableItem | null) => Boolean(dict?.sourceScope === 'PUBLIC_SYSTEM' && dict?.systemBuiltIn && !isSuperAdmin.value)
const isSelectedBuiltinDict = computed(() => isBuiltinDict(selectedDict.value?.key))
const isSelectedDictReadOnly = computed(() => isDictReadOnly(selectedDict.value))
const hasBuiltinSelection = computed(() => {
  return dictSelections.value.some(item => isDictProtected(item))
})
const hasBuiltinItemSelection = computed(() => {
  return itemSelections.value.some(item => isItemProtected(item))
})
const getSourceScopeLabel = (scope?: string) => SOURCE_SCOPE_LABELS[scope ?? ''] ?? '未知'
const getSourceScopeTagType = (scope?: string) => {
  if (scope === 'PUBLIC_SYSTEM') return 'danger'
  if (scope === 'TENANT_OVERRIDE') return 'warning'
  return 'success'
}
const isItemProtected = (item?: DictItemTableItem | null) => Boolean(item?.codeReferenced)

const handleDictSelectionChange = (rows: DictTableItem[]) => {
  dictSelections.value = rows
}

const handleItemSelectionChange = (rows: DictItemTableItem[]) => {
  itemSelections.value = rows
}

const syncSelectedDict = async () => {
  if (dictTableData.value.length === 0) {
    selectedDict.value = null
    itemTableData.value = []
    itemPageTotal.value = 0
    dictSelections.value = []
    itemSelections.value = []
    return
  }

  const current = selectedDict.value?.id
  const matched = dictTableData.value.find(item => item.id === current) ?? dictTableData.value[0]
  selectedDict.value = matched
  nextTick(() => {
    dictTableRef.value?.setCurrentRow(matched)
  })
  await searchItems()
}

const searchDicts = async () => {
  if (dictSearchForm.value.effectiveOnly !== false) {
    dictSearchForm.value.sourceScope = ''
  }
  const query = {
    current: dictCurrentPage.value,
    size: dictPageSize.value,
    ...dictSearchForm.value,
    sourceScope: dictSearchForm.value.sourceScope || undefined,
  }
  const response = await DictApi.page(
    query,
    {loadingOption: {target: '.dict-panel .el-table'}, enableDebounce: false}
  )
  dictPageTotal.value = response.total ?? 0
  dictTableData.value = response.data ?? []
  dictSelections.value = []
  await syncSelectedDict()
}

const resetDictSearch = () => {
  dictSearchForm.value = defaultDictSearchForm()
  dictCurrentPage.value = 1
  searchDicts()
}

const handleDictCurrentChange = async (row?: DictTableItem) => {
  if (!row) return
  selectedDict.value = row
  itemCurrentPage.value = 1
  await searchItems()
}

const searchItems = async () => {
  if (!selectedDict.value?.id) {
    itemTableData.value = []
    itemPageTotal.value = 0
    return
  }
  const response = await DictItemApi.page(
    {current: itemCurrentPage.value, size: itemPageSize.value, dictId: selectedDict.value.id, ...itemSearchForm.value},
    {loadingOption: {target: '.item-panel .el-table'}, enableDebounce: false}
  )
  itemPageTotal.value = response.total ?? 0
  itemTableData.value = response.data ?? []
  itemSelections.value = []
}

const dictDialogVisible = ref(false)
const dictFormRef = ref<FormInstance>()
const dictForm = reactive<DictEditForm>({
  id: '',
  name: '',
  key: '',
  remarks: '',
})
const dictFormRules = reactive<FormRules<DictEditForm>>({
  name: [{required: true, message: '请输入字典名称', trigger: 'blur'}],
  key: [{required: true, message: '请输入字典标识', trigger: 'blur'}],
})
const dictIsAdd = ref(false)
let dictEditRequestSeq = 0
const dictKeyReadonlyReason = '字典标识是系统识别字典的业务标识，创建后不允许修改。'

const assignDictForm = (source?: Partial<DictEditForm> | null) => {
  Object.assign(dictForm, {
    id: source?.id ? String(source.id) : '',
    name: source?.name ?? '',
    key: source?.key ?? '',
    remarks: source?.remarks ?? '',
  })
  nextTick(() => dictFormRef.value?.clearValidate())
}

const resetDictForm = () => {
  dictEditRequestSeq += 1
  assignDictForm()
}

const addDict = () => {
  resetDictForm()
  dictIsAdd.value = true
  dictDialogVisible.value = true
}

const editDict = async (row: DictTableItem) => {
  if (isDictReadOnly(row)) {
    ElMessage.warning('系统公共字典不允许直接修改')
    return
  }
  const requestSeq = ++dictEditRequestSeq
  assignDictForm(row)
  dictIsAdd.value = false
  dictDialogVisible.value = true
  if (!row.id) return
  const res = await DictApi.get(String(row.id), {loadingOption: {target: '.el-dialog'}}).catch(() => undefined)
  if (requestSeq === dictEditRequestSeq && res) {
    assignDictForm(res)
  }
}

const confirmDictEdit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((isValid) => {
    if (!isValid) return

    const afterEdit = (response?: { code?: number }) => {
      if (response?.code !== 200) return
      dictDialogVisible.value = false
      resetDictForm()
      searchDicts()
    }

    if (dictIsAdd.value) {
      DictApi.save(dictForm, {loadingOption: {target: '.el-dialog'}, showOkMsg: true}).then(response => afterEdit(response))
    } else {
      DictApi.update(dictForm, {loadingOption: {target: '.el-dialog'}, showOkMsg: true}).then(response => afterEdit(response))
    }
  })
}

const removeDict = (row?: DictTableItem) => {
  const selectedRows = row ? [row] : dictSelections.value
  if (selectedRows.some(item => isDictProtected(item))) {
    ElMessage.warning('系统引用字典不允许删除')
    return
  }
  ElMessageBox.confirm('是否确认删除', '提示', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(() => {
    let ids: string[]
    if (row) {
      ids = [String(row.id)]
    } else {
      ids = dictSelections.value.map(item => String(item.id))
    }
    const req = DictApi.remove(ids, {loadingOption: {target: '.el-main'}, showOkMsg: true})
    if (!req) return
    req.then(() => {
      searchDicts()
    })
  })
}

const itemDialogVisible = ref(false)
const itemFormRef = ref<FormInstance>()
const itemForm = reactive<DictItemEditForm>({
  id: '',
  dictId: '',
  dictKey: '',
  itemValue: '',
  label: '',
  description: '',
  sortOrder: 1,
  remarks: '',
})
const itemFormRules = reactive<FormRules<DictItemEditForm>>({
  label: [{required: true, message: '请输入字典项名称', trigger: 'blur'}],
  itemValue: [{required: true, message: '请输入字典项值', trigger: 'blur'}],
  sortOrder: [{required: true, message: '请输入排序', trigger: 'blur'}],
})
const itemIsAdd = ref(false)
let itemEditRequestSeq = 0
const isItemValueReadonly = computed(() => !itemIsAdd.value && Boolean(itemForm.codeReferenced))
const itemDictKeyReadonlyReason = '字典标识由当前字典决定，字典项不能在编辑时移动到其他字典。'
const itemValueReadonlyReason = '该字典项值已被代码引用，属于业务真值，不允许修改。'

const assignItemForm = (source?: Partial<DictItemEditForm> | null) => {
  Object.assign(itemForm, {
    id: source?.id ? String(source.id) : '',
    dictId: String(source?.dictId ?? selectedDict.value?.id ?? ''),
    dictKey: source?.dictKey ?? selectedDict.value?.key ?? '',
    itemValue: source?.itemValue ?? '',
    label: source?.label ?? '',
    description: source?.description ?? '',
    sortOrder: Number(source?.sortOrder ?? 1),
    remarks: source?.remarks ?? '',
    systemBuiltIn: source?.systemBuiltIn,
    codeReferenced: source?.codeReferenced,
    baseItemId: source?.baseItemId,
  })
  nextTick(() => itemFormRef.value?.clearValidate())
}

const resetItemForm = () => {
  itemEditRequestSeq += 1
  Object.assign(itemForm, {
    id: '',
    dictId: '',
    dictKey: '',
    itemValue: '',
    label: '',
    description: '',
    sortOrder: 1,
    remarks: '',
    systemBuiltIn: undefined,
    codeReferenced: undefined,
    baseItemId: undefined,
  })
  nextTick(() => itemFormRef.value?.clearValidate())
}

const addItem = () => {
  if (!selectedDict.value?.id) {
    ElMessage.warning('请先选择字典')
    return
  }
  if (isSelectedDictReadOnly.value) {
    ElMessage.warning('系统公共字典项不允许直接新增')
    return
  }
  resetItemForm()
  assignItemForm({
    dictId: selectedDict.value.id,
    dictKey: selectedDict.value.key,
    sortOrder: 1,
  })
  itemIsAdd.value = true
  itemDialogVisible.value = true
}

const editItem = async (row: DictItemTableItem) => {
  if (isSelectedDictReadOnly.value) {
    ElMessage.warning('系统公共字典项不允许直接修改')
    return
  }
  const requestSeq = ++itemEditRequestSeq
  assignItemForm(row)
  itemIsAdd.value = false
  itemDialogVisible.value = true
  if (!row.id) return
  const res = await DictItemApi.get(String(row.id), {loadingOption: {target: '.el-dialog'}}).catch(() => undefined)
  if (requestSeq === itemEditRequestSeq && res) {
    assignItemForm(res)
  }
}

const confirmItemEdit = async (formEl: FormInstance | undefined) => {
  if (!formEl || !selectedDict.value?.id) return
  await formEl.validate((isValid) => {
    if (!isValid) return

    const afterEdit = (response?: { code?: number }) => {
      if (response?.code !== 200) return
      itemDialogVisible.value = false
      resetItemForm()
      searchItems()
    }

    const payload = {
      ...itemForm,
      dictId: selectedDict.value?.id ?? itemForm.dictId,
      dictKey: selectedDict.value?.key ?? itemForm.dictKey
    }
    if (itemIsAdd.value) {
      DictItemApi.save(payload, {loadingOption: {target: '.el-dialog'}, showOkMsg: true}).then(response => afterEdit(response))
    } else {
      DictItemApi.update(payload, {loadingOption: {target: '.el-dialog'}, showOkMsg: true}).then(response => afterEdit(response))
    }
  })
}

const removeItem = (row?: DictItemTableItem) => {
  const selectedRows = row ? [row] : itemSelections.value
  if (selectedRows.some(item => isItemProtected(item))) {
    ElMessage.warning('系统引用字典项不允许删除')
    return
  }
  ElMessageBox.confirm('是否确认删除', '提示', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(() => {
    let ids: string[]
    if (row) {
      ids = [String(row.id)]
    } else {
      ids = itemSelections.value.map(item => String(item.id))
    }
    const req = DictItemApi.remove(ids, {loadingOption: {target: '.el-main'}, showOkMsg: true})
    if (!req) return
    req.then(() => {
      searchItems()
    })
  })
}
</script>

<style scoped>
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-desc {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.action-buttons :deep(.el-button + .el-button) {
  margin-left: 0;
}

:deep(.table-th) {
  background: #f8f8f9 !important
}

.dict-view-alert {
  margin: 0 0 8px;
}

.readonly-field-tip {
  display: block;
  position: relative;
  width: 100%;
  cursor: not-allowed;
}

.readonly-field-tip[data-tip]:not([data-tip=""]):hover::after,
.readonly-field-tip[data-tip]:not([data-tip=""]):focus-within::after {
  content: attr(data-tip);
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  z-index: 3000;
  max-width: 260px;
  padding: 6px 10px;
  transform: translateX(-50%);
  border-radius: 4px;
  background: var(--el-text-color-primary);
  box-shadow: var(--el-box-shadow-light);
  color: #fff;
  font-size: 12px;
  line-height: 1.45;
  pointer-events: none;
  white-space: normal;
}

.readonly-field-tip[data-tip]:not([data-tip=""]):hover::before,
.readonly-field-tip[data-tip]:not([data-tip=""]):focus-within::before {
  content: "";
  position: absolute;
  left: 50%;
  bottom: calc(100% + 2px);
  z-index: 3001;
  width: 0;
  height: 0;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--el-text-color-primary);
  pointer-events: none;
}

.readonly-field-tip :deep(.el-input.is-disabled) {
  pointer-events: none;
}

.dict-item-edit-form :deep(.el-form-item__label) {
  white-space: nowrap;
}

.readonly-tip-icon {
  position: absolute;
  top: 50%;
  right: 8px;
  z-index: 1;
  display: inline-flex;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
  border-radius: 50%;
  background: var(--el-fill-color-dark);
  color: var(--el-text-color-secondary);
  cursor: help;
  font-size: 11px;
  line-height: 1;
  pointer-events: auto;
}

.readonly-tip-icon[data-tip]:not([data-tip=""]):hover::after,
.readonly-tip-icon[data-tip]:not([data-tip=""]):focus::after {
  content: attr(data-tip);
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  z-index: 3000;
  width: max-content;
  max-width: 260px;
  padding: 6px 10px;
  transform: translateX(-50%);
  border-radius: 4px;
  background: var(--el-text-color-primary);
  box-shadow: var(--el-box-shadow-light);
  color: #fff;
  font-size: 12px;
  line-height: 1.45;
  pointer-events: none;
  white-space: normal;
}

.readonly-tip-icon[data-tip]:not([data-tip=""]):hover::before,
.readonly-tip-icon[data-tip]:not([data-tip=""]):focus::before {
  content: "";
  position: absolute;
  left: 50%;
  bottom: calc(100% + 2px);
  z-index: 3001;
  width: 0;
  height: 0;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--el-text-color-primary);
  pointer-events: none;
}
</style>
