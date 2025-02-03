import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页'
    }
  },
  // 基础功能
  {
    path: '/batch-rename',
    name: 'BatchRename',
    component: () => import('@/views/BatchRename/index.vue'),
    meta: {
      title: '批量重命名',
      parent: '基础功能',
      group: '1'
    }
  },
  {
    path: '/file-preview',
    name: 'FilePreview',
    component: () => import('@/views/FilePreview/index.vue'),
    meta: {
      title: '文件预览',
      parent: '基础功能',
      group: '1'
    }
  },
  // 格式转换
  {
    path: '/image-convert',
    name: 'ImageConvert',
    component: () => import('@/views/ImageConvert/index.vue'),
    meta: {
      title: '图片转换',
      parent: '格式转换',
      group: '2'
    }
  },
  {
    path: '/pdf-convert',
    name: 'PdfConvert',
    component: () => import('@/views/PdfConvert/index.vue'),
    meta: {
      title: 'PDF转换',
      parent: '格式转换',
      group: '2'
    }
  },
  {
    path: '/office-convert',
    name: 'OfficeConvert',
    component: () => import('@/views/OfficeConvert/index.vue'),
    meta: {
      title: 'Office转换',
      parent: '格式转换',
      group: '2'
    }
  },
  // 媒体处理
  {
    path: '/image-compress',
    name: 'ImageCompress',
    component: () => import('@/views/ImageCompress/index.vue'),
    meta: {
      title: '图片压缩',
      parent: '媒体处理',
      group: '3'
    }
  },
  {
    path: '/video-gif',
    name: 'VideoGif',
    component: () => import('@/views/VideoGif/index.vue'),
    meta: {
      title: '视频转GIF',
      parent: '媒体处理',
      group: '3'
    }
  },
  {
    path: '/audio-convert',
    name: 'AudioConvert',
    component: () => import('@/views/AudioConvert/index.vue'),
    meta: {
      title: '音频转换',
      parent: '媒体处理',
      group: '3'
    }
  },
  // 智能处理
  {
    path: '/duplicate-check',
    name: 'DuplicateCheck',
    component: () => import('@/views/DuplicateCheck/index.vue'),
    meta: {
      title: '重复文件检查',
      parent: '智能处理',
      group: '4'
    }
  },
  {
    path: '/content-detect',
    name: 'ContentDetect',
    component: () => import('@/views/ContentDetect/index.vue'),
    meta: {
      title: '内容检测',
      parent: '智能处理',
      group: '4'
    }
  },
  {
    path: '/exif-clean',
    name: 'ExifClean',
    component: () => import('@/views/ExifClean/index.vue'),
    meta: {
      title: 'EXIF清理',
      parent: '智能处理',
      group: '4'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/about.vue'),
    meta: { title: '关于我们' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 