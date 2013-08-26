var Messenger = (function () {
    _M = Messenger;
    var socket = io.connect('http://localhost');

    // grumpySet won't let you add an item if it's already in there
    // stores only strings
    function GrumpySet() {
        var lookup = {};
        
        this.add = function (key, value) {
            if (key in lookup) {
                throw {
                    message: "There is already an object "+key+"in the lookup",
                    key: key
                }
            };
            lookup[key] = value;
            this.notifyUpdate();
        }

        this.del = function (key) {
            delete lookup[key];
            this.notifyUpdate();
        }

        this.reset = function(hash) {
            lookup = hash;
        };

        this.get = function (key) { return lookup[key]; };

        this.getKeys = function () {
            var keylist = [], key;
            for (key in lookup) {
                keylist.push(key);
            };
            return keylist;
        };

        this.notifyUpdate = function () {
            var key;
            for (key in lookup) {
                var value = lookup[key];
                value.clientsUpdated();
            };
        };
    };

    _M.localClients = new GrumpySet();
    _M.allClients = new GrumpySet();

    socket.on('clientListUpdate', function (data) {
        _M.allClients.reset(data.clientList);
        _M.localClients.notifyUpdate();
    });

    socket.on('receive message', function (targetID, data) {
        _M.localClients.get(targetID).receiveMessage(data);
        console.log("message received");
    });;

    // Messenger prototype
    var p_messenger = {
        sendMessage: function (targetID /* string, for now */, message) {
            var target = _M.localClients.get(targetID);
            if (target) {
                target.receiveMessage(message);
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
        messengerInit: function (clientName) {
            var self = this;
            //this.component.updateClientID();
            console.log("let's make a socket call");
            socket.emit("new client", {clientName:clientName}, function(data) {
                if (data.error) {
                    self.clientName = data.newName;
                    self.clientNameRejected(clientName, data.newName);
                } else {
                    console.log("server message: " + data.message);
                    self.clientName = clientName;
                };
                console.log("Added " +  self.clientName);
                //console.log("A.K.A. " + self.clientName);
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
