<template>
  <div class="batch-rename">
    <el-card class="batch-rename-card">
      <template #header>
        <div class="card-header">
          <span>共 {{ fileCount }} 个文件</span>
          <div class="header-actions">
          </div>
        </div>
      </template>

      <div class="filter-section">
        <div class="filter-row">
          <el-select v-model="filterForm.type" class="filter-item" placeholder="包含文件">
            <el-option label="包含文件" value="include" />
            <el-option label="排除文件" value="exclude" />
          </el-select>

          <el-select v-model="filterForm.field" class="filter-item">
            <el-option
              v-for="field in filterFields"
              :key="field.value"
              :label="field.label"
              :value="field.value"
            />
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

          <el-button type="primary" @click="addFilter">提交</el-button>
          <el-button type="warning" @click="clearFilters" :disabled="!activeFilters.length">
            <el-icon><delete /></el-icon>
            清除过滤
          </el-button>

          <el-tooltip 
            :content="filterForm.field === 'name' ? '这里的文件名不包括扩展名' : filterForm.field === 'path' ? '后缀名称支持模糊处理' : ''" 
            placement="top"
            v-if="filterForm.field === 'name' || filterForm.field === 'path'"
          >
            <el-icon class="help-icon"><question-filled /></el-icon>
          </el-tooltip>
        </div>

        <div class="filter-tags">
          <el-tag
            v-for="(filter, index) in activeFilters"
            :key="index"
            closable
            class="filter-tag"
            @close="removeFilter(index)"
          >
            {{ getFilterLabel(filter) }}
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
              
              <el-form-item label="插入类型">
                <el-radio-group v-model="processForm.insert.type">
                  <el-radio-button label="text">文本</el-radio-button>
                  <el-radio-button label="sequence">序号</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="插入位置">
                <el-select v-model="processForm.insert.position">
                  <el-option label="开始位置" value="start" />
                  <el-option label="末尾位置" value="end" />
                  <el-option label="第N个字符之后" value="afterN" />
                  <el-option label="倒数N个字符之前" value="beforeN" />
                  <el-option label="XX字符串之后" value="afterString" />
                  <el-option label="XX字符串之前" value="beforeString" />
                </el-select>
              </el-form-item>

              <template v-if="processForm.insert.position === 'afterN' || processForm.insert.position === 'beforeN'">
                <el-form-item label="字符位置">
                  <el-input-number v-model="processForm.insert.charPosition" :min="1" />
                </el-form-item>
              </template>

              <template v-if="processForm.insert.position === 'afterString' || processForm.insert.position === 'beforeString'">
                <el-form-item label="查找字符串">
                  <el-input v-model="processForm.insert.searchString" placeholder="请输入要查找的字符串" />
                </el-form-item>
              </template>

              <template v-if="processForm.insert.type === 'text'">
                <el-form-item label="插入内容">
                  <el-input v-model="processForm.insert.text" placeholder="请输入要插入的内容" />
                </el-form-item>
              </template>

              <template v-else>
                <el-form-item label="序号类型">
                  <el-select v-model="processForm.insert.sequenceType">
                    <el-option label="阿拉伯数字" value="arabic" />
                    <el-option label="小写中文数字" value="chineseSmall" />
                    <el-option label="大写中文数字" value="chineseBig" />
                    <el-option label="英文小写字母" value="englishLower" />
                    <el-option label="英文大写字母" value="englishUpper" />
                    <el-option label="罗马数字" value="roman" />
                  </el-select>
                </el-form-item>

                <el-form-item label="起始序号">
                  <el-input-number v-model="processForm.insert.startNumber" :min="0" />
                </el-form-item>

                <el-form-item label="固定位数">
                  <el-input-number v-model="processForm.insert.digits" :min="1" />
                </el-form-item>

                <el-form-item label="序号前缀">
                  <el-input v-model="processForm.insert.prefix" placeholder="序号前的文本" />
                </el-form-item>

                <el-form-item label="序号后缀">
                  <el-input v-model="processForm.insert.suffix" placeholder="序号后的文本" />
                </el-form-item>
              </template>
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
              
              <el-form-item label="对第">
                <el-input-number 
                  v-model="processForm.sequence.groupIndex" 
                  :min="1" 
                  :default-value="1"
                />
                <span class="ml-2">组数字进行补齐，目标长度为：</span>
                <el-input-number 
                  v-model="processForm.sequence.targetLength" 
                  :min="1" 
                  :default-value="2"
                  class="ml-2"
                />
              </el-form-item>
              
              <el-form-item label="填充字符">
                <el-input 
                  v-model="processForm.sequence.fillChar" 
                  maxlength="1" 
                  style="width: 80px"
                  placeholder="默认为0"
                />
                <span class="form-tip ml-2">1 / 1</span>
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
                  placeholder="输入命名模板，例如：<name>_<date.now:YYYY-MM-DD>_<###>"
                >
                  <template #append>
                    <el-tooltip
                      content="点击查看变量说明"
                      placement="top"
                    >
                      <el-button
                        :icon="QuestionFilled"
                        @click="helpVisible = true"
                      />
                    </el-tooltip>
                  </template>
                </el-input>
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
                <div class="regex-header">
                  <div class="regex-checkboxes">
                    <el-checkbox v-model="processForm.regex.enabled">启用规则</el-checkbox>
                    <el-checkbox v-model="processForm.regex.processExt" class="ml-4">同时处理后缀名</el-checkbox>
                  </div>
                  <el-button type="primary" link @click="showRegexHelp">
                    <el-icon><QuestionFilled /></el-icon>
                    正则表达式帮助
                  </el-button>
                </div>
              </el-form-item>
              <el-form-item label="正则表达式">
                <el-input v-model="processForm.regex.pattern" placeholder="请输入正则表达式" />
              </el-form-item>
              <el-form-item label="替换内容">
                <el-input v-model="processForm.regex.replacement" placeholder="支持$1,$2等捕获组引用" />
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
        <div class="view-controls">
          <el-radio-group v-model="previewMode">
            <el-radio-button label="preview">仅显示预览</el-radio-button>
            <el-radio-button label="affected">仅显示受影响文件</el-radio-button>
          </el-radio-group>
          <el-checkbox v-model="showPath" class="show-path-checkbox">
            显示目录
          </el-checkbox>
        </div>
        <div class="selection-actions">
          <el-button 
            type="primary" 
            size="default"
            @click="handleSelectAll"
          >
            全选
          </el-button>
          <el-button 
            type="danger" 
            size="default"  
            :disabled="!selectedFiles.length"
            @click="removeSelectedFiles"
          >
            删除选中文件
          </el-button>
        </div>
      </div>

      <div class="file-list-container mt-4">
        <VirtualFileList
          ref="virtualListRef"
          :items="tableData"
          :item-height="CONFIG.ITEM_HEIGHT"
          :buffer-size="CONFIG.BUFFER_SIZE"
          :show-path="showPath"
          :sort-config="sortConfig"
          :show-affected-only="previewMode === 'affected'"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
          style="height: 400px"
        />
      </div>

      <!-- 在 operation-buttons 前添加进度条 -->
      <div class="progress-section" v-if="isProcessing">
        <el-progress 
          :percentage="processProgress" 
          :status="processStatus"
          :format="progressFormat"
        />
        <div class="progress-details">
          <span>已处理: {{ processedCount }}/{{ totalFiles }} 个文件</span>
          <span>平均速度: {{ processSpeed }} 个/秒</span>
          <span>预计剩余时间: {{ remainingTime }}</span>
        </div>
      </div>

      <div class="operation-buttons">
        <el-button-group>
          <el-button
            type="primary"
            :icon="RefreshRight"
            @click="handleRefresh"
            :disabled="isProcessingSelected"
          >
            刷新
          </el-button>
          <el-button
            type="primary"
            :icon="Delete"
            @click="handleClear"
            :disabled="!hasFiles"
          >
            清空
          </el-button>
        </el-button-group>

        <el-button-group class="history-buttons">
          <el-button
            :icon="Back"
            @click="handleUndo"
            :disabled="!historyStore.undoStack?.length"
          >
            撤销
          </el-button>
          <el-button
            :icon="Right"
            @click="handleRedo"
            :disabled="!historyStore.redoStack?.length"
          >
            重做
          </el-button>
        </el-button-group>

        <el-button
          type="success"
          :icon="Check"
          @click="handleExecute"
          :disabled="!hasFilteredFiles || isProcessingSelected"
        >
          执行
        </el-button>
      </div>
    </el-card>

    <!-- 添加进度条对话框 -->
    <el-dialog
      v-model="progressVisible"
      title="重命名进度"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      width="400px"
    >
      <div class="progress-container">
        <el-progress
          :percentage="currentProgress"
          :format="(percentage) => `${percentage}%`"
          :status="currentProgress === 100 ? 'success' : ''"
        />
        <div class="progress-text">{{ progressText }}</div>
      </div>
    </el-dialog>
  </div>

  <el-dialog
    v-model="helpVisible"
    width="800px"
    :close-on-click-modal="true"
    :show-close="true"
    class="variable-help-dialog"
  >
    <div class="variable-help">
      <el-carousel 
        height="600px"
        indicator-position="outside" 
        :autoplay="false"
        trigger="click"
      >
        <!-- 第一页：变量说明 -->
        <el-carousel-item>
          <div class="help-page">
            <h4 class="page-title">🔍 可用变量说明</h4>
            <div class="vars-list">
              <!-- 基础变量 -->
              <div class="var-item">
                <code class="code-primary">&lt;name&gt;</code>
                <span class="var-desc">原文件名(不含后缀)</span>
              </div>
              <div class="var-item">
                <code class="code-primary">&lt;ext&gt;</code>
                <span class="var-desc">原后缀名</span>
              </div>
              <div class="var-item">
                <code class="code-primary">&lt;name:upper&gt;</code> / <code class="code-primary">&lt;name:lower&gt;</code>
                <span class="var-desc">转换大小写</span>
              </div>

              <!-- 编号变量 -->
              <div class="var-item">
                <code class="code-success">&lt;#&gt;</code>
                <span class="var-desc">编号，从1开始</span>
              </div>
              <div class="var-item">
                <code class="code-success">&lt;####&gt;</code>
                <span class="var-desc">固定位数编号，如0001</span>
              </div>

              <!-- 日期时间 -->
              <div class="var-item">
                <code class="code-warning">&lt;date&gt;</code> / <code class="code-warning">&lt;date.now&gt;</code>
                <span class="var-desc">当前日期</span>
              </div>
              <div class="var-item">
                <code class="code-warning">&lt;date.modify&gt;</code>
                <span class="var-desc">文件修改日期</span>
              </div>
              <div class="var-item">
                <code class="code-info">&lt;time&gt;</code> / <code class="code-info">&lt;time.now&gt;</code>
                <span class="var-desc">当前时间</span>
              </div>
              <div class="var-item">
                <code class="code-info">&lt;time.modify&gt;</code>
                <span class="var-desc">文件修改时间</span>
              </div>

              <!-- 特殊变量 -->
              <div class="var-item">
                <code class="code-danger">&lt;uuid:8:upper&gt;</code>
                <span class="var-desc">随机字符串，:8指定长度(最长32)，:upper转换大写</span>
              </div>

              <div class="format-note">
                格式化示例：<code class="code-example">&lt;date:YYYY-MM-DD&gt;</code> <code class="code-example">&lt;time:HH-mm-ss&gt;</code>
              </div>
            </div>
          </div>
        </el-carousel-item>

        <!-- 第二页：基础示例 -->
        <el-carousel-item>
          <div class="help-page">
            <h4 class="help-title">📝 基础示例</h4>
            <div class="example-content">
              <div class="example-group">
                <div class="example-title">📸 照片日期编号</div>
                <div class="example-code">
                  <div class="code-label">模板：</div>
                  <code class="code-block">照片_&lt;date.now:YYYY-MM-DD&gt;_&lt;###&gt;</code>
                </div>
                <div class="example-result">
                  <div class="result-label">结果：</div>
                  <div class="result-text">照片_2024-01-20_001.jpg</div>
                </div>
                <div class="example-desc">适用于按日期整理照片，自动编号</div>
              </div>

              <div class="divider"></div>

              <div class="example-group">
                <div class="example-title">📊 报表命名规范</div>
                <div class="example-code">
                  <div class="code-label">模板：</div>
                  <code class="code-block">月度报表_&lt;name:upper&gt;_&lt;date.now:YYYYMM&gt;</code>
                </div>
                <div class="example-result">
                  <div class="result-label">结果：</div>
                  <div class="result-text">月度报表_SALES_202401.xlsx</div>
                </div>
                <div class="example-desc">适用于规范化报表命名，自动大写</div>
              </div>
            </div>
          </div>
        </el-carousel-item>

        <!-- 第三页：进阶示例 -->
        <el-carousel-item>
          <div class="help-page">
            <h4 class="help-title">🚀 进阶示例</h4>
            <div class="example-content">
              <div class="example-group">
                <div class="example-title">🎵 音乐文件整理</div>
                <div class="example-code">
                  <div class="code-label">模板：</div>
                  <code class="code-block">&lt;name:upper&gt;_&lt;date.modify:YYYY-MM&gt;_&lt;uuid:6:upper&gt;</code>
                </div>
                <div class="example-result">
                  <div class="result-label">结果：</div>
                  <div class="result-text">SONG_2024-01_A7B2C3.mp3</div>
                </div>
                <div class="example-desc">使用修改日期和唯一标识符整理音乐文件</div>
              </div>

              <div class="divider"></div>

              <div class="example-group">
                <div class="example-title">📱 截图归档</div>
                <div class="example-code">
                  <div class="code-label">模板：</div>
                  <code class="code-block">Screenshot_&lt;time.now:HHmmss&gt;_&lt;uuid:4&gt;</code>
                </div>
                <div class="example-result">
                  <div class="result-label">结果：</div>
                  <div class="result-text">Screenshot_153022_x4f2.png</div>
                </div>
                <div class="example-desc">使用精确时间和短UUID区分截图</div>
              </div>
            </div>
          </div>
        </el-carousel-item>

        <!-- 第四页：完整示例 -->
        <el-carousel-item>
          <div class="help-page">
            <h4 class="help-title">🎯 完整示例</h4>
            <div class="example-content">
              <div class="example-group">
                <div class="example-title">📁 项目文档管理</div>
                <div class="example-code">
                  <div class="code-label">模板：</div>
                  <code class="code-block">项目文档/&lt;date.now:YYYY&gt;/&lt;date.now:MM&gt;/DOC_&lt;time.now:HH-mm&gt;_&lt;####&gt;</code>
                </div>
                <div class="example-result">
                  <div class="result-label">结果：</div>
                  <div class="result-text">项目文档/2024/01/DOC_15-30_0001.pdf</div>
                </div>
                <div class="example-desc">自动创建年月目录结构，规范化文档命名</div>
              </div>

              <div class="divider"></div>

              <div class="example-group">
                <div class="example-title">🎨 设计稿版本控制</div>
                <div class="example-code">
                  <div class="code-label">模板：</div>
                  <code class="code-block">&lt;name&gt;/v&lt;##&gt;/&lt;name:lower&gt;_&lt;date.now:YYYYMMDDHHmm&gt;</code>
                </div>
                <div class="example-result">
                  <div class="result-label">结果：</div>
                  <div class="result-text">Homepage/v01/homepage_202401201530.psd</div>
                </div>
                <div class="example-desc">按版本号组织设计稿，包含详细时间戳</div>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
  </el-dialog>

  <!-- 正则表达式帮助对话框 -->
  <el-dialog
    v-model="regexHelpVisible"
    title="正则表达式使用帮助"
    width="800px"
    :close-on-click-modal="true"
  >
    <el-carousel height="400px" :interval="4000" indicator-position="outside">
      <!-- 示例1：基础替换 -->
      <el-carousel-item>
        <div class="help-slide">
          <h3>基础替换示例</h3>
          <div class="example-box">
            <div class="example-item">
              <div class="code-block">
                <p>原文件名：report2024.pdf</p>
                <p>正则表达式：report(\d+)</p>
                <p>替换内容：文档_$1</p>
              </div>
              <div class="result-block">
                <el-icon><ArrowDown /></el-icon>
                <p>结果：文档_2024.pdf</p>
              </div>
            </div>
            <div class="example-desc">
              说明：将"report"替换为"文档_"，并保留后面的数字
            </div>
          </div>
        </div>
      </el-carousel-item>

      <!-- 示例2：日期格式转换 -->
      <el-carousel-item>
        <div class="help-slide">
          <h3>日期格式转换示例</h3>
          <div class="example-box">
            <div class="example-item">
              <div class="code-block">
                <p>原文件名：2024-01-20.jpg</p>
                <p>正则表达式：(\d{4})-(\d{2})-(\d{2})</p>
                <p>替换内容：$1年$2月$3日</p>
              </div>
              <div class="result-block">
                <el-icon><ArrowDown /></el-icon>
                <p>结果：2024年01月20日.jpg</p>
              </div>
            </div>
            <div class="example-desc">
              说明：将短横线日期格式转换为中文日期格式
            </div>
          </div>
        </div>
      </el-carousel-item>

      <!-- 示例3：序号提取 -->
      <el-carousel-item>
        <div class="help-slide">
          <h3>序号提取示例</h3>
          <div class="example-box">
            <div class="example-item">
              <div class="code-block">
                <p>原文件名：IMG_20240120_001.jpg</p>
                <p>正则表达式：IMG_\d+_(\d+)</p>
                <p>替换内容：图片_$1</p>
              </div>
              <div class="result-block">
                <el-icon><ArrowDown /></el-icon>
                <p>结果：图片_001.jpg</p>
              </div>
            </div>
            <div class="example-desc">
              说明：提取文件名中的序号部分
            </div>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { useFileStore } from '@/stores/file'
import { useHistoryStore } from '@/stores/historyStore'
import type { FileWithHandle, ProcessedFile, FilterCondition, ProcessForm } from '@/types/files'
import { RenameProcessor, type ProcessForm as RenameProcessForm } from '@/utils/renameRules'
import { formatFileSize, formatDate, processRegexRename } from '@/utils/file'
import { UploadFilled, QuestionFilled, RefreshRight, Delete, Back, Right, Check, ArrowDown } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import VirtualFileList from '@/components/VirtualFileList.vue'

const fileStore = useFileStore()
const historyStore = useHistoryStore()
const filteredFileList = ref<ProcessedFile[]>([])
const activeFilters = ref<FilterCondition[]>([])
const previewMode = ref('preview')
const selectedFiles = ref<FileWithHandle[]>([])
const isProcessingSelected = ref(false)

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
    type: 'text',
    position: 'start',
    charPosition: 1,
    searchString: '',
    text: '',
    sequenceType: 'arabic',
    startNumber: 1,
    digits: 3,
    prefix: '',
    suffix: ''
  },
  sequence: {
    enabled: false,
    processExt: false,
    groupIndex: 1,
    targetLength: 2,
    fillChar: '0'
  },
  newName: {
    enabled: false,
    processExt: false,
    template: ''
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

const activeProcessTab = ref('replace')
const showPath = ref(false)

const filterFields = [
  { label: '文件名', value: 'name' },
  { label: '后缀名', value: 'extension' },
  { label: '大小', value: 'size' },
  { label: '修改时间', value: 'lastModified' }
]

const conditionMap: Record<string, string> = {
  'contains': '包含',
  'notContains': '不包含',
  'startsWith': '开头是',
  'endsWith': '结尾是',
  'equals': '等于',
  'gt': '大于',
  'gte': '大于等于',
  'lt': '小于',
  'lte': '小于等于',
  'between': '介于',
  'after': '晚于',
  'before': '早于'
}

const filterForm = ref<FilterCondition>({
  type: 'include',
  field: 'name',  // 默认选择"文件名"
  condition: 'contains',
  value: '',
  ignoreCase: true,
  startDate: '',
  endDate: '',
  sizeValue: 0,
  sizeUnit: 'MB'
})

const tableData = ref<ProcessedFile[]>([])

const hasFiles = computed(() => fileStore.files?.length > 0)
const hasFilteredFiles = computed(() => filteredFileList.value?.length > 0)


const fileCount = computed(() => fileStore?.files?.length || 0)

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
      const fileEntry = handle as FileSystemFileHandle
      const file = await fileEntry.getFile()
      
      const fileWithHandle: FileWithHandle = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        path: dirHandle.name,  // 使用选择的目录名称
        arrayBuffer: () => file.arrayBuffer(),
        slice: (start?: number, end?: number) => file.slice(start, end),
        stream: () => file.stream(),
        text: () => file.text()
      }
      
      files.push(fileWithHandle)
    }

    handleFiles(files)
  } catch (error: unknown) {
    if ((error as { name?: string }).name !== 'AbortError') {
      console.error('选择文件失败:', error)
      ElMessage.error('选择文件失败')
    }
  }
}

const handleFolderSelect = async () => {
  try {
    const dirHandle = await window.showDirectoryPicker()
    const files: FileWithHandle[] = []
    
    await traverseDirectory(dirHandle as FileSystemDirectoryHandle, dirHandle.name, files)
    handleFiles(files)
  } catch (error: unknown) {
    if ((error as { name?: string }).name !== 'AbortError') {  // 忽略用户取消操作
      console.error('选择文件夹失败:', error)
      ElMessage.error('选择文件夹失败')
    }
  }
}

const traverseDirectory = async (dirHandle: FileSystemDirectoryHandle, parentPath: string, files: FileWithHandle[]) => {
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      const fileEntry = entry as FileSystemFileHandle
      const file = await fileEntry.getFile()
      
      const fileWithHandle: FileWithHandle = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        path: parentPath,
        arrayBuffer: () => file.arrayBuffer(),
        slice: (start?: number, end?: number) => file.slice(start, end),
        stream: () => file.stream(),
        text: () => file.text()
      }
      
      files.push(fileWithHandle)
    } else if (entry.kind === 'directory') {
      await traverseDirectory(entry as FileSystemDirectoryHandle, `${parentPath}/${entry.name}`, files)
    }
  }
}

const handleFileDrop = async (event: DragEvent) => {
  event.preventDefault()
  
  if (!event.dataTransfer?.items && !event.dataTransfer?.files) {
    return
  }

  isProcessingSelected.value = true
  
  try {
    const items = event.dataTransfer.items
    const files = event.dataTransfer.files
    
    if (items) {
      await processItems(Array.from(items))
    } else if (files) {
      await processFiles(Array.from(files))
    }
    
    // 上传完成后刷新文件列表
    refreshFileList()
  } catch (error: unknown) {
    console.error('文件处理失败:', error)
    ElMessage.error('文件处理失败：' + error)
  } finally {
    isProcessingSelected.value = false
  }
}

const processItems = async (items: DataTransferItem[]) => {
  const processedFiles: FileWithHandle[] = []
  for (const item of items) {
    const entry = item.webkitGetAsEntry()
    if (entry) {
      await traverseFileTree(entry, processedFiles)
    }
  }
  handleFiles(processedFiles)
}

const processFiles = async (files: File[]) => {
  const processedFiles: FileWithHandle[] = []
  for (const file of files) {
    const fileWithHandle: FileWithHandle = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      path: '根目录',
      arrayBuffer: () => file.arrayBuffer(),
      slice: (start?: number, end?: number) => file.slice(start, end),
      stream: () => file.stream(),
      text: () => file.text()
    }
    processedFiles.push(fileWithHandle)
  }
  handleFiles(processedFiles)
}

const traverseFileTree = async (item: any, files: FileWithHandle[]) => {
  if (item.isFile) {
    const file = await new Promise<File>((resolve) => item.file(resolve))
    const fileWithHandle: FileWithHandle = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      path: '根目录',
      arrayBuffer: () => file.arrayBuffer(),
      slice: (start?: number, end?: number) => file.slice(start, end),
      stream: () => file.stream(),
      text: () => file.text()
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

const handleSelectionChange = (selection: ProcessedFile[]) => {
  console.log('选择变化:', selection) // 添加日志查看选择变化
  selectedFiles.value = selection
}

const removeSelectedFiles = () => {
  if (!selectedFiles.value.length) return
  
  // 先保存选中的文件数量
  const deletedCount = selectedFiles.value.length
  
  // 从文件存储中移除选中的文件
  const remainingFiles = fileStore.files.filter(file => {
    return !selectedFiles.value.some(selected => 
      selected.name === file.name && selected.path === file.path
    )
  })
  
  fileStore.$patch({ files: remainingFiles })
  
  // 清空选中状态
  selectedFiles.value = []
  
  // 刷新文件列表
  refreshFileList()
  
  // 使用保存的数量显示消息
  ElMessage.success(`已排除${deletedCount} 个文件`)
}

watch(() => fileStore.files, (newFiles) => {
  // 确保所有文件都被加载到表格中
  const processor = new RenameProcessor(processForm.value as RenameProcessForm)
  
  let files = [...newFiles]
  if (activeFilters.value?.length) {
    files = files.filter(file => {
      return activeFilters.value.every(filter => {
        if (!filter) return true
        const matchesFilter = applyFilter(file, filter)
        return filter.type === 'include' ? matchesFilter : !matchesFilter
      })
    })
  }

  // 更新过滤后的文件列表
  filteredFileList.value = files.map((file, index) => ({
    ...file,
    newName: processor.processFileName(file.name, index)
  })) as ProcessedFile[]

  // 更新表格数据
  tableData.value = filteredFileList.value
}, { deep: true, immediate: true })

watch([processForm, activeFilters], () => {
  nextTick(refreshFileList)
}, { deep: true })

// 检查字符串条件
function checkStringCondition(value: string, pattern: string, condition: string, ignoreCase: boolean) {
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
function checkSizeCondition(fileSize: number, targetSize: number, condition: string, unit: string) {
  const unitMultiplier: Record<string, number> = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024
  }
  
  const targetBytes = targetSize * (unitMultiplier[unit] || 1)
  
  switch (condition) {
    case 'gt': return fileSize > targetBytes
    case 'gte': return fileSize >= targetBytes
    case 'lt': return fileSize < targetBytes
    case 'lte': return fileSize <= targetBytes
    case 'equals': return fileSize === targetBytes
    default: return true
  }
}

// 检查时间条件
function checkTimeCondition(fileTime: number, filter: FilterCondition) {
  const fileDate = new Date(fileTime)
  
  switch (filter.condition) {
    case 'between':
      const startDate = filter.startDate ? new Date(filter.startDate) : null
      const endDate = filter.endDate ? new Date(filter.endDate) : null
      return (!startDate || fileDate >= startDate) && (!endDate || fileDate <= endDate)
    case 'after':
      return fileDate >= new Date(filter.startDate as string)
    case 'before':
      return fileDate <= new Date(filter.endDate as string)
    default:
      return true
  }
}

// 修改文件过滤逻辑中的时间判断
function addFilter() {
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
  } else if (!filterForm.value.value && filterForm.value.field !== 'size' && filterForm.value.field !== 'lastModified') {
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
      'name': '文件名',
      'path': '目录'
    }
    ElMessage.warning(`已存在${fieldMap[filterForm.value.field]}的过滤条件，请先删除原有条件`)
    return
  }

  const filter: FilterCondition = {
    type: filterForm.value.type,
    field: filterForm.value.field,
    condition: filterForm.value.condition,
    value: filterForm.value.value,
    ignoreCase: filterForm.value.ignoreCase
  }

  if (filterForm.value.field === 'size') {
    filter.sizeValue = filterForm.value.sizeValue
    filter.sizeUnit = filterForm.value.sizeUnit
  } else if (filterForm.value.field === 'lastModified') {
    filter.startDate = filterForm.value.startDate
    filter.endDate = filterForm.value.endDate
  }

  activeFilters.value.push(filter)
  
  // 重置表单
  filterForm.value = {
    type: 'include',
    field: 'name',  // 重置为"文件名"
    condition: 'contains',
    value: '',
    ignoreCase: true,
    startDate: '',
    endDate: '',
    sizeValue: 0,
    sizeUnit: 'MB'
  }

  ElMessage.success('添加过滤条件成功')
}

// 修改过滤条件描述文本
function getFilterLabel(filter: FilterCondition) {
  const fieldLabel = filterFields.find(f => f.value === filter.field)?.label || filter.field
  let conditionText = conditionMap[filter.condition] || filter.condition
  let valueText = ''

  switch (filter.field) {
    case 'size':
      valueText = `${filter.sizeValue}${filter.sizeUnit}`
      break
    case 'lastModified':
      if (filter.condition === 'between') {
        valueText = `${filter.startDate} 至 ${filter.endDate}`
      } else if (filter.condition === 'after') {
        valueText = filter.startDate as string
      } else {
        valueText = filter.endDate as string
      }
      break
    default:
      valueText = filter.value.toString()
  }

  return `${fieldLabel} ${conditionText} ${valueText}`
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
function clearFilters() {
  // 清空过滤条件数组
  activeFilters.value = []
  
  // 重置过滤表单
  filterForm.value = {
    type: 'include',
    field: 'name',
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

// 添加进度相关的状态
const isProcessing = ref(false)
const processProgress = ref(0)
const processStatus = ref<'success' | 'exception' | ''>('')
const processedCount = ref(0)
const totalFiles = ref(0)
const processSpeed = ref('0.00')
const remainingTime = ref('计算中...')
const startTime = ref(0)

// 更新进度格式化函数
const progressFormat = (percentage: number) => {
  if (processStatus.value === 'success') {
    return '完成'
  } else if (processStatus.value === 'exception') {
    return '失败'
  }
  return `${percentage}%`
}

// 添加计算速度和剩余时间的函数
const updateProcessMetrics = () => {
  const currentTime = Date.now()
  const elapsedTime = (currentTime - startTime.value) / 1000 // 转换为秒
  
  if (elapsedTime > 0) {
    // 计算处理速度（个/秒）
    const speed = processedCount.value / elapsedTime
    processSpeed.value = speed.toFixed(2)
    
    // 计算剩余时间
    if (speed > 0) {
      const remainingFiles = totalFiles.value - processedCount.value
      const remainingSeconds = remainingFiles / speed
      
      if (remainingSeconds < 60) {
        remainingTime.value = `${Math.ceil(remainingSeconds)}秒`
      } else if (remainingSeconds < 3600) {
        remainingTime.value = `${Math.ceil(remainingSeconds / 60)}分钟`
      } else {
        remainingTime.value = `${(remainingSeconds / 3600).toFixed(1)}小时`
      }
    } else {
      remainingTime.value = '计算中...'
    }
  }
}

// 将所有配置常量统一放在文件顶部
const CONFIG = {
  BATCH_SIZE: 200,    // 批处理数据大小
  VISIBLE_ITEMS: 30,  // 可视区域显示的行数
  BATCH_DELAY: 10,    // 批处理延迟时间(ms)
  BUFFER_SIZE: 5,     // 缓冲区大小(额外渲染的行数)
  ITEM_HEIGHT: 40     // 每行高度(px)
} as const;

// 创建 Worker 实例
const worker = new Worker(
  new URL('@/workers/renameWorker.ts', import.meta.url),
  { type: 'module' }
);

// Worker 消息处理
worker.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;
  
  switch (type) {
    case 'renameResults':
      handleRenameResults(payload);
      break;
    case 'validationResults':
      handleValidationResults(payload);
      break;
    case 'conflictsResult':
      handleConflictsResult(payload);
      break;
    case 'error':
      handleWorkerError(payload);
      break;
  }
};

// 处理重命名结果
const handleRenameResults = (results: any[]) => {
  // 更新文件列表中的新文件名
  filteredFileList.value = results;
  // 触发UI更新
  nextTick(() => {
    updatePreview();
  });
};

// 处理验证结果
const handleValidationResults = (results: any[]) => {
  const invalidFiles = results.filter(r => !r.isValid);
  if (invalidFiles.length > 0) {
    ElMessage.warning(`${invalidFiles.length} 个文件名无效`);
  }
};

// 处理冲突检测结果
const handleConflictsResult = (conflicts: any[]) => {
  if (conflicts.length > 0) {
    ElMessage.warning(`检测到 ${conflicts.length} 个文件名冲突`);
    // 显示冲突文件列表
    showConflictDialog(conflicts);
  }
};

// 处理 Worker 错误
const handleWorkerError = (error: any) => {
  console.error('Worker error:', error);
  ElMessage.error('处理失败：' + error.message);
};

// 添加进度相关的响应式变量
const progressVisible = ref(false)
const currentProgress = ref(0)
const progressText = ref('')

const handleExecute = async () => {
  try {
    // 初始化进度状态
    isProcessing.value = true
    processProgress.value = 0
    processStatus.value = ''
    processedCount.value = 0
    startTime.value = Date.now()
    
    const filesToRename = filteredFileList.value.filter(file => file.name !== file.newName)
    totalFiles.value = filesToRename.length

    // 检查是否有文件
    if (!filesToRename.length) {
      ElMessage.warning('没有可重命名的文件')
      progressVisible.value = false
      return
    }

    // 检查重名
    const newNames = filesToRename.map(f => f.newName)
    if (new Set(newNames).size !== newNames.length) {
      ElMessage.error('重命名后存在重复的文件名')
      progressVisible.value = false
      return
    }

    // 请求用户选择目录
    currentProgress.value = 10
    progressText.value = '选择目录中...'
    
    const dirHandle = await window.showDirectoryPicker({
      mode: 'readwrite'
    })

    // 检查目录中是否有源文件
    currentProgress.value = 20
    progressText.value = '检查源文件...'
    
    let hasSourceFiles = false
    for (const file of filesToRename) {
      try {
        await dirHandle.getFileHandle(file.name)
        hasSourceFiles = true
        break
      } catch (error) {
        continue
      }
    }

    if (!hasSourceFiles) {
      ElMessage.error('选择的目录下没有找到需要重命名的文件，请确认目录是否正确')
      progressVisible.value = false
      return
    }

    // 检查目标文件是否已存在
    currentProgress.value = 30
    progressText.value = '检查目标文件...'
    
    const existingFiles: string[] = []
    for (const file of filesToRename) {
      try {
        await dirHandle.getFileHandle(file.newName)
        existingFiles.push(file.newName)
      } catch (error) {
        // 文件不存在，可以继续
        continue
      }
    }

    if (existingFiles.length > 0) {
      ElMessage.error(`以下文件已存在，为防止数据丢失，已停止重命名操作：\n${existingFiles.join('\n')}`)
      progressVisible.value = false
      return
    }

    // 执行重命名操作
    const updateInterval = setInterval(() => {
      updateProcessMetrics()
    }, 1000)

    const promises = filesToRename.map(async (file, index) => {
      try {
        progressText.value = `正在重命名: ${file.name} -> ${file.newName}`
        
        const fileHandle = await dirHandle.getFileHandle(file.name)
        const fileContent = await fileHandle.getFile()
        
        // 创建新文件并写入内容
        const newFileHandle = await dirHandle.getFileHandle(file.newName, { create: true })
        const writable = await newFileHandle.createWritable()
        await writable.write(await fileContent.arrayBuffer())
        await writable.close()
        
        // 删除旧文件
        await dirHandle.removeEntry(file.name)

        // 更新进度
        processedCount.value++
        processProgress.value = Math.round((processedCount.value / totalFiles.value) * 100)
        
        return { success: true, file }
      } catch (error) {
        console.error('重命名失败:', error)
        return { success: false, error }
      }
    })

    const results = await Promise.all(promises)
    clearInterval(updateInterval)

    // 设置最终状态
    processProgress.value = 100
    processStatus.value = 'success'
    
    // 延迟关闭进度条
    setTimeout(() => {
      progressVisible.value = false
    }, 500)

    if (results.every(r => r.success)) {
      // 添加到历史记录
      historyStore.addRecord(results.map(r => ({
        oldName: r.file.name,
        newName: r.file.newName
      })))
      
      // 更新文件列表
      const updatedFiles = fileStore.files.map(file => {
        const renamedFile = results.find(r => r.file.name === file.name)
        if (renamedFile?.file) {
          return {
            ...file,
            name: renamedFile.file.newName
          }
        }
        return file
      })
      fileStore.$patch({ files: updatedFiles })
      ElMessage.success(`成功重命名 ${results.length} 个文件`)
    }

    if (results.some(r => !r.success)) {
      const failedNames = results.filter(r => !r.success).map(r => r.file.name).join('\n')
      ElMessage.error(`${results.length - results.filter(r => r.success).length} 个文件重命名失败:\n${failedNames}`)
    }

  } catch (error: unknown) {
    progressVisible.value = false
    if ((error as { name?: string }).name !== 'AbortError') {
      console.error('重命名操作失败:', error)
      ElMessage.error(`重命名操作失败: ${error}`)
    }
    processStatus.value = 'exception'
  } finally {
    // 延迟关闭进度显示
    setTimeout(() => {
      isProcessing.value = false
    }, 1000)
  }
}

const handleClear = () => {
  ElMessageBox.confirm(
    '确定要清空所有文件吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    fileStore.clearFiles()
    historyStore.clear()
    ElMessage.success('已清空所有文件')
  }).catch(() => {})
}

const handleRefresh = () => {
  refreshFileList()
  ElMessage.success('刷新成功')
}

const removeFilter = (index: number) => {
  if (!activeFilters.value) return
  activeFilters.value = activeFilters.value.filter((_, i) => i !== index)
  nextTick(() => {
    refreshFileList()
  })
}

// 修改 refreshFileList 函数
function refreshFileList() {
  if (!fileStore.files?.length) {
    filteredFileList.value = []
    tableData.value = []
    return
  }

  const processor = new RenameProcessor(processForm.value as RenameProcessForm)
  
  let files = [...fileStore.files]
  if (activeFilters.value?.length) {
    files = files.filter(file => {
      return activeFilters.value.every(filter => {
        if (!filter) return true
        const matchesFilter = applyFilter(file, filter)
        return filter.type === 'include' ? matchesFilter : !matchesFilter
      })
    })
  }

  // 更新过滤后的文件列表
  filteredFileList.value = files.map((file, index) => ({
    ...file,
    newName: processor.processFileName(file.name, index)
  })) as ProcessedFile[]

  // 更新表格数据
  tableData.value = filteredFileList.value
}

// 过滤器应用函数
function applyFilter(file: FileWithHandle, filter: FilterCondition): boolean {
  switch (filter.field) {
    case 'name': {
      const name = file.name.substring(0, file.name.lastIndexOf('.') || file.name.length)
      return checkStringCondition(name, filter.value.toString(), filter.condition, filter.ignoreCase ?? true)
    }
    case 'extension': {
      const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.') + 1) : ''
      return checkStringCondition(ext, filter.value.toString(), filter.condition, filter.ignoreCase ?? true)
    }
    case 'size':
      return checkSizeCondition(file.size, filter.sizeValue || 0, filter.condition, filter.sizeUnit || 'B')
    case 'lastModified':
      return checkTimeCondition(file.lastModified, filter)
    case 'path':
      return checkStringCondition(file.path, filter.value.toString(), filter.condition, filter.ignoreCase ?? true)
    default:
      return true
  }
}

// 修改重做功能
const handleRedo = async () => {
  try {
    const record = await historyStore.redo()
    if (!record) {
      ElMessage.warning('没有可重做的操作')
      return
    }

    const dirHandle = await window.showDirectoryPicker({
      mode: 'readwrite'
    })

    const promises = record.files.map(async (file) => {
      try {
        // 获取旧文件内容
        const oldFileHandle = await dirHandle.getFileHandle(file.oldName)
        const fileContent = await oldFileHandle.getFile()
        
        // 创建新文件名的文件
        const newFileHandle = await dirHandle.getFileHandle(file.newName, { create: true })
        const writable = await newFileHandle.createWritable()
        await writable.write(await fileContent.arrayBuffer())
        await writable.close()
        
        // 删除旧文件名的文件
        await dirHandle.removeEntry(file.oldName)

        return { success: true, file }
      } catch (error) {
        console.error('重做失败:', error)
        return { success: false, error }
      }
    })

    const results = await Promise.all(promises)
    const succeeded = results.filter(r => r.success)
    const failed = results.length - succeeded.length

    if (succeeded.length > 0) {
      // 更新文件列表
      const updatedFiles = fileStore.files.map(file => {
        const redoneFile = succeeded.find(r => r.file?.oldName === file.name)
        if (redoneFile?.file) {
          return {
            ...file,
            name: redoneFile.file.newName,
            newName: redoneFile.file.newName
          }
        }
        return file
      })
      fileStore.$patch({ files: updatedFiles })
      ElMessage.success(`成功重做 ${succeeded.length} 个文件的重命名`)
    }

    if (failed > 0) {
      ElMessage.error(`${failed} 个文件重做失败`)
    }

  } catch (error: unknown) {
    if ((error as { name?: string }).name !== 'AbortError') {
      console.error('重做操作失败:', error)
      ElMessage.error('重做操作失败：' + error)
    }
  }
}

// 修改撤销功能
const handleUndo = async () => {
  try {
    const record = await historyStore.undo()
    if (!record) {
      ElMessage.warning('没有可撤销的操作')
      return
    }

    const dirHandle = await window.showDirectoryPicker({
      mode: 'readwrite'
    })

    const promises = record.files.map(async (file) => {
      try {
        // 获取新文件内容
        const newFileHandle = await dirHandle.getFileHandle(file.newName)
        const fileContent = await newFileHandle.getFile()
        
        // 创建旧文件名的文件
        const oldFileHandle = await dirHandle.getFileHandle(file.oldName, { create: true })
        const writable = await oldFileHandle.createWritable()
        await writable.write(await fileContent.arrayBuffer())
        await writable.close()
        
        // 删除新文件名的文件
        await dirHandle.removeEntry(file.newName)

        return { success: true, file }
      } catch (error) {
        console.error('撤销失败:', error)
        return { success: false, error }
      }
    })

    const results = await Promise.all(promises)
    const succeeded = results.filter(r => r.success)
    const failed = results.length - succeeded.length

    if (succeeded.length > 0) {
      // 更新文件列表
      const updatedFiles = fileStore.files.map(file => {
        const undoneFile = succeeded.find(r => r.file?.newName === file.name)
        if (undoneFile?.file) {
          return {
            ...file,
            name: undoneFile.file.oldName,
            newName: undoneFile.file.oldName
          }
        }
        return file
      })
      fileStore.$patch({ files: updatedFiles })
      ElMessage.success(`成功撤销 ${succeeded.length} 个文件的重命名`)
    }

    if (failed > 0) {
      ElMessage.error(`${failed} 个文件撤销失败`)
    }

  } catch (error: unknown) {
    if ((error as { name?: string }).name !== 'AbortError') {
      console.error('撤销操作失败:', error)
      ElMessage.error('撤销操作失败：' + error)
    }
  }
}

// 修改行类名函数
const getRowClassName = ({ row, rowIndex }: { row: ProcessedFile, rowIndex: number }) => {
  const classes = []
  
  // 添加变更标记
  if (row.name !== row.newName) {
    classes.push('changed-row')
  }
  
  // 添加奇偶行标记
  classes.push(rowIndex % 2 === 0 ? 'even-row' : 'odd-row')
  
  return classes.join(' ')
}

filteredFileList.value = fileStore.files.map(file => ({
  ...file,
  newName: file.name // 初始时 newName 与原名相同
}))

// 添加控制 popover 显示的变量
const helpVisible = ref(false)

declare global {
  interface Window {
    showOpenFilePicker: (options?: {
      multiple?: boolean;
      startIn?: FileSystemDirectoryHandle;
    }) => Promise<FileSystemFileHandle[]>;
    showDirectoryPicker: (options?: { 
      mode?: 'read' | 'readwrite' 
    }) => Promise<FileSystemDirectoryHandle>;
    requestIdleCallback: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number
  }
  
  interface FileSystemDirectoryHandle {
    values: () => AsyncIterableIterator<FileSystemHandle>;
    getFileHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemFileHandle>;
    removeEntry: (name: string, options?: FileSystemRemoveOptions) => Promise<void>;
  }
  
  interface FileSystemFileHandle {
    getFile: () => Promise<File>;
    move: (newName: string) => Promise<void>;
    getParentDirectory: () => Promise<FileSystemDirectoryHandle | null>;
    createWritable: (options?: FileSystemCreateWritableOptions) => Promise<FileSystemWritableFileStream>;
    getParent: () => Promise<FileSystemDirectoryHandle | null>;
  }
  
  interface FileSystemHandle {
    readonly kind: 'file' | 'directory';
    readonly name: string;
  }

  interface FileSystemWritableFileStream extends WritableStream {
    write: (data: FileSystemWriteChunkType) => Promise<void>;
    close: () => Promise<void>;
  }
}

// 处理文件名的函数
const processFileName = (file: FileWithHandle): string => {
  let newName = file.name

  // 处理正则替换
  if (processForm.regex.enabled) {
    newName = processRegexRename(
      newName,
      processForm.regex.pattern,
      processForm.regex.replacement,
      {
        processExt: processForm.regex.processExt,
        useGlobal: processForm.regex.useGlobal,
        ignoreCase: processForm.regex.ignoreCase
      }
    )
  }

  return newName
}

const regexHelpVisible = ref(false)

const showRegexHelp = () => {
  regexHelpVisible.value = true
}

// 添加排序相关的状态
const sortConfig = ref({
  prop: '',
  order: null as 'ascending' | 'descending' | null
})

// 处理排序变化
const handleSortChange = ({ prop, order }: { prop: string; order: 'ascending' | 'descending' | null }) => {
  sortConfig.value = { prop, order }
}

// 文件元数据接口
interface FileMeta {
  handle: FileSystemFileHandle;
  originalName: string;
  newName?: string;
  status: 'pending' | 'processing' | 'renamed' | 'failed';
  path: string;
  size?: number;
  lastModified?: number;
}

// 文件映射表
const fileMap = new Map<string, FileMeta>();

// 优化的文件加载函数
const loadDirectoryContent = async (dirHandle: FileSystemDirectoryHandle, parentPath = '') => {
  const entries = [];
  try {
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        const path = parentPath ? `${parentPath}/${entry.name}` : entry.name;
        // 只存储必要的元数据
        const fileMeta: FileMeta = {
          handle: entry,
          originalName: entry.name,
          status: 'pending',
          path: path
        };
        fileMap.set(path, fileMeta);
        entries.push(fileMeta);
      } else if (entry.kind === 'directory') {
        const newPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
        // 递归处理子目录
        const subEntries = await loadDirectoryContent(entry, newPath);
        entries.push(...subEntries);
      }
    }
  } catch (error) {
    console.error('加载目录内容失败:', error);
    ElMessage.error('加载目录内容失败');
  }
  return entries;
};

// 组件卸载时清理 Worker
onUnmounted(() => {
  worker.terminate();
});

// 处理文件选择
const handleFilesSelected = async (files: File[]) => {
  // 处理文件上传
  await fileStore.addFiles(files)
  // 确保表格数据更新
  tableData.value = [...fileStore.files]
}

// 定义重命名规则
const currentRules = ref([
  {
    type: 'replace',
    find: '',
    replace: '',
    useRegex: false,
    caseSensitive: false
  }
])

const virtualListRef = ref() // 添加对VirtualFileList组件的引用

// 处理全选
const handleSelectAll = () => {
  if (virtualListRef.value) {
    virtualListRef.value.selectAll()
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

.operation-buttons {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  padding: 16px;
  border-top: 1px solid var(--el-border-color-light);
}

.history-buttons {
  margin-left: auto;
  margin-right: 16px;
}

:deep(.el-button) {
  padding: 8px 16px;
}

:deep(.el-button [class*=el-icon]+span) {
  margin-left: 6px;
}

/* 修改表格样式 */
:deep(.el-table) {
  --el-table-row-hover-bg-color: #f5f7fa;
  --el-table-border-color: #ebeef5;
  --el-table-header-bg-color: #f5f7fa;
}

/* 默认所有行都是白色背景 */
:deep(.el-table__row) {
  background-color: #ffffff !important;
}

/* 变更的奇数行 - 较深的蓝色 */
:deep(.changed-row.odd-row) {
  background-color: #ecf5ff !important;
  color: var(--el-color-primary);
}

/* 变更的偶数行 - 较浅的蓝色 */
:deep(.changed-row.even-row) {
  background-color: #f5f9ff !important;
  color: var(--el-color-primary);
}

/* 变更行悬停效果 */
:deep(.changed-row:hover td) {
  background-color: #e3effd !important;
}

/* 表格边框和分割线 */
:deep(.el-table) {
  border: 1px solid var(--el-table-border-color);
}

:deep(.el-table__cell) {
  border-bottom: 1px solid var(--el-table-border-color);
}

/* 表头样式 */
:deep(.el-table__header-wrapper th) {
  background-color: var(--el-table-header-bg-color);
  color: var(--el-text-color-primary);
  font-weight: bold;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.show-path-checkbox {
  margin-left: 16px;
}

.variable-help {
  padding: 0px;
}

.help-page {
  height: 680px;
  padding: 12px;
  overflow-y: auto;
  box-sizing: border-box;
}

.help-title {
  color: var(--el-color-primary);
  margin-bottom: 20px;
  font-size: 25px;
  font-weight: 600;
  text-align: center;
}

.vars-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.var-group {
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 20px;
}

.var-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.var-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 6px 0;
}

.var-desc {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.var-tip {
  margin-top: 12px;
  padding: 8px;
  background-color: var(--el-color-info-light-9);
  border-radius: 4px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.5;
}

code {
  font-family: Monaco, Consolas, monospace;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.code-example {
  display: inline-block;
  margin: 4px 0;
  background-color: var(--el-color-info-light-9);
  color: var(--el-color-info);
}

.example-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 20px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}

.divider {
  display: none;
}

.example-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-block {
  margin: 12px 0;
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  padding: 10px 16px;
  border-radius: 6px;
  font-family: Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 3;
  word-break: break-all;
}

.result-text {
  margin: 10px 0;
  background-color: var(--el-fill-color-lighter);
  padding: 12px 16px;
  border-radius: 6px;
  font-family: Monaco, Consolas, monospace;
  font-size: 13px;
  color: var(--el-text-color-primary);
  line-height: 1.5;
}

.code-label, .result-label {
  font-weight: 600;
  color: var(--el-text-color-regular);
  margin: 0px 0;
}

.example-desc {
  margin-top: 12px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 2;
  font-style: italic;
}

.code-primary { background-color: var(--el-color-primary-light-9); color: var(--el-color-primary); }
.code-success { background-color: var(--el-color-success-light-9); color: var(--el-color-success); }
.code-warning { background-color: var(--el-color-warning-light-9); color: var(--el-color-warning); }
.code-info { background-color: var(--el-color-info-light-9); color: var(--el-color-info); }
.code-danger { background-color: var(--el-color-danger-light-9); color: var(--el-color-danger); }

.el-dialog__body {
  padding: 0 !important;
}

.variable-help {
  margin: 0;
  padding: 0;
}

/* 调整对话框样式 */
.variable-help-dialog {
  --el-dialog-padding-primary: 0;
}

.variable-help-dialog .el-dialog__header {
  padding: 20px;
  margin-right: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.variable-help-dialog .el-dialog__body {
  padding: 0 !important;
}

/* 调整轮播图指示器位置 */
.variable-help-dialog .el-carousel__indicators {
  bottom: 20px;
}

/* 美化滚动条 */
.help-page::-webkit-scrollbar {
  width: 6px;
}

.help-page::-webkit-scrollbar-thumb {
  background-color: var(--el-border-color);
  border-radius: 3px;
}

.help-page::-webkit-scrollbar-track {
  background-color: transparent;
}

.help-page {
  padding: 20px;
}

.page-title {
  font-size: 20px;
  margin-bottom: 16px;
  text-align: center;
}

.vars-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.var-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.var-desc {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.format-note {
  margin-top: 12px;
  padding: 8px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

code {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  font-family: Monaco, Consolas, monospace;
}

.regex-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-row {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.regex-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.help-slide {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
}

.help-slide h3 {
  text-align: center;
  margin-bottom: 20px;
  color: var(--el-color-primary);
  font-size: 20px;
}

.example-box {
  background: var(--el-bg-color-page);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.example-item {
  margin-bottom: 16px;
}

.code-block {
  background: var(--el-bg-color);
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.code-block p {
  margin: 8px 0;
  font-family: Monaco, Consolas, monospace;
}

.result-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--el-color-success);
}

.example-desc {
  margin-top: 16px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  font-style: italic;
}

:deep(.el-carousel__item) {
  background-color: var(--el-bg-color);
}

/* 添加进度条样式 */
.progress-section {
  margin: 16px 0;
  padding: 0 16px;
}

.progress-details {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

:deep(.el-progress-bar__inner) {
  transition: width 0.3s ease;
}

:deep(.el-progress__text) {
  font-size: 13px !important;
}

/* 添加排序相关样式 */
:deep(.el-table .caret-wrapper) {
  height: 34px;
}

:deep(.el-table .sort-caret.ascending) {
  top: 5px;
}

:deep(.el-table .sort-caret.descending) {
  bottom: 7px;
}

:deep(.el-table .ascending .sort-caret.ascending) {
  border-bottom-color: var(--el-color-primary);
}

:deep(.el-table .descending .sort-caret.descending) {
  border-top-color: var(--el-color-primary);
}

.progress-container {
  padding: 20px;
}

.progress-text {
  margin-top: 15px;
  text-align: center;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
}
</style>