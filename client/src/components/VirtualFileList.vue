<template>
  <div class="virtual-list-wrapper">
    <!-- 表头 -->
    <div class="virtual-list-header">
      <el-row :gutter="0" align="middle">
        <el-col :span="1" class="checkbox-cell">
          <el-checkbox 
            v-model="isAllSelected"
            :indeterminate="isIndeterminate"
            @change="handleSelectAll"
          />
        </el-col>
        <el-col :span="1" class="index-header">序号</el-col>
        <!-- 目录列 -->
        <template v-if="showPath">
          <el-col :span="6" class="header-cell" @click="handleSort('path')">
            <span>目录</span>
            <div class="sort-indicators">
              <el-icon 
                :class="[
                  'sort-caret ascending',
                  { active: sortConfig?.prop === 'path' && sortConfig?.order === 'ascending' }
                ]"
              >
                <ArrowUp />
              </el-icon>
              <el-icon 
                :class="[
                  'sort-caret descending',
                  { active: sortConfig?.prop === 'path' && sortConfig?.order === 'descending' }
                ]"
              >
                <ArrowDown />
              </el-icon>
            </div>
          </el-col>
        </template>
        <el-col :span="showPath ? 5 : 8" class="header-cell" @click="handleSort('name')">
          <span>原文件名</span>
          <div class="sort-indicators">
            <el-icon 
              :class="[
                'sort-caret ascending',
                { active: sortConfig?.prop === 'name' && sortConfig?.order === 'ascending' }
              ]"
            >
              <ArrowUp />
            </el-icon>
            <el-icon 
              :class="[
                'sort-caret descending',
                { active: sortConfig?.prop === 'name' && sortConfig?.order === 'descending' }
              ]"
            >
              <ArrowDown />
            </el-icon>
          </div>
        </el-col>
        <el-col :span="showPath ? 5 : 8" class="header-cell" @click="handleSort('newName')">
          <span>新文件名</span>
          <div class="sort-indicators">
            <el-icon 
              :class="[
                'sort-caret ascending',
                { active: sortConfig?.prop === 'newName' && sortConfig?.order === 'ascending' }
              ]"
            >
              <ArrowUp />
            </el-icon>
            <el-icon 
              :class="[
                'sort-caret descending',
                { active: sortConfig?.prop === 'newName' && sortConfig?.order === 'descending' }
              ]"
            >
              <ArrowDown />
            </el-icon>
          </div>
        </el-col>
        <el-col :span="2" class="header-cell" @click="handleSort('size')">
          <span>大小</span>
          <div class="sort-indicators">
            <el-icon 
              :class="[
                'sort-caret ascending',
                { active: sortConfig?.prop === 'size' && sortConfig?.order === 'ascending' }
              ]"
            >
              <ArrowUp />
            </el-icon>
            <el-icon 
              :class="[
                'sort-caret descending',
                { active: sortConfig?.prop === 'size' && sortConfig?.order === 'descending' }
              ]"
            >
              <ArrowDown />
            </el-icon>
          </div>
        </el-col>
        <el-col :span="4" class="header-cell date-header" @click="handleSort('lastModified')">
          <span>修改时间</span>
          <div class="sort-indicators">
            <el-icon 
              :class="[
                'sort-caret ascending',
                { active: sortConfig?.prop === 'lastModified' && sortConfig?.order === 'ascending' }
              ]"
            >
              <ArrowUp />
            </el-icon>
            <el-icon 
              :class="[
                'sort-caret descending',
                { active: sortConfig?.prop === 'lastModified' && sortConfig?.order === 'descending' }
              ]"
            >
              <ArrowDown />
            </el-icon>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 列表内容 -->
    <div 
      ref="containerRef"
      class="virtual-list-container"
      @scroll="handleScroll"
    >
      <div 
        class="virtual-list-phantom"
        :style="{ height: `${totalHeight}px` }"
      ></div>
      <div
        class="virtual-list-content"
        :style="{ transform: `translateY(${startOffset}px)` }"
      >
        <div
          v-for="(item, index) in visibleData"
          :key="item.path || item.name"
          class="virtual-list-item"
          :class="{ 'changed-file': item.name !== item.newName }"
        >
          <el-row :gutter="0" align="middle">
            <el-col :span="1" class="checkbox-cell">
              <el-checkbox 
                v-model="selectedFiles" 
                :value="item"
                @change="(val) => handleSelectionChange(val, item)"
              />
            </el-col>
            <el-col :span="1" class="index-cell">{{ visibleRange.start + index + 1 }}</el-col>
            <!-- 目录列 -->
            <template v-if="showPath">
              <el-col :span="6" class="directory-cell">
                <el-tooltip 
                  :content="getDirectory(item)"
                  placement="top"
                  :show-after="500"
                >
                  <span class="ellipsis-text">{{ getDirectory(item) }}</span>
                </el-tooltip>
              </el-col>
            </template>
            <el-col :span="showPath ? 5 : 8" class="filename-cell">
              <el-tooltip 
                :content="getFileName(item)"
                placement="top"
                :show-after="500"
              >
                <span class="ellipsis-text">{{ getFileName(item) }}</span>
              </el-tooltip>
            </el-col>
            <el-col :span="showPath ? 5 : 8" class="new-filename-cell">
              <el-tooltip 
                :content="item.newName || item.name"
                placement="top"
                :show-after="500"
              >
                <span class="ellipsis-text" :class="{ 'changed-name': item.name !== item.newName }">
                  {{ item.newName || item.name }}
                </span>
              </el-tooltip>
            </el-col>
            
            <el-col :span="2" class="size-cell">
              {{ formatFileSize(item.size) }}
            </el-col>
            <el-col :span="4" class="date-cell">
              {{ formatDate(item.lastModified) }}
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { formatFileSize, formatDate } from '@/utils/file'
import type { ProcessedFile } from '@/types/files'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'

const props = defineProps<{
  items: ProcessedFile[]
  itemHeight: number
  bufferSize: number
  showPath?: boolean
  sortConfig?: {
    prop: string
    order: 'ascending' | 'descending' | null
  }
}>()

const emit = defineEmits<{
  (e: 'selection-change', files: ProcessedFile[]): void
  (e: 'sort-change', config: { prop: string; order: string }): void
}>()

// 视口相关状态
const containerRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const viewportHeight = ref(0)
const selectedFiles = ref<ProcessedFile[]>([])

// 计算总高度
const totalHeight = computed(() => {
  return props.items.length * props.itemHeight
})

// 计算可见范围
const visibleRange = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight)
  const visibleCount = Math.ceil(viewportHeight.value / props.itemHeight)
  const bufferCount = Math.ceil(props.bufferSize / 2)
  
  return {
    start: Math.max(0, start - bufferCount),
    end: Math.min(props.items.length, start + visibleCount + bufferCount)
  }
})

// 计算可见数据
const visibleData = computed(() => {
  return props.items.slice(visibleRange.value.start, visibleRange.value.end)
})

// 计算起始偏移
const startOffset = computed(() => {
  return visibleRange.value.start * props.itemHeight
})

// 处理滚动
const handleScroll = () => {
  if (containerRef.value) {
    scrollTop.value = containerRef.value.scrollTop
  }
}

// 处理选择变化
const handleSelectionChange = (val: boolean, item: ProcessedFile) => {
  if (val) {
    selectedFiles.value.push(item)
  } else {
    const index = selectedFiles.value.findIndex(f => f.name === item.name)
    if (index !== -1) {
      selectedFiles.value.splice(index, 1)
    }
  }
  emit('selection-change', selectedFiles.value)
}

// 获取目录路径
const getDirectory = (file: ProcessedFile) => {
  console.log('处理目录显示的文件信息:', file)
  return file.directory || file.path || ''
}

// 获取文件名（不含路径）
const getFileName = (file: ProcessedFile) => {
  return file.name
}

// 初始化视口高度
onMounted(() => {
  if (containerRef.value) {
    viewportHeight.value = containerRef.value.clientHeight
    
    // 监听容器大小变化
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        viewportHeight.value = entry.contentRect.height
      }
    })
    
    resizeObserver.observe(containerRef.value)
  }
})

// 监听数据变化，重置滚动位置
watch(() => props.items, () => {
  scrollTop.value = 0
  if (containerRef.value) {
    containerRef.value.scrollTop = 0
  }
}, { deep: true })

// 全选相关
const isAllSelected = computed(() => {
  return selectedFiles.value.length === props.items.length
})

const isIndeterminate = computed(() => {
  return selectedFiles.value.length > 0 && selectedFiles.value.length < props.items.length
})

const handleSelectAll = (val: boolean) => {
  selectedFiles.value = val ? [...props.items] : []
  emit('selection-change', selectedFiles.value)
}

// 排序处理
const handleSort = (prop: string) => {
  let order: 'ascending' | 'descending' | null = 'ascending'
  
  if (props.sortConfig?.prop === prop) {
    if (props.sortConfig.order === 'ascending') {
      order = 'descending'
    } else if (props.sortConfig.order === 'descending') {
      order = null
    }
  }
  
  emit('sort-change', { prop, order })
}
</script>

<style scoped>
.virtual-list-wrapper {
  height: 100%;
  position: relative;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  font-size: 13px;
}

.virtual-list-header {
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding: 8px 0;
  font-weight: bold;
  font-size: 13px;
}

.checkbox-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.index-header,
.index-cell {
  text-align: center;
}

.header-cell {
  display: flex;
  align-items: center;
  padding: 0 8px;
  cursor: pointer;
  user-select: none;
}

.filename-cell,
.new-filename-cell {
  padding: 0 8px;
}

.size-cell {
  text-align: right;
  padding-right: 8px;
}

.date-cell {
  text-align: center;
  padding: 0 4px;
}

.ellipsis-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

/* 确保所有行高一致 */
:deep(.el-row) {
  height: 32px;
}

/* 确保所有列垂直居中 */
:deep(.el-col) {
  height: 100%;
  display: flex;
  align-items: center;
}

/* 调整排序图标位置 */
.sort-indicators {
  margin-left: 4px;
  display: inline-flex;
  flex-direction: column;
  height: 14px;
}

.sort-caret {
  font-size: 11px;
}

.changed-name {
  color: var(--el-color-primary);
  font-weight: bold;
}

.changed-file {
  background-color: var(--el-color-primary-light-9);
}

.virtual-list-container {
  height: calc(100% - 48px); /* 减去表头高度 */
  overflow-y: auto;
  position: relative;
}

.virtual-list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.virtual-list-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  min-height: 100%;
}

.directory-cell {
  padding: 0 8px;
  overflow: hidden;
}

.directory-cell .ellipsis-text {
  display: inline-block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.filename-cell {
  padding: 0 8px;
  overflow: hidden;
}

.filename-cell .ellipsis-text {
  display: inline-block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 