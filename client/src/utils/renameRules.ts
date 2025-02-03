export interface RenameRule {
  type: string;
  enabled: boolean;
  processExt: boolean;
  ignoreCase: boolean;
  processFileName: (fileName: string, index: number) => string;
}

// 序号补齐规则
export interface SequenceRule extends RenameRule {
  type: 'sequence';
  startNumber: number;
  increment: number;
  digits: number;
  position: 'prefix' | 'suffix';
  separator: string;
}

// 全新命名规则
export interface NewNameRule extends RenameRule {
  type: 'newName';
  template: string;
  startNumber: number;
  increment: number;
  digits: number;
}

// 正则替换规则
export interface RegexRule extends RenameRule {
  type: 'regex';
  pattern: string;
  replacement: string;
  useGlobal: boolean;
  ignoreCase: boolean;
}

// 自定义JS规则
export interface CustomJSRule extends RenameRule {
  type: 'customJS';
  code: string;
}

export interface ReplaceRule {
  enabled: boolean
  processExt: boolean
  type: 'specific' | 'frontN' | 'backN' | 'positionMN' | 'reversePositionMN' | 
        'afterString' | 'beforeString' | 'afterStringN' | 'beforeStringN'
  searchText: string
  replaceText: string
  count: number
  position: number
}

interface ProcessForm {
  replace: {
    enabled: boolean
    processExt: boolean
    type: string
    searchText: string
    replaceText: string
    count: number
    position: number
    ignoreCase: boolean
  }
  // ... other process form interfaces
}

export class RenameProcessor {
  private form: ProcessForm

  constructor(form: ProcessForm) {
    this.form = form
  }

  processFileName(fileName: string, _index: number): string {
    const { name, extension } = this.getFileNameParts(fileName)
    let newName = name
    let newExtension = extension

    if (this.form.replace.enabled) {
      let processedName = name
      let processedExt = extension.slice(1) // 移除前导点号

      switch (this.form.replace.type) {
        case 'specific':
          const flags = this.form.replace.ignoreCase ? 'gi' : 'g'
          const regex = new RegExp(this.form.replace.searchText, flags)
          processedName = name.replace(regex, this.form.replace.replaceText)
          if (this.form.replace.processExt && extension) {
            processedExt = extension.slice(1).replace(regex, this.form.replace.replaceText)
          }
          break

        case 'frontN':
          processedName = this.form.replace.replaceText + name.slice(this.form.replace.count)
          if (this.form.replace.processExt && extension) {
            processedExt = this.form.replace.replaceText + processedExt.slice(this.form.replace.count)
          }
          break

        case 'backN':
          processedName = name.slice(0, -this.form.replace.count) + this.form.replace.replaceText
          if (this.form.replace.processExt && extension) {
            processedExt = processedExt.slice(0, -this.form.replace.count) + this.form.replace.replaceText
          }
          break

        case 'positionMN':
          const startPos = this.form.replace.position - 1
          processedName = name.slice(0, startPos) + 
                         this.form.replace.replaceText + 
                         name.slice(startPos + this.form.replace.count)
          if (this.form.replace.processExt && extension) {
            processedExt = processedExt.slice(0, startPos) + 
                          this.form.replace.replaceText + 
                          processedExt.slice(startPos + this.form.replace.count)
          }
          break

        case 'reversePositionMN':
          const revStartPos = name.length - this.form.replace.position
          processedName = name.slice(0, revStartPos) + 
                         this.form.replace.replaceText + 
                         name.slice(revStartPos + this.form.replace.count)
          if (this.form.replace.processExt && extension) {
            const extRevStartPos = processedExt.length - this.form.replace.position
            processedExt = processedExt.slice(0, extRevStartPos) + 
                          this.form.replace.replaceText + 
                          processedExt.slice(extRevStartPos + this.form.replace.count)
          }
          break

        case 'afterString':
          const afterIdx = this.form.replace.ignoreCase 
            ? name.toLowerCase().indexOf(this.form.replace.searchText.toLowerCase())
            : name.indexOf(this.form.replace.searchText)
          if (afterIdx !== -1) {
            processedName = name.slice(0, afterIdx + this.form.replace.searchText.length) + 
                          this.form.replace.replaceText
          }
          if (this.form.replace.processExt && extension) {
            const extAfterIdx = this.form.replace.ignoreCase 
              ? processedExt.toLowerCase().indexOf(this.form.replace.searchText.toLowerCase())
              : processedExt.indexOf(this.form.replace.searchText)
            if (extAfterIdx !== -1) {
              processedExt = processedExt.slice(0, extAfterIdx + this.form.replace.searchText.length) + 
                            this.form.replace.replaceText
            }
          }
          break

        case 'beforeString':
          const beforeIdx = this.form.replace.ignoreCase 
            ? name.toLowerCase().indexOf(this.form.replace.searchText.toLowerCase())
            : name.indexOf(this.form.replace.searchText)
          if (beforeIdx !== -1) {
            processedName = this.form.replace.replaceText + name.slice(beforeIdx)
          }
          if (this.form.replace.processExt && extension) {
            const extBeforeIdx = this.form.replace.ignoreCase 
              ? processedExt.toLowerCase().indexOf(this.form.replace.searchText.toLowerCase())
              : processedExt.indexOf(this.form.replace.searchText)
            if (extBeforeIdx !== -1) {
              processedExt = this.form.replace.replaceText + processedExt.slice(extBeforeIdx)
            }
          }
          break

        case 'afterStringN':
          const afterNIdx = this.form.replace.ignoreCase 
            ? name.toLowerCase().indexOf(this.form.replace.searchText.toLowerCase())
            : name.indexOf(this.form.replace.searchText)
          if (afterNIdx !== -1) {
            const startIdx = afterNIdx + this.form.replace.searchText.length
            processedName = name.slice(0, startIdx) + 
                          this.form.replace.replaceText + 
                          name.slice(startIdx + this.form.replace.count)
          }
          if (this.form.replace.processExt && extension) {
            const extAfterNIdx = this.form.replace.ignoreCase 
              ? processedExt.toLowerCase().indexOf(this.form.replace.searchText.toLowerCase())
              : processedExt.indexOf(this.form.replace.searchText)
            if (extAfterNIdx !== -1) {
              const extStartIdx = extAfterNIdx + this.form.replace.searchText.length
              processedExt = processedExt.slice(0, extStartIdx) + 
                            this.form.replace.replaceText + 
                            processedExt.slice(extStartIdx + this.form.replace.count)
            }
          }
          break

        case 'beforeStringN':
          const beforeNIdx = this.form.replace.ignoreCase 
            ? name.toLowerCase().indexOf(this.form.replace.searchText.toLowerCase())
            : name.indexOf(this.form.replace.searchText)
          if (beforeNIdx !== -1) {
            processedName = name.slice(0, beforeNIdx - this.form.replace.count) + 
                          this.form.replace.replaceText + 
                          name.slice(beforeNIdx)
          }
          if (this.form.replace.processExt && extension) {
            const extBeforeNIdx = this.form.replace.ignoreCase 
              ? processedExt.toLowerCase().indexOf(this.form.replace.searchText.toLowerCase())
              : processedExt.indexOf(this.form.replace.searchText)
            if (extBeforeNIdx !== -1) {
              processedExt = processedExt.slice(0, extBeforeNIdx - this.form.replace.count) + 
                            this.form.replace.replaceText + 
                            processedExt.slice(extBeforeNIdx)
            }
          }
          break
      }

      newName = processedName
      if (extension) {
        newExtension = this.form.replace.processExt ? `.${processedExt}` : extension
      }
    }

    return newName + newExtension
  }

  private getFileNameParts(fileName: string) {
    const lastDotIndex = fileName.lastIndexOf('.')
    if (lastDotIndex === -1) {
      return { name: fileName, extension: '' }
    }
    return {
      name: fileName.substring(0, lastDotIndex),
      extension: fileName.substring(lastDotIndex)
    }
  }

  // 辅助方法
    // @ts-ignore
  private static processInsert(name: string, rule: any): string {
    switch (rule.position) {
      case 'start':
        return rule.text + name;
      case 'end':
        return name + rule.text;
      case 'custom':
        const pos = Math.min(rule.customPosition, name.length);
        return name.slice(0, pos) + rule.text + name.slice(pos);
      default:
        return name;
    }
  }
  // @ts-ignore
  private static processDelete(name: string, rule: any): string {
    switch (rule.type) {
      case 'start':
        return name.slice(rule.count);
      case 'end':
        return name.slice(0, -rule.count);
      case 'custom':
        return name.slice(0, rule.startPos - 1) + 
               name.slice(rule.startPos - 1 + rule.count);
      default:
        return name;
    }
  }
  // @ts-ignore
  private static processPad(name: string, rule: any): string {
    // 查找第n组数字并补齐
    const regex = /\d+/g;
    let count = 0;
    return name.replace(regex, (match) => {
      count++;
      if (count === rule.startPos) {
        return match.padStart(rule.targetLength, rule.fillChar || '0');
      }
      return match;
    });
  }
  // @ts-ignore
  private static processSequence(name: string, rule: any, index: number): string {
    const number = (rule.startNumber + index * rule.increment)
      .toString()
      .padStart(rule.digits, '0');
    
    return rule.position === 'prefix' ?
      `${number}${rule.separator}${name}` :
      `${name}${rule.separator}${number}`;
  }
  // @ts-ignore
  private static processNewName(name: string, rule: any, index: number, ext: string): string {
    const number = (rule.startNumber + index * rule.increment)
      .toString()
      .padStart(rule.digits, '0');
    
    return rule.template
      .replace(/{n}/g, number)
      .replace(/{name}/g, name)
      .replace(/{ext}/g, ext.slice(1));
  }

  // @ts-ignore
  private static processRegex(name: string, rule: any): string {
    try {
      const flags = `${rule.ignoreCase ? 'i' : ''}${rule.useGlobal ? 'g' : ''}`;
      const regex = new RegExp(rule.pattern, flags);
      return name.replace(regex, rule.replacement);
    } catch (error) {
      console.error('正则表达式错误:', error);
      return name;
    }
  }
  // @ts-ignore
  private static processCustomJS(name: string, rule: any, index: number): string {
    try {
      const fn = new Function('fileName', 'index', rule.code);
      return fn(name, index) || name;
    } catch (error) {
      console.error('自定义JS执行错误:', error);
      return name;
    }
  }

  // 辅助函数：转义正则表达式特殊字符
    // @ts-ignore
  private static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
} 