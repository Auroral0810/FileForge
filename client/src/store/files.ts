import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFileStore = defineStore('files', () => {
  const files = ref<File[]>([])
  const processedFiles = ref<string[]>([])
  
  const addFiles = (newFiles: File[]) => {
    files.value = [...files.value, ...newFiles]
  }
  
  const clearFiles = () => {
    files.value = []
    processedFiles.value = []
  }
  
  const addProcessedFile = (filename: string) => {
    processedFiles.value.push(filename)
  }
  
  return {
    files,
    processedFiles,
    addFiles,
    clearFiles,
    addProcessedFile
  }
}) 