/*
  array element mean:
  0:外框, edge
  1:間隔, interval
  2:未造訪, Not visited
  3:已造訪, Visited
  4:已回朔, Backtracked
  5:不合法, illegal
  6:起點, starting point
  7:終點, end point
*/
/*
  vector array index mean:
  [up,right,down,left]
  0:上
  1:右
  2:下
  3:左
*/
import * as Pixi from 'pixi.js'
export default class MazeArr {
    maze!: string[][]
    roadRun: string
    tileWidth:number
    backPointList: any[]
    startPositionIndex: number
    endIndex!: {
        row: number
        col: number
    }
    graphics!: Pixi.Graphics
    private rowLegnth: number
    private directionList: any
    constructor(rowLegnth: number,tileWidth:number) {
        this.tileWidth =tileWidth 
        this.rowLegnth = rowLegnth || 25
        this.directionList = [[-1, 0], [0, 1], [1, 0], [0, -1]]
        this.roadRun = ''
        this.startPositionIndex = (this.rowLegnth - 1) / 2
        this.backPointList = []
        this.init()
    }
    createMazeRow() {
        let tempMazeRow = ['0']  //ex:0,2,1,2,1,2,1,2,0
        const totalPushTime = (this.rowLegnth - 1) / 2
        for (let index = 0; index < totalPushTime; index++) {
            tempMazeRow.push('2')
            if (index + 1 !== totalPushTime) {
                tempMazeRow.push('1')
            }
        }
        tempMazeRow.push('0')
        return tempMazeRow
    }
    createEmptyMaze() {
        let tempMaze = []
        const gapRow = (() => {
            let arr = ['0']
            for (let index = 0; index < this.rowLegnth - 2; index++) {
                arr.push('1')
            }
            arr.push('0')
            return arr
        })()
        const tempMazeOuterFrameRow = (() => {
            let arr = []
            for (let index = 0; index < this.rowLegnth; index++) {
                arr.push('0')
            }
            return arr
        })()
        tempMaze.push([...tempMazeOuterFrameRow])
        for (let index = 1; index < this.rowLegnth / 2; index++) {
            tempMaze.push(this.createMazeRow())
            if (index !== (this.rowLegnth - 1) / 2) {
                tempMaze.push([...gapRow])
            }
        }
        tempMaze.push([...tempMazeOuterFrameRow])
        tempMaze[this.startPositionIndex][this.startPositionIndex] = '6'//設置起點, set start point
        return [...tempMaze]
    }
    checkAround(rowIndex: number, colIndex: number): string[] {
        let aroundStaus = ['', '', '', ''] //[up,right,bottom,left]
        let YVector: number
        let XVector: number
        const checkPositionByVector = (times: number) => { // 5 is out of boundry
            if (this.maze[rowIndex + YVector * times]) {
                if (this.maze[rowIndex + YVector * times][colIndex + XVector * times]) {
                    return String(this.maze[rowIndex + YVector * times][colIndex + XVector * times])
                } else {
                    return '5'
                }
            } else {
                return '5'
            }
        }
        this.directionList.forEach((directionVector: number[], vectorIndex: number) => {
            YVector = directionVector[0]
            XVector = directionVector[1]
            aroundStaus[vectorIndex] = checkPositionByVector(1) + checkPositionByVector(2)
        });
        return aroundStaus
    }

    handleNextDirection(around: string[]): any {
        /*
        有12最優先
        有36則表示回到起點了
        若沒有12、36，只有13 33 則往33走 把本身加路徑變為已回朔，注意 終點不改變

        12 is top priority,
        
        if 36, meaning have be back to the starting point
        
        if without 12、36, and only has 13、33 ,then go 33, 
        making path and self to 4(backtracked).
        */
        if (around.indexOf('12') !== -1) {
            let arrInclude12: { value: string, index: number }[] = []
            around.forEach((el, index) => {
                if (el === '12') {
                    arrInclude12.push({ value: el, index: index })
                }
            });
            let randomIndex = Math.floor(Math.random() * (arrInclude12.length))
            while (randomIndex === arrInclude12.length) {
                randomIndex = Math.floor(Math.random() * (arrInclude12.length))
            }
            return { index_direction: arrInclude12[randomIndex]['index'], colChangeTo: '3', status: 'roading' }
        } else {
            let backIndex_direction
            if (around.indexOf('36') !== -1) {//回到起點, back to start point
                for (const key in around) {
                    if (around[key] === '36') {
                        backIndex_direction = key
                    }
                }
                //console.log('渲染結束'), render end
                return { index_direction: backIndex_direction, colChangeTo: '4', status: 'backToStart' }
            }
            else if (around.indexOf('44') === -1 && around.indexOf('33') !== -1) {//折返起點, backtracked start point
                for (const key in around) {
                    if (around[key] === '33') {
                        backIndex_direction = key
                    }
                }
                //console.log('折返起點')
                return { index_direction: backIndex_direction, colChangeTo: '4', status: 'backPoint' }
            }
            else if (around.indexOf('33') !== -1) {//折返中, backtracking
                for (const key in around) {
                    if (around[key] === '33') {
                        backIndex_direction = key
                    }
                }
                //console.log('需折返'), need to backtrack
                return { index_direction: backIndex_direction, colChangeTo: '4', status: 'backing' }
            }
        }
    }
    createEnd() {
        this.backPointList.sort(function (a, b) {
            return b.stepNum - a.stepNum;
        });
        this.endIndex = {
            row: this.backPointList[0].rowIndex,
            col: this.backPointList[0].colIndex
        }
        this.maze[this.backPointList[0].rowIndex][this.backPointList[0].colIndex] = '7'
    }
    init() {
        this.maze = this.createEmptyMaze()
        let rowIndex = this.startPositionIndex
        let colIndex = this.startPositionIndex
        while (true) {
            const { index_direction, colChangeTo, status } = this.handleNextDirection(this.checkAround(rowIndex, colIndex))
            const YV = this.directionList[index_direction][0]
            const XV = this.directionList[index_direction][1]
            if (this.maze[rowIndex][colIndex] !== '6') {
                this.maze[rowIndex][colIndex] = colChangeTo
            }
            this.maze[rowIndex + YV][colIndex + XV] = colChangeTo
            if (status === 'backToStart') {
                this.roadRun += index_direction
                break
            } else if (status === 'roading') {
                this.roadRun += index_direction
            } else if (status === 'backPoint') {
                this.roadRun = this.roadRun.slice(0, -1);
                this.backPointList.push({ rowIndex: rowIndex, colIndex: colIndex, stepNum: this.roadRun.length })
            } else if (status === 'backing') {
                this.roadRun = this.roadRun.slice(0, -1);
            }
            rowIndex = rowIndex + YV * 2
            colIndex = colIndex + XV * 2
        }
        this.createEnd()
        this.createMazeGraphics()
    }
    createMazeGraphics() {
        let mazeGraphics = new Pixi.Graphics()
        this.maze.forEach((row, rowIndex) => {
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
        this.graphics = mazeGraphics
    }
}