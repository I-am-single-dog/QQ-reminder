<script setup lang="ts">
import {ref, onMounted} from 'vue';
import { ipcRenderer } from 'electron';

const qrCodeSrc = ref('');

onMounted(()=>{
    ipcRenderer.send('login');
})

ipcRenderer.on('qrcode', (evt:any, pwd:string)=>{
    console.log('hello')
    console.log('get:', pwd)
    qrCodeSrc.value = `${pwd}\\qrcode.png`
})

</script>

<template>
<div>
    <el-card
        class = 'el-card'
        v-loading=" qrCodeSrc == '' "
    >
        <template #header>
            <h2>扫描二维码登录</h2>
        </template>
        <el-image
            class = 'el-image'
            element-loading-text="正在启动QQ服务……"
            :src = 'qrCodeSrc'
            fit = "contain"
        >
        </el-image>
    </el-card>
</div>

</template>

<style scoped>
    div{
        
    }
    .el-image{
        width: 80%;
        
        margin-top: 10%;
    }
    .el-card{
        margin-left: 0%;
        margin-right: 0%;
        margin: auto;
        margin-top: 3%;
        text-align: center;
        align-items: center;
        width:40%;
    }
    h2{
        color: grey;
    }
</style>