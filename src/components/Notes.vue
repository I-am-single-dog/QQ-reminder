<script setup lang="ts">
//  @ts-nocheck
import {CloseBold} from '@element-plus/icons-vue'
import {ref} from 'vue'

interface note {
    group: String,
    gid: Number,
    time: Date,
    msg: String
}

// interface NoteClass{
//     A: Array<Number>,
//     B: Array<Number>
// }

const props = defineProps({
  notes:Array<note>
})

// const init: note = {
//     group : '你好',
//     gid: 123,
//     time : new Date(),
//     msg : '123'
// }

// const data = ref([init])

const nowSelClass = ref('0');

</script>

<template>
<el-container class="el-container">
    <el-aside>
        <el-menu 
            class="el-menu"
            @select="(index:string)=>{nowSelClass = index}"
        >
                <el-menu-item index="0">
                    <span>默认分组</span>
                </el-menu-item>
                
            </el-menu>
    </el-aside>

    <el-main>
        <el-card class="box-card" 
                v-for="note in notes"
                v-if="nowSelClass == '0'"
            >
            <template #header>
            <div class="card-header">
                <span>{{note.group}}</span>
                <el-button class="button" :icon="CloseBold" circle></el-button>
            </div>
            </template>

            <div>{{note.msg}}</div>
            <el-divider></el-divider>
            <div class = 'timemsg'>{{note.time.getMonth()}} / {{note.time.getDate()}} &nbsp; 
                {{note.time.getHours()}} : 
                {{(note.time.getMinutes() < 10) ? '0' + note.time.getMinutes() : note.time.getMinutes()}}
            </div>

        </el-card>
    </el-main>
</el-container>
</template>

<style scoped>

.el-container{
    margin-top: 5%;
    width: 90%;
}

.card-header {
    color: #6190e8;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.box-card{
    width: 90%;
    left: 0;
    right: 0;
    margin: auto;
    margin-top: 2%;
}

.timemsg{
    color: #6190e8;
}

.el-menu{
    position: fixed;
    width: 20%;
}
</style>