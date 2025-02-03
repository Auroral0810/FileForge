<template>
  <div class="about-container">
    <el-card class="about-card animate__animated animate__fadeInUp">
      <template #header>
        <div class="card-header">
          <h2>关于 FileForge</h2>
          <el-tag type="success">v1.0.0</el-tag>
        </div>
      </template>
      
      <div class="content">
        <div class="description">
          <el-input
            type="textarea"
            :rows="3"
            readonly
            resize="none"
            v-model="description"
            class="description-textarea"
          />
        </div>

        <el-row :gutter="20">
          <el-col :span="16">
            <div class="tech-stack">
              <h3>技术栈</h3>
              <el-row :gutter="12">
                <el-col :span="8" v-for="(tech, index) in techList" :key="index">
                  <el-card shadow="hover" class="tech-card">
                    <el-icon><component :is="tech.icon" /></el-icon>
                    <h4>{{ tech.name }}</h4>
                    <span>{{ tech.version }}</span>
                  </el-card>
                </el-col>
              </el-row>
            </div>

            <div class="friends">
              <h3>友情链接</h3>
              <el-row :gutter="12">
                <el-col :span="8" v-for="(friend, index) in friendLinks" :key="index">
                  <el-card shadow="hover" class="friend-card">
                    <img :src="friend.avatar" :alt="friend.name">
                    <h4>{{ friend.name }}</h4>
                    <p>{{ friend.description }}</p>
                    <el-link :href="friend.url" target="_blank" type="primary">访问</el-link>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-col>

          <el-col :span="8">
            <div class="links">
              <h3>相关链接</h3>
              <el-card shadow="hover" class="links-card">
                <template v-for="link in linkList" :key="link.url">
                  <el-link 
                    :href="link.url" 
                    target="_blank" 
                    :type="link.type"
                    class="link-item"
                  >
                    <el-icon><component :is="link.icon" /></el-icon>
                    {{ link.name }}
                  </el-link>
                </template>
              </el-card>
            </div>

            <div class="features">
              <h3>主要功能</h3>
              <el-card shadow="hover" class="features-card">
                <ul>
                  <li>批量重命名</li>
                  <li>格式转换</li>
                  <li>媒体处理</li>
                  <li>智能处理</li>
                </ul>
              </el-card>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">

const description = `FileForge 是一个现代化的文件处理工具集，提供批量重命名、格式转换、媒体处理等功能。我们致力于为用户提供简单易用、功能强大的文件处理解决方案。`

const techList = [
  { name: 'Vue 3', version: 'v3.2.x', icon: 'Platform' },
  { name: 'TypeScript', version: 'v4.5.x', icon: 'Setting' },
  { name: 'Element Plus', version: 'v2.2.x', icon: 'Collection' },
  { name: 'Vite', version: 'v2.9.x', icon: 'Promotion' },
  { name: 'Vue Router', version: 'v4.0.x', icon: 'Share' },
  { name: 'Pinia', version: 'v2.0.x', icon: 'Link' }
]

const linkList = [
  { 
    name: 'GitHub 仓库',
    url: 'https://github.com/your-repo/fileforge',
    type: 'primary',
    icon: 'Platform'
  },
  {
    name: '问题反馈',
    url: 'https://github.com/your-repo/fileforge/issues',
    type: 'warning',
    icon: 'Warning'
  },
  {
    name: '使用文档',
    url: 'https://your-repo.github.io/fileforge',
    type: 'success',
    icon: 'Document'
  }
]

const friendLinks = [
  {
    name: 'Vue.js',
    description: '渐进式 JavaScript 框架',
    url: 'https://vuejs.org',
    avatar: 'https://vuejs.org/images/logo.png'
  },
  {
    name: 'Element Plus', 
    description: '基于 Vue 3 的组件库',
    url: 'https://element-plus.org',
    avatar: 'https://element-plus.org/images/element-plus-logo.svg'
  },
  {
    name: 'TypeScript',
    description: 'JavaScript 的超集',
    url: 'https://www.typescriptlang.org',
    avatar: 'https://www.typescriptlang.org/favicon-32x32.png'
  }
]
</script>

<style scoped>
.about-container {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
  height: calc(100vh - 32px);
  overflow: hidden;
}

.about-card {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.content {
  padding: 16px;
  height: calc(100% - 60px);
  overflow-y: auto;
}

.description {
  margin-bottom: 24px;
}

.description-textarea {
  font-size: 14px;
  line-height: 1.6;
  background-color: var(--el-fill-color-lighter);
}

h3 {
  font-size: 16px;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
  border-left: 3px solid var(--el-color-primary);
  padding-left: 8px;
  font-weight: 600;
}

.tech-card {
  text-align: center;
  padding: 12px;
  margin-bottom: 12px;
  transition: transform 0.2s;
  height: 100px;
}

.tech-card:hover {
  transform: translateY(-3px);
}

.tech-card .el-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.tech-card h4 {
  margin: 8px 0;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.tech-card span {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.links-card, .features-card {
  padding: 16px;
  margin-bottom: 24px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}

.friend-card {
  text-align: center;
  padding: 16px;
  margin-bottom: 12px;
  transition: transform 0.2s;
  height: 160px;
}

.friend-card:hover {
  transform: translateY(-3px);
}

.friend-card img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-bottom: 8px;
}

.friend-card h4 {
  margin: 8px 0;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.friend-card p {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-bottom: 12px;
}

.features-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-card li {
  padding: 8px 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.features-card li:last-child {
  border-bottom: none;
}
</style>
