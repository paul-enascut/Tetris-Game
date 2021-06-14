class Cell {
   constructor(x, y, width) {
      this._x = x;
      this._y = y;
      this._cellDiv = this._buildCellHtml(width);
      this._cellState = PES.Constants.cellStates.free;
      this._cellFreeColor = PES.Constants.cellColors.free;
      this._cellOccupiedColor = PES.Constants.cellColors.occupied;
   }

   get x() {
      return this._x;
   }

   get y() {
      return this._y;
   }

   get HTML() {
      return this._cellDiv;
   }

   get state() {
      return this._cellState;
   }

   set state(value) {
      this._cellState = value;
      if(this.state === PES.Constants.cellStates.free) {
         this._unmark();
      } else if (this.state === PES.Constants.cellStates.occupied) {
         this._mark();
      }
   }

   _buildCellHtml(size) {
      let elem = document.createElement('div');
      elem.classList.add(`cell`);
      elem.style.width = `${size}px`;
      elem.style.height = `${size}px`;
      return elem;
   }

   swapColor() {
      let swapColor = this._cellFreeColor;
      this._cellFreeColor = this._cellOccupiedColor;
      this._cellOccupiedColor = swapColor;
   }

   _mark() {
      this.HTML.style.backgroundColor = this._cellOccupiedColor;
   } 

   _unmark() {
      this.HTML.style.backgroundColor = this._cellFreeColor;
   } 
}