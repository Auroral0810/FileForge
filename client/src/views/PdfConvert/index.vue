<template>
  <div class="pdf-convert">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>PDF 转换</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="PDF转图片" name="toImage">
          <el-form :model="pdfToImageForm" label-width="120px">
            <el-form-item label="输出格式">
              <el-select v-model="pdfToImageForm.format">
                <el-option label="PNG" value="png" />
                <el-option label="JPEG" value="jpeg" />
              </el-select>
            </el-form-item>
            <el-form-item label="DPI">
              <el-input-number v-model="pdfToImageForm.dpi" :min="72" :max="600" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="图片转PDF" name="toPdf">
          <el-form :model="imageToPdfForm" label-width="120px">
            <el-form-item label="页面大小">
              <el-select v-model="imageToPdfForm.pageSize">
                <el-option label="A4" value="a4" />
                <el-option label="A3" value="a3" />
                <el-option label="自适应" value="auto" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <el-upload
        drag
        multiple
        :auto-upload="false"
        :accept="activeTab === 'toImage' ? '.pdf' : 'image/*'"
        @change="handleFileChange"
      >
        <el-icon><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
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

const activeTab = ref('toImage')

const pdfToImageForm = ref({
  format: 'png',
  dpi: 300
})

const imageToPdfForm = ref({
  pageSize: 'a4'
})

const fileList = ref<any[]>([])

const handleFileChange = (files: File[]) => {
  // TODO: 处理文件变化
}

const handleConvert = () => {
  // TODO: 实现转换逻辑
}

const resetForm = () => {
  if (activeTab.value === 'toImage') {
    pdfToImageForm.value = {
      format: 'png',
      dpi: 300
    }
  } else {
    imageToPdfForm.value = {
      pageSize: 'a4'
    }
  }
  fileList.value = []
}
</script>

<style scoped>
.mt-4 { margin-top: 16px; }
</style> 