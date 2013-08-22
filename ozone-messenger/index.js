exports.listen = function (server) {
    var io = require('socket.io').listen(server);

    // Keep track of all clients to make sure there are no duplicate IDs
    var messengerClients = {};
    
    io.sockets.on('connection', function (socket) {
        
        // connectionClients keeps track of clients attached to this socket, so
        // they can be de-registered when the connection is broken
        connectionClients = {};
        //socket.emit('news', "Connected!");
        socket.on('new client', function (data, fn) {
            console.log("got new client " + data.clientName);
            if (messengerClients[data.clientName]) {
                var newName = "client-" + Math.random();
                fn({error: "Houston, we have a problem",
                    newName: newName});
            } else {
                messengerClients[data.clientName] = {};
                connectionClients[data.clientName] = {};
                fn({message: "addedd " + data.clientName});
            };
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
