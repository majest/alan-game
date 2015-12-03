class AiHandler implements TransportHandler {

    mode = 'right';

    handleMessage(message) {
        console.log(message);
    }



    destination(id, x, y) {
        console.log('destination');
        var m = new Message();
        var l = new Loc();
        m.setId(id);
        l.set(x,y);
        m.setDestination(l);
        return m;
    }


    move(id, x1,y1,x2,y2) {
        if (this.mode == 'right') {
            this.mode = 'left';
            return this.destination(id, x1,y1);

        } else {
            this.mode = 'right';
            return this.destination(id, x2,y2);
        }
    }

    login(id, x,y) {
        console.log('destination');
        var m = new Message();
        var l = new Loc();
        l.set(x,y);
        m.setId(id);
        m.addPlayer(l, Properties.factory('ai'));
        return m;
    }

}
