<script setup lang="ts">
import ThemeSetter from './ThemeSetter.vue'
import SpellCheckSetter from './SpellCheckSetter.vue';
</script>

<template>
  <div class="SettingBaseBox">
    <ThemeSetter />
    <SpellCheckSetter />
  </div>
</template>

<style lang="less" scoped>
.SettingBaseBox {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
