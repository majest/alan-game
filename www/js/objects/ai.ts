class AiHandler implements TransportHandler {

    mode = 'right';

    handleMessage(message) {
        console.log(message);
    }



    destination(x, y) {
        console.log('destination');
        var m = new Message();
        var l = new Loc();
        m.setId('DUMMY');
        l.set(x,y);
        m.setDestination(l);
        return m;
    }


    move() {
        if (this.mode == 'right') {
            this.mode = 'left';
            return this.destination(300,1000);

        } else {
            this.mode = 'right';
            return this.destination(300,300);
        }
    }

    login(x,y) {
        console.log('destination');
        var m = new Message();
        var l = new Loc();
        l.set(x,y);
        m.setId('DUMMY');
        m.addPlayer(l, Properties.factory('ai'));
        return m;
    }

}
