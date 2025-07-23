<script setup lang="ts">
import ThemeSetter from './ThemeSetter.vue'
import SpellCheckSetter from './SpellCheckSetter.vue';
import UploadConfig from './UploadConfig.vue';
</script>

<template>
  <div class="SettingBaseBox">
    <div class="settingItem">
      <span class="title">主题</span>
      <ThemeSetter />
    </div>
    <div class="settingItem">
      <span class="title">拼写检查</span>
      <SpellCheckSetter />
    </div>
    <div class="settingItem">
      <span class="title">当图片粘贴时</span>
      <UploadConfig />
    </div>
  </div>
</template>

<style lang="less" scoped>
.SettingBaseBox {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .settingItem {
    display: flex;
    flex-direction: column;
    gap: 8px;
    .title{
      font-size: 14px;
      color: var(--text-color-1);
    }
  }
}
</style>
