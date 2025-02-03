<template>
  <div class="video-gif">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>视频转GIF</span>
        </div>
      </template>

      <el-form :model="convertForm" label-width="120px">
        <el-form-item label="GIF尺寸">
          <el-select v-model="convertForm.size">
            <el-option label="原始尺寸" value="original" />
            <el-option label="720p" value="720p" />
            <el-option label="480p" value="480p" />
            <el-option label="360p" value="360p" />
          </el-select>
        </el-form-item>
        <el-form-item label="帧率">
          <el-select v-model="convertForm.fps">
            <el-option label="30fps" :value="30" />
            <el-option label="24fps" :value="24" />
            <el-option label="15fps" :value="15" />
            <el-option label="10fps" :value="10" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-slider
            v-model="convertForm.timeRange"
            range
            :max="maxDuration"
            :format-tooltip="formatTime"
          />
        </el-form-item>
      </el-form>

      <el-upload
        drag
        :auto-upload="false"
        accept="video/*"
        @change="handleFileChange"
      >
        <el-icon><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽视频到此处或 <em>点击上传</em>
        </div>
      </el-upload>

      <div class="preview-container mt-4" v-if="videoUrl">
        <video
          ref="videoRef"
          :src="videoUrl"
          controls
          style="max-width: 100%"
        ></video>
      </div>

      <div class="preview-container mt-4" v-if="gifUrl">
        <img :src="gifUrl" alt="预览GIF" style="max-width: 100%" />
      </div>

      <div class="actions mt-4">
        <el-button type="primary" @click="handleConvert">开始转换</el-button>
        <el-button @click="resetForm">重置</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'

const convertForm = ref({
  size: 'original',
  fps: 15,
  timeRange: [0, 5]
})

const maxDuration = ref(0)
const videoUrl = ref('')
const gifUrl = ref('')
const videoRef = ref<HTMLVideoElement>()

const handleFileChange = (file: File) => {
  // TODO: 处理文件变化
  videoUrl.value = URL.createObjectURL(file)
}

const handleConvert = () => {
  // TODO: 实现转换逻辑
}

const resetForm = () => {
  convertForm.value = {
    size: 'original',
    fps: 15,
    timeRange: [0, 5]
  }
  videoUrl.value = ''
  gifUrl.value = ''
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.mt-4 { margin-top: 16px; }

.preview-container {
  max-width: 100%;
  overflow: hidden;
  border-radius: 4px;
  background-color: #000;
}
</style> 