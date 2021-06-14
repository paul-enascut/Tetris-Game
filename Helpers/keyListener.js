class KeyListener {
    constructor(eventTarget, handler) {
        this.eventTarget = eventTarget;
        this.handler = handler;

        this._listen = this._listen.bind(this);
    }

    start() {
        this.eventTarget.addEventListener('keydown', this._listen);
    }

    stop() {
        this.eventTarget.removeEventListener('keydown', this._listen);
    }

    _listen(keyEvent)
    {
        this.handler(keyEvent.keyCode);
    }
}