var Messenger = (function () {
    _M = Messenger;
    var socket = io.connect('http://localhost');

    // grumpySet won't let you add an item if it's already in there
    // stores only strings
    function GrumpySet(setname, updateCB) {
        var lookup = {};
        
        this.add = function (key, value) {
            if (key in lookup) {
                throw {
                    message: "There is already an object "+key+"in the lookup",
                    key: key
                }
            };
            lookup[key] = value;
            console.log("in grumpy add");
            updateCB && updateCB();
        }

        this.del = function (key) {
            delete lookup[key];
            updateCB && updateCB();
        }

        this.reset = function(hash) {
            lookup = hash;
            updateCB && updateCB();
        };

        this.get = function (key) { return lookup[key]; };

        this.getKeys = function () {
            var keylist = [], key;
            for (key in lookup) {
                keylist.push(key);
            };
            return keylist;
        };

        this.map = function (f) {
            var newArray = {}, key;
            for (key in lookup) {
                var value = lookup[key];
                newArray[key] = f(value);
            };
            return newArray;
        };
    };

    function localClientsUpdate() {
        _M.localClients.map(function (value) {
            value.clientsUpdated();
        });
    };

    _M.localClients = new GrumpySet("localClients", localClientsUpdate);
    _M.allClients = new GrumpySet("allClients", localClientsUpdate);
    _M.allChannels = new GrumpySet("allChannels", localClientsUpdate);
    var channelSubscribers = new GrumpySet("channelSubscribers");

    socket.on('clientListUpdate', function (data) {
        _M.allClients.reset(data.clientList);
    });

    socket.on('channelListUpdate', function(response) {
        console.log('new channel list: ');
        console.dir(response.channelList);
        _M.allChannels.reset(response.channelList);
    });

    socket.on('receive message', function (targetID, data) {
        _M.localClients.get(targetID).receiveMessage(data);
        console.log("message received");
    });;

    // Messenger prototype
    var p_messenger = {
        sendMessage: function (targetID /* string, for now */, message) {
            var channel = _M.allChannels.get(targetID);
            //if (channel && (channel.channelType != "open"
            var target = _M.localClients.get(targetID);
            if (target) {
                target.receiveMessage({senderID: this.clientName, message: message});
            } else {
                socket.emit('sendMessage', targetID,
                            {senderID: this.clientName, message: message},
                            function(data) {
                                if (data.success) {
                                    console.log(data.success);
                                }
                            })
            };
        },
        createChannel: function (channelName, options) {            
            socket.emit('create channel', channelName, this.clientName, options, function(response) {
                if (response.error) {
                    console.log("Error creating channel: " + response.error);
                }
            });
        },
        subscribe: function (channelName) {
            var channel = channelSubscribers.get(channelName);
            if (!channel) {
                channel = {};
                channelSubscribers.add(channelName, channel);
            };
            if (channel[this.clientName]) {
                console.log("this client already subscribed to this channel");
                return;
            };
            channel[this.clientName] = this;
            socket.emit('subscribe', channelName, this.clientName, function(result) {
                if (result.error) {
                    console.log("Subscription failed: " + result.error);
                    delete channel[this.clientName];
                };
            });
        },
        messengerInit: function (clientName) {
            var self = this;
            socket.emit("new client", {clientName:clientName}, function(data) {
                if (data.error) {
                    self.clientName = data.newName;
                    self.clientNameRejected(clientName, data.newName);
                } else {
                    console.log("server message: " + data.message);
                    self.clientName = clientName;
                };
                console.log("Added " +  self.clientName);
                _M.localClients.add(self.clientName, self);
            });

        },
        disconnect: function () {
            _M.localClients.del(this.clientName);
            socket.emit('drop client', this.clientName);
        },
        changeID: function (newName) {
            console.log("in changeID, newName is %s, clientName is %s", newName, this.clientName);
            this.disconnect();
            this.messengerInit(newName);
        },
        // This is a method that clients should override
        clientNameRejected: function (requestedName, newName) {
            console.log("Could not assign the name %s.  Assigned the name %s.  Sorry.", requestedName, newName);
        }
    };

    function Messenger () {};

    Messenger.prototype = p_messenger;

    return Messenger;

})();
