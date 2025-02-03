export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

export const generateNewFileName = (
  originalName: string,
  options: {
    prefix?: string
    suffix?: string
    sequence?: number
    sequenceDigits?: number
  }
): string => {
  const { prefix = '', suffix = '', sequence, sequenceDigits = 3 } = options
  const ext = getFileExtension(originalName)
  const nameWithoutExt = originalName.slice(0, -(ext.length + 1))
  
  let newName = `${prefix}${nameWithoutExt}${suffix}`
  if (sequence !== undefined) {
    newName += '_' + String(sequence).padStart(sequenceDigits, '0')
  }
  return `${newName}.${ext}`
}

export const formatDate = (date: Date | number | string): string => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}