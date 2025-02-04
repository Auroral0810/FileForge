<template>
  <div class="app">
    <el-container>
      <el-aside width="180px">
        <div class="logo-container">
          <h2 class="app-title animate__animated animate__fadeIn animate__delay-1s">FileForge</h2>
        </div>
        <el-menu
          :default-active="$route.path"
          router
          class="menu"
          unique-opened
          menu-trigger="hover"
          @mouseleave="handleMenuLeave"
        >
          <el-sub-menu 
            index="1"
            @mouseenter="handleSubmenuEnter('1')"
            @mouseleave="handleSubmenuLeave"
            class="menu-item animate__animated animate__fadeInLeft animate__delay-2s"
          >
            <template #title>
              <div class="menu-title">
                <el-icon><Edit /></el-icon>
                <span>基础功能</span>
              </div>
            </template>
            <el-menu-item index="/batch-rename" @click="handleMenuClick('/batch-rename')">
              <el-icon><Document /></el-icon>
              <span>批量重命名</span>
            </el-menu-item>
            <el-menu-item index="/file-preview" @click="handleMenuClick('/file-preview')">
              <el-icon><View /></el-icon>
              <span>文件预览</span>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu 
            index="2"
            @mouseenter="handleSubmenuEnter('2')"
            @mouseleave="handleSubmenuLeave"
            class="menu-item animate__animated animate__fadeInLeft animate__delay-3s"
          >
            <template #title>
              <div class="menu-title">
                <el-icon><Picture /></el-icon>
                <span>格式转换</span>
              </div>
            </template>
            <el-menu-item index="/image-convert" @click="handleMenuClick('/image-convert')">
              <el-icon><Picture /></el-icon>
              <span>图片转换</span>
            </el-menu-item>
            <el-menu-item index="/pdf-convert" @click="handleMenuClick('/pdf-convert')">
              <el-icon><Document /></el-icon>
              <span>PDF转换</span>
            </el-menu-item>
            <el-menu-item index="/office-convert" @click="handleMenuClick('/office-convert')">
              <el-icon><Files /></el-icon>
              <span>Office转换</span>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu 
            index="3"
            @mouseenter="handleSubmenuEnter('3')"
            @mouseleave="handleSubmenuLeave"
            class="menu-item animate__animated animate__fadeInLeft animate__delay-4s"
          >
            <template #title>
              <div class="menu-title">
                <el-icon><Film /></el-icon>
                <span>媒体处理</span>
              </div>
            </template>
            <el-menu-item index="/image-compress" @click="handleMenuClick('/image-compress')">
              <el-icon><PictureFilled /></el-icon>
              <span>图片压缩</span>
            </el-menu-item>
            <el-menu-item index="/video-gif" @click="handleMenuClick('/video-gif')">
              <el-icon><VideoPlay /></el-icon>
              <span>视频转GIF</span>
            </el-menu-item>
            <el-menu-item index="/audio-convert" @click="handleMenuClick('/audio-convert')">
              <el-icon><Headset /></el-icon>
              <span>音频转换</span>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu 
            index="4"
            @mouseenter="handleSubmenuEnter('4')"
            @mouseleave="handleSubmenuLeave"
            class="menu-item animate__animated animate__fadeInLeft animate__delay-5s"
          >
            <template #title>
              <div class="menu-title">
                <el-icon><Monitor /></el-icon>
                <span>智能处理</span>
              </div>
            </template>
            <el-menu-item index="/duplicate-check" @click="handleMenuClick('/duplicate-check')">
              <el-icon><CopyDocument /></el-icon>
              <span>重复文件检查</span>
            </el-menu-item>
            <el-menu-item index="/content-detect" @click="handleMenuClick('/content-detect')">
              <el-icon><Warning /></el-icon>
              <span>内容检测</span>
            </el-menu-item>
            <el-menu-item index="/exif-clean" @click="handleMenuClick('/exif-clean')">
              <el-icon><Delete /></el-icon>
              <span>EXIF清理</span>
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/about" class="menu-item animate__animated animate__fadeInLeft animate__delay-6s" @click="handleMenuClick('/about')">
            <el-icon><InfoFilled /></el-icon>
            <span>关于我们</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container class="main-container">
        <el-header class="animate__animated animate__fadeInDown">
          <el-breadcrumb>
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="$route.meta.parent">{{ $route.meta.parent }}</el-breadcrumb-item>
            <el-breadcrumb-item v-if="$route.meta.title">{{ $route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </el-header>

        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeSubmenu = ref('')
let leaveTimer: ReturnType<typeof setTimeout>

const handleSubmenuEnter = (index: string) => {
  clearTimeout(leaveTimer)
  activeSubmenu.value = index
}

const handleSubmenuLeave = () => {
  leaveTimer = setTimeout(() => {
    activeSubmenu.value = ''
  }, 300)
}

const handleMenuLeave = () => {
  activeSubmenu.value = ''
}

const handleMenuClick = async (path: string) => {
  if (router.currentRoute.value.path === path) {
    return
  }
  await router.push(path)
}
</script>

<style scoped>
.app {
  height: 100vh;
  background: #f8f9fa;
}

.logo-container {
  padding: 16px;
  text-align: center;
  background: #ffffff;
  border-bottom: 1px solid #eaeaea;
}

.app-title {
  font-family: 'Pacifico', cursive;
  font-size: 1.8rem;
  margin: 0;
  background: linear-gradient(45deg, #4A90E2, #67C23A);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.el-aside {
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.menu {
  border-right: none;
  padding: 0px;
}

.menu-title {
  display: flex;
  align-items: center;
  gap: 0px;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  margin: 4px 0;
  border-radius: 6px;
  height: 45px;
  line-height: 45px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background: #f5f7fa;
  transform: translateX(8px);
  padding-left: 0px;
}

:deep(.el-menu-item.is-active) {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  transform: translateX(8px);
  padding-left: 25px;
}

:deep(.el-sub-menu .el-menu) {
  position: static;
  box-shadow: none;
  padding: 0 0 0 0px;
  background: transparent;
  transform-origin: top;
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.el-header {
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.el-main {
  padding: 20px;
  overflow-x: hidden;
  height: calc(100vh - 60px); /* 减去header高度 */
}

.main-container {
  height: 100%;
  overflow: hidden;
}

/* 动画相关样式 */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: scaleY(0);
  }
  to {
    opacity: 1;
    transform: scaleY(1);
  }
}

.page-component {
  width: 100%;
  height: 100%;
}

/* 修改过渡动画样式 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease-out;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 确保动画元素正确定位 */
.animate__animated {
  animation-duration: 0.5s;
  animation-fill-mode: both;
}

/* 优化动画性能 */
.animate__fadeIn {
  will-change: opacity, transform;
}

/* 添加滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>