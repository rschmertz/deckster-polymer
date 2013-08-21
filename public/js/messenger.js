var Messenger = (function () {
    var socket = io.connect('http://localhost');

    var p_messenger = {

    };

    function Messenger(clientName) {
        this.clientName = clientName;
        console.log("let's make a socket call");
        socket.emit("new client", {clientName:clientName});
    };
    Messenger.prototype = p_messenger;

    return Messenger;

})();
