import { defineStore } from 'pinia'
// import { ref } from 'vue'

export interface FileWithHandle {
  name: string
  size: number
  type: string
  lastModified: number
  handle?: FileSystemFileHandle
  path: string
  arrayBuffer: () => Promise<ArrayBuffer>
  slice: (start?: number, end?: number) => Blob
  stream: () => ReadableStream
  text: () => Promise<string>
}

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