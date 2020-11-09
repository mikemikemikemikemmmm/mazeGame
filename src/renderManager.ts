
import * as Pixi from 'pixi.js'
import Maze from './maze'
export default class RenderManager {
    appWidth: number
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
    endBounds!: any
    mazeGraphics!: Pixi.Graphics
    ballGraphics!: Pixi.Graphics
    keyBoardData!: any
    bindHandlePress!: (e: KeyboardEvent) => void
    bindHandleUnPress!: (e: KeyboardEvent) => void
    bindGameLoop!: () => void
    constructor(
        appWidth: number,
        rowLength: number
    ) {
        this.rowLength = rowLength
        this.appWidth = appWidth
        this.tileWidth = appWidth / rowLength
        this.ballSpeed = this.tileWidth / 3 //ball would go out of tile when too fast
        this.ballRadius = this.tileWidth / 4
        this.ballDiameter = this.ballRadius * 2
        this.app = new Pixi.Application({
            width: this.appWidth,
            height: this.appWidth,
            backgroundColor: 0xFFFFFF
        })
        this.init()
    }
    resetConfig() {
        this.app.ticker.remove(this.bindGameLoop)
        this.appContainer.destroy({
            children: true,
            texture: true,
            baseTexture: true
        })
    }
    init() {
        this.appContainer = new Pixi.Container()
        this.bindHandlePress = this.handleKeyBoardPress.bind(this)
        this.bindHandleUnPress = this.handleKeyBoardUnPress.bind(this)
        this.maze = new Maze(this.rowLength)
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
        this.mazeGraphics = this.createMazeGraphics()
        this.appContainer.addChild(this.mazeGraphics, this.ballGraphics)
        this.ballGraphics.x = (this.appWidth / 2) - this.ballRadius
        this.ballGraphics.y = (this.appWidth / 2) - this.ballRadius
        this.app.stage.addChild(this.appContainer)
        this.bindGameLoop = this.gameLoop.bind(this)
        this.app.ticker.add(this.bindGameLoop)
        this.initKeyListener()
    }
    isWin() {
        return this.ballGraphics.x + this.ballDiameter > this.endBounds.x &&
            this.ballGraphics.x < this.endBounds.x + this.endBounds.width &&
            this.ballGraphics.y + this.ballDiameter > this.endBounds.y &&
            this.ballGraphics.y < this.endBounds.y + this.endBounds.height;
    }
    handleWin() {
        this.removeKeyListender()
        if (window.confirm('win，another game?')) {
            this.resetConfig()
            this.init()
        } else {
            this.app.ticker.stop()
        }
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
        document.removeEventListener('keyup', this.bindHandleUnPress)
        document.removeEventListener('keydown', this.bindHandlePress)
    }
    handleKeyBoardPress(e: KeyboardEvent) {
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
        const leftTopPoint = [rowIndex * this.tileWidth, colIndex * this.tileWidth]
        return [leftTopPoint, leftTopPoint.map(coordinates => coordinates + this.tileWidth)]
    }
    isWallByXY(x: number, y: number) {
        const tileType = this.maze.maze[Math.ceil(x / this.tileWidth) - 1][Math.ceil(y / this.tileWidth) - 1]
        return tileType === '0' || tileType === '1' //0 is edge, 1 is wall
    }
    getMaxCoordinates(direction: 'up' | 'down' | 'left' | 'right', x: number, y: number) {//when touch wall
        switch (direction) {
            case 'up':
                return y - y % this.tileWidth + 2
            case 'right':
                return x - (x + this.ballDiameter) % this.tileWidth + this.tileWidth - 2
            case 'down':
                return y - (y + this.ballDiameter) % this.tileWidth + this.tileWidth - 2
            case 'left':
                return x - x % this.tileWidth + 2
        }
    }
    isTouchWall(direction: 'up' | 'down' | 'left' | 'right', x: number, y: number) {
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
            if (this.isWin()) {
                this.handleWin()
                return
            }
            const { x, y } = this.ballGraphics
            if (this.isTouchWall('up', x, y)) {
                this.ballGraphics.y = this.getMaxCoordinates('up', x, y)
            } else {
                this.ballGraphics.y -= this.ballSpeed
            }
        }
        if (this.keyBoardStatus['a']) {
            if (this.isWin()) {
                this.handleWin()
                return
            }
            const { x, y } = this.ballGraphics
            if (this.isTouchWall('left', x, y)) {
                this.ballGraphics.x = this.getMaxCoordinates('left', x, y)
            } else {
                this.ballGraphics.x -= this.ballSpeed
            }
        }
        if (this.keyBoardStatus['s']) {
            if (this.isWin()) {
                this.handleWin()
                return
            }
            const { x, y } = this.ballGraphics
            if (this.isTouchWall('down', x, y)) {
                this.ballGraphics.y = this.getMaxCoordinates('down', x, y)
            } else {
                this.ballGraphics.y += this.ballSpeed
            }
        }
        if (this.keyBoardStatus['d']) {
            if (this.isWin()) {
                this.handleWin()
                return
            }
            const { x, y } = this.ballGraphics
            if (this.isTouchWall('right', x, y)) {
                this.ballGraphics.x = this.getMaxCoordinates('right', x, y)
            } else {
                this.ballGraphics.x += this.ballSpeed
            }
        }
    }
}