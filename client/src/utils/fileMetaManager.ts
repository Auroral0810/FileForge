interface FileMeta {
  handle: FileSystemFileHandle;
  originalName: string;
  newName?: string;
  status: 'pending' | 'processing' | 'renamed';
  size: number;
  modifyTime: number;
}

export class FileMetaManager {
  private fileMap = new Map<string, FileMeta>();
  
  async addFiles(handles: FileSystemFileHandle[]) {
    for (const handle of handles) {
      const file = await handle.getFile();
      this.fileMap.set(handle.name, {
        handle,
        originalName: handle.name,
        status: 'pending',
        size: file.size,
        modifyTime: file.lastModified
      });
    }
  }

  getFileMeta(path: string): FileMeta | undefined {
    return this.fileMap.get(path);
  }

  getAllFiles(): FileMeta[] {
    return Array.from(this.fileMap.values());
  }

  updateStatus(path: string, status: FileMeta['status'], newName?: string) {
    const meta = this.fileMap.get(path);
    if (meta) {
      meta.status = status;
      if (newName) meta.newName = newName;
    }
  }
} 