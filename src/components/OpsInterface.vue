<script setup lang="ts">
import {ref} from 'vue'
import {Menu, Setting, Iphone, House, Headset} from '@element-plus/icons-vue'
import {ipcRenderer} from 'electron'

import NotesVue from './Notes.vue';
import SettingsVue from './Settings.vue';

const showDrawer = ref(false);
const page = ref('0')
const notesData = ref([])

ipcRenderer.on('notes', (evt:any, notes:any)=>{
    console.log('getNotes:')
    console.log(notes)
    notesData.value = notes;
})

</script>

<template>
    <el-button 
        v-if="!showDrawer"
        @click="showDrawer=true"
        :icon = 'Menu'
        circle
        size="large"
    >

    </el-button>

    <el-drawer
        v-model="showDrawer"
        size="20%"
        :show-close="false"
    >
        <template #default>
            <el-menu @select="(index:string)=>{page = index}">
                <el-menu-item index="0">
                    <el-icon><House /></el-icon>
                    <span>主页</span>
                </el-menu-item>
                <el-menu-item index="1">
                    <el-icon><Iphone /></el-icon>
                    <span>QQ</span>
                </el-menu-item>
                <el-menu-item index="2">
                    <el-icon><Setting /></el-icon>
                    <span>设置</span>
                </el-menu-item>
                <el-menu-item index="3">
                    <el-icon><Headset /></el-icon>
                    <span>关于</span>
                </el-menu-item>
            </el-menu>
        </template>

    </el-drawer>

    <NotesVue v-if=" page == '0' " :notes = 'notesData'></NotesVue>
    <SettingsVue v-if=" page == '2' "></SettingsVue>
</template>

<style scoped>
.el-button{
    position: fixed;
    left: 3%;
    bottom: 6%;
}
</style>