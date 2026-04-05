<template>
  <div class="home">
    <div class="articles-container">
      <div v-if="articles.length === 0" class="empty-state">
        <p>No articles yet. Click Refresh to fetch news.</p>
      </div>
      <div v-else class="articles-grid">
        <article v-for="article in articles" :key="article.url" class="article-card">
          <h2>{{ article.title }}</h2>
          <p class="meta">
            <span class="author" v-if="article.author">By {{ article.author }}</span>
            <span class="date">{{ formatDate(article.publishDate) }}</span>
          </p>
          <p class="description">{{ article.description }}</p>
          <a :href="article.url" target="_blank" rel="noopener" class="read-more">Read More →</a>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Article {
  url: string
  title: string
  description: string
  author: string
  publishDate: string
  category: string
}

const articles = ref<Article[]>([])

onMounted(() => {
  // Load mock data for demonstration
  articles.value = [
    {
      url: 'https://bbc.com',
      title: 'Latest Global News',
      description: 'Breaking news from around the world',
      author: 'BBC News',
      publishDate: new Date().toISOString(),
      category: 'world',
    },
  ]
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Unknown'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style scoped>
.home {
  height: 100%;
}

.articles-container {
  max-width: 1000px;
  margin: 0 auto;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.article-card {
  background: #F3DFC1;
  border: 1px solid #e0e0e0;
  color: #1A1C1A;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  font-family: "Courier New", Courier, monospace;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.2)
}

.article-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.article-card h2 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.meta {
  font-size: 12px;
  color: #999;
  margin: 10px 0;
}

.author {
  margin-right: 15px;
}

.description {
  margin: 15px 0;
  color: #666;
  line-height: 1.5;
}

.read-more {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.read-more:hover {
  color: #764ba2;
}
</style>
