<template>
  <div class="image-convert">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>图片格式转换</span>
        </div>
      </template>

      <el-form :model="convertForm" label-width="120px">
        <el-form-item label="目标格式">
          <el-select v-model="convertForm.format">
            <el-option label="WebP" value="webp" />
            <el-option label="AVIF" value="avif" />
            <el-option label="JPEG" value="jpeg" />
            <el-option label="PNG" value="png" />
          </el-select>
        </el-form-item>

        <el-form-item label="质量">
          <el-slider v-model="convertForm.quality" :min="1" :max="100" />
        </el-form-item>
      </el-form>

      <el-upload
        drag
        multiple
        :auto-upload="false"
        accept="image/*"
        @change="handleFileChange"
      >
        <el-icon><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽图片到此处或 <em>点击上传</em>
        </div>
      </el-upload>

      <div class="file-list mt-4">
        <el-table :data="fileList">
          <el-table-column prop="name" label="文件名" />
          <el-table-column prop="size" label="大小" width="120">
            <template #default="{ row }">
              {{ formatFileSize(row.size) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.status === 'success' ? 'success' : 'info'">
                {{ row.status === 'success' ? '已完成' : '待转换' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="actions mt-4">
        <el-button type="primary" @click="handleConvert">开始转换</el-button>
        <el-button @click="resetForm">重置</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { formatFileSize } from '@/utils/file'

const convertForm = ref({
  format: 'webp',
  quality: 80
})

const fileList = ref<any[]>([])

const handleFileChange = (files: File[]) => {
  // TODO: 处理文件变化
}

const handleConvert = () => {
  // TODO: 实现转换逻辑
}

const resetForm = () => {
  convertForm.value = {
    format: 'webp',
    quality: 80
  }
  fileList.value = []
}
</script>

<style scoped>
.mt-4 { margin-top: 16px; }
</style> 