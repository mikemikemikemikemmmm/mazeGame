
import * as Pixi from 'pixi.js'
import Maze from './maze'
import Ball from './Ball'
export default class RenderManager {
    appWidth: number
    rowLength: number
    tileWidth: number //px
    directionData: {
        [key: string]: {
            axis: 'y' | 'x',
            vector: -1 | 1,
            direction: 'up' | 'left' | 'down' | 'right'
        }
    }
    itemData: any
    //set in init
    ball!: Ball
    app!: Pixi.Application
    maze!: Maze
    appContainer!: Pixi.Container
    keyBoardStatus!: { 'w': boolean, 'a': boolean, 's': boolean, 'd': boolean }
    endCoordinates!: number[][]
    endBounds!: any
    mazeGraphics!: Pixi.Graphics
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
        this.app = new Pixi.Application({
            width: this.appWidth,
            height: this.appWidth,
            backgroundColor: 0xFFFFFF
        })
        this.directionData = {
            w: {
                direction: 'up',
                axis: 'y',
                vector: -1
            },
            a: {
                direction: 'left',
                axis: 'x',
                vector: -1
            },
            s: {
                direction: 'down',
                axis: 'y',
                vector: 1
            },
            d: {
                direction: 'right',
                axis: 'x',
                vector: 1
            },
        }
        this.itemData = {
            1: {
                name: 'wall',
                whenTouch: () => {

                }
            },
            7: {
                name: 'endPoint',
                whenTouch: () => {
                    this.removeKeyListender()
                    if (window.confirm('win，another game?')) {
                        this.resetConfig()
                        this.init()
                    } else {
                        this.app.ticker.stop()
                    }
                }
            }
        }
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
        this.mazeGraphics = this.createMazeGraphics()
        this.ball = new Ball(this.tileWidth)
        this.appContainer.addChild(this.mazeGraphics, this.ball.graphics)
        this.ball.graphics.x = (this.appWidth / 2) - this.ball.radius
        this.ball.graphics.y = (this.appWidth / 2) - this.ball.radius
        this.app.stage.addChild(this.appContainer)
        this.bindGameLoop = this.gameLoop.bind(this)
        this.app.ticker.add(this.bindGameLoop)
        this.initKeyListener()
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
                return x - (x + this.ball.diameter) % this.tileWidth + this.tileWidth - 2
            case 'down':
                return y - (y + this.ball.diameter) % this.tileWidth + this.tileWidth - 2
            case 'left':
                return x - x % this.tileWidth + 2
        }
    }
    isTouchWall(direction: 'up' | 'down' | 'left' | 'right', x: number, y: number) {
        switch (direction) {
            case 'up':
                if (this.isWallByXY(x, y - this.ball.speed) ||
                    this.isWallByXY(x + this.ball.diameter, y - this.ball.speed)) {
                    return true
                }
                break
            case 'right':
                if (this.isWallByXY(x + this.ball.diameter + this.ball.speed, y) ||
                    this.isWallByXY(x + this.ball.diameter + this.ball.speed, y + this.ball.diameter)) {
                    return true
                }
                break
            case 'down':
                if (this.isWallByXY(x, y + this.ball.diameter + this.ball.speed) ||
                    this.isWallByXY(x + this.ball.diameter, y + this.ball.diameter + this.ball.speed)) {
                    return true
                }
                break
            case 'left':
                if (this.isWallByXY(x - this.ball.speed, y) ||
                    this.isWallByXY(x - this.ball.speed, y + this.ball.diameter)) {
                    return true
                }
                break
        }
        return false
    }
    handleKeyBoardStatus(keyCode: 'w' | 'a' | 's' | 'd') {
        if (this.ball.isTouchByBounds(this.endBounds)) {
            this.handleWin()
            return
        }
        const { x, y } = this.ball.graphics
        const { vector, direction, axis } = this.directionData[keyCode]
        if (this.isTouchWall(direction, x, y)) {
            this.ball.graphics[axis] = this.getMaxCoordinates(direction, x, y)
        } else {
            this.ball.graphics[axis] += this.ball.speed * vector
        }

    }
    gameLoop() {
        if (!this.keyBoardStatus['w'] || !this.keyBoardStatus['s']) {
            if (this.keyBoardStatus['w']) {
                this.handleKeyBoardStatus('w')
            }
            if (this.keyBoardStatus['s']) {
                this.handleKeyBoardStatus('s')
            }
        }
        if (!this.keyBoardStatus['a'] || !this.keyBoardStatus['d']) {
            if (this.keyBoardStatus['a']) {
                this.handleKeyBoardStatus('a')
            }
            if (this.keyBoardStatus['d']) {
                this.handleKeyBoardStatus('d')
            }
        }
    }
}