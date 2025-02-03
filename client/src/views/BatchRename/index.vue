<template>
  <div class="batch-rename">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>批量重命名 (共 {{ fileList.length }} 个文件)</span>
        </div>
      </template>

      <div class="filter-section">
        <div class="filter-row">
          <el-select v-model="filterForm.type" class="filter-item" placeholder="包含文件">
            <el-option label="包含文件" value="include" />
            <el-option label="排除文件" value="exclude" />
          </el-select>

          <el-select v-model="filterForm.field" class="filter-item" placeholder="文件名">
            <el-option label="文件名" value="filename" />
            <el-option label="后缀名" value="extension" label-zh="后缀名" />
            <el-option label="修改时间" value="lastModified" />
            <el-option label="文件大小" value="size" />
          </el-select>

          <template v-if="filterForm.field === 'lastModified'">
            <div class="datetime-group">
              <el-date-picker
                v-model="filterForm.startDate"
                type="datetime"
                placeholder="开始时间（可选）"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="date-picker"
                clearable
              />
              <span class="separator">至</span>
              <el-date-picker
                v-model="filterForm.endDate"
                type="datetime"
                placeholder="结束时间（可选）"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="date-picker"
                clearable
              />
            </div>
          </template>

          <template v-else-if="filterForm.field === 'size'">
            <el-select v-model="filterForm.condition" class="size-condition" placeholder="大于">
              <el-option label="大于" value="gt" />
              <el-option label="大于等于" value="gte" />
              <el-option label="小于" value="lt" />
              <el-option label="小于等于" value="lte" />
              <el-option label="等于" value="equals" />
            </el-select>
            <el-input-number 
              v-model="filterForm.sizeValue" 
              :min="0"
              class="size-input"
              controls-position="right"
            />
            <el-select v-model="filterForm.sizeUnit" class="unit-select">
              <el-option label="B" value="B" />
              <el-option label="KB" value="KB" />
              <el-option label="MB" value="MB" />
              <el-option label="GB" value="GB" />
              <el-option label="TB" value="TB" />
            </el-select>
          </template>

          <template v-else>
            <el-select v-model="filterForm.condition" class="filter-item" placeholder="包含">
              <el-option label="包含" value="contains" />
              <el-option label="不包含" value="notContains" />
              <el-option label="开始于" value="startsWith" />
              <el-option label="结束于" value="endsWith" />
              <el-option label="等于" value="equals" />
            </el-select>

            <el-input 
              v-model="filterForm.value" 
              class="filter-input" 
              placeholder="请输入" 
            />
          </template>

          <el-checkbox 
            v-if="filterForm.field !== 'lastModified' && filterForm.field !== 'size'" 
            v-model="filterForm.ignoreCase"
          >
            忽略大小写
          </el-checkbox>

          <el-button type="primary" @click="handleFilter">提交</el-button>
          <el-button type="warning" @click="clearFilters" :disabled="!activeFilters.length">
            <el-icon><delete /></el-icon>
            清除过滤
          </el-button>

          <el-tooltip 
            :content="filterForm.field === 'filename' ? '这里的文件名不包括扩展名' : filterForm.field === 'extension' ? '后缀名称支持模糊处理' : ''" 
            placement="top"
            v-if="filterForm.field === 'filename' || filterForm.field === 'extension'"
          >
            <el-icon class="help-icon"><question-filled /></el-icon>
          </el-tooltip>
        </div>

        <div class="filter-tags" v-if="activeFilters.length">
          <el-tag
            v-for="(filter, index) in activeFilters"
            :key="index"
            class="filter-tag"
            closable
            @close="removeFilter(index)"
          >
            [{{ filter.type === 'include' ? '包含文件' : '排除文件' }}] 
            {{ getFilterDescription(filter) }}
          </el-tag>
        </div>
      </div>

      <div class="process-section">
        <el-tabs v-model="activeProcessTab">
          <el-tab-pane name="replace">
            <template #label>
              <span class="tab-label">
                删除/替换字符
                <span v-if="processForm.replace.enabled" class="active-dot"></span>
              </span>
            </template>
            <el-form :model="processForm.replace" label-width="120px">
              <el-form-item>
                <el-checkbox v-model="processForm.replace.enabled">启用规则</el-checkbox>
                <el-checkbox v-model="processForm.replace.processExt" class="ml-4">同时处理后缀名</el-checkbox>
                <el-checkbox v-model="processForm.replace.ignoreCase" class="ml-4">忽略大小写</el-checkbox>
              </el-form-item>
              
              <el-form-item label="操作类型">
                <el-select v-model="processForm.replace.type" placeholder="请选择操作类型">
                  <el-option label="指定字符串" value="specific" />
                  <el-option label="前N个字符" value="frontN" />
                  <el-option label="后N个字符" value="backN" />
                  <el-option label="第M位置后的N个字符" value="positionMN" />
                  <el-option label="倒数M位置前的N个字符" value="reversePositionMN" />
                  <el-option label="XX字符串后面的所有字符" value="afterString" />
                  <el-option label="XX字符串前面的所有字符" value="beforeString" />
                  <el-option label="XX字符串后面的N个字符" value="afterStringN" />
                  <el-option label="XX字符串前面的N个字符" value="beforeStringN" />
                </el-select>
              </el-form-item>

              <!-- 根据不同的操作类型显示不同的输入框 -->
              <template v-if="['specific', 'afterString', 'beforeString'].includes(processForm.replace.type)">
                <el-form-item label="字符串">
                  <el-input 
                    v-model="processForm.replace.searchText" 
                    placeholder="请输入字符串的取值"
                  />
                </el-form-item>
              </template>

              <template v-if="['frontN', 'backN'].includes(processForm.replace.type)">
                <el-form-item label="字符数量">
                  <el-input-number 
                    v-model="processForm.replace.count" 
                    :min="1" 
                    :default-value="1"
                  />
                </el-form-item>
              </template>

              <template v-if="['positionMN', 'reversePositionMN'].includes(processForm.replace.type)">
                <el-form-item :label="processForm.replace.type === 'positionMN' ? '起始位置' : '倒数位置'">
                  <el-input-number 
                    v-model="processForm.replace.position" 
                    :min="1" 
                    :default-value="1"
                  />
                </el-form-item>
                <el-form-item label="字符数量">
                  <el-input-number 
                    v-model="processForm.replace.count" 
                    :min="1" 
                    :default-value="1"
                  />
                </el-form-item>
              </template>

              <template v-if="['afterStringN', 'beforeStringN'].includes(processForm.replace.type)">
                <el-form-item label="字符串">
                  <el-input 
                    v-model="processForm.replace.searchText" 
                    placeholder="请输入要查找的字符串"
                  />
                </el-form-item>
                <el-form-item label="字符数量">
                  <el-input-number 
                    v-model="processForm.replace.count" 
                    :min="1" 
                    :default-value="1"
                  />
                </el-form-item>
              </template>

              <el-form-item label="替换为">
                <el-input 
                  v-model="processForm.replace.replaceText" 
                  placeholder="请输入新字符串（如果是删除，则无需输入）"
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane name="insert">
            <template #label>
              <span class="tab-label">
                新增/插入字符
                <span v-if="processForm.insert.enabled" class="active-dot"></span>
              </span>
            </template>
            <el-form :model="processForm.insert" label-width="120px">
              <el-form-item>
                <el-checkbox v-model="processForm.insert.enabled">启用规则</el-checkbox>
                <el-checkbox v-model="processForm.insert.processExt" class="ml-4">同时处理后缀名</el-checkbox>
              </el-form-item>
              <el-form-item label="插入位置">
                <el-select v-model="processForm.insert.position">
                  <el-option label="文件名开头" value="start" />
                  <el-option label="文件名结尾" value="end" />
                  <el-option label="指定位置" value="custom" />
                </el-select>
                <el-input-number 
                  v-if="processForm.insert.position === 'custom'"
                  v-model="processForm.insert.customPosition"
                  :min="1"
                  class="ml-2"
                />
              </el-form-item>
              <el-form-item label="插入内容">
                <el-input v-model="processForm.insert.text" placeholder="请输入要插入的内容" />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane name="delete">
            <template #label>
              <span class="tab-label">
                删除字符
                <span v-if="processForm.delete.enabled" class="active-dot"></span>
              </span>
            </template>
            <el-form :model="processForm.delete" label-width="120px">
              <el-form-item>
                <el-checkbox v-model="processForm.delete.enabled">启用规则</el-checkbox>
                <el-checkbox v-model="processForm.delete.processExt" class="ml-4">同时处理后缀名</el-checkbox>
              </el-form-item>
              <el-form-item label="删除位置">
                <el-select v-model="processForm.delete.type">
                  <el-option label="删除前N个字符" value="start" />
                  <el-option label="删除后N个字符" value="end" />
                  <el-option label="删除指定位置" value="custom" />
                </el-select>
              </el-form-item>
              <el-form-item label="删除数量">
                <el-input-number v-model="processForm.delete.count" :min="1" />
              </el-form-item>
              <el-form-item v-if="processForm.delete.type === 'custom'" label="起始位置">
                <el-input-number v-model="processForm.delete.startPos" :min="1" />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane name="pad">
            <template #label>
              <span class="tab-label">
                补齐字符
                <span v-if="processForm.pad.enabled" class="active-dot"></span>
              </span>
            </template>
            <el-form :model="processForm.pad" label-width="120px">
              <el-form-item>
                <el-checkbox v-model="processForm.pad.enabled">启用规则</el-checkbox>
                <el-checkbox v-model="processForm.pad.processExt" class="ml-4">同时处理后缀名</el-checkbox>
              </el-form-item>
              <el-form-item label="对第">
                <el-input-number v-model="processForm.pad.startPos" :min="1" />
                <span class="ml-2">组数字进行补零操作，目标长度为：</span>
                <el-input-number v-model="processForm.pad.targetLength" :min="1" class="ml-2" />
              </el-form-item>
              <el-form-item label="填充字符">
                <el-input v-model="processForm.pad.fillChar" maxlength="1" style="width: 80px" />
                <span class="form-tip ml-2">1 / 1</span>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane name="sequence">
            <template #label>
              <span class="tab-label">
                序号补齐
                <span v-if="processForm.sequence.enabled" class="active-dot"></span>
              </span>
            </template>
            <el-form :model="processForm.sequence" label-width="120px">
              <el-form-item>
                <el-checkbox v-model="processForm.sequence.enabled">启用规则</el-checkbox>
                <el-checkbox v-model="processForm.sequence.processExt" class="ml-4">同时处理后缀名</el-checkbox>
              </el-form-item>
              <el-form-item label="起始序号">
                <el-input-number v-model="processForm.sequence.startNumber" :min="0" />
              </el-form-item>
              <el-form-item label="递增值">
                <el-input-number v-model="processForm.sequence.increment" :min="1" />
              </el-form-item>
              <el-form-item label="序号位数">
                <el-input-number v-model="processForm.sequence.digits" :min="1" />
              </el-form-item>
              <el-form-item label="序号位置">
                <el-radio-group v-model="processForm.sequence.position">
                  <el-radio label="prefix">前缀</el-radio>
                  <el-radio label="suffix">后缀</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="分隔符">
                <el-input v-model="processForm.sequence.separator" style="width: 80px" />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane name="newName">
            <template #label>
              <span class="tab-label">
                全新命名
                <span v-if="processForm.newName.enabled" class="active-dot"></span>
              </span>
            </template>
            <el-form :model="processForm.newName" label-width="120px">
              <el-form-item>
                <el-checkbox v-model="processForm.newName.enabled">启用规则</el-checkbox>
                <el-checkbox v-model="processForm.newName.processExt" class="ml-4">同时处理后缀名</el-checkbox>
              </el-form-item>
              <el-form-item label="命名模板">
                <el-input 
                  v-model="processForm.newName.template" 
                  placeholder="支持变量：{n}序号 {name}原名 {ext}扩展名"
                />
              </el-form-item>
              <el-form-item label="起始序号">
                <el-input-number v-model="processForm.newName.startNumber" :min="0" />
              </el-form-item>
              <el-form-item label="递增值">
                <el-input-number v-model="processForm.newName.increment" :min="1" />
              </el-form-item>
              <el-form-item label="序号位数">
                <el-input-number v-model="processForm.newName.digits" :min="1" />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane name="regex">
            <template #label>
              <span class="tab-label">
                正则替换
                <span v-if="processForm.regex.enabled" class="active-dot"></span>
              </span>
            </template>
            <el-form :model="processForm.regex" label-width="120px">
              <el-form-item>
                <el-checkbox v-model="processForm.regex.enabled">启用规则</el-checkbox>
                <el-checkbox v-model="processForm.regex.processExt" class="ml-4">同时处理后缀名</el-checkbox>
              </el-form-item>
              <el-form-item label="正则表达式">
                <el-input v-model="processForm.regex.pattern" placeholder="请输入正则表达式" />
              </el-form-item>
              <el-form-item label="替换内容">
                <el-input v-model="processForm.regex.replacement" placeholder="支持$1,$2等捕获组引用" />
              </el-form-item>
              <el-form-item>
                <el-checkbox v-model="processForm.regex.useGlobal">全局替换</el-checkbox>
                <el-checkbox v-model="processForm.regex.ignoreCase">忽略大小写</el-checkbox>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane name="customJS">
            <template #label>
              <span class="tab-label">
                自定义JS
                <span v-if="processForm.customJS.enabled" class="active-dot"></span>
              </span>
            </template>
            <el-form :model="processForm.customJS" label-width="120px">
              <el-form-item>
                <el-checkbox v-model="processForm.customJS.enabled">启用规则</el-checkbox>
                <el-checkbox v-model="processForm.customJS.processExt" class="ml-4">同时处理后缀名</el-checkbox>
              </el-form-item>
              <el-form-item label="自定义代码">
                <el-input
                  type="textarea"
                  v-model="processForm.customJS.code"
                  :rows="10"
                  placeholder="// 示例代码:
// return fileName.toUpperCase();
// 可用参数: fileName, index"
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="upload-area">
        <div 
          class="drop-zone"
          @drop.prevent="handleFileDrop"
          @dragover.prevent
        >
          <el-icon class="upload-icon"><upload-filled /></el-icon>
          <div class="upload-text">
            <p>拖拽文件/文件夹到此处</p>
            <p class="upload-tip">支持单个或多个文件、整个文件夹</p>
          </div>
          <div class="upload-buttons">
            <el-button 
              type="text" 
              class="upload-button"
              @click="handleFileSelect"
            >
              选择文件
            </el-button>
            <el-button 
              type="text" 
              class="upload-button"
              @click="handleFolderSelect"
            >
              选择文件夹
            </el-button>
          </div>
        </div>
      </div>

      <div class="view-options mt-4">
        <el-radio-group v-model="previewMode">
          <el-radio-button label="list">显示目录</el-radio-button>
          <el-radio-button label="preview">仅显示预览</el-radio-button>
          <el-radio-button label="affected">仅显示受影响文件</el-radio-button>
        </el-radio-group>
        <div class="selection-actions">
          <el-button 
            type="danger" 
            size="normal" 
            :disabled="!selectedFiles.length"
            @click="removeSelectedFiles"
          >
            删除选中文件
          </el-button>
        </div>
      </div>

      <div class="file-list-container mt-4">
        <el-table 
          :data="filteredFileList" 
          height="400"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="name" label="文件名" sortable />
          <template v-if="previewMode === 'list'">
            <el-table-column prop="path" label="目录" sortable />
            <el-table-column prop="newName" label="预览" sortable />
            <el-table-column prop="lastModified" label="修改时间" sortable>
              <template #default="{ row }">
                {{ formatDate(row.lastModified) }}
              </template>
            </el-table-column>
            <el-table-column prop="size" label="大小" sortable>
              <template #default="{ row }">
                {{ formatFileSize(row.size) }}
              </template>
            </el-table-column>
          </template>
          <template v-else-if="previewMode === 'preview'">
            <el-table-column prop="newName" label="预览" sortable />
            <el-table-column prop="size" label="大小" sortable>
              <template #default="{ row }">
                {{ formatFileSize(row.size) }}
              </template>
            </el-table-column>
          </template>
          <template v-else>
            <el-table-column prop="newName" label="预览" sortable />
            <el-table-column prop="lastModified" label="修改时间" sortable>
              <template #default="{ row }">
                {{ formatDate(row.lastModified) }}
              </template>
            </el-table-column>
            <el-table-column prop="size" label="大小" sortable>
              <template #default="{ row }">
                {{ formatFileSize(row.size) }}
              </template>
            </el-table-column>
          </template>
        </el-table>
      </div>

      <div class="actions mt-4">
        <div class="action-buttons">
          <el-button 
            type="primary" 
            class="action-button execute-btn"
            size="large"
            :icon="Check"
            @click="handleExecute"
          >
            执行
          </el-button>
          <el-button 
            class="action-button clear-btn"
            size="large"
            :icon="Delete"
            @click="handleClear"
          >
            清空
          </el-button>
          <el-button 
            class="action-button refresh-btn"
            size="large"
            :icon="Refresh"
            @click="handleRefresh"
          >
            刷新
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFileStore } from '@/store/files'
import { formatFileSize, formatDate } from '@/utils/file'
import { UploadFilled, QuestionFilled } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Check, Delete, Refresh } from '@element-plus/icons-vue'
import { RenameProcessor } from '@/utils/renameRules'

interface FileWithHandle {
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

interface FilterCondition {
  type: string
  field: string
  condition: string
  value: string | number
  ignoreCase?: boolean
  startDate?: string
  endDate?: string
  sizeValue?: number
  sizeUnit?: string
}

const fileStore = useFileStore()
const selectedFiles = ref<FileWithHandle[]>([])
const isProcessingSelected = ref(false)

const activeProcessTab = ref('replace')
const previewMode = ref('list')

const filterForm = ref({
  type: 'include',
  field: 'filename',
  condition: 'contains',
  value: '',
  ignoreCase: true,
  startDate: '',
  endDate: '',
  sizeValue: 0,
  sizeUnit: 'MB'
})

interface ReplaceRule {
  enabled: boolean
  processExt: boolean
  ignoreCase: boolean
  type: 'specific' | 'frontN' | 'backN' | 'positionMN' | 'reversePositionMN' | 
        'afterString' | 'beforeString' | 'afterStringN' | 'beforeStringN'
  searchText: string
  replaceText: string
  count: number
  position: number
}

interface ProcessForm {
  replace: ReplaceRule
  insert: {
    enabled: boolean
    processExt: boolean
    position: 'start' | 'end' | 'custom'
    customPosition: number
    text: string
  }
  delete: {
    enabled: boolean
    processExt: boolean
    type: 'start' | 'end' | 'custom'
    count: number
    startPos: number
  }
  pad: {
    enabled: boolean
    processExt: boolean
    startPos: number
    targetLength: number
    fillChar: string
  }
  sequence: {
    enabled: boolean
    processExt: boolean
    startNumber: number
    increment: number
    digits: number
    position: 'prefix' | 'suffix'
    separator: string
  }
  newName: {
    enabled: boolean
    processExt: boolean
    template: string
    startNumber: number
    increment: number
    digits: number
  }
  regex: {
    enabled: boolean
    processExt: boolean
    pattern: string
    replacement: string
    useGlobal: boolean
    ignoreCase: boolean
  }
  customJS: {
    enabled: boolean
    processExt: boolean
    code: string
  }
}

const processForm = ref<ProcessForm>({
  replace: {
    enabled: false,
    processExt: false,
    ignoreCase: false,
    type: 'specific',
    searchText: '',
    replaceText: '',
    count: 1,
    position: 1
  },
  insert: {
    enabled: false,
    processExt: false,
    position: 'start',
    customPosition: 1,
    text: ''
  },
  delete: {
    enabled: false,
    processExt: false,
    type: 'start',
    count: 1,
    startPos: 1
  },
  pad: {
    enabled: false,
    processExt: false,
    startPos: 1,
    targetLength: 2,
    fillChar: '0'
  },
  sequence: {
    enabled: false,
    processExt: false,
    startNumber: 1,
    increment: 1,
    digits: 3,
    position: 'prefix',
    separator: '_'
  },
  newName: {
    enabled: false,
    processExt: false,
    template: 'file_{n}',
    startNumber: 1,
    increment: 1,
    digits: 3
  },
  regex: {
    enabled: false,
    processExt: false,
    pattern: '',
    replacement: '',
    useGlobal: true,
    ignoreCase: false
  },
  customJS: {
    enabled: false,
    processExt: false,
    code: '// 在这里编写处理代码\nreturn fileName;'
  }
})

const activeFilters = ref<FilterCondition[]>([])

const fileList = computed(() => {
  return fileStore.files || []
})

const filteredFileList = ref<any[]>([])

const handleFileSelect = async () => {
  try {
    // 先让用户选择目录
    const dirHandle = await window.showDirectoryPicker()
    const files: FileWithHandle[] = []
    
    // 然后让用户选择该目录下的文件
    const fileHandles = await window.showOpenFilePicker({
      multiple: true,
      startIn: dirHandle
    })
    
    for (const handle of fileHandles) {
      const file = await handle.getFile()
      
      const fileWithHandle: FileWithHandle = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        handle: handle,
        path: dirHandle.name,  // 使用选择的目录名称
        arrayBuffer: () => file.arrayBuffer(),
        slice: (start?: number, end?: number) => file.slice(start, end),
        stream: () => file.stream(),
        text: () => file.text()
      }
      
      files.push(fileWithHandle)
    }

    handleFiles(files)
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('选择文件失败:', error)
      ElMessage.error('选择文件失败')
    }
  }
}

const handleFolderSelect = async () => {
  try {
    const dirHandle = await window.showDirectoryPicker()
    const files: FileWithHandle[] = []
    
    await traverseDirectory(dirHandle, dirHandle.name, files)
    handleFiles(files)
  } catch (error) {
    if (error.name !== 'AbortError') {  // 忽略用户取消操作
      console.error('选择文件夹失败:', error)
      ElMessage.error('选择文件夹失败')
    }
  }
}

const traverseDirectory = async (dirHandle: FileSystemDirectoryHandle, parentPath: string, files: FileWithHandle[]) => {
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      const file = await entry.getFile()
      
      const fileWithHandle: FileWithHandle = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        handle: entry,
        path: parentPath,
        arrayBuffer: () => file.arrayBuffer(),
        slice: (start?: number, end?: number) => file.slice(start, end),
        stream: () => file.stream(),
        text: () => file.text()
      }
      
      files.push(fileWithHandle)
    } else if (entry.kind === 'directory') {
      await traverseDirectory(entry, `${parentPath}/${entry.name}`, files)
    }
  }
}

const handleFileDrop = async (event: DragEvent) => {
  event.preventDefault()
  const items = event.dataTransfer?.items
  if (items) {
    try {
      const files: FileWithHandle[] = []
      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry()
        if (item) {
          await traverseFileTree(item, files)
        }
      }
      handleFiles(files)
    } catch (err) {
      console.error('处理拖放文件失败:', err)
    }
  }
}

const traverseFileTree = async (item: any, files: FileWithHandle[]) => {
  if (item.isFile) {
    const file = await new Promise<File>((resolve) => item.file(resolve))
    const fileWithHandle: FileWithHandle = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      handle: await item.getFileHandle()
    }
    files.push(fileWithHandle)
  } else if (item.isDirectory) {
    const dirReader = item.createReader()
    const entries = await new Promise<any[]>((resolve) => {
      dirReader.readEntries((entries: any[]) => resolve(entries))
    })
    for (const entry of entries) {
      await traverseFileTree(entry, files)
    }
  }
}

const handleFiles = async (files: FileWithHandle[]) => {
  const duplicateFiles: string[] = []
  const newFiles: FileWithHandle[] = []

  for (const file of files) {
    const isDuplicate = fileStore.files.some(existingFile => 
      existingFile.name === file.name && 
      existingFile.size === file.size &&
      existingFile.lastModified === file.lastModified
    )

    if (isDuplicate) {
      duplicateFiles.push(file.name)
    } else {
      // 确保文件有 path 属性
      if (!file.path) {
        file.path = '根目录'
      }
      newFiles.push(file)
    }
  }

  if (duplicateFiles.length > 0) {
    ElMessage.warning(`以下文件已存在：${duplicateFiles.join(', ')}`)
  }

  if (newFiles.length > 0) {
    fileStore.addFiles(newFiles)
    ElMessage.success(`成功添加 ${newFiles.length} 个文件`)
  }
  isProcessingSelected.value = false
}

const handleSelectionChange = (selection: FileWithHandle[]) => {
  selectedFiles.value = selection
}

const removeSelectedFiles = () => {
  const selectedNames = selectedFiles.value.map(file => file.name)
  const remainingFiles = fileStore.files.filter(file => !selectedNames.includes(file.name))
  fileStore.$patch({
    files: remainingFiles
  })
  selectedFiles.value = []
  isProcessingSelected.value = false
}

watch(() => fileStore.files, (newFiles) => {
  const files = isProcessingSelected.value ? selectedFiles.value : newFiles || []
  filteredFileList.value = files.map((file) => ({
    name: file.name,
    newName: file.name,
    size: file.size,
    type: file.type,
    path: file.path,
    lastModified: file.lastModified
  }))
}, { immediate: true })

watch(
  [processForm, activeFilters],
  () => {
    // 更新文件列表中的 newName
    filteredFileList.value = filteredFileList.value.map((file, index) => {
      const processor = new RenameProcessor(processForm.value)
      const newName = processor.processFileName(file.name, index)
      
      return {
        ...file,
        newName
      }
    })

    // 应用过滤条件
    filteredFileList.value = filteredFileList.value.filter(file => {
      return activeFilters.value.every(filter => {
        switch (filter.field) {
          case 'filename':
            return checkStringCondition(
              file.name.slice(0, file.name.lastIndexOf('.')),
              filter.value as string,
              filter.condition,
              filter.ignoreCase ?? false
            )
          case 'extension':
            const ext = file.name.slice(file.name.lastIndexOf('.') + 1)
            return checkStringCondition(
              ext,
              filter.value as string,
              filter.condition,
              filter.ignoreCase ?? false
            )
          case 'size':
            return checkSizeCondition(
              file.size,
              filter.sizeValue as number,
              filter.condition,
              filter.sizeUnit as string
            )
          case 'lastModified':
            return checkTimeCondition(file.lastModified, filter)
          default:
            return true
        }
      })
    })

    console.group('处理文件重命名')
    filteredFileList.value.forEach((file, index) => {
      console.log(`处理文件 ${index + 1}:`, {
        原文件名: file.name,
        新文件名: file.newName
      })
    })
    console.log('处理后的文件列表:', filteredFileList.value)
    console.groupEnd()
  },
  { deep: true }
)

// 检查字符串条件
const checkStringCondition = (value: string, pattern: string, condition: string, ignoreCase: boolean) => {
  if (ignoreCase) {
    value = value.toLowerCase()
    pattern = pattern.toLowerCase()
  }
  
  switch (condition) {
    case 'contains':
      return value.includes(pattern)
    case 'notContains':
      return !value.includes(pattern)
    case 'startsWith':
      return value.startsWith(pattern)
    case 'endsWith':
      return value.endsWith(pattern)
    case 'equals':
      return value === pattern
    default:
      return true
  }
}

// 检查大小条件
const checkSizeCondition = (fileSize: number, targetSize: number, condition: string, unit: string) => {
  const unitMultiplier = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024
  }
  
  const targetBytes = targetSize * unitMultiplier[unit as keyof typeof unitMultiplier]
  
  switch (condition) {
    case 'gt':
      return fileSize > targetBytes
    case 'gte':
      return fileSize >= targetBytes
    case 'lt':
      return fileSize < targetBytes
    case 'lte':
      return fileSize <= targetBytes
    case 'equals':
      return fileSize === targetBytes
    default:
      return true
  }
}

// 修改时间条件的处理逻辑
const handleFilter = () => {
  // 验证是否为空
  if (filterForm.value.field === 'size') {
    if (filterForm.value.sizeValue === undefined || filterForm.value.sizeValue === null) {
      ElMessage.warning('请输入文件大小值')
      return
    }
  } else if (filterForm.value.field === 'lastModified') {
    if (!filterForm.value.startDate && !filterForm.value.endDate) {
      ElMessage.warning('请至少选择一个时间')
      return
    }
    // 根据输入的时间设置对应的条件
    if (filterForm.value.startDate && filterForm.value.endDate) {
      filterForm.value.condition = 'between'
    } else if (filterForm.value.startDate) {
      filterForm.value.condition = 'after'
    } else {
      filterForm.value.condition = 'before'
    }
  } else if (!filterForm.value.value) {
    ElMessage.warning('请输入过滤条件的值')
    return
  }

  // 检查是否存在相同字段的条件
  const existingFilter = activeFilters.value.find(filter => 
    filter.field === filterForm.value.field
  )

  if (existingFilter) {
    const fieldMap: Record<string, string> = {
      'size': '文件大小',
      'lastModified': '修改时间',
      'filename': '文件名',
      'extension': '后缀名'
    }
    ElMessage.warning(`已存在${fieldMap[filterForm.value.field]}的过滤条件，请先删除原有条件`)
    return
  }

  // 创建新的过滤条件
  const newFilter: FilterCondition = {
    type: filterForm.value.type,
    field: filterForm.value.field,
    condition: filterForm.value.condition,
    value: filterForm.value.value,
    ignoreCase: filterForm.value.ignoreCase
  }

  if (filterForm.value.field === 'lastModified') {
    newFilter.startDate = filterForm.value.startDate
    newFilter.endDate = filterForm.value.endDate
  }

  activeFilters.value.push(newFilter)
  ElMessage.success('添加过滤条件成功')
}

// 修改文件过滤逻辑中的时间判断
const checkTimeCondition = (fileTime: number, filter: FilterCondition) => {
  const modTime = new Date(fileTime)
  
  switch (filter.condition) {
    case 'between':
      return modTime >= new Date(filter.startDate as string) &&
             modTime <= new Date(filter.endDate as string)
    case 'after':
      return modTime >= new Date(filter.startDate as string)
    case 'before':
      return modTime <= new Date(filter.endDate as string)
    default:
      return true
  }
}

// 修改过滤条件描述文本
const getFilterDescription = (filter: FilterCondition) => {
  switch (filter.field) {
    case 'size':
      return `文件${getSizeConditionText(filter.condition)}${filter.sizeValue}${filter.sizeUnit}`
    case 'lastModified':
      if (filter.condition === 'between') {
        return `修改时间在 ${filter.startDate} 至 ${filter.endDate} 之间`
      } else if (filter.condition === 'after') {
        return `修改时间在 ${filter.startDate} 之后`
      } else {
        return `修改时间在 ${filter.endDate} 之前`
      }
    default:
      return `${filter.field === 'filename' ? '文件名' : '后缀名'}${getConditionText(filter.condition)} "${filter.value}"${filter.ignoreCase ? ' (忽略大小写)' : ''}`
  }
}

const getSizeConditionText = (condition: string) => {
  const map: Record<string, string> = {
    'gt': '大于',
    'gte': '大于等于',
    'lt': '小于',
    'lte': '小于等于',
    'equals': '等于'
  }
  return map[condition] || condition
}

const getConditionText = (condition: string) => {
  const map: Record<string, string> = {
    'contains': '包含',
    'notContains': '不包含',
    'startsWith': '开始于',
    'endsWith': '结束于',
    'equals': '等于'
  }
  return map[condition] || condition
}

// 监听 field 变化，设置对应的默认条件
watch(() => filterForm.value.field, (newField) => {
  switch (newField) {
    case 'size':
      filterForm.value.condition = 'gt'
      break
    case 'lastModified':
      filterForm.value.condition = 'between'
      break
    default:
      filterForm.value.condition = 'contains'
      break
  }
})

// 清除所有过滤规则
const clearFilters = () => {
  // 清空过滤条件数组
  activeFilters.value = []
  
  // 重置过滤表单
  filterForm.value = {
    type: 'include',
    field: 'filename',
    condition: 'contains',
    value: '',
    ignoreCase: true,
    startDate: '',
    endDate: '',
    sizeValue: 0,
    sizeUnit: 'MB'
  }
  
  ElMessage.success('已清除所有过滤规则')
}

const handleExecute = async () => {
  try {
    if (!filteredFileList.value.length) {
      ElMessage.warning('没有可重命名的文件')
      return
    }

    const hasChanges = filteredFileList.value.some(file => file.name !== file.newName)
    if (!hasChanges) {
      ElMessage.warning('没有文件需要重命名')
      return
    }

    await ElMessageBox.confirm(
      '确定要执行重命名操作吗？此操作不可撤销',
      '确认重命名',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 请求目录权限
    const dirHandle = await window.showDirectoryPicker({
      mode: 'readwrite'
    })

    // 验证目录中是否存在所有待重命名的文件
    try {
      for (const file of filteredFileList.value) {
        if (file.name === file.newName) continue
        await dirHandle.getFileHandle(file.name)
      }
    } catch (error) {
      ElMessage.error('保存目录选择错误：目录中未找到待重命名的文件')
      return
    }

    const promises = filteredFileList.value.map(async (file) => {
      if (file.name === file.newName) return

      try {
        const oldFileHandle = await dirHandle.getFileHandle(file.name)
        const oldFile = await oldFileHandle.getFile()
        
        const newFileHandle = await dirHandle.getFileHandle(file.newName, { create: true })
        const writable = await newFileHandle.createWritable()
        
        await writable.write(await oldFile.arrayBuffer())
        await writable.close()
        
        await dirHandle.removeEntry(file.name)

        return {
          oldName: file.name,
          newName: file.newName,
          success: true
        }
      } catch (error) {
        console.error('重命名失败:', error)
        return {
          oldName: file.name,
          newName: file.newName,
          success: false,
          error
        }
      }
    })

    const results = await Promise.all(promises)
    const succeeded = results.filter(r => r && r.success).length
    const failed = results.filter(r => r && !r.success).length

    if (succeeded > 0) {
      ElMessage.success(`成功重命名 ${succeeded} 个文件`)
      fileStore.clearFiles()
    }
    if (failed > 0) {
      ElMessage.error(`${failed} 个文件重命名失败`)
    }

  } catch (error) {
    if (error !== 'cancel') {
      console.error('重命名操作失败:', error)
      ElMessage.error('重命名操作失败：' + error)
    }
  }
}

const handleClear = () => {
  ElMessageBox.confirm('确定要清空所有待处理的文件吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    fileStore.$patch({
      files: []
    })
    selectedFiles.value = []
    isProcessingSelected.value = false
    ElMessage.success('已清空所有文件')
  }).catch(() => {})
}

const handleRefresh = () => {
  fileStore.$patch({
    files: [...fileStore.files]
  })
  ElMessage.success('刷新成功')
}

const removeFilter = (index: number) => {
  const removedFilter = activeFilters.value[index]
  activeFilters.value.splice(index, 1)
  
  // 可选：清空对应的输入
  if (filterForm.value.field === removedFilter.field) {
    if (removedFilter.field === 'size') {
      filterForm.value.sizeValue = 0
    } else if (removedFilter.field === 'lastModified') {
      filterForm.value.startDate = ''
      filterForm.value.endDate = ''
    } else {
      filterForm.value.value = ''
    }
  }

  ElMessage.success('删除过滤条件成功')
}

declare global {
  interface Window {
    showOpenFilePicker: (options?: {
      multiple?: boolean;
      startIn?: FileSystemDirectoryHandle;
    }) => Promise<FileSystemFileHandle[]>;
    showDirectoryPicker: (options?: { 
      mode?: 'read' | 'readwrite' 
    }) => Promise<FileSystemDirectoryHandle>;
  }
  
  interface FileSystemDirectoryHandle {
    values: () => AsyncIterableIterator<FileSystemHandle>;
    getFileHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemFileHandle>;
    removeEntry: (name: string) => Promise<void>;
  }
  
  interface FileSystemFileHandle {
    getFile: () => Promise<File>;
    move: (newName: string) => Promise<void>;
    getParentDirectory: () => Promise<FileSystemDirectoryHandle | null>;
    createWritable: () => Promise<FileSystemWritableFileStream>;
    getParent: () => Promise<FileSystemDirectoryHandle | null>;
  }
  
  interface FileSystemHandle {
    kind: 'file' | 'directory';
    name: string;
  }

  interface FileSystemWritableFileStream extends WritableStream {
    write: (data: ArrayBuffer | Blob | string) => Promise<void>;
    close: () => Promise<void>;
  }
}

</script>

<style scoped>
.batch-rename {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-section {
  padding: 16px 0;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-item {
  width: 120px;
}

.filter-input {
  width: 200px;
}

.datetime-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-picker {
  width: 180px;
}

.separator {
  color: #606266;
}

.size-condition {
  width: 100px;
}

.size-input {
  width: 120px;
}

.unit-select {
  width: 80px;
}

.help-icon {
  color: #909399;
  cursor: pointer;
  font-size: 16px;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 2px;
}

:deep(.el-input__wrapper) {
  border-radius: 2px;
}

:deep(.el-button) {
  border-radius: 2px;
  height: 32px;
  padding: 0 16px;
}

:deep(.el-checkbox) {
  margin-right: 8px;
}

.process-section {
  margin: 20px 0;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.upload-area {
  margin: 20px 0;
}

.drop-zone {
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  padding: 40px 0;
  text-align: center;
  transition: all 0.3s;
}

.drop-zone:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.upload-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 16px;
}

.upload-text {
  color: #606266;
}

.upload-text p {
  margin: 4px 0;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

.upload-buttons {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.upload-button {
  font-size: 14px;
  color: var(--el-color-primary);
}

.upload-button:hover {
  color: var(--el-color-primary-light-3);
}

.file-list-container {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.mt-4 { margin-top: 16px; }

.view-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selection-actions {
  display: flex;
  gap: 8px;
}

.actions {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 32px;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.action-button {
  min-width: 120px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.execute-btn {
  background: var(--el-color-primary);
  border: none;
}

.execute-btn:hover {
  background: var(--el-color-primary-light-3);
}

.clear-btn {
  color: var(--el-color-danger);
  border-color: var(--el-color-danger);
}

.clear-btn:hover {
  color: #fff;
  background: var(--el-color-danger);
  border-color: var(--el-color-danger);
}

.refresh-btn {
  color: var(--el-color-info);
  border-color: var(--el-color-info);
}

.refresh-btn:hover {
  color: #fff;
  background: var(--el-color-info);
  border-color: var(--el-color-info);
}

.filter-tags {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  display: flex;
  align-items: center;
  background-color: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
}

.filter-tag :deep(.el-tag__close) {
  color: #67c23a;
}

.filter-tag :deep(.el-tag__close:hover) {
  background-color: #67c23a;
  color: #fff;
}

.el-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.el-button [class*="el-icon"] {
  font-size: 16px;
}

/* 当按钮禁用时的样式 */
.el-button.is-disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.ml-4 {
  margin-left: 16px;
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.active-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #67C23A;
  display: inline-block;
}
</style>