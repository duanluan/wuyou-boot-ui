<template>
  <el-card style="max-width: 400px">
    <template #header>
      <div class="card-header">
        <span>个人信息</span>
      </div>
    </template>
    <el-row>
      <el-table :data="tableData" :show-header="false" style="width: 100%">
        <el-table-column prop="name" label="名称" width="120">
          <template #default="{row}">
            <div style="display: flex; align-items: center;">
              <Iconify :icon="row.icon" :size="20" style="margin-right: 5px"/>
              {{ row.name }}：
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="value" label="值">
          <template #default="{row}">
            <template v-if="row.prop === 'roleNames' || row.prop === 'postNames'">
              <el-tag
                  v-for="value1 in row.value"
                  :key="value1"
                  :type="row.prop === 'roleNames' ? 'primary' : 'info'"
                  style="margin-right: 5px"
              >
                {{ value1 }}
              </el-tag>
            </template>
            <template v-else>
              {{ row.value }}
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import {useUserStore} from "@/store/user.ts";
import Iconify from "@/components/Iconify.vue";

const userInfo = useUserStore().info
const tableData = ref([
  {icon: 'mdi:account', prop: 'username', name: '用户名', value: userInfo.username},
  {icon: 'mdi:face-man-profile', prop: 'nickName', name: '昵称', value: userInfo.nickName},
  {icon: 'mdi:account-eye', prop: 'roleNames', name: '角色', value: userInfo.roleNames},
  {icon: 'mdi:family-tree', prop: 'deptName', name: '部门', value: userInfo.deptName},
  {icon: 'mdi:account-tag', prop: 'postNames', name: '岗位', value: userInfo.postNames},
  {icon: 'mdi:calendar-month', prop: 'createdTime', name: '创建时间', value: userInfo.createdTime}
])
</script>

<style scoped>
</style>