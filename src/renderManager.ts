
import * as Pixi from 'pixi.js'
import Maze from './maze'
export default class RenderManager {
    screenWidth: number
    rowLength: number
    tileWidth: number //px
    ballSpeed: number
    ballRadius: number
    ballDiameter: number
    directionData: any
    //set in init
    app!: Pixi.Application
    maze!: Maze
    appContainer!: Pixi.Container
    keyBoardStatus!: { 'w': boolean, 'a': boolean, 's': boolean, 'd': boolean }
    endCoordinates!: number[][]
    endBounds: any
    mazeGraphics!: Pixi.Graphics
    ballGraphics!: Pixi.Graphics
    bindHandlePress!:(e:KeyboardEvent)=>void
    bindHandleUnPress!:(e:KeyboardEvent)=>void
    constructor(
        screenWidth: number,
        rowLength: number
    ) {
        this.rowLength = rowLength
        this.screenWidth = screenWidth
        this.tileWidth = screenWidth / rowLength
        this.ballSpeed = this.tileWidth / 2
        this.ballRadius = this.tileWidth / 4
        this.ballDiameter = this.ballRadius * 2
        this.init()
    }
    init() {
        this.bindHandlePress = this.handleKeyBoardPress.bind(this)
        this.bindHandleUnPress = this.handleKeyBoardUnPress.bind(this)
        this.maze = new Maze(this.rowLength)
        this.app = new Pixi.Application({
            width: this.screenWidth,
            height: this.screenWidth,
            backgroundColor: 0xFFFFFF
        })
        this.appContainer = new Pixi.Container()
        this.keyBoardStatus = {
            'w': false,
            'a': false,
            's': false,
            'd': false
        }
        this.endCoordinates = this.mazeIndexMapToCanvasCoordinate(this.maze.endIndex.row, this.maze.endIndex.col)
        this.endBounds = {
            x: this.endCoordinates[0][0],
            y: this.endCoordinates[0][1],
            width: this.tileWidth,
            height: this.tileWidth
        }
        this.ballGraphics = this.createBallGraphics()
        this.ballGraphics.x = (this.screenWidth / 2) - this.ballRadius
        this.ballGraphics.y = (this.screenWidth / 2) - this.ballRadius
        this.mazeGraphics = this.createMazeGraphics()
        this.appContainer.addChild(this.mazeGraphics, this.ballGraphics)
        this.app.stage.addChild(this.appContainer)
        this.initKeyListener()
        const bindGameLoop = this.gameLoop.bind(this)
        this.app.ticker.add(bindGameLoop)
    }
    isWin() {
        return this.ballGraphics.x + this.ballDiameter > this.endBounds.x &&
            this.ballGraphics.x < this.endBounds.x + this.endBounds.width &&
            this.ballGraphics.y + this.ballDiameter > this.endBounds.y &&
            this.ballGraphics.y < this.endBounds.y + this.endBounds.height;
    }

    createBallGraphics() {
        let ballGraphics = new Pixi.Graphics()
        ballGraphics.beginFill(0xff0000);
        ballGraphics.drawCircle(this.ballRadius, this.ballRadius, this.ballRadius)
        ballGraphics.endFill();
        return ballGraphics
    }
    createMazeGraphics() {
        let mazeGraphics = new Pixi.Graphics()
        this.maze.maze.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                if (col === '1' || col === '0') { // 1 is wall, 0 is edge
                    mazeGraphics.beginFill(0x000000);
                    mazeGraphics.drawRect(
                        this.tileWidth * rowIndex,
                        this.tileWidth * colIndex,
                        this.tileWidth,
                        this.tileWidth)
                    mazeGraphics.endFill();
                }
                else if (col === '7') { //end
                    const endText = new Pixi.Text('終', { fontSize: this.tileWidth, fill: 0xff0000, fontWeight: 900, align: "" });
                    mazeGraphics.addChild(endText)
                    endText.x = rowIndex * this.tileWidth + (this.tileWidth - endText.width) / 2
                    endText.y = colIndex * this.tileWidth + (this.tileWidth - endText.width) / 2
                }
            })
        })
        return mazeGraphics
    }
    initKeyListener() {
        document.addEventListener('keyup', this.bindHandleUnPress)
        document.addEventListener('keydown', this.bindHandlePress)
    }
    removeKeyListender() {
        document.removeEventListener('keyup',  this.bindHandleUnPress)
        document.removeEventListener('keydown', this.bindHandlePress)
    }
    handleKeyBoardPress(e: KeyboardEvent) {
        console.log(e)
        const { key } = e
        if (!(key in this.keyBoardStatus)) {
            return
        }
        //@ts-ignore
        this.keyBoardStatus[key] = true
    }
    handleKeyBoardUnPress(e: KeyboardEvent) {
        const { key } = e
        if (!(key in this.keyBoardStatus)) {
            return
        }
        //@ts-ignore
        this.keyBoardStatus[key] = false
    }
    mazeIndexMapToCanvasCoordinate(rowIndex: number, colIndex: number) {
        const leftTop = [rowIndex * this.tileWidth, colIndex * this.tileWidth]
        return [leftTop, leftTop.map(coordinates => coordinates + this.tileWidth)]
    }
    isWallByXY(x: number, y: number) {
        const tileType = this.maze.maze[Math.ceil(x / this.tileWidth) - 1][Math.ceil(y / this.tileWidth) - 1]
        return tileType === '0' || tileType === '1'
    }
    getMaxCoordinates(direction: 'up' | 'down' | 'left' | 'right', x: number, y: number) {//when touch wall
        switch (direction) {
            case 'up':
                return Math.floor(y - y % this.tileWidth + 1)
            case 'right':
                return Math.ceil(x - (x + this.ballDiameter) % this.tileWidth + this.tileWidth - 1)
            case 'down':
                return Math.ceil(y - (y + this.ballDiameter) % this.tileWidth + this.tileWidth - 1)
            case 'left':
                return Math.floor(x - x % this.tileWidth + 1)
        }
    }
    isTouchWall(direction: 'up' | 'down' | 'left' | 'right', x: number, y: number) {
        if (this.isWin()) {
            this.removeKeyListender()
            if (window.confirm('win')) {
                this.init()
            } else {
                this.app.ticker.stop()
            }
            return
        }
        switch (direction) {
            case 'up':
                if (this.isWallByXY(x, y - this.ballSpeed) ||
                    this.isWallByXY(x + this.ballDiameter, y - this.ballSpeed)) {
                    return true
                }
                break
            case 'right':
                if (this.isWallByXY(x + this.ballDiameter + this.ballSpeed, y) ||
                    this.isWallByXY(x + this.ballDiameter + this.ballSpeed, y + this.ballDiameter)) {
                    return true
                }
                break
            case 'down':
                if (this.isWallByXY(x, y + this.ballDiameter + this.ballSpeed) ||
                    this.isWallByXY(x + this.ballDiameter, y + this.ballDiameter + this.ballSpeed)) {
                    return true
                }
                break
            case 'left':
                if (this.isWallByXY(x - this.ballSpeed, y) ||
                    this.isWallByXY(x - this.ballSpeed, y + this.ballDiameter)) {
                    return true
                }
                break
        }
        return false
    }
    gameLoop() {
        if (this.keyBoardStatus['w']) {
            const { x, y } = this.ballGraphics
            if (this.isTouchWall('up', x, y)) {
                this.ballGraphics.y = this.getMaxCoordinates('up', x, y)
            } else {
                this.ballGraphics.y -= this.ballSpeed
            }
        }
        if (this.keyBoardStatus['a']) {
            const { x, y } = this.ballGraphics
            if (this.isTouchWall('left', x, y)) {
                this.ballGraphics.x = this.getMaxCoordinates('left', x, y)
            } else {
                this.ballGraphics.x -= this.ballSpeed
            }
        }
        if (this.keyBoardStatus['s']) {
            const { x, y } = this.ballGraphics
            if (this.isTouchWall('down', x, y)) {
                this.ballGraphics.y = this.getMaxCoordinates('down', x, y)
            } else {
                this.ballGraphics.y += this.ballSpeed
            }
        }
        if (this.keyBoardStatus['d']) {
            const { x, y } = this.ballGraphics
            if (this.isTouchWall('right', x, y)) {
                this.ballGraphics.x = this.getMaxCoordinates('right', x, y)
            } else {
                this.ballGraphics.x += this.ballSpeed
            }
        }
    }
}