<template>
  <div class="file-preview">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>文件预览</span>
        </div>
      </template>

      <el-upload
        drag
        multiple
        :auto-upload="false"
        @change="handleFileChange"
      >
        <el-icon><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
      </el-upload>

      <div class="preview-container mt-4">
        <el-row :gutter="20">
          <el-col :span="16">
            <div class="preview-main">
              <div v-if="currentFile" class="preview-content">
                <!-- 预览区域 -->
                <img v-if="isImage" :src="previewUrl" alt="预览图" />
                <iframe v-else-if="isPdf" :src="previewUrl" frameborder="0"></iframe>
                <div v-else class="no-preview">
                  暂不支持预览该类型文件
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="metadata-panel">
              <h3>文件信息</h3>
              <el-descriptions v-if="currentFile" direction="vertical" :column="1">
                <el-descriptions-item label="文件名">{{ currentFile.name }}</el-descriptions-item>
                <el-descriptions-item label="大小">{{ formatFileSize(currentFile.size) }}</el-descriptions-item>
                <el-descriptions-item label="类型">{{ currentFile.type }}</el-descriptions-item>
                <el-descriptions-item label="修改时间">{{ formatDate(currentFile.lastModified) }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="thumbnail-list mt-4">
        <el-scrollbar>
          <div class="thumbnails">
            <div 
              v-for="file in files" 
              :key="file.name"
              class="thumbnail-item"
              :class="{ active: currentFile?.name === file.name }"
              @click="selectFile(file)"
            >
              <el-icon v-if="!isImageFile(file)"><Document /></el-icon>
              <img v-else :src="getThumbnailUrl(file)" :alt="file.name">
              <span class="filename">{{ file.name }}</span>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { UploadFilled, Document } from '@element-plus/icons-vue'
import { formatFileSize } from '@/utils/file'

const files = ref<File[]>([])
const currentFile = ref<File | null>(null)

const previewUrl = computed(() => {
  if (!currentFile.value) return ''
  return URL.createObjectURL(currentFile.value)
})

const isImage = computed(() => {
  return currentFile.value?.type.startsWith('image/')
})

const isPdf = computed(() => {
  return currentFile.value?.type === 'application/pdf'
})

const handleFileChange = (uploadFiles: any) => {
  files.value = uploadFiles.map((item: any) => item.raw)
  if (files.value.length > 0) {
    selectFile(files.value[0])
  }
}

const selectFile = (file: File) => {
  currentFile.value = file
}

const isImageFile = (file: File) => {
  return file.type.startsWith('image/')
}

const getThumbnailUrl = (file: File) => {
  return URL.createObjectURL(file)
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}
</script>

<style scoped>
.mt-4 { margin-top: 16px; }

.preview-container {
  min-height: 400px;
}

.preview-content {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
}

.preview-content img,
.preview-content iframe {
  max-width: 100%;
  max-height: 100%;
}

.metadata-panel {
  padding: 20px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}

.thumbnail-list {
  margin-top: 20px;
}

.thumbnails {
  display: flex;
  gap: 10px;
  padding: 10px;
}

.thumbnail-item {
  width: 100px;
  height: 100px;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5px;
}

.thumbnail-item.active {
  border-color: var(--el-color-primary);
}

.thumbnail-item img {
  max-width: 100%;
  max-height: 70px;
  object-fit: contain;
}

.thumbnail-item .el-icon {
  font-size: 32px;
  color: var(--el-text-color-secondary);
}

.filename {
  font-size: 12px;
  margin-top: 5px;
  width: 100%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style> 