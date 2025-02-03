export interface FileWithHandle {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  handle?: FileSystemFileHandle;
  path: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
  slice: (start?: number, end?: number) => Blob;
  stream: () => ReadableStream;
  text: () => Promise<string>;
} 