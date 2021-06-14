class Grid extends Array {
    constructor(rows, columns, cellWidth) {
        super(rows);
        this.cellWidth = cellWidth;
        this._init(rows, columns, cellWidth);
    }

    get width() { 
        if(this.length > 0 && Array.isArray(this[0])){
            return this[0].length;
        }

        return 0;
    }

    get height() { 
        return this.length; 
    }

    popPush() {
        this.pop();
        let newRow = this._buildRow(0, this.width);
        this.unshift(newRow);
        this._refresh();
    }

    removeFromContainer(container) {
        this.forEach(rows => rows.forEach(cell => container.removeChild(cell.HTML)));
    }

    isColumnOccupied(columnIndex) {
        for(let rowInd = 0; rowInd < this.height; ++rowInd) {
            if(this[rowInd][columnIndex].state === PES.Constants.cellStates.free) {
                return false;
            }
        }

        return true;
    }

    isRowOccupied(rowIndex) {
        for(let colIndex = 0; colIndex < this.width; ++colIndex) {
            if(this[rowIndex][colIndex].state === PES.Constants.cellStates.free) {
                return false;
            }
        }
        
        return true;
    }

    display() {
        console.log(this._toString());
    } 

    _init(rows, columns, cellWidth) {
        for (let i = 0; i < rows; ++i) {
            this[i] = this._buildRow(i, columns);
        }
    }

    _buildRow(rowIndex, rowWidth) {
        let row = new Array(rowWidth);
        for (let j = 0; j < row.length; j++) {    
            row[j] = this._buildCell(rowIndex, j, PES.Constants.cellStates.free);
        }

        return row;
    }

    _buildCell(i, j, state) {
        let cell = new Cell(i, j, this.cellWidth);
        cell.state = state;
        return cell;
    }

    _refresh() {
        for (let i = 0; i < this.height; ++i) {
            for (let j = 0; j < this.width; ++j) {
                let state = this[i][j].state;
                this[i][j] = this._buildCell(i, j, state);
            }
        }
    }

    _toString() {
        let arrayStr = '';
        for (let i = 0; i < this.height; ++i) {
            for (let j = 0; j < this.width; ++j) {
                arrayStr += this[j][i] + ' ';
            }
            arrayStr += '\n';
        }

        return arrayStr;
    }
}