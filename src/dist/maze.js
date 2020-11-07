"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
/*
  0:外框
  1:間隔
  2:未造訪
  3:已造訪
  4:已回朔
  5:不合法
  6:起點
  7:終點
*/
/*
  0:上
  1:右
  2:下
  3:左
*/
var MazeArr = /** @class */ (function () {
    function MazeArr(rowLegnth) {
        this.rowLegnth = rowLegnth || 25;
        this.directionList = [[-1, 0], [0, 1], [1, 0], [0, -1]];
        this.roadRun = '';
        this.startPositionIndex = (this.rowLegnth - 1) / 2;
        this.backPointList = [];
        this.maze = this.createEmptyMaze();
        this.init();
    }
    MazeArr.prototype.createMazeRow = function () {
        var tempMazeRow = ['0']; //0,2,1,2,1,2,1,2,0
        var totalPushTime = (this.rowLegnth - 1) / 2;
        for (var index = 0; index < totalPushTime; index++) {
            tempMazeRow.push('2');
            if (index + 1 !== totalPushTime) {
                tempMazeRow.push('1');
            }
        }
        tempMazeRow.push('0');
        return tempMazeRow;
    };
    MazeArr.prototype.createEmptyMaze = function () {
        var _this = this;
        var tempMaze = [];
        var gapRow = (function () {
            var arr = ['0'];
            for (var index = 0; index < _this.rowLegnth - 2; index++) {
                arr.push('1');
            }
            arr.push('0');
            return arr;
        })();
        var tempMazeOuterFrameRow = (function () {
            var arr = [];
            for (var index = 0; index < _this.rowLegnth; index++) {
                arr.push('0');
            }
            return arr;
        })();
        tempMaze.push(__spreadArrays(tempMazeOuterFrameRow));
        for (var index = 1; index < this.rowLegnth / 2; index++) {
            tempMaze.push(this.createMazeRow());
            if (index !== (this.rowLegnth - 1) / 2) {
                tempMaze.push(__spreadArrays(gapRow));
            }
        }
        tempMaze.push(__spreadArrays(tempMazeOuterFrameRow));
        tempMaze[this.startPositionIndex][this.startPositionIndex] = '6'; //設置起點
        return __spreadArrays(tempMaze);
    };
    MazeArr.prototype.checkAround = function (rowIndex, colIndex) {
        var _this = this;
        var aroundStaus = ['', '', '', '']; //[up,right,bottom,left]
        var YVector;
        var XVector;
        var checkPositionByVector = function (times) {
            if (_this.maze[rowIndex + YVector * times]) {
                if (_this.maze[rowIndex + YVector * times][colIndex + XVector * times]) {
                    return String(_this.maze[rowIndex + YVector * times][colIndex + XVector * times]);
                }
                else {
                    return '5';
                }
            }
            else {
                return '5';
            }
        };
        // for (const directionVector in this.directionList) {
        //     YVector = this.directionList[directionIndex][0]
        //     XVector = this.directionList[directionIndex][1]
        //     aroundStaus[Number(directionIndex)] = checkPositionByVector(1) + checkPositionByVector(2)
        // }
        this.directionList.forEach(function (directionVector, vectorIndex) {
            YVector = directionVector[0];
            XVector = directionVector[1];
            aroundStaus[vectorIndex] = checkPositionByVector(1) + checkPositionByVector(2);
        });
        return aroundStaus;
    };
    MazeArr.prototype.handleNextDirection = function (around) {
        /*
        有12最優先
        有36則表示回到起點了
        若沒有12、36，只有13 33 則往33走 把本身加路徑變為已回朔，注意 終點不改變
        */
        if (around.indexOf('12') !== -1) {
            var arrInclude12_1 = [];
            around.forEach(function (el, index) {
                if (el === '12') {
                    arrInclude12_1.push({ value: el, index: index });
                }
            });
            var randomIndex = Math.floor(Math.random() * (arrInclude12_1.length));
            while (randomIndex === arrInclude12_1.length) {
                randomIndex = Math.floor(Math.random() * (arrInclude12_1.length));
            }
            return { index_direction: arrInclude12_1[randomIndex]['index'], colChangeTo: '3', status: 'roading' };
        }
        else {
            var backIndex_direction = void 0;
            if (around.indexOf('36') !== -1) { //回到起點
                for (var key in around) {
                    if (around[key] === '36') {
                        backIndex_direction = key;
                    }
                }
                //console.log('渲染結束')
                return { index_direction: backIndex_direction, colChangeTo: '4', status: 'backToStart' };
            }
            else if (around.indexOf('44') === -1 && around.indexOf('33') !== -1) { //折返起點
                for (var key in around) {
                    if (around[key] === '33') {
                        backIndex_direction = key;
                    }
                }
                //console.log('折返起點')
                return { index_direction: backIndex_direction, colChangeTo: '4', status: 'backPoint' };
            }
            else if (around.indexOf('33') !== -1) { //折返中
                for (var key in around) {
                    if (around[key] === '33') {
                        backIndex_direction = key;
                    }
                }
                //console.log('需折返')
                return { index_direction: backIndex_direction, colChangeTo: '4', status: 'backing' };
            }
        }
    };
    MazeArr.prototype.createEnd = function () {
        this.backPointList.sort(function (a, b) {
            return b.stepNum - a.stepNum;
        });
        this.endIndex = {
            row: this.backPointList[0].rowIndex,
            col: this.backPointList[0].colIndex
        };
        this.maze[this.backPointList[0].rowIndex][this.backPointList[0].colIndex] = '7';
    };
    MazeArr.prototype.init = function () {
        var rowIndex = this.startPositionIndex;
        var colIndex = this.startPositionIndex;
        while (true) {
            var _a = this.handleNextDirection(this.checkAround(rowIndex, colIndex)), index_direction = _a.index_direction, colChangeTo = _a.colChangeTo, status = _a.status;
            var YV = this.directionList[index_direction][0];
            var XV = this.directionList[index_direction][1];
            if (this.maze[rowIndex][colIndex] !== '6') {
                this.maze[rowIndex][colIndex] = colChangeTo;
            }
            this.maze[rowIndex + YV][colIndex + XV] = colChangeTo;
            if (status === 'backToStart') {
                this.roadRun += index_direction;
                break;
            }
            else if (status === 'roading') {
                this.roadRun += index_direction;
            }
            else if (status === 'backPoint') {
                this.roadRun = this.roadRun.slice(0, -1);
                this.backPointList.push({ rowIndex: rowIndex, colIndex: colIndex, stepNum: this.roadRun.length });
            }
            else if (status === 'backing') {
                this.roadRun = this.roadRun.slice(0, -1);
            }
            rowIndex = rowIndex + YV * 2;
            colIndex = colIndex + XV * 2;
        }
        this.createEnd();
    };
    return MazeArr;
}());
exports["default"] = MazeArr;
