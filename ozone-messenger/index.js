function obj_map(hash, fn) {
    var keys = {}, key;
    for (key in hash) {
        
        keys[key] = (typeof fn == 'function') ? fn(hash[key]) : {};
    };
    return keys;
};

// Create a simple hash that is JSONifiable
function getFlatHash (hash) {
    return obj_map(hash);
}

var io;

var allSockets = {};
// Keep track of all clients to make sure there are no duplicate IDs
var messengerClients = {};
var channels = {};

function broadcastChannelList() {
    var channelListOut = obj_map(channels, function (channel) {
        return {
            name: channel.name,
            options: channel.options
        }
    });
    io.sockets.emit('channelListUpdate', {channelList: channelListOut});
};

exports.createChannel =  function (channelName, creatorName, options, fn, socketid) {
    if (channelName in channels || channelName in messengerClients) {
        fn({error: "The name " + channelName + " is already in use"});
        return;
    };
    channels[channelName] = { name: channelName,
                              creatorName: creatorName,
                              socketid: socketid,
                              subscribers: {},
                              options: options };

    broadcastChannelList();
};

exports.sendMessage = function (targetID, data, fn, socketid) {
    console.log('sendMessage called for %s with data ' + data.message, targetID);
    try {
        var targetObj = messengerClients[targetID];
        var channel = channels[targetID];
        if (targetObj) {
            var targetSocket = allSockets[targetObj.socketid];
            targetSocket.emit('receive message', targetID, data);
        } else if (channel) {
            var errmsg = '';
            if (channel.options.channelType == "oneway") {
                if (data.senderID != channel.creatorName) {
                    errmsg += "ID " + data.senderID + " doesn't match creator name " + channel.creatorName + "; ";
                };
                if (socketid != channel.socketid) {
                    errmsg += "calling socket ID " + socketid + " doesn't match socket ID of channel creator " + channel.socketid;
                };
                if (errmsg != '') {
                    fn({error: errmsg});
                };
                return;
            };
            var targetSockets = {};
            for (clientid in channel.subscribers) {
                // Add the relevent socket for this client to the set
                targetSockets[messengerClients[clientid].socketid] = 1
            };
            console.log("Target sockets are:");
            console.dir(targetSockets);
            for (var socketid in targetSockets) {
                allSockets[socketid].emit('receive message', targetID, data);
            };
        };
        fn({success: 'received sendMessage'});
    } catch (e) {
        var msg = "Error forwarding message: perhaps " + targetID + " does not exist";
        console.log(e + ": " + msg);
        fn({error: msg});
    };
};

exports.listen = function (server) {

    io = require('socket.io').listen(server);
    io.sockets.on('connection', function (socket) {
        
        // connectionClients keeps track of clients attached to this socket, so
        // they can be de-registered when the connection is broken
        var connectionClients = {};
        //socket.emit('news', "Connected!");
        allSockets[socket.id] = socket;
        socket.on('new client', function newClient (data, fn) {
            var clientName = data.clientName;
            console.log("got new client request" + data.clientName);
            if (messengerClients[clientName]) {
                clientName = "client-" + Math.random();
                fn({error: "Houston, we have a problem",
                    newName: clientName});
            } else {
                fn({message: "added " + data.clientName});
            };
            messengerClients[clientName] = {socketid: socket.id};
            connectionClients[clientName] = {};
            io.sockets.emit('clientListUpdate', {clientList: messengerClients});
        });

        socket.on('create channel', function (channelName, creatorName, options, fn) {
            exports.createChannel(channelName, creatorName, options, fn, socket.id);
        });
        socket.on('subscribe', function (channelName, clientName, fn) {
            var channel = channels[channelName];
            if (!channel) {
                fn(channel + ": no such channel");
                return;
            };
            try {
                channel.subscribers[clientName] = {};
            } catch (e) {
                fn({ error: "Error setting client as subscriber" });
            };
            fn({ success: clientName + "Successfully subscribed to channel " + channelName});
        });
        socket.on('sendMessage', function (targetID, data, fn) {
            exports.sendMessage(targetID, data, fn, socket.id);
        });
        socket.on('drop client', function dropClient (clientName) {
            if (typeof connectionClients[clientName] == 'undefined') {
                console.log("Client %s does not belong to the socket requesting disconnect", clientName);
                return;
            };
            delete messengerClients[clientName];
            delete connectionClients[clientName];
        });

        socket.on('changeID', function (oldName, newName) {
            dropClient(oldName);
            newClient({clientName: newName});
        });
            
        socket.on('disconnect', function () {
            console.log('Hey, browser disconnected');
            for (var key in connectionClients) {
                delete messengerClients[key];
            };
            connectionClients = {};
        });
        broadcastChannelList()
    });
};
