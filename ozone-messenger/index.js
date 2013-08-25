exports.listen = function (server) {

    // Create a simple hash that is JSONifiable
    function getFlatHash (hash) {
        var keys = {}, key;
        for (key in hash) {
            keys[key] = 1;
        }
        return keys;
    }

    var io = require('socket.io').listen(server);

    // Keep track of all clients to make sure there are no duplicate IDs
    var messengerClients = {};
    
    io.sockets.on('connection', function (socket) {
        
        // connectionClients keeps track of clients attached to this socket, so
        // they can be de-registered when the connection is broken
        var connectionClients = {};
        //socket.emit('news', "Connected!");
        socket.on('new client', function (data, fn) {
            var clientName = data.clientName;
            console.log("got new client request" + data.clientName);
            if (messengerClients[clientName]) {
                clientName = "client-" + Math.random();
                fn({error: "Houston, we have a problem",
                    newName: clientName});
            } else {
                fn({message: "added " + data.clientName});
            };
            messengerClients[clientName] = {socket: socket};
            connectionClients[clientName] = {};
            io.sockets.emit('clientListUpdate', {clientList: getFlatHash(messengerClients)});
        });
        socket.on('sendMessage', function (target, data, fn) {
            console.log('sendMessage called for %s with data ' + data.message, target);
            fn({success: 'received sendMessage'});
        });
        socket.on('disconnect', function () {
            console.log('Hey, browser disconnected');
            for (var key in connectionClients) {
                delete messengerClients[key];
            };
            connectionClients = {};
        });
    });
};
