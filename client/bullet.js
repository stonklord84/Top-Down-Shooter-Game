import{
    ctx
} from "./gameloop.js"

export class Bullet{
    constructor(id,x,y,radius,color){
        this.id = id
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw(){
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI ,false)
        ctx.fill()
        ctx.closePath()
    }
}
