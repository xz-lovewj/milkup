<script setup lang='ts'>
</script>

<template>
  <div class='UploadConfigBox'>
    <input type="radio" id="temp" name="pasteMethod" value="local" checked>
    <label for="temp">本地文件</label>
    <input type="radio" id="local" name="pasteMethod" value="base64">
    <label for="local">转为 Base64</label>
    <input type="radio" id="remote" name="pasteMethod" value="remote">
    <label for="remote">上传</label>
  </div>
</template>

<style lang='less' scoped>
.UploadConfigBox {
  width: 100%;
  height: 100%;
}
</style>