Deckster-Polymer
================

This repo is essentially two projects in one.  The original intent was to be an exercise in learning the Polymer web component framework[http://www.polymer-project.org/] by implementing bits of Deckster [https://github.com/42sixsolutions/deckster].  The master branch reflects this side of the project.

A secondary purpose is to implement a web-based messaging/update system, similar to [PushUpdater-node](https://github.com/rschmertz/PushUpdater-Node), but expanded to allow client-to-client communication, and general message bus service.  All the code for this is in the [messenger branch](https://github.com/rschmertz/deckster-polymer/tree/messenger).  At this point, however, there is more code in the **messenger** branch than in the **master** branch, as my study of Polymer is on hold.

You must install bower globally to use this.

    sudo npm install -g bower

This is a Node.js/Express project, so also do a simple `npm install` in the directory.

Then run `make`

Then run `node app`.

To view the demo, visit [http://localhost:3000/deckster.html](http://localhost:3000/deckster.html).

Target capabilities for Messenger
-----------
The goal of the Messenger component is to support the following types of communication:

<dl>
<dt>Peer-to-Peer</dt>
<dd>
In this scenario, a client component in the browser sends a JSON message to another client, specified by a client name.  An example of this sort of communication would be a simple chat client.  To support this and make it practical to use, clients are allowed to set their own names so that they are manageable by humans.  The server keeps track of client names to enforce uniqueness across all clients, assigning a randomly generated name if the requested ID is already in use.
</dd>
<dt>Channel</dt>
<dd>
A client may subscribe to a channel.  There are two broad categories of channel:
<dl>
  <dt>Open Channel</dt>
  <dd>
  Any client may put a message on this type of channel, and the message will be transmitted to all subscribers.  This is analagous to a listserv.
  </dd>
  <dt>One-way Channel</dt>
  <dd>
  This is a restricted form of the Open Channel: only the creator of the channel can put messages into the channel.  An analogue for this might be a Twitter feed.
  </dd>
</dl>
There are two more broad categories of channel:
<dl>
  <dt>Client-based</dt>
  <dd>
  Any client can create a channel.  The client that creates a channel can designate it as an Open Channel or a One-way Channel.
  </dd>
  <dt>Server-based</dt>
  <dd>
  A channel can be provided by the server itself, to provide either locally-generated content, such as a system log, or third-party content, such as a Twitter feed.  ~~Server-based channels are One-way~~ (Thinking about this)
  </dd>
  </dl>
</dl>

Client API
----------
A client should inherit off the Messenger class.  The example below uses JavaScript's prototypal inheritance, but other types of inheritance may work as well:

``` javascript
function MyClient(options) {
    this.foo = options.foo;
    this.myClientName = options.name;

    /*
      Clients should implement receiveMessage.  While a default implementation
      is provided, it's hard to imagine a useful client that doesn't implement
      this method.
     */
    this.receiveMessage = function (message) {
        console.log("chat client %s received message: %s", this.myClientName, message);
    };

    /*
      Calling messengerInit is mandatory.  The client must choose an ID that
      should be unique.  If the requested ID is already in use, a new, random
      ID will be generated and assigned to the client.
    */
    this.messengerInit(options.clientID);
}

MyClient.prototype = new Messenger();

```
### Non-overridable methods
The following methods are inherited from the Messenger class, and should *not* be overridden:
<dl>
  <dt>
    .sendMessage(targetID, message)
  </dt>
  <dt>.createChannel(channelName, options)</dt>
  <dd>
    Any client can create a channel.  That channel must have a name (<strong>channelName</strong>) that is not
    currently used by any existing client or channel.  The <strong>options</strong> hash may contain both custom options pertaining to the channel type, and options used by the Messenger framework. The framework pays attention to the following fields in the options hash:
    <dl>
      <dt>channelType</dt>
      <dd>
	Accepted values are "oneway" and "open".  If set to "oneway", only the creating client may send messages to the channel.  If set to "open", any client may send a conforming message to the channel.
      </dd>
    </dl>
  </dd>
  <dt>.subscribe(channelName)</dt>
  <dd>
    Subscribe for updates from the channel <strong>channelName</strong>.
  </dd>
  <dd>
    Send a message, <strong>message</strong>, to a target with ID <strong>targetID</strong>.  <strong>message</strong> should be a serializable JavaScript object, in a format that the message target/recipient is able to recognize and make use of.
  </dd>
  <dt>.changeID(newName)</dt>
  <dd>A client may attempt to change its ID to a new one of its own choosing, in the event that the client was not given the name it originally requested, or for any other reason.  <strong>newName</strong> is the new name that is being requested.
  </dd>
  <dt>.disconnect()</dt>
  <dd>
    The the developer may want to call this method in the event that an instance of a client is removed from the user interface, as it will clean up some things on the client and server side.
  </dd>
  <dt>.clientName</dt>
  <dd>
    A string member, rather than a method, this is the unique ID of this client.  It is set by the Messenger framework, but is available for use by the client.
  </dd>
</dl>

### Overridable methods
The following methods contain default implementations from the Messenger class, but are available for overriding:
<dl>
  <dt>.receiveMessage(message)</dt>
  <dd>
    This is the method that the service will call when it has new data for the client.  While a default implementation is provided, it's hard to imagine a useful client that doesn't have its own implementation of this.
  </dd>
  <dt>.clientsUpdate()</dt>
  <dd>
    This method is called when there has been an update to the list of clients and channels attached to the system.  If your client needs to have an up-to-date list of clients and or channels, it should implement this method.  To get an up-to-date list of Channels, it may call <tt>Messenger.allChannels.getKeys()</tt>.  For an up-to-date list of Clients, call <tt>Messenger.allClients.getKeys()</tt>.  <em>Note: this seems kind of lame.  Maybe this should be reworked to pass clients and channels to the method</em>
  </dd>
  <dt>.clientNameRejected(requestedName, newName)</dt>
  <dd>
    If the client requests a name which turns out not to be unique, the request will be rejected and a new name randomly generated and assigned.  In that event, this method will be called.  A client may wish to implement this method to, say, prompt the user to apply for a different name.
  </dd>
</dl>

### Page-level APIs
At the page level, two "GrumpySet" instances are maintained: `Messenger.allClients` and `Messenger.allChannels`.  In each of these, "all" means all (clients/channels) known to the server that the client connects to.  The list of IDs contained in each of these is available through the `.getKeys()` method, e.g., `Messenger.allChannels.getKeys()`.
