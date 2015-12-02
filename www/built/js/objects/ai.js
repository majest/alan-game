var AiHandler = (function () {
    function AiHandler() {
        this.mode = 'right';
    }
    AiHandler.prototype.handleMessage = function (message) {
        console.log(message);
    };
    AiHandler.prototype.destination = function (x, y) {
        console.log('destination');
        var m = new Message();
        var l = new Loc();
        m.setId('DUMMY');
        l.set(x, y);
        m.setDestination(l);
        return m;
    };
    AiHandler.prototype.move = function () {
        if (this.mode == 'right') {
            this.mode = 'left';
            return this.destination(300, 1000);
        }
        else {
            this.mode = 'right';
            return this.destination(300, 300);
        }
    };
    AiHandler.prototype.login = function (x, y) {
        console.log('destination');
        var m = new Message();
        var l = new Loc();
        l.set(x, y);
        m.setId('DUMMY');
        m.addPlayer(l, Properties.factory('ai'));
        return m;
    };
    return AiHandler;
})();
