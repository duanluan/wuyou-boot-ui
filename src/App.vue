<template>
  <router-view/>
  <h1>menuStore.count: {{ menuStore.count }}</h1>
  <el-button type="primary" @click="increment">+1</el-button>
</template>

<script setup lang="ts">
import {useMenuStore} from './store/menu';

const menuStore = useMenuStore();
const increment = () => {
  menuStore.increment();
}
</script>
