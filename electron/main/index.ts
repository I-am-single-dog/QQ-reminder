// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, '../public')

import { app, BrowserWindow, shell, ipcMain, Menu, webContents} from 'electron'
import { release } from 'os'
import { join } from 'path'

import {exec, execFile, execSync} from 'child_process'
const fs = require('fs')
import { fstat } from 'original-fs'

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

async function createWindow() {

  Menu.setApplicationMenu(null);

  win = new BrowserWindow({
    title: 'Main window',
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    width: 1000,
    height: 600,
    // transparent: true,
    frame: false,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      //devTools: false,
    },

  })

  if (app.isPackaged) {
    win.loadFile(indexHtml)
  } else {
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  exec('taskkill -f -t -im go-cqhttp.exe');
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// new window example arg: new windows url
ipcMain.handle('open-win', (event, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (app.isPackaged) {
    childWindow.loadFile(indexHtml, { hash: arg })
  } else {
    childWindow.loadURL(`${url}#${arg}`)
    // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
  }
})


ipcMain.addListener('window-min', ()=>{
  win.minimize();
})

ipcMain.addListener('window-close', ()=>{
  win.close();
})

function jionlpFunc(evt:any, msg:any, date:any)
{
  return new Promise(
    (resolve, reject)=>{
      exec(`"${process.env.PUBLIC}/jionlp.exe" "${msg}" "${date.toDateString()}"`, (err:any, stdout:String, stderr:any)=>{
        if(err | stderr)
        {
          reject('jionlpErr')
        }
        let data = JSON.parse(stdout.replace(new RegExp("'",'g'), '"'));
        resolve(data)
      })
    }
  )
}

ipcMain.handle('jionlp', jionlpFunc)



ipcMain.addListener('login', ()=>{
  return new Promise(
    (resolve, reject)=>{

      let pwd = execSync('chdir');

      execSync(`copy ${process.env.PUBLIC}\\config.yml ${pwd}`);

      let child = exec(`"${process.env.PUBLIC}/go-cqhttp.exe" --faststart`);
        
        child.stdout.on('data',data=>{
          console.log(data)
          if(data.indexOf('qrcode.png') != -1)
          {
            console.log('qrcode.png occurred')
            setTimeout(()=>{win.webContents.send('qrcode', pwd.toString())}, 500);
          }
          
          if(data.indexOf('127.0.0.1:5700') != -1)
          {
            win.webContents.send('loginSucc');
            setTimeout(()=>{getGroupListAndMsg()}, 2000)
          }

        })
      
    }
  )
})

const http = require('http')

http.createServer(
  (req, res)=>{
    if(req.method == 'POST')
    {
        let data;
        let body = '';
        req.on('data',item=>{
            body += item;
        })
        req.on('end', ()=>{
            data = JSON.parse(body);
            router(data);
        })
    }
    
    res.end();
  }
).listen(5701, '127.0.0.1')

var msgData = [];

function gotGroupMsg(gid, msg)
{
  jionlpFunc('', msg, new Date()).then(
    (data)=>{
      // @ts-ignore
      data.time[0] += ' UTC+08:00';
      // @ts-ignore
      let date = new Date(Date.parse(data.time[0]));

      msgData.push({
        group:'',
        gid,
        time:date,
        msg,
      });
      console.log('msgData:')
      console.log(msgData)
      win.webContents.send('notes', msgData);
    }
  ).catch(err=>{

  })
}

function router(data:any)
{
  
  if(data.post_type == 'message')
  {
    console.log("routerMsg:")
    console.log(data)
    if(data.message_type=='group')
        gotGroupMsg(data.group_id, data.message);
  }
}

const axios = require('axios')

function getGroupMsg(gid:Number)
{
    axios.get(`http://127.0.0.1:5700/get_group_msg_history?group_id=${gid}`).then(
    (data)=>{
      data = JSON.parse(data).data.data;
      
      for(let i =0; i<data.length; i++)
      {
        let msg:{
          group: String,
          gid: Number,
          time: Date,
          msg: String
        };
        msg.group='';
        msg.gid=gid;
        msg.msg=data[i].message;
        msg.time=new Date(data[i].time);

        msgData.push(msg);
      }
      
      msgData.sort((a:any, b:any)=>{
        return a.time.getTime()-b.time.getTime();
      })
      console.log('msgData:')
      console.log(msgData)
      win.webContents.send('notes', msgData);
    }
  )  
}

function getGroupListAndMsg()
{
  axios.get('http://127.0.0.1:5700/get_group_list/').then(
    (data)=>{
      console.log('data:')
      console.log(data);
      let glist = JSON.parse(data).data.data;
      console.log('GroupList:')
      console.log(glist)
      for(let i = 0; i<glist.length; i++)
      {
        getGroupMsg(glist[i].group_id)
      }
    }
  ).catch(
    (err)=>{
      console.error(err);
    }
  )
}

process.on('uncaughtException', function (err) {
  console.error('uncaught exception: ' + err);
})