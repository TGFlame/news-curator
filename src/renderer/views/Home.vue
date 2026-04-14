<template>
  <div class="home">
    <div class="articles-container">
      <div v-if="articles.length === 0" class="empty-state">
        <p>No articles yet. Click Refresh to fetch news.</p>
      </div>
      <div v-else class="articles-grid">
        <article v-for="article in articles" :key="article.url" class="article-card">
          <h2>{{ sanitizeDescription(article.title) }}</h2>
          <p class="meta">
            <span class="author" v-if="article.author">By {{ article.author }}</span>
            <span class="date">{{ formatDate(article.publishDate) }}</span>
          </p>
          <p class="description">{{ sanitizeDescription(article.description) }}</p>
          <a :href="article.url" target="_blank" rel="noopener" class="read-more">Read More →</a>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, inject, Ref } from 'vue'

interface Article {
  url: string
  title: string
  description: string
  author: string
  publishDate: string
  category: string
}

declare global {
  interface Window {
    electronAPI: {
      startCrawl: (config: any) => Promise<any>
      getArticles: (category: string) => Promise<Article[]>
    }
  }
}

const articles = ref<Article[]>([])
const isLoading = ref(false)
const selectedCategory = inject<Ref<string>>('selectedCategory')!

const fetchArticles = async (category: string) => {
  isLoading.value = true
  try {
    const data = await window.electronAPI.getArticles(category)
    const filtered = Array.isArray(data) ? filterArticles(data) : []
    articles.value = filtered
  } catch (error) {
    console.error('Failed to fetch articles:', error)
    articles.value = []
  } finally {
    isLoading.value = false
  }
}

const filterArticles = (articles: Article[]) => {
  return articles.filter(article => {
    // Exclude homepage/category pages and section listing pages
    const homepagePatterns = [
      /^https?:\/\/[^/]+\/?$/,  // Root domain only
      /\/(news|world|sport|business|entertainment|health|science|technology|lifestyle|uk|us|culture|arts)\/?$/i,
      /\/(articles|latest|top|trending|headlines|feeds|category|sections?)\/?$/i,
      /\?page|\/page\/\d+/i,  // Pagination
      /\/(live|live-blog)/i,  // Live blogs
    ]
    
    if (homepagePatterns.some(pattern => pattern.test(article.url))) {
      return false
    }
    
    // Exclude articles with very short titles
    if (!article.title || article.title.trim().length < 15) {
      return false
    }
    
    // Exclude articles with very short descriptions
    if (!article.description || article.description.trim().length < 30) {
      return false
    }
    
    // Exclude section/category indicator titles
    const sectionKeywords = ['latest', 'top stories', 'news feeds', 'headlines', 'category', 'homepage', 'live blog', 'columns', 'opinion|analysis|review only']
    if (sectionKeywords.some(keyword => article.title.toLowerCase().includes(keyword))) {
      return false
    }
    
    return true
  })
}

onMounted(() => {
  fetchArticles(selectedCategory.value)
})

watch(selectedCategory, (newCategory) => {
  fetchArticles(newCategory)
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

const sanitizeDescription = (text: string) => {
  if (!text) return ''
  
  let sanitized = text
    // Decode HTML entities first
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    // Split camelCase concatenations (e.g., "Labsgold" -> "Labs gold")
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Remove all character description patterns (without word boundaries to catch concatenated text)
    .replace(/double\s*quotation\s*mark/gi, '')
    .replace(/single\s*quotation\s*mark/gi, '')
    .replace(/left\s*quotation\s*mark/gi, '')
    .replace(/right\s*quotation\s*mark/gi, '')
    .replace(/quotation\s*mark/gi, '')
    .replace(/apostrophe/gi, '')
    .replace(/ampersand/gi, '')
    .replace(/less\s*than/gi, '')
    .replace(/greater\s*than/gi, '')
    .replace(/gold\s*medal/gi, '')
    .replace(/silver\s*medal/gi, '')
    .replace(/bronze\s*medal/gi, '')
    .replace(/medal/gi, '')
    .replace(/dash/gi, '')
    .replace(/hyphen/gi, '')
    .replace(/slash/gi, '')
    .replace(/backslash/gi, '')
    .replace(/caret/gi, '')
    .replace(/asterisk/gi, '')
    .replace(/percent/gi, '')
    .replace(/dollar/gi, '')
    .replace(/pound/gi, '')
    .replace(/euro/gi, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove consecutive double/single quotes
    .replace(/""+/g, '"')
    .replace(/''+/g, "'")
    // Remove repeated words (with spaces only, preserve proper words like "BBC" or "books")
    .replace(/\b(\w+)\s+\1\b/gi, '$1')
    // Remove multiple spaces around punctuation
    .replace(/\s+([.,!?;:—–\-|])/g, '$1')
    .replace(/([.,!?;:—–\-|])\s+/g, '$1 ')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    // Remove leading/trailing punctuation and spaces
    .replace(/^\s*[.,!?;:—–\-|]\s*/, '')
    .replace(/\s*[.,!?;:—–\-|]\s*$/, '')
    .trim()
  
  return sanitized
}
</script>

<style scoped>
.home {
  height: 100%;
}

.articles-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
  font-size: 16px;
  font-weight: 500;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 32px;
  margin-bottom: 40px;
}

.article-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
  overflow: hidden;
}

.article-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
  transform: translateY(-4px);
}

.article-card h2 {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.4;
  letter-spacing: -0.5px;
  flex-grow: 0;
}

.article-card h2:hover {
  color: #667eea;
  transition: color 0.2s;
}

.meta {
  font-size: 13px;
  color: #666;
  margin: 12px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  flex-grow: 0;
}

.author {
  font-weight: 600;
  color: #555;
}

.date {
  color: #999;
  font-weight: 500;
}

.meta::after {
  content: '';
  flex-basis: 100%;
  height: 1px;
  background: linear-gradient(to right, #e8e8e8, transparent);
  margin: 4px 0 0 0;
}

.description {
  margin: 16px 0;
  color: #555;
  line-height: 1.6;
  font-size: 15px;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.read-more {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  flex-grow: 0;
}

.read-more:hover {
  color: #764ba2;
  gap: 10px;
}

.read-more::after {
  content: '→';
  transition: transform 0.2s;
}

.read-more:hover::after {
  transform: translateX(3px);
}
</style>
