# vue-upload-image-xw

一个基于 [vue](https://www.npmjs.com/package/vue) 的图片上传组件，支持本地图片选中上传、本地图片拖拽上传、剪贴板图片粘贴(ctrl+v)三种方式，同时，支持上传图片删除及图片浏览。

## Installing

依赖库：[vue](https://www.npmjs.com/package/vue) 2.5+, [vue-easy-lightbox](https://www.npmjs.com/package/vue-easy-lightbox) 0.10+

```shell
npm install vue-easy-lightbox --save
```

```javascript
import UploadImageXw from 'vue-upload-image-xw'
```

## Example

```html
<template>
  <div>
    <upload-image @data-change="changeUploadImageList"> </upload-image>
  </div>
</template>

<script>
export default {
  data () {
    return {
      uploadImages: [] // 待上传的图片
    }
  },
  methods () {
    changeUploadImageList(data) {
      this.uploadImages = data
    }
  }
}
</script>
```
