<script setup lang="ts">
import AccountManager from './components/AccountManager.vue'
</script>

<template>
  <div class="app-container">
    <AccountManager />
  </div>
</template>

<style>
:root {
  --primary-color: #1e88e5;
  --primary-light: #e3f2fd;
  --secondary-color: #ff5722;
  --text-color: #263238;
  --background-color: #f5f7fa;
  --card-background: #ffffff;
  --border-color: #e0e0e0;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  background-color: var(--background-color);
}

.app-container {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  padding: 5px;
}
</style>
