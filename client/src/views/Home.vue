<template>
  <div class="home-container">
    <div class="hero-section animate__animated animate__fadeIn">
      <h1 class="main-title">FileForge</h1>
      <p class="subtitle">简单高效的文件处理工具集</p>
    </div>

    <div class="features-container">
      <div 
        v-for="(module, index) in modules" 
        :key="module.title"
        class="feature-card animate__animated animate__fadeInUp"
        :style="{ 
          animationDelay: `${index * 0.15}s`,
          background: `linear-gradient(135deg, ${module.color}15, white)`,
          borderTop: `3px solid ${module.color}`
        }"
      >
        <div class="card-content">
          <div class="module-header">
            <el-icon class="module-icon" :style="{ background: `${module.color}20`, color: module.color }">
              <component :is="module.icon" />
            </el-icon>
            <h2>{{ module.title }}</h2>
          </div>
          <div class="features-list">
            <router-link
              v-for="feature in module.features" 
              :key="feature.path"
              :to="feature.path"
              custom
              v-slot="{ navigate }"
            >
              <div 
                class="feature-item"
                @click="handleFeatureClick($event, navigate)"
              >
                <el-icon :style="{ color: module.color }"><component :is="feature.icon" /></el-icon>
                <div class="feature-info">
                  <h3>{{ feature.title }}</h3>
                  <p>{{ feature.description }}</p>
                </div>
                <el-icon class="arrow-icon" :style="{ color: module.color }"><ArrowRight /></el-icon>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight} from '@element-plus/icons-vue'


const modules = [
  {
    title: '基础功能',
    icon: 'Edit',
    color: '#4A90E2',
    features: [
      {
        title: '批量重命名',
        path: '/batch-rename',
        icon: 'Edit',
        description: '支持正则表达式、序号生成、元数据插入的智能批量重命名'
      },
      {
        title: '文件预览',
        path: '/file-preview',
        icon: 'View',
        description: '强大的文件预览系统，支持缩略图生成和元数据展示'
      }
    ]
  },
  {
    title: '格式转换',
    icon: 'Document',
    color: '#50C14E',
    features: [
      {
        title: '图片转换',
        path: '/image-convert',
        icon: 'Picture',
        description: '支持WebP/AVIF等现代图片格式的互相转换'
      },
      {
        title: 'PDF转换',
        path: '/pdf-convert',
        icon: 'Document',
        description: 'PDF与图片互转，支持批量处理'
      },
      {
        title: 'Office转换',
        path: '/office-convert',
        icon: 'Files',
        description: 'Office文档转PDF，保持格式完整'
      }
    ]
  },
  {
    title: '媒体处理',
    icon: 'Film',
    color: '#F5A623',
    features: [
      {
        title: '图片压缩',
        path: '/image-compress',
        icon: 'PictureFilled',
        description: '智能图片压缩，支持质量和尺寸调整'
      },
      {
        title: '视频转GIF',
        path: '/video-gif',
        icon: 'VideoPlay',
        description: '视频转GIF，支持关键帧提取'
      },
      {
        title: '音频转换',
        path: '/audio-convert',
        icon: 'Headset',
        description: '音频格式转换，支持多种格式'
      }
    ]
  },
  {
    title: '智能处理',
    icon: 'Monitor',
    color: '#D85140',
    features: [
      {
        title: '重复文件检查',
        path: '/duplicate-check',
        icon: 'CopyDocument',
        description: '智能检测重复文件，支持多种对比方式'
      },
      {
        title: '内容检测',
        path: '/content-detect',
        icon: 'Warning',
        description: '智能识别图片/视频内容，支持敏感内容检测'
      },
      {
        title: 'EXIF清理',
        path: '/exif-clean',
        icon: 'Delete',
        description: '一键清理图片元数据，保护隐私'
      }
    ]
  }
]

const handleFeatureClick = (event: MouseEvent, navigate: () => void) => {
  const target = event.currentTarget as HTMLElement
  
  // 添加波纹动画效果
  const ripple = document.createElement('div')
  ripple.className = 'ripple'
  const rect = target.getBoundingClientRect()
  ripple.style.left = event.clientX - rect.left + 'px'
  ripple.style.top = event.clientY - rect.top + 'px'
  target.appendChild(ripple)

  // 添加缩放动画
  target.style.transform = 'scale(0.95)'
  
  setTimeout(() => {
    target.style.transform = 'scale(1)'
    ripple.remove()
    navigate()
  }, 300)
}
</script>

<style scoped>
.home-container {
  height: 95vh;
  max-height: 95vh;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  overflow: hidden;
}

.hero-section {
  text-align: center;
  padding: 10px 0;
  flex-shrink: 0;
  margin-top: -30px;
}

.main-title {
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(45deg, #2c3e50, #3498db);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2px;
}

.subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
  margin-bottom: 10px;
}

.features-container {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 0 20px 20px;
  overflow: auto;
  margin-top: -10px;
}

.feature-card {
  position: relative;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  min-height: 300px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.card-content {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.module-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.module-icon {
  font-size: 1.8rem;
  margin-right: 12px;
  padding: 12px;
  border-radius: 12px;
}

.module-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.features-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
  overflow: hidden;
}

.feature-item:hover {
  background: var(--el-color-primary-light-9);
  transform: translateX(5px);
}

.feature-item .el-icon {
  font-size: 1.2rem;
  margin-right: 12px;
  flex-shrink: 0;
}

.feature-info {
  flex: 1;
  min-width: 0;
}

.feature-info h3 {
  font-size: 1rem;
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-weight: 500;
}

.feature-info p {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow-icon {
  font-size: 1rem;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.feature-item:hover .arrow-icon {
  transform: translateX(3px);
}

.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

@media (max-width: 1200px) {
  .features-container {
    grid-template-columns: 1fr;
  }
  
  .feature-info p {
    white-space: normal;
  }
}
</style>