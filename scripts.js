function Game () {
    this.grid = null;
    this.scoreElement = null;

    this.balls = [];
    this.selectedBalls = [];
    this.lastSelectedBall = null;
    this.shiftedBalls = [];

    this.ROWS = 9;
    this.COLS = 9;

    this.cellClassName = 'grid__cell';
    this.ballClassName = 'ball';

    this.score = 0;

    this.init = function () {
        this.grid = document.getElementById('js-grid');
        this.grid.dataset.rows = this.ROWS;
        this.grid.dataset.columns = this.COLS;

        this.scoreElement = document.getElementById('js-score');

        var cells = document.createDocumentFragment();

        for (var y = 0; y < this.ROWS; y++) {
            for (var x = 0; x < this.COLS; x++) {
                if (!y) {
                    this.balls[x] = [];
                }
                var color = this.generateColorByPosition(x, y);
                this.balls[x][y] = new Ball(x, y, color);

                cells.append(this.createCellAndBall(x, y));
            }
        }

        this.grid.append(cells);
        this.grid.addEventListener('click', this.handleGridClick.bind(this));
    };

    this.generateColorByPosition = function (x, y) {
        var exclusions = [];
        if (y) {
            exclusions.push(this.balls[x][y - 1].color);
        }
        if (x) {
            exclusions.push(this.balls[x - 1][y].color);
        }
        return this.generateColor(exclusions);
    }

    this.generateColor = function (exclusions) {
        var color = Math.ceil(Math.random() * 9);

        exclusions = exclusions || [];
        var hasExclusion = exclusions.some(function (exclusionColor) {
            return exclusionColor === color;
        });

        return hasExclusion ? this.generateColor(exclusions) : color;
    }

    this.handleGridClick = function (event) {
        let cell = event.target;

        while (cell.id !== this.grid.id) {
            if (cell.classList.contains(this.cellClassName)) {
                this.toggleCell(cell);
            }

            cell = cell.parentNode;
        }

    };

    this.toggleCell = function (cell) {
        if (cell.classList.contains('is-selected')) {
            this.unselectBall();
        } else {
            if (this.lastSelectedBall !== null) {
                if (this.checkNextSelectedCells(cell)) {
                    this.changeSelectedBalls(cell);
                    this.unselectBall();
                    this.checkBalls();
                    return;
                }
                this.unselectBall();
            } else {
                this.selectBall(cell);
            }
        }
    }

    this.checkNextSelectedCells = function (cell) {
        if (this.lastSelectedBall === null) {
            return false;
        }
        var prevCellPos
            = this.lastSelectedBall.dataset.x
            + ','
            + this.lastSelectedBall.dataset.y;
        nextCellPos = [
            Number(cell.dataset.x) - 1 + ',' + cell.dataset.y,
            Number(cell.dataset.x) + 1 + ',' + cell.dataset.y,
            cell.dataset.x + ',' + (Number(cell.dataset.y) - 1),
            cell.dataset.x + ',' + (Number(cell.dataset.y) + 1),
        ];
        return nextCellPos.indexOf(prevCellPos) !== -1;
    }

    this.checkBalls = function () {
        var hasShift = false;
        for (var x = 0; x < this.ROWS; x++) {
            for (var y = 0; y < this.COLS; y++) {
                if (x && this.balls[x][y].color === this.balls[x - 1][y].color) {
                    this.balls[x][y].remove = true;
                    this.balls[x - 1][y].remove = true;
                    hasShift = true;
                    this.score += 2;
                }
                if (y && this.balls[x][y].color === this.balls[x][y - 1].color) {
                    this.balls[x][y].remove = true;
                    this.balls[x][y - 1].remove = true;
                    hasShift = true;
                    this.score += 2;
                }
            }
        }
        if (hasShift) {
            this.removeBalls();
            this.checkBalls();
            this.updateScore();
        }
    }

    this.removeBalls = function () {
        for (var x = 0; x < this.COLS; x++) {
            var colorsStack = [];

            for (var y = 0; y < this.ROWS; y++) {
                if (this.balls[x][y].remove) {
                    this.balls[x][y].remove = false;
                } else {
                    colorsStack.push(this.balls[x][y].color);
                }
            }

            for (var i = this.ROWS - colorsStack.length; i > 0; i--) {
                colorsStack.unshift(this.generateColor());
            }


            for (var y = 0; y < this.ROWS; y++) {
                if (this.balls[x][y].color !== colorsStack[y]) {
                    this.balls[x][y].color = colorsStack[y];
                    this.balls[x][y].render();
                }
            }

        }
    }

    this.selectBall = function (ball) {
        this.lastSelectedBall = ball;
        this.lastSelectedBall.classList.add('is-selected');
    }

    this.unselectBall = function () {
        this.lastSelectedBall.classList.remove('is-selected');
        this.lastSelectedBall = null;
    }

    this.changeSelectedBalls = function (cell) {
        var ball1 = cell.querySelector('.' + this.ballClassName);
        var ball2 = this.lastSelectedBall.querySelector('.' + this.ballClassName);
        var x1 = ball1.parentNode.dataset.x;
        var y1 = ball1.parentNode.dataset.y;
        var x2 = ball2.parentNode.dataset.x;
        var y2 = ball2.parentNode.dataset.y;

        this.balls[x1][y1].color = Number(ball2.dataset.color);
        this.balls[x2][y2].color = Number(ball1.dataset.color);

        ball1.dataset.color = this.balls[x1][y1].color;
        ball2.dataset.color = this.balls[x2][y2].color;
    }

    this.createCellAndBall = function (x, y) {
        var cell = document.createElement('div');
        cell.classList.add(this.cellClassName);
        cell.dataset.x = x;
        cell.dataset.y = y;

        cell.appendChild(
            this.createBall(this.balls[x][y].color)
        );

        return cell;
    }

    this.createBall = function (color) {
        var ball = document.createElement('div');
        ball.classList.add('ball');
        ball.dataset.color = color;

        return ball;
    };

    this.updateScore = function () {
        this.scoreElement.innerText = this.score;
    }

}

function Ball (x, y, color) {
    this.x = null;
    this.y = null;
    this.color = null;

    this.init = function () {
        this.setPosition(x, y);
        this.setColor(color);
    }

    this.setPosition = function (x, y) {
        this.x = x;
        this.y = y;
    }

    this.setColor = function (color) {
        this.color = color;
    }

    this.render = function () {
        var cell = document.querySelector('.' + game.cellClassName + '[data-x="' + this.x + '"][data-y="' + this.y + '"]');
        var ball = cell.querySelector('.' + game.ballClassName);
        ball.dataset.color = this.color;
    }

    this.init();
}

var game = new Game();
game.init();