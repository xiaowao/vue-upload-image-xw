<template>
  <div id="upload-image">
    <div class="drag-container" id="drag-container" @click="onclick" @dragover="fileDragover" @drop="fileDrop">
      <div>
        <img class="image-icon-upload" src="./assets/upload.png">
      </div>
      <label class="upload-text">在此区域点击、拖拽或粘贴上传图片</label>
      <br>
      <span class="upload-info-text">粘贴时要求鼠标放置在此区域</span>
      <input type="file" id="fileInput" ref="uploadFile" accept="image/png,image/jpg" @change="chooseUploadFile">
    </div>
    <div class="image-list-container">
      <div class="image-list-item" v-for="(item, idx) in images" :key="idx">
        <div class="image-view-area">
          <div class="image-overlay" @click="showLightBox(idx)">
            <img class="image-icon-zoom" src="./assets/zoom.svg">
          </div>
          <div class="centered">
            <img :src="item.path" :alt="item.name">
          </div>
        </div>
        <div class="image-icon-delete" @click="deleteImage(idx)"></div>
      </div>
    </div>
    <div>
      <Lightbox
        :visible="visible"
        :imgs="lightBoxData"
        :index="index"
        @hide="handleHide"
      />
    </div>
  </div>
</template>
<script>
import { fileToBase64, getElementPosition } from './utils/index'
import Lightbox from 'vue-easy-lightbox'
export default {
  components: { Lightbox },
  data() {
    return {
      images: [],
      lightBoxData: [],
      visible: false,
      index: 0,
      mx: 0,
      my: 0,
      MAX_UPLOAD_NUM: 10,
      MAX_FILE_SIZE: 1000 * 1000
    }
  },
  watch: {
    images: {
      handler() {
        this.$emit('data-change', this.images)
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    const _this = this
    document.addEventListener('paste', _this.filePaste, false)
    document.addEventListener('mousemove', _this.mouseMove, false)
  },
  beforeDestroy() {
    const _this = this
    document.removeEventListener('paste', _this.filePaste, false)
    document.removeEventListener('mousemove', _this.mouseMove, false)
  },
  methods: {
    onclick() {
      this.$refs.uploadFile.click()
    },
    deleteImage(idx) {
      this.$confirm('确定删除此张图片?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.images.splice(idx, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    chooseUploadFile(event) {
      if (this.images.length === this.MAX_UPLOAD_NUM) {
        this.$message({
          message: `最多上传${this.MAX_UPLOAD_NUM}张图片!`,
          type: 'error',
          duration: 1000
        })
        return
      }
      const files = event.target.files
      if (!files || !files.length) {
        return
      }
      const file = files[0]
      if (!file) {
        return
      }
      if (!this.verificationFileSize(file.size)) {
        this.$refs.uploadFile.value = null
        return
      }
      fileToBase64(file, (base64) => {
        this.images.push({
          source: file,
          path: base64,
          name: file.name
        })
        this.lightBoxData.push(base64)
        // 移除文件，可以保证上传同样的文件时，也会触发change事件
        this.$refs.uploadFile.value = null
      })
    },
    fileDragover(event) {
      event.preventDefault()
    },
    fileDrop(event) {
      event.preventDefault()
      if (this.images.length === this.MAX_UPLOAD_NUM) {
        this.$message({
          message: `最多上传${this.MAX_UPLOAD_NUM}张图片!`,
          type: 'error',
          duration: 1000
        })
        return
      }
      const files = event.dataTransfer.files
      if (!files || !files.length) {
        return
      }
      const file = files[0] // 获取到第一个上传的文件对象
      if (!file) return
      if (!this.verificationFileType(file.name) || !this.verificationFileSize(file.size)) {
        file.value = ''
        return
      }
      fileToBase64(file, (base64) => {
        this.images.push({
          source: file,
          path: base64,
          name: file.name
        })
        this.lightBoxData.push(base64)
        file.value = ''
      })
    },
    filePaste(event) {
      event.preventDefault()
      event.stopPropagation()
      if (this.images.length === this.MAX_UPLOAD_NUM) {
        this.$message({
          message: `最多上传${this.MAX_UPLOAD_NUM}张图片!`,
          type: 'error',
          duration: 1000
        })
        return
      }
      if (!this.checkMousePos('drag-container')) {
        return
      }
      var items = (event.clipboardData || window.clipboardData).items
      var file = null
      if (items && items.length) {
      // 搜索剪切板items
        for (var i = 0; i < items.length; i++) {
          if (this.verificationFileType(items[i].type, '/', false)) {
            file = items[i].getAsFile()
            break
          }
        }
      }
      if (!file) {
        this.$message({
          message: '文件格式错误!',
          type: 'warn',
          center: true,
          duration: 1000
        })
        return
      }
      fileToBase64(file, (base64) => {
        const pos = file.name.lastIndexOf('.')
        let name = ''
        if (pos === -1) {
          name = file.name + '_' + file.lastModified
        } else {
          name = file.name.slice(0, pos) + '_' + file.lastModified + file.name.slice(pos)
        }
        this.images.push({
          source: file,
          path: base64,
          name: name
        })
        this.lightBoxData.push(base64)
      })
    },
    mouseMove(event) {
      this.mx = event.clientX
      this.my = event.clientY
    },

    // 图片类型验证
    verificationFileType(filePath, split = '.', showMessage = true) {
      var fileTypes = ['jpg', 'png']
      // 当括号里面的值为0、空字符、false 、null 、undefined的时候就相当于false
      if (filePath) {
        var isNext = false
        var fileEnd = filePath.substring(filePath.indexOf(split) + 1)
        for (var i = 0; i < fileTypes.length; i++) {
          if (fileTypes[i] === fileEnd) {
            isNext = true
            break
          }
        }
        if (!isNext) {
          if (showMessage) {
            this.$message({
              message: '文件格式错误d!',
              type: 'warn',
              center: true,
              duration: 1000
            })
          }
          return false
        }
        return isNext
      } else {
        if (showMessage) {
          this.$message({
            message: '文件格式获取失败!',
            type: 'warn',
            center: true,
            duration: 1000
          })
        }
        return false
      }
    },

    // 图片大小验证
    verificationFileSize(fileSize) {
      if (fileSize > this.MAX_FILE_SIZE) {
        this.$message({
          message: '文件大小不能大于1M!',
          type: 'warn',
          center: true,
          duration: 1000
        })
        return false
      } else if (fileSize <= 0) {
        this.$message({
          message: '文件大小不能为0M!',
          type: 'warn',
          center: true,
          duration: 1000
        })
        return false
      }
      return true
    },
    showLightBox(index) {
      this.index = index
      this.visible = true
    },
    handleHide() {
      this.visible = false
    },
    checkMousePos(divId) {
      const div = document.getElementById(divId)
      const { x, y } = getElementPosition(div)
      const w = div.offsetWidth
      const h = div.offsetHeight
      const x2 = x + w
      const y2 = y + h
      if (this.mx < x || this.mx > x2 || this.my < y || this.my > y2 || w === 0 || h === 0) {
        return false
      }
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
.drag-container {
  position: relative;
  height: 160px;
  border: 1px dashed #D6D6D6;
  border-radius: 4px;
  background-color: #fff;
  text-align: center;
  cursor: pointer;
  .image-icon-upload {
    margin: 15px 0;
    height: 50px;
    width: 50px;
    vertical-align: middle;
  }
  .upload-text {
    color: #777;
    font-weight: 400;
    line-height: 1.5;
  }
  .upload-info-text {
    font-size: 86%;
    color: #206ec5;
    text-decoration: none;
  }
  #fileInput {
    position: absolute;
    display: none;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
}
.image-list-container {
  display: flex;
  margin-top: 10px;
  flex-wrap: wrap;
  .image-list-item {
    position: relative;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #D6D6D6;
    margin-bottom: 5px;
    &:not(:last-child) {
      margin-right: 5px;
    }
    .centered {
      left: 50%;
      transform: translate(-50%,-50%);
      top: 50%;
      position: absolute;
      display: block;
      img {
        max-width: 25px;
        max-height: 17px;
        vertical-align: middle;
      }
    }
    .image-view-area {
      position: relative;
      height: 32px;
      width: 32px;
     .image-overlay {
        position: relative;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,.4);
        z-index: 10;
        border-radius: 5px;
        opacity: 0;
        transition: all .3s ease-in-out 0s;
        text-align: center;
        cursor: pointer;
        &:hover {
          opacity: 1;
        }
      }
    }
    .image-icon-zoom {
      width: 20px;
      vertical-align: middle;
    }
    .image-icon-delete {
      position: absolute;
      width: 20px;
      height: 20px;
      top: -5px;
      right: -5px;
      border-radius: 50%;
      background: url(./assets/delete.png) no-repeat;
      background-size: cover;
      cursor: pointer;
      &:hover {
        width: 25px;
        height: 25px;
        transition: all .3s linear 0s;
      }
    }
  }
}
</style>
