import type { FileMeta } from '@/utils/fileMetaManager';

// 定义消息类型
type WorkerMessage = {
  type: 'rename' | 'validate' | 'checkConflicts';
  payload: any;
};

// 处理重命名规则的计算
const processRenameRules = (file: any, rules: any) => {
  let newName = file.name;
  
  // 处理各种重命名规则
  if (rules.replace?.enabled) {
    // 替换规则处理
    newName = processReplaceRule(newName, rules.replace);
  }
  
  if (rules.insert?.enabled) {
    // 插入规则处理
    newName = processInsertRule(newName, rules.insert);
  }
  
  // ... 其他规则处理
  
  return newName;
};

// 处理文件名冲突检测
const checkNameConflicts = (files: any[]) => {
  const nameSet = new Set();
  const conflicts = [];
  
  for (const file of files) {
    if (nameSet.has(file.newName)) {
      conflicts.push(file);
    }
    nameSet.add(file.newName);
  }
  
  return conflicts;
};

// 监听主线程消息
self.addEventListener('message', async (e: MessageEvent<WorkerMessage>) => {
  const { type, payload } = e.data;
  
  switch (type) {
    case 'rename':
      try {
        const { files, rules } = payload;
        const results = files.map(file => ({
          ...file,
          newName: processRenameRules(file, rules)
        }));
        self.postMessage({ type: 'renameResults', payload: results });
      } catch (error) {
        self.postMessage({ type: 'error', payload: error });
      }
      break;
      
    case 'validate':
      try {
        const { files, rules } = payload;
        const validationResults = files.map(file => ({
          file,
          isValid: validateFileName(file.newName)
        }));
        self.postMessage({ type: 'validationResults', payload: validationResults });
      } catch (error) {
        self.postMessage({ type: 'error', payload: error });
      }
      break;
      
    case 'checkConflicts':
      try {
        const { files } = payload;
        const conflicts = checkNameConflicts(files);
        self.postMessage({ type: 'conflictsResult', payload: conflicts });
      } catch (error) {
        self.postMessage({ type: 'error', payload: error });
      }
      break;
  }
});

// 防止 TypeScript 报错
export {}; 