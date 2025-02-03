<template>
  <div class="audio-convert">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>音频转换</span>
        </div>
      </template>

      <el-form :model="convertForm" label-width="120px">
        <el-form-item label="输出格式">
          <el-select v-model="convertForm.format">
            <el-option label="MP3" value="mp3" />
            <el-option label="WAV" value="wav" />
            <el-option label="AAC" value="aac" />
            <el-option label="OGG" value="ogg" />
          </el-select>
        </el-form-item>
        <el-form-item label="比特率">
          <el-select v-model="convertForm.bitrate">
            <el-option label="320kbps" value="320" />
            <el-option label="256kbps" value="256" />
            <el-option label="192kbps" value="192" />
            <el-option label="128kbps" value="128" />
          </el-select>
        </el-form-item>
      </el-form>

      <el-upload
        drag
        multiple
        :auto-upload="false"
        accept="audio/*"
        @change="handleFileChange"
      >
        <el-icon><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽音频到此处或 <em>点击上传</em>
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
          <el-table-column prop="duration" label="时长" width="120">
            <template #default="{ row }">
              {{ formatDuration(row.duration) }}
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
  format: 'mp3',
  bitrate: '320'
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
    format: 'mp3',
    bitrate: '320'
  }
  fileList.value = []
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.mt-4 { margin-top: 16px; }
</style> 