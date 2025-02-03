import { ref } from 'vue'
import { useFileStore } from '@/store/files'

export function useFileUpload() {
  const fileStore = useFileStore()
  const uploading = ref(false)
  const progress = ref(0)
  
  const handleFileChange = (files: File[]) => {
    fileStore.addFiles(files)
  }
  
  const resetUpload = () => {
    uploading.value = false
    progress.value = 0
    fileStore.clearFiles()
  }
  
  return {
    uploading,
    progress,
    handleFileChange,
    resetUpload
  }
} 