<script setup lang="ts">
import AccountManager from './components/AccountManager.vue'
</script>

<template>
  <div class="app-container">
    <AccountManager />
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.app-container {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}
</style>
