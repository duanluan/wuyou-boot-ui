<template>
  <div>
    <el-form :inline="true" :model="searchForm" label-width="auto">
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
    <el-table :data="roleList" style="width: 100%; margin-bottom: 15px" header-cell-class-name="table-th">
      <el-table-column prop="name" label="名称" width="180"/>
      <el-table-column prop="code" label="编码" width="180"/>
      <el-table-column prop="createdTime" label="创建时间" width="220"/>
      <el-table-column prop="description" label="描述"/>
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
  </div>
</template>

<script setup lang="ts">
import RoleApi from "@/api/sys/role.ts"

const roleList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const pageTotal = ref(0)


onMounted(async () => {
  search()
})

interface SearchForm {
  // 名称
  name: string
  // 编码
  code: string
}

const searchForm = ref<SearchForm>({})

const search = async () => {
  const response = await RoleApi.page({current: currentPage.value, size: pageSize.value, ...searchForm.value})
  pageTotal.value = response.total
  roleList.value = response.data
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
</script>

<style scoped>
:deep(.table-th) {
  /* 表头背景色：https://github.com/element-plus/element-plus/issues/6540 */
  background: #f8f8f9 !important
}
</style>