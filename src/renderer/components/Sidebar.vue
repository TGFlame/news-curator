<template>
  <aside class="sidebar">
    <nav class="nav">
      <h3>Categories</h3>
      <ul class="category-list">
        <li 
          v-for="category in categories" 
          :key="category"
          :class="{ active: selectedCategory === category }"
          @click="selectCategory(category)"
          class="category-item"
        >
          {{ formatCategory(category) }}
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, inject, Ref } from 'vue'

const categories = ref([
  'world',
  'business',
  'technology',
  'sports',
  'entertainment',
  'health',
  'science',
])

const selectedCategory = inject<Ref<string>>('selectedCategory')!

const selectCategory = (category: string) => {
  selectedCategory.value = category
}

const formatCategory = (cat: string) => {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: #f5f5f5;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  padding: 20px;
}

.nav h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  padding: 12px;
  margin-bottom: 8px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.category-item:hover {
  background: #f0f0f0;
  border-color: #667eea;
}

.category-item.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}
</style>
