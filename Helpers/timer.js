class Timer {
    constructor(callback) {
        this.callback = callback;
    }

    start(interval) {
        let intervalMs = interval * 1000;
        this.speedInterval = this._setIntervalAndExecute(this.callback, intervalMs);
    }

    stop() {
        clearInterval(this.speedInterval);
        this.speedInterval = null;
    }

    _setIntervalAndExecute(callback, timeout) {
        callback();
        return setInterval(callback, timeout);
    }
}