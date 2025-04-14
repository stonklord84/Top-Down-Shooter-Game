import{
    ctx,
}from "./gameloop.js"

export class Player{
    constructor(x,y,radius,color,w,a,s,d, nickname){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.w = w
        this.a = a
        this.s = s
        this.d = d
        this.nickname = nickname
    }
    draw(){
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI ,false)
        ctx.fill()
        ctx.closePath()
        const textWidth = ctx.measureText(this.nickname).width
        let textX = this.x - textWidth/2
        ctx.fillText(this.nickname, textX, this.y-20)
    }
}
