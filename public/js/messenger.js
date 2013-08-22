var Messenger = (function () {
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

        this.get = function (key) {
            return lookup[key];
        };

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
                console.log("about to call clientsUpdated for " + key);
                var value = lookup[key];
                console.log("uuid for %s is %s", key, value.uuid);
                value.clientsUpdated();
            };
        };
    };

    var localClients = new GrumpySet();

    // Messenger prototype
    var p_messenger = {
        sendMessage: function (targetID /* string, for now */, message) {
            var target = localClients.get(targetID);
            if (target) {
                target.receiveMessage(message);
            } else {
                alert("socket messaging not implemented yet");
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
                localClients.add(self.clientName, self);
            });

        },
        changeID: function (newName) {
            console.log("in changeID, newName is %s, clientName is %s", newName, this.clientName);
            localClients.del(this.clientName);
            this.clientName = newName;
            localClients.add(newName, this);
        },
        // This is a method that clients should override
        clientNameRejected: function (requestedName, newName) {
            console.log("Could not assign the name %s.  Assigned the name %s.  Sorry.", requestedName, newName);
        },
        clients: localClients
    };

    function Messenger () {};

    Messenger.prototype = p_messenger;

    // should be somewhere else, but it's here for now.
    window.ChatClient = function (_component) {
        this.component = _component;
        this.receiveMessage = function (message) {
            console.log("chat client %s received message: %s", this.clientName, message);
        };
        this.clientsUpdated = function () {
            var keylist = this.clients.getKeys();
            var objectList = []; // the Polymer list here apparently can't work with simple strings in an array, so convert it to a list of objects
            for (var i = 0, len = keylist.length; i < len; i++) {
                objectList.push({shortname: keylist[i],
                                 longname:  keylist[i]});
            };
            _component.targets = objectList;
        };
        this.messengerInit(_component.clientID);
    }

    ChatClient.prototype = new Messenger();


    return Messenger;

})();
