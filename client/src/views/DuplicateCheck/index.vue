<template>
  <div class="duplicate-check">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>重复文件检查</span>
        </div>
      </template>

      <el-form :model="checkForm" label-width="120px">
        <el-form-item label="检查方式">
          <el-radio-group v-model="checkForm.mode">
            <el-radio label="hash">哈希值比对</el-radio>
            <el-radio label="content">内容比对</el-radio>
            <el-radio label="name">文件名比对</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

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

      <div class="file-list mt-4">
        <el-collapse v-if="duplicateGroups.length">
          <el-collapse-item 
            v-for="(group, index) in duplicateGroups" 
            :key="index"
            :title="`重复组 ${index + 1} (${group.files.length} 个文件)`"
          >
            <el-table :data="group.files">
              <el-table-column prop="name" label="文件名" />
              <el-table-column prop="path" label="路径" />
              <el-table-column prop="size" label="大小" width="120">
                <template #default="{ row }">
                  {{ formatFileSize(row.size) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </div>

      <div class="actions mt-4">
        <el-button type="primary" @click="handleCheck">开始检查</el-button>
        <el-button @click="resetForm">重置</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { formatFileSize } from '@/utils/file'

const checkForm = ref({
  mode: 'hash'
})

const fileList = ref<any[]>([])
const duplicateGroups = ref<any[]>([])

const handleFileChange = (files: File[]) => {
  // TODO: 处理文件变化
}

const handleCheck = () => {
  // TODO: 实现检查逻辑
}

const handleDelete = (file: any) => {
  // TODO: 实现删除逻辑
}

const resetForm = () => {
  checkForm.value = {
    mode: 'hash'
  }
  fileList.value = []
  duplicateGroups.value = []
}
</script>

<style scoped>
.mt-4 { margin-top: 16px; }
</style> 