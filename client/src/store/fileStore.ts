import { defineStore } from 'pinia'
import type { FileWithHandle } from '@/types/files'

export const useFileStore = defineStore('file', {
  state: () => ({
    files: [] as FileWithHandle[],
    processedFiles: [] as string[]
  }),
  actions: {
    addFiles(files: FileWithHandle[]) {
      this.files.push(...files)
    },
    clearFiles() {
      this.files = []
      this.processedFiles = []
    },
    addProcessedFile(filename: string) {
      this.processedFiles.push(filename)
    }
  }
}) 