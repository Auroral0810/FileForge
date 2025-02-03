<template>
  <div class="file-list">
    <el-table :data="files" style="width: 100%">
      <el-table-column prop="name" label="文件名" />
      <el-table-column prop="newName" label="新文件名" v-if="showNewName" />
      <el-table-column prop="size" label="大小" width="120">
        <template #default="{ row }">
          {{ formatFileSize(row.size) }}
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="120" />
      <el-table-column label="操作" width="150" v-if="$slots.operation">
        <template #default="scope">
          <slot name="operation" :row="scope.row" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { formatFileSize } from '@/utils/file'

interface FileItem {
  name: string
  newName?: string
  size: number
  type: string
}

defineProps<{
  files: FileItem[]
  showNewName?: boolean
}>()
</script> 