<template>
  <div class="image-compress">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>图片压缩</span>
        </div>
      </template>

      <el-form :model="compressForm" label-width="120px">
        <el-form-item label="压缩质量">
          <el-slider v-model="compressForm.quality" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="调整尺寸">
          <el-switch v-model="compressForm.resize" />
        </el-form-item>
        <template v-if="compressForm.resize">
          <el-form-item label="最大宽度">
            <el-input-number v-model="compressForm.maxWidth" :min="100" />
          </el-form-item>
          <el-form-item label="最大高度">
            <el-input-number v-model="compressForm.maxHeight" :min="100" />
          </el-form-item>
        </template>
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
          <el-table-column prop="originalSize" label="原始大小" width="120">
            <template #default="{ row }">
              {{ formatFileSize(row.originalSize) }}
            </template>
          </el-table-column>
          <el-table-column prop="compressedSize" label="压缩后大小" width="120">
            <template #default="{ row }">
              {{ row.compressedSize ? formatFileSize(row.compressedSize) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="ratio" label="压缩率" width="120">
            <template #default="{ row }">
              {{ row.ratio ? `${row.ratio}%` : '-' }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="actions mt-4">
        <el-button type="primary" @click="handleCompress">开始压缩</el-button>
        <el-button @click="resetForm">重置</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { formatFileSize } from '@/utils/file'

const compressForm = ref({
  quality: 80,
  resize: false,
  maxWidth: 1920,
  maxHeight: 1080
})

const fileList = ref<any[]>([])


const handleFileChange = (files: File[]) => {
  // TODO: 处理文件变化
}

const handleCompress = () => {
  // TODO: 实现压缩逻辑
}

const resetForm = () => {
  compressForm.value = {
    quality: 80,
    resize: false,
    maxWidth: 1920,
    maxHeight: 1080
  }
  fileList.value = []
}
</script>

<style scoped>
.mt-4 { margin-top: 16px; }
</style> 