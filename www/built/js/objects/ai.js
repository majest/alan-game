var AiHandler = (function () {
    function AiHandler() {
        this.mode = 'right';
    }
    AiHandler.prototype.handleMessage = function (message) {
        console.log(message);
    };
    AiHandler.prototype.destination = function (id, x, y) {
        console.log('destination');
        var m = new Message();
        var l = new Loc();
        m.setId(id);
        l.set(x, y);
        m.setDestination(l);
        return m;
    };
    AiHandler.prototype.move = function (id, x1, y1, x2, y2) {
        if (this.mode == 'right') {
            this.mode = 'left';
            return this.destination(id, x1, y1);
        }
        else {
            this.mode = 'right';
            return this.destination(id, x2, y2);
        }
    };
    AiHandler.prototype.login = function (id, x, y) {
        console.log('destination');
        var m = new Message();
        var l = new Loc();
        l.set(x, y);
        m.setId(id);
        m.addPlayer(l, Properties.factory('ai'));
        return m;
    };
    return AiHandler;
}());
