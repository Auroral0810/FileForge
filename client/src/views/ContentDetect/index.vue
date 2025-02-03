<template>
  <div class="content-detect">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>内容检测</span>
        </div>
      </template>

      <el-form :model="detectForm" label-width="120px">
        <el-form-item label="检测类型">
          <el-checkbox-group v-model="detectForm.types">
            <el-checkbox label="sensitive">敏感内容</el-checkbox>
            <el-checkbox label="watermark">水印</el-checkbox>
            <el-checkbox label="quality">质量问题</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <el-upload
        drag
        multiple
        :auto-upload="false"
        accept="image/*,video/*"
        @change="handleFileChange"
      >
        <el-icon><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持图片和视频文件
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
          <el-table-column prop="result" label="检测结果" width="200">
            <template #default="{ row }">
              <el-tag 
                v-for="issue in row.issues" 
                :key="issue"
                :type="getIssueType(issue)"
                class="mr-1"
              >
                {{ issue }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="actions mt-4">
        <el-button type="primary" @click="handleDetect">开始检测</el-button>
        <el-button @click="resetForm">重置</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { formatFileSize } from '@/utils/file'

const detectForm = ref({
  types: ['sensitive']
})

const fileList = ref<any[]>([])

const handleFileChange = (files: File[]) => {
  // TODO: 处理文件变化
}

const handleDetect = () => {
  // TODO: 实现检测逻辑
}

const resetForm = () => {
  detectForm.value = {
    types: ['sensitive']
  }
  fileList.value = []
}

const getIssueType = (issue: string) => {
  const types: Record<string, string> = {
    sensitive: 'danger',
    watermark: 'warning',
    quality: 'info'
  }
  return types[issue] || 'info'
}
</script>

<style scoped>
.mt-4 { margin-top: 16px; }
.mr-1 { margin-right: 4px; }
</style> 