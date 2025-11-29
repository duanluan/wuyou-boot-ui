<template>
  <el-popover
      placement="bottom-start"
      :width="450"
      trigger="click"
      v-model:visible="visible"
  >
    <template #reference>
      <div class="icon-trigger">
        <el-input
            :model-value="modelValue"
            placeholder="点击选择图标"
            readonly
        >
          <template #prefix>
            <Iconify v-if="modelValue" :icon="modelValue" class="el-input__icon" />
            <i-ep-search v-else class="el-input__icon" />
          </template>
          <template #suffix>
            <i-ep-circle-close
                v-if="modelValue"
                class="el-input__icon cursor-pointer hover:text-primary"
                @click.stop="clear"
            />
          </template>
        </el-input>
      </div>
    </template>

    <div class="icon-selector-body">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="Element Plus" name="ep" />
        <el-tab-pane label="Material Design" name="mdi" />
      </el-tabs>

      <el-input
          v-model="searchText"
          placeholder="搜索图标名称（如：user, home）"
          clearable
          size="small"
          @input="handleSearch"
          style="margin-bottom: 10px"
      >
        <template #prefix><i-ep-search /></template>
      </el-input>

      <div class="icon-list">
        <div
            v-for="icon in renderList"
            :key="icon"
            class="icon-item"
            :class="{ active: modelValue === icon }"
            @click="handleSelect(icon)"
            :title="icon"
        >
          <Iconify :icon="icon" size="20" />
        </div>
        <div v-if="renderList.length === 0" class="empty-text">未找到相关图标</div>
      </div>

      <div class="pagination">
        <el-pagination
            small
            layout="prev, pager, next"
            :total="total"
            :page-size="pageSize"
            v-model:current-page="currentPage"
            @current-change="handlePageChange"
        />
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { ref, computed, shallowRef } from 'vue'
// 导入图标数据 (Vite 会自动处理 JSON 导入)
import epData from '@iconify-json/ep/icons.json'
import mdiData from '@iconify-json/mdi/icons.json'
import Iconify from "@/components/Iconify.vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emits = defineEmits(['update:modelValue'])

const visible = ref(false)
const activeTab = ref('ep') // 当前激活的 Tab：ep 或 mdi
const searchText = ref('')
const currentPage = ref(1)
const pageSize = 36 // 每页显示数量

// 解析图标数据的函数
const parseIcons = (json: any, prefix: string) => {
  return Object.keys(json.icons).map(name => `${prefix}:${name}`)
}

// 使用 shallowRef 优化大数据量性能
const epIcons = shallowRef(parseIcons(epData, 'ep'))
const mdiIcons = shallowRef(parseIcons(mdiData, 'mdi'))

// 当前选中的图标库全量数据
const currentIconList = computed(() => {
  return activeTab.value === 'ep' ? epIcons.value : mdiIcons.value
})

// 过滤后的数据（搜索逻辑）
const filteredList = computed(() => {
  const text = searchText.value.toLowerCase().trim()
  if (!text) return currentIconList.value
  return currentIconList.value.filter(icon => icon.includes(text))
})

// 分页渲染的数据
const renderList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

const total = computed(() => filteredList.value.length)

// Tab 切换时重置分页和搜索
const handleTabChange = () => {
  currentPage.value = 1
  searchText.value = ''
}

// 搜索时重置分页
const handleSearch = () => {
  currentPage.value = 1
}

// 翻页
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// 选择图标
const handleSelect = (icon: string) => {
  emits('update:modelValue', icon)
  visible.value = false
}

// 清空图标
const clear = () => {
  emits('update:modelValue', '')
}
</script>

<style scoped>
.icon-trigger {
  width: 100%;
  cursor: pointer;
}

.icon-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  height: 200px; /* 固定高度防止抖动 */
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px;
}

.icon-item {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.icon-item:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.icon-item.active {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary);
  color: white;
}

.pagination {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.empty-text {
  grid-column: span 6;
  text-align: center;
  color: #909399;
  line-height: 200px;
}

.cursor-pointer {
  cursor: pointer;
}
.hover\:text-primary:hover {
  color: var(--el-color-primary);
}
</style>