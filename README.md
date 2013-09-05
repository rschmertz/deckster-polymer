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

I hope that clarifies everything.
