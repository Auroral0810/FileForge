import { defineStore } from 'pinia'
// import type { FileWithHandle } from './fileStore'

interface HistoryRecord {
  files: Array<{
    oldName: string
    newName: string
  }>
  timestamp: number
}

export const useHistoryStore = defineStore('history', {
  state: () => ({
    undoStack: [] as HistoryRecord[],
    redoStack: [] as HistoryRecord[]
  }),

  actions: {
    addRecord(files: Array<{ oldName: string, newName: string }>) {
      this.undoStack.push({
        files,
        timestamp: Date.now()
      })
      this.redoStack = [] // 清空重做栈
    },

    async undo() {
      if (this.undoStack.length === 0) return null
      const record = this.undoStack.pop()!
      this.redoStack.push(record)
      return record
    },

    async redo() {
      if (this.redoStack.length === 0) return null
      const record = this.redoStack.pop()!
      this.undoStack.push(record)
      return record
    },

    clear() {
      this.undoStack = []
      this.redoStack = []
    }
  }
}) 