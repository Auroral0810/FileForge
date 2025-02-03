<template>
  <div class="exif-clean">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>EXIF清理</span>
        </div>
      </template>

      <el-form :model="cleanForm" label-width="120px">
        <el-form-item label="清理选项">
          <el-checkbox-group v-model="cleanForm.options">
            <el-checkbox label="location">位置信息</el-checkbox>
            <el-checkbox label="device">设备信息</el-checkbox>
            <el-checkbox label="datetime">时间信息</el-checkbox>
            <el-checkbox label="software">软件信息</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="保留原文件">
          <el-switch v-model="cleanForm.keepOriginal" />
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
          <el-table-column prop="exif" label="EXIF信息" width="300">
            <template #default="{ row }">
              <el-popover
                placement="top-start"
                :title="row.name"
                :width="300"
                trigger="hover"
              >
                <template #default>
                  <div v-if="row.exif">
                    <p v-for="(value, key) in row.exif" :key="key">
                      {{ key }}: {{ value }}
                    </p>
                  </div>
                  <div v-else>无EXIF信息</div>
                </template>
                <template #reference>
                  <el-button size="small">查看EXIF</el-button>
                </template>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.status === 'success' ? 'success' : 'info'">
                {{ row.status === 'success' ? '已清理' : '待处理' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="actions mt-4">
        <el-button type="primary" @click="handleClean">开始清理</el-button>
        <el-button @click="resetForm">重置</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { formatFileSize } from '@/utils/file'

const cleanForm = ref({
  options: ['location', 'device'],
  keepOriginal: true
})

const fileList = ref<any[]>([])

const handleFileChange = (files: File[]) => {
  // TODO: 处理文件变化
}

const handleClean = () => {
  // TODO: 实现清理逻辑
}

const resetForm = () => {
  cleanForm.value = {
    options: ['location', 'device'],
    keepOriginal: true
  }
  fileList.value = []
}
</script>

<style scoped>
.mt-4 { margin-top: 16px; }
</style> 