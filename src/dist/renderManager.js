"use strict";
exports.__esModule = true;
var Pixi = require("pixi.js");
var maze_1 = require("./maze");
var RenderManager = /** @class */ (function () {
    function RenderManager(screenWidth, rowLength) {
        this.rowLength = rowLength;
        this.screenWidth = screenWidth;
        this.tileWidth = screenWidth / rowLength;
        this.ballSpeed = this.tileWidth / 2;
        this.ballRadius = this.tileWidth / 4;
        this.ballDiameter = this.ballRadius * 2;
        this.init();
    }
    RenderManager.prototype.init = function () {
        this.bindHandlePress = this.handleKeyBoardPress.bind(this);
        this.bindHandleUnPress = this.handleKeyBoardUnPress.bind(this);
        this.maze = new maze_1["default"](this.rowLength);
        this.app = new Pixi.Application({
            width: this.screenWidth,
            height: this.screenWidth,
            backgroundColor: 0xFFFFFF
        });
        this.appContainer = new Pixi.Container();
        this.keyBoardStatus = {
            'w': false,
            'a': false,
            's': false,
            'd': false
        };
        this.endCoordinates = this.mazeIndexMapToCanvasCoordinate(this.maze.endIndex.row, this.maze.endIndex.col);
        this.endBounds = {
            x: this.endCoordinates[0][0],
            y: this.endCoordinates[0][1],
            width: this.tileWidth,
            height: this.tileWidth
        };
        this.ballGraphics = this.createBallGraphics();
        this.ballGraphics.x = (this.screenWidth / 2) - this.ballRadius;
        this.ballGraphics.y = (this.screenWidth / 2) - this.ballRadius;
        this.mazeGraphics = this.createMazeGraphics();
        this.appContainer.addChild(this.mazeGraphics, this.ballGraphics);
        this.app.stage.addChild(this.appContainer);
        this.initKeyListener();
        var bindGameLoop = this.gameLoop.bind(this);
        this.app.ticker.add(bindGameLoop);
    };
    RenderManager.prototype.isWin = function () {
        return this.ballGraphics.x + this.ballDiameter > this.endBounds.x &&
            this.ballGraphics.x < this.endBounds.x + this.endBounds.width &&
            this.ballGraphics.y + this.ballDiameter > this.endBounds.y &&
            this.ballGraphics.y < this.endBounds.y + this.endBounds.height;
    };
    RenderManager.prototype.createBallGraphics = function () {
        var ballGraphics = new Pixi.Graphics();
        ballGraphics.beginFill(0xff0000);
        ballGraphics.drawCircle(this.ballRadius, this.ballRadius, this.ballRadius);
        ballGraphics.endFill();
        return ballGraphics;
    };
    RenderManager.prototype.createMazeGraphics = function () {
        var _this = this;
        var mazeGraphics = new Pixi.Graphics();
        this.maze.maze.forEach(function (row, rowIndex) {
            row.forEach(function (col, colIndex) {
                if (col === '1' || col === '0') { // 1 is wall, 0 is edge
                    mazeGraphics.beginFill(0x000000);
                    mazeGraphics.drawRect(_this.tileWidth * rowIndex, _this.tileWidth * colIndex, _this.tileWidth, _this.tileWidth);
                    mazeGraphics.endFill();
                }
                else if (col === '7') { //end
                    var endText = new Pixi.Text('終', { fontSize: _this.tileWidth, fill: 0xff0000, fontWeight: 900, align: "" });
                    mazeGraphics.addChild(endText);
                    endText.x = rowIndex * _this.tileWidth + (_this.tileWidth - endText.width) / 2;
                    endText.y = colIndex * _this.tileWidth + (_this.tileWidth - endText.width) / 2;
                }
            });
        });
        return mazeGraphics;
    };
    RenderManager.prototype.initKeyListener = function () {
        document.addEventListener('keyup', this.bindHandleUnPress);
        document.addEventListener('keydown', this.bindHandlePress);
    };
    RenderManager.prototype.removeKeyListender = function () {
        document.removeEventListener('keyup', this.bindHandleUnPress);
        document.removeEventListener('keydown', this.bindHandlePress);
    };
    RenderManager.prototype.handleKeyBoardPress = function (e) {
        console.log(e);
        var key = e.key;
        if (!(key in this.keyBoardStatus)) {
            return;
        }
        //@ts-ignore
        this.keyBoardStatus[key] = true;
    };
    RenderManager.prototype.handleKeyBoardUnPress = function (e) {
        var key = e.key;
        if (!(key in this.keyBoardStatus)) {
            return;
        }
        //@ts-ignore
        this.keyBoardStatus[key] = false;
    };
    RenderManager.prototype.mazeIndexMapToCanvasCoordinate = function (rowIndex, colIndex) {
        var _this = this;
        var leftTop = [rowIndex * this.tileWidth, colIndex * this.tileWidth];
        return [leftTop, leftTop.map(function (coordinates) { return coordinates + _this.tileWidth; })];
    };
    RenderManager.prototype.isWallByXY = function (x, y) {
        var tileType = this.maze.maze[Math.ceil(x / this.tileWidth) - 1][Math.ceil(y / this.tileWidth) - 1];
        return tileType === '0' || tileType === '1';
    };
    RenderManager.prototype.getMaxCoordinates = function (direction, x, y) {
        switch (direction) {
            case 'up':
                return Math.floor(y - y % this.tileWidth + 1);
            case 'right':
                return Math.ceil(x - (x + this.ballDiameter) % this.tileWidth + this.tileWidth - 1);
            case 'down':
                return Math.ceil(y - (y + this.ballDiameter) % this.tileWidth + this.tileWidth - 1);
            case 'left':
                return Math.floor(x - x % this.tileWidth + 1);
        }
    };
    RenderManager.prototype.isTouchWall = function (direction, x, y) {
        if (this.isWin()) {
            this.removeKeyListender();
            if (window.confirm('win')) {
                this.init();
            }
            else {
                this.app.ticker.stop();
            }
            return;
        }
        switch (direction) {
            case 'up':
                if (this.isWallByXY(x, y - this.ballSpeed) ||
                    this.isWallByXY(x + this.ballDiameter, y - this.ballSpeed)) {
                    return true;
                }
                break;
            case 'right':
                if (this.isWallByXY(x + this.ballDiameter + this.ballSpeed, y) ||
                    this.isWallByXY(x + this.ballDiameter + this.ballSpeed, y + this.ballDiameter)) {
                    return true;
                }
                break;
            case 'down':
                if (this.isWallByXY(x, y + this.ballDiameter + this.ballSpeed) ||
                    this.isWallByXY(x + this.ballDiameter, y + this.ballDiameter + this.ballSpeed)) {
                    return true;
                }
                break;
            case 'left':
                if (this.isWallByXY(x - this.ballSpeed, y) ||
                    this.isWallByXY(x - this.ballSpeed, y + this.ballDiameter)) {
                    return true;
                }
                break;
        }
        return false;
    };
    RenderManager.prototype.gameLoop = function () {
        if (this.keyBoardStatus['w']) {
            var _a = this.ballGraphics, x = _a.x, y = _a.y;
            if (this.isTouchWall('up', x, y)) {
                this.ballGraphics.y = this.getMaxCoordinates('up', x, y);
            }
            else {
                this.ballGraphics.y -= this.ballSpeed;
            }
        }
        if (this.keyBoardStatus['a']) {
            var _b = this.ballGraphics, x = _b.x, y = _b.y;
            if (this.isTouchWall('left', x, y)) {
                this.ballGraphics.x = this.getMaxCoordinates('left', x, y);
            }
            else {
                this.ballGraphics.x -= this.ballSpeed;
            }
        }
        if (this.keyBoardStatus['s']) {
            var _c = this.ballGraphics, x = _c.x, y = _c.y;
            if (this.isTouchWall('down', x, y)) {
                this.ballGraphics.y = this.getMaxCoordinates('down', x, y);
            }
            else {
                this.ballGraphics.y += this.ballSpeed;
            }
        }
        if (this.keyBoardStatus['d']) {
            var _d = this.ballGraphics, x = _d.x, y = _d.y;
            if (this.isTouchWall('right', x, y)) {
                this.ballGraphics.x = this.getMaxCoordinates('right', x, y);
            }
            else {
                this.ballGraphics.x += this.ballSpeed;
            }
        }
    };
    return RenderManager;
}());
exports["default"] = RenderManager;
