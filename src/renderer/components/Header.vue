<template>
  <header class="header">
    <div class="header-content">
      <h1>📰 News Curator</h1>
      <div class="header-actions">
        <button @click="handleRefresh" class="btn-primary">Refresh</button>
        <button @click="handleSettings" class="btn-secondary">Settings</button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isRefreshing = ref(false)

const handleRefresh = async () => {
  isRefreshing.value = true
  try {
    // Emit event to start crawl
    console.log('Refreshing news...')
  } finally {
    isRefreshing.value = false
  }
}

const handleSettings = () => {
  console.log('Opening settings...')
}
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  margin: 0;
  font-size: 24px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-primary {
  background: #fff;
  color: #667eea;
  font-weight: 600;
}

.btn-primary:hover {
  background: #f0f0f0;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
