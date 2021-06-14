var PES = PES || {};

PES.Tetris = class {
    constructor(config) {
        this._configOptions(config);
        let containers = Array.from(document.querySelectorAll(this.options.containerSelector));
        containers.forEach(container => 
            new PES.Tetris.PlayGround(
                container,
                this.options.rows,
                this.options.columns,
                this.options.cellWidth,
                this.options.speed
            ).startGame());
    }

    _configOptions(config) {
        this.options = {
            containerSelector: '.tetris',
            speed: 1, // secondsTimeout
            rows: 50,
            columns: 80,
            cellWidth: 10, // in px
          };
 
        if(config) {
            Object.assign(this.options, config);
        }
    }
}


PES.Tetris.PlayGround = class {
    constructor(container, rows, columns, cellWidth, speed) {
        // Assign instance variables
        this.rows = rows;
        this.columns = columns;
        this.cellWidth = cellWidth;
        this.speed = speed;
        this.container = container;

        // Capture events
        this._onChangeSpeed = this._onChangeSpeed.bind(this);
        this._resumeGame = this._resumeGame.bind(this);
        this._pauseGame = this._pauseGame.bind(this);
        this._onChangeLayout = this._onChangeLayout.bind(this);
        
        // Register Events
        this.container.addEventListener('focus', this._onContainerFocus);
        this.container.addEventListener('focusout', this._onContainerFocusOut);
               
        // Prepare the Game
        this._game = new PES.Tetris.Game(this.rows, this.columns, this.cellWidth);
        this._setupPlayGround();

        // Init Dependencies
        this._timer = new Timer(() => this._tryMovePiece(40));
        this._keylistener = new KeyListener(this.container, keyCode => this._tryMovePiece(keyCode));
    }

    startGame() {
        this._game.start();
        this._timer.start(this.speed);
        this._keylistener.start();

        this._toggleControls(true);
        this.container.focus();

        let overlayedDiv = this.container.getElementsByClassName('overlay')[0];
        overlayedDiv.style.display = 'none';
    }

    _finishGame() {
        this._timer.stop();
        this._keylistener.stop();
        this._toggleControls(false);

        // Create game over text
        let overlayedDiv = this.container.getElementsByClassName('overlay')[0];
        overlayedDiv.style.display = 'table';

        let gameOverLabel = overlayedDiv.getElementsByClassName('game-over')[0]
        gameOverLabel.style.display = 'table-cell';
    }

    _setupPlayGround() {
        var fragment = document.createDocumentFragment();

        let gridDiv = this._createGrid();
        this._game.appendToContainer(gridDiv);
        let controlsDiv = this._createControls();

        fragment.appendChild(gridDiv);
        fragment.appendChild(controlsDiv);
        this.container.appendChild(fragment);
        
        this.container.setAttribute('tabindex', '0');
    }

    _createGrid() {
        let gridHeight = `${this.columns * this.cellWidth}px`;
        let gridWidth =  `${this.rows * this.cellWidth}px`;

        let gridDiv = document.createElement('div');
        gridDiv.classList.add('tetris-grid');
        gridDiv.style.width = gridHeight;
        gridDiv.style.height = gridWidth;

        // Create overlay element
        let overlayedDiv = document.createElement('div');
        overlayedDiv.classList.add('overlay');
        overlayedDiv.style.width = gridHeight;
        overlayedDiv.style.height = gridWidth;

        // Create game status labels
        let failGameStatusSpan = document.createElement('span');
        failGameStatusSpan.classList.add('game-status');
        failGameStatusSpan.classList.add('game-over');
        failGameStatusSpan.innerHTML = "Game over!";
        overlayedDiv.appendChild(failGameStatusSpan);
        
        gridDiv.appendChild(overlayedDiv);
        return gridDiv;
    }

    _createControls() {
        let controlsDiv = document.createElement('div');
        controlsDiv.classList.add('tetris-controls');
        controlsDiv.classList.add('text-center');

        // Start Button
        let startBtn = document.createElement('button');
        startBtn.id = 'start';
        startBtn.type = 'button';
        startBtn.innerHTML = 'Start';
        startBtn.classList.add('btn');
        startBtn.classList.add('btn-primary');
        startBtn.addEventListener('click', this._resumeGame);
        controlsDiv.appendChild(startBtn);

        // Pause Button
        let pauseBtn = document.createElement('button');
        pauseBtn.id = 'pause';
        pauseBtn.type = 'button';
        pauseBtn.innerHTML = 'Pause';
        pauseBtn.classList.add('btn');
        pauseBtn.classList.add('btn-success');
        pauseBtn.addEventListener('click', this._pauseGame);
        controlsDiv.appendChild(pauseBtn);

        // Speed Dial
        let speedDialContainer = document.createElement('div');

        let speedDialLabel = document.createElement('label');
        speedDialLabel.innerHTML = 'Speed';
        speedDialLabel.htmlFor = 'speed-dial';
        speedDialContainer.appendChild(speedDialLabel);
        
        let speedDial = document.createElement('input');
        speedDial.id = 'speed-dial'
        speedDial.type = 'range';
        speedDial.classList.add('custom-range');
        speedDial.min = '1';
        speedDial.max = '100';
        speedDial.title = 'Speed dial';
        speedDial.value = 1 / this.speed;
        speedDial.attributes['aria-label'] = 'Speed dial';
        speedDial.addEventListener('change', this._onChangeSpeed);
        speedDialContainer.appendChild(speedDial);

        // Layout Customization
        let layoutSelect = document.createElement('select');
        layoutSelect.id = 'layout';
        layoutSelect.classList.add('custom-select');
        layoutSelect.addEventListener('change', this._onChangeLayout);
        let darkLayoutOption = document.createElement('option');
        darkLayoutOption.innerHTML = 'white';
        let whiteLayoutOption = document.createElement('option');
        whiteLayoutOption.innerHTML = 'dark';
        layoutSelect.appendChild(darkLayoutOption);
        layoutSelect.appendChild(whiteLayoutOption);
        speedDialContainer.appendChild(layoutSelect);

        controlsDiv.appendChild(speedDialContainer);
        return controlsDiv;
    }

    _toggleControls(forStart) {
        let startButton = this.container.querySelector('#start');
        let pauseButton = this.container.querySelector('#pause');
        let speedDial = this.container.querySelector('#speed-dial');
        
        if(forStart) {
            startButton.setAttribute('disabled', 'disabled');
            pauseButton.removeAttribute('disabled');
            speedDial.removeAttribute('disabled');
        } else {
            startButton.removeAttribute('disabled');
            pauseButton.setAttribute('disabled', 'disabled');
            speedDial.setAttribute('disabled', 'disabled');
        }
    }

    _tryMovePiece(keyCode) {
        if(!this._game.canProceed) {
            this._finishGame();
        } else {
            let gridContainer = this.container.querySelector('.tetris-grid');
            switch(keyCode) {
                case 37: this._game.fire({ type: 'moveLeft' }); break;
                case 39: this._game.fire({ type: 'moveRight' }); break;
                case 40: this._game.fire({ type: 'moveDown', data: gridContainer }); break;
            }
        }
    }

    // #region Event Handlers

    _onContainerFocus(e) {
        e.currentTarget.style.boxShadow = '10px 20px 30px blue';
    }

    _onContainerFocusOut(e) {
        e.currentTarget.style.boxShadow = '';
    }

    _resumeGame() {
        let overlayedDiv = this.container.getElementsByClassName('overlay')[0];
        if(overlayedDiv.style.display === 'table') {
            overlayedDiv.style.display = 'none';
            this._game.reset();
        }

        this._timer.start(this.speed);
        this._keylistener.start();

        this._toggleControls(true);
        this.container.focus();

        let startButton = this.container.querySelector('#start');
        startButton.innerHTML = 'Start';
    }

    _pauseGame() {
        this._timer.stop();
        this._keylistener.stop();
        this._toggleControls(false);

        let startButton = this.container.querySelector('#start');
        startButton.innerHTML = 'Resume';
    }

    _onChangeSpeed(e) {
        let rangeVal = parseInt(e.currentTarget.value);
        this.speed = 1 / rangeVal;

        this._pauseGame();
        this._resumeGame();
    }

    _onChangeLayout(e) {
        e.currentTarget.blur();
        this._game.swapLayout();
    }

    // #endregion
}

PES.Tetris.Game = class {
    constructor(rows, columns, cellWidth) {
        // Init Grid
        this._grid = new Grid(rows, columns, cellWidth);
        
        // Init Events
        Utils.mixin(Object.getPrototypeOf(this), EventTarget.prototype);
        this.addListener("moveLeft", this._moveCellLeft);
        this.addListener("moveRight",  this._moveCellRight);
        this.addListener("moveDown", this._moveCellDown);
    }

    get canProceed() {
        return !this._grid.isColumnOccupied(this.cell.y);
    }

    start() {
        this.reset();
        this._addPieceToGame();
    }

    reset() {
        this._grid.forEach(rows => rows.forEach(cell => cell.state = PES.Constants.cellStates.free));
    }

    appendToContainer(container) {
        this._grid.forEach(rows => rows.forEach(cell => container.appendChild(cell.HTML)));
    }

    removeFromContainer(container) {
        this._grid.forEach(rows => rows.forEach(cell => container.removeChild(cell.HTML)));
    }

    swapLayout() {
        this._grid.forEach(rows => rows.forEach(cell => cell.swapColor()));
        this._grid.forEach(rows => rows.forEach(cell => cell.state = cell.state));
    }

    _addPieceToGame() {
        let defaultX = 0;
        let defaultY = Math.floor(this._grid.width / 2);
        
        this.cell = this._grid[defaultX][defaultY];
        this.cell.state = PES.Constants.cellStates.occupied;
    }

    _purgeLastRow(gridContainer) {
        this.removeFromContainer(gridContainer);
        this._grid.popPush();
        this.appendToContainer(gridContainer);
    }

    _moveCell(nextCell) {
        if(nextCell.state === PES.Constants.cellStates.free) {
            this.cell.state = PES.Constants.cellStates.free;
            this.cell = nextCell;
            this.cell.state = PES.Constants.cellStates.occupied;
        }
    }

    _moveCellLeft() {
        
        if(this.cell.y > 0) {
            let nextCell = this._grid[this.cell.x][this.cell.y - 1];
            this._moveCell(nextCell);
        }
    }
    
    _moveCellRight() {
        if(this.cell.y < this._grid.width) {
            let nextCell = this._grid[this.cell.x][this.cell.y + 1];
            this._moveCell(nextCell);
        }
    }

    _moveCellDown(eventArgs) {
        let gridContainer = eventArgs.data;
        if(this.cell.x < this._grid.height - 1) {
            let nextCell = this._grid[this.cell.x + 1][this.cell.y];
            if(nextCell.state === PES.Constants.cellStates.free) {
                this._moveCell(nextCell);
            } else {
                // add a new Piece to the game               
                this._addPieceToGame(); 
            }
        } else if(this._grid.isRowOccupied(this.cell.x)) {
            this._purgeLastRow(gridContainer);
        } else {
            // add a new Piece to the game
		    this._addPieceToGame();
        }
    }
} 