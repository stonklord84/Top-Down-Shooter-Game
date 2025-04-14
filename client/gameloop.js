import {
    Player
  } from "./player.js"
import{
    Bullet
} from "./bullet.js"

const socket = io()
const c = document.getElementById("gamecanvas")
export const ctx = c.getContext('2d')
 
c.width = innerWidth
c.height = innerHeight
 
var players = {}
var keys = {

  }
 
var cameraX
var cameraY
var movingplayers = {}
var bullets = []

const teamWehrmacht = document.getElementById('wehrmacht')
const teamRedarmy = document.getElementById('redarmy')
const nicknamebox = document.getElementById('nickname')
const deathmsg = document.getElementById('deathmessage')
var nickname = ''

var alivestatus = false

socket.on('chooseteam', (playerjoined)=>{
    deathmsg.style.visibility = 'hidden'
    teamWehrmacht.style.visibility = 'visible'
    teamRedarmy.style.visibility = 'visible'
    nicknamebox.style.visibility = 'visible'
    teamWehrmacht.addEventListener('click',()=>{
        console.log('bruh????')
        nickname = nicknamebox.value
        let feldgrau = 'rgb(77,93,83)'
        socket.emit('startgame',feldgrau,nickname)
        teamWehrmacht.style.visibility = 'hidden'
        teamRedarmy.style.visibility = 'hidden'
        nicknamebox.style.visibility = 'hidden'
        alivestatus = true
        setTimeout(addeventlisteners,10)
    })
    teamRedarmy.addEventListener('click',()=>{
        nickname = nicknamebox.value
        let red = 'red'
        socket.emit('startgame', red,nickname)
        teamWehrmacht.style.visibility = 'hidden'
        teamRedarmy.style.visibility = 'hidden'
        nicknamebox.style.visibility = 'hidden'
        alivestatus = true
        setTimeout(addeventlisteners,10)
    })
})

let clickEventHandler = (e) =>{
    socket.emit('shooting',e.clientX,e.clientY,c.width/2,c.height/2)
}

let keydownEventHandler = (e) =>{
    keys[e.key] = true
}

let keyupEventHandler = (e) =>{
    delete keys[e.key]
}

function addeventlisteners(){
    
    addEventListener('keydown', keydownEventHandler)

    addEventListener('keyup', keyupEventHandler)
    
    addEventListener('click', clickEventHandler)
}

 
socket.on('updatePlayers', (backendplayers) => {
    for (var id in backendplayers) {
        if (!players[id]) {
            let backendplayer = backendplayers[id]
            players[id] = new Player(backendplayer.x, backendplayer.y, backendplayer.radius, backendplayer.color,
            backendplayer.w, backendplayer.a, backendplayer.s, backendplayer.d, backendplayer.nickname)
            cameraX = players[id].x - c.width / 2
            cameraY = players[id].y - c.height / 2
        }else {
        let backendplayer = backendplayers[id]
        players[id] = new Player(backendplayer.x, backendplayer.y, backendplayer.radius, backendplayer.color,
          backendplayer.w, backendplayer.a, backendplayer.s, backendplayer.d, backendplayer.nickname)
        }
    }
})
   
socket.on('updateBackground', (socketid) => {
    movingplayers[socketid] = true
})

socket.on('createBullets',(backendbullets)=>{
    bullets = []
    for(var i in backendbullets){
        let bullet = new Bullet(backendbullets[i].id, backendbullets[i].x, backendbullets[i].y, backendbullets[i].radius, backendbullets[i].color)
        bullets.push(bullet)
    }
})

socket.on('updateBullets', (backendBullets) => {
    //bullets = backendBullets
    backendBullets.forEach((backendBullet, i) => {
      bullets[i].x = backendBullet.x;
      bullets[i].y = backendBullet.y;
    });
  });
 
socket.on('shot', (shooter)=>{
    //console.log(shooter)
})


socket.on('death', (killerID, victimID)=>{
    //alert('L')
    console.log('you died')
    delete(players[victimID])
    delete(movingplayers[victimID])
    teamWehrmacht.style.visibility = 'visible'
    teamRedarmy.style.visibility = 'visible'
    removeEventListener('click',clickEventHandler)
    removeEventListener('keydown',keydownEventHandler)
    removeEventListener('keyup',keyupEventHandler)
   
})

socket.on('removecorpse',(id)=>{
    delete players[id]
})

socket.on('disconnectPlayer', (id) => {
    delete (players[id])
    delete (movingplayers[id])
})

function updateCamera() {
    for(var id in movingplayers) {
        let player = players[id]
        if (player) {
            cameraX = player.x - c.width / 2
            cameraY = player.y - c.height / 2
            break
        }
    }
}
 
function animate(){
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, c.width, c.height)
    updateCamera()
    ctx.translate(-cameraX, -cameraY)
    ctx.fillStyle = 'black'
    ctx.fillRect(50, 50, 10, 50)
    let inputs = []
   
    //console.log(keys)
    for (var key in keys){
        inputs.unshift(key)
    }
    
    for (var key in keys) {
        if (keys[key]) {
            let validKeys = ['w', 'a', 's', 'd'];
            if(validKeys.includes(key)){
                socket.emit('playermoved', key, inputs)
            }
        }
    }
    for (var id in players) {
        let player = players[id]
        player.draw()
    }
    for (var i in bullets){
        console.log(bullets)
        let b = bullets[i]
        b.draw()
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0)
}
 
addEventListener('resize', () => {
    ctx.clearRect(0, 0, c.width, c.height)
    c.width = innerWidth
    c.height = innerHeight
    for (var id in players) {
        let player = players[id]
        player.draw()
    }
})
 
animate()
