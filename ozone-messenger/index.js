exports.listen = function (server) {
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
            messengerClients[clientName] = {};
            connectionClients[clientName] = {};
            io.sockets.emit('clientListUpdate', {clientList: messengerClients});
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
