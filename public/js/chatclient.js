ChatClient = (function () {
    // should be somewhere else, but it's here for now.
    var ChatClient = function (_component) {
        this.component = _component;
        this.receiveMessage = function (message) {
            console.log("chat client %s received message: %s", this.clientName, message);
            _component.messages.push({content: message.message});
        };
        this.clientsUpdated = function () {
            var channelKeys = Messenger.allChannels.getKeys();
            var keylist = Messenger.allClients.getKeys().concat(channelKeys);
            var objectList = []; // the Polymer list here apparently can't work with simple strings in an array, so convert it to a list of objects
            var channels = [];
            for (var i = 0, len = keylist.length; i < len; i++) {
                objectList.push({shortname: keylist[i],
                                 longname:  keylist[i]});
            };
            for (var i = 0, len = channelKeys.length; i < len; i++) {
                channels.push({shortname: channelKeys[i],
                                 longname:  channelKeys[i]});
            };
            _component.targets = objectList;
            _component.channels = channels;
        };
        this.messengerInit(_component.clientID);
    }

    ChatClient.prototype = new Messenger();

    return ChatClient;

})();
