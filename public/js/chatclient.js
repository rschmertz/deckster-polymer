ChatClient = (function () {
    // should be somewhere else, but it's here for now.
    var ChatClient = function (_component) {
        this.component = _component;
        this.receiveMessage = function (message) {
            console.log("chat client %s received message: %s", this.clientName, message);
        };
        this.clientsUpdated = function () {
            var keylist = Messenger.allClients.getKeys();
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

    return ChatClient;

})();
