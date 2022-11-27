<script setup lang="ts">
import {ref} from 'vue'
import {ipcRenderer} from 'electron'
import {SemiSelect, CloseBold} from '@element-plus/icons-vue'

import OpsInterfaceVue from './components/OpsInterface.vue';
import QQlink from './components/QQlink.vue';

const haveLoggedIn = ref(false);

function windowMinSize()
{
  ipcRenderer.send('window-min')
}

function windowClose()
{
  ipcRenderer.send('window-close')
}

ipcRenderer.on('loginSucc', (evt:any)=>{
  haveLoggedIn.value=true;
  
})

</script>

<template>
<div calss = 'main'>
  <el-container>
    <el-header style="-webkit-app-region: drag; position: absolute; top: 2%; left: 0; right: 0%;">
      <span style="-webkit-app-region: no-drag;">
        <el-button :icon="SemiSelect" circle size="small" @click="windowMinSize" 
            style="margin-top:0%; z-index:10; position: fixed; top: 2%; left: 1%;
            -webkit-app-region: no-drag;"
            ></el-button>
        <el-button :icon="CloseBold" circle size="small" @click="windowClose" 
            style="margin-top:0%; z-index:10; position: fixed; top: 2%; left: 3%;
            -webkit-app-region: no-drag;"
            ></el-button> 
      </span>
    </el-header>
    <el-main>
      
      
      <QQlink
        v-if="!haveLoggedIn"
      ></QQlink>

      <OpsInterfaceVue
        v-else
      ></OpsInterfaceVue>
      
    </el-main>
    
  </el-container>
</div>
</template>

<style>


</style>
