<template>
  <div id="app" class="app-container">
    <Header />
    <div class="main-content">
      <Sidebar />
      <router-view class="content-area" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'

const selectedCategory = ref('world')
provide('selectedCategory', selectedCategory)
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
</style>
