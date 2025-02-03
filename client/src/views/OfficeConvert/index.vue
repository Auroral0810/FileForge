<template>
  <div class="office-convert">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Office转换</span>
        </div>
      </template>

      <el-form :model="convertForm" label-width="120px">
        <el-form-item label="输出格式">
          <el-select v-model="convertForm.format">
            <el-option label="PDF" value="pdf" />
            <el-option label="图片" value="image" />
          </el-select>
        </el-form-item>
        <el-form-item label="图片质量" v-if="convertForm.format === 'image'">
          <el-slider v-model="convertForm.quality" :min="1" :max="100" />
        </el-form-item>
      </el-form>

      <el-upload
        drag
        multiple
        :auto-upload="false"
        accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx"
        @change="handleFileChange"
      >
        <el-icon><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽Office文件到此处或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 Word、Excel、PowerPoint 文件
          </div>
        </template>
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
  format: 'pdf',
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
    format: 'pdf',
    quality: 80
  }
  fileList.value = []
}
</script>

<style scoped>
.mt-4 { margin-top: 16px; }
</style> 