const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const io = require('socket.io')(server);

app.use(express.static('client'))

const players = {}
var bullets = []
var color
let counter = {}

var backendhalfcwidth
var backendhalfcheight


const movementdelay = 50
let movementTimeout = null

let keyqueue = {}
let keyheld = []

let bulletInterval = null

io.on('connection', (socket) => {
    socket.emit('chooseteam', socket.id)
    console.log(`New client! Clientid: ${socket.id}`)

    counter[socket.id] = 0
    if(counter[socket.id] == 0){
        console.log('test')
        updateBullets()
        counter[socket.id] += 1
    }
    socket.on('startgame', (chosencolor,nickname)=>{
        players[socket.id] = {
            x: 350*Math.random(),
            y: 350*Math.random(),
            color: chosencolor,
            radius: 15,
            w: false,
            a: false,
            s: false,
            d: false,
            health: 100,
            nickname: nickname
        }
        keyqueue[socket.id] = {
            w: false,
            a: false,
            s: false,
            d: false
        }
        io.emit('updatePlayers',players)
        socket.emit('updateBackground', socket.id);
    })

    socket.on('playermoved',(keypressed, keyspressed)=>{
        let player = players[socket.id]
        let validkeys = ['w','a','s','d']
        validkeys.forEach((key)=>{
            if(!keyspressed.includes(key)){
                players[socket.id][key] = false
            }
        })
        if (!players[socket.id][keypressed]) {
            players[socket.id][keypressed] = true;
        }          
        clearTimeout(movementTimeout)

        movementTimeout = setTimeout(()=>{
            changeplayerpos(keyspressed, player)
        },1/100)
    })

    let playerSpeed = 5
    function changeplayerpos(keyspressed, player) {
        let velocityX = (player['d'] ? playerSpeed : 0) - (player['a'] ? playerSpeed : 0)
        let velocityY = (player['s'] ? playerSpeed : 0 ) - (player['w'] ? playerSpeed : 0)
        let inputs = Object.values(player).filter((val) => typeof val === 'boolean' && val)


        if(inputs.length === 1){
            player.x += velocityX
            player.y += velocityY
            inputs = Object.values(player).filter((val) => typeof val === 'boolean' && val)
        }
        else if (inputs.length === 2){
            if ((player['a'] && player['d'] && !player['w'] && !player['s']) || (player['w'] && player['s'] && !player['a'] && !player['d'])) {
                // Horizontal movement
                let key = keyspressed[keyspressed.length-1]
                if(key == 'a'){
                    player.x -= playerSpeed
                }
                else if(key == 'd'){
                    player.x += playerSpeed
                }
                else if(key == 'w'){
                    player.y -= playerSpeed
                }
                else if(key == 's'){
                    player.y += playerSpeed
                }
              } else {
                // Diagonal movement
                const magnitude = Math.sqrt(velocityX ** 2 + velocityY ** 2);
                const normalizedX = velocityX / magnitude;
                const normalizedY = velocityY / magnitude;
                const diagonalFactor = Math.sqrt(2) / 1.3; // Adjust the constant value here
                velocityX = normalizedX * playerSpeed * diagonalFactor;
                velocityY = normalizedY * playerSpeed * diagonalFactor;
                player.x += velocityX
                player.y += velocityY
              }
        }
        else if (inputs.length === 3) {
            if(player['a'] && player['w'] && player['d'] && !player['s']){
                player.x += 0
                player.y += velocityY;
            }
            else if(player['a'] && player['s'] && player['d'] && !player['w']){
                player.x += 0
                player.y += velocityY
            }
        }
        io.emit('updatePlayers', players);
    }
     
    let bulletspeed = 20
    socket.on('shooting',(mouseX,mouseY,halfcwidth,halfcheight)=>{
        backendhalfcwidth = halfcwidth
        backendhalfcheight = halfcheight
        const O = mouseY- halfcheight
        const A = mouseX - halfcwidth
        const angle = Math.atan2(O,A)
        bullets.push({
            id: socket.id,
            x: players[socket.id].x,
            y: players[socket.id].y,
            distTraveled: 0,
            radius: 2.5,
            color: 'black',
            angle: angle,
            velocity:{
                x: Math.cos(angle)*bulletspeed,
                y: Math.sin(angle)*bulletspeed,
            }
        })
        io.emit('createBullets',bullets)
    })

    function updateBullets() {
        //console.log('test')
        clearInterval(bulletInterval);
        bulletInterval = setInterval(() => {
            for(var id in bullets){
                let bullet = bullets[id]
                bullet.x += bullet.velocity.x
                bullet.y += bullet.velocity.y
                console.log(bullet.x)
                bullet.distTraveled += 1
                for (var id in players){
                    if(id !== bullet.id){
                        let player = players[id]
                        if (
                            player.x - player.radius < bullet.x &&
                            bullet.x < player.x + player.radius &&
                            player.y - player.radius < bullet.y &&
                            bullet.y < player.y + player.radius
                          ) {
                            io.emit('shot',bullet.id)
                            player.health -= 50
                            bullets.splice(id,1)
                            if(player.health == 0){
                                console.log('victim:')
                                console.log(id)
                                console.log('players:')
                                console.log(players)
                                delete players[id]
                                io.to(id).emit('death', bullet.id, id)
                                io.emit('removecorpse', id)
                              }
                          }
                    }
                }
                if(bullet.distTraveled > 30){
                    bullets.splice(id,1)
                }
            }
            io.emit('createBullets',bullets)
            io.emit('updateBullets',bullets)
        }, 10); // Adjust the interval (in milliseconds) to your desired speed
    }


    socket.on('disconnect',()=>{
        console.log(`client disconnected:${socket.id}`)
        delete(players[socket.id])
        io.emit('disconnectPlayer',socket.id)
        io.emit('updatePlayers',players)
    })
});




server.listen(5000, () => {
    console.log('listening on port 5000');
});








console.log('server loaded')
