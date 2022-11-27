<script setup lang="ts">
import {ref} from 'vue'
const input = ref('')
</script>

<template>
<el-container class="el-container">
    <el-input class = 'el-input' v-model="input" placeholder="请告诉我课程群号~" />
    <el-button>添加</el-button>
</el-container>
</template>

<style scoped>
.el-container{
    position: absolute;
    top: 10%;
    width: 90%;
}
.el-input{
    width: 60%;
    left: 0%;
    right: 0;
    margin: auto;
}
</style>