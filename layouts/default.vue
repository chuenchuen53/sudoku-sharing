<template>
  <el-container id="main-layout-container">
    <el-header id="main-layout-header">Header</el-header>
    <el-main><slot></slot></el-main>
    <el-footer id="main-layout-footer">Footer</el-footer>
  </el-container>
</template>

<style>
#main-layout-container {
  height: 100%;
  width: 100%;
}

#main-layout-header {
  background-color: var(--el-bg-color-overlay);
}

#main-layout-footer {
  background-color: var(--el-bg-color-overlay);
}
</style>
