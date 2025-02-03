import { defineStore } from 'pinia'
import type { ProcessedFile } from '@/types/files'

export const useFileStore = defineStore('file', {
  state: () => ({
    files: [] as ProcessedFile[]
  }),

  getters: {
    // 获取可以传递给 Worker 的数据
    workerData(): any[] {
      return this.files.map(file => ({
        name: file.name,
        newName: file.newName,
        path: file.path,
        directory: file.directory,
        size: file.size,
        lastModified: file.lastModified,
        type: file.type
      }))
    }
  },

  actions: {
    async addFiles(files: File[]) {
      const processedFiles: ProcessedFile[] = files.map(file => ({
        name: file.name,
        newName: file.name,
        path: file.path || '',
        directory: file.path || '',
        size: file.size,
        lastModified: file.lastModified,
        type: file.type
      }))

      this.files = [...this.files, ...processedFiles]
    },

    clearFiles() {
      this.files = []
    },

    updateFileName(index: number, newName: string) {
      if (this.files[index]) {
        this.files[index].newName = newName
      }
    }
  }
}) 