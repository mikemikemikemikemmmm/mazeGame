import * as Pixi from 'pixi.js'
export default class Ball {
    tileWidth: number
    speed: number
    radius: number
    diameter: number
    graphics: Pixi.Graphics
    constructor(tileWidth: number) {
        this.tileWidth = tileWidth
        this.speed = tileWidth / 3 //ball would go out of tile when too fast
        this.radius = tileWidth / 4
        this.diameter = this.radius * 2
        this.graphics = this.createBallGraphics()
    }
    createBallGraphics() {
        let ballGraphics = new Pixi.Graphics()
        ballGraphics.beginFill(0xff0000);
        ballGraphics.drawCircle(this.radius, this.radius, this.radius)
        ballGraphics.endFill();
        return ballGraphics
    }
    isTouchByBounds(bounds: { x: number, y: number, width: number, height: number }) {
        return this.graphics.x + this.diameter > bounds.x &&
            this.graphics.x < bounds.x + bounds.width &&
            this.graphics.y + this.diameter > bounds.y &&
            this.graphics.y < bounds.y + bounds.height;
    }
}