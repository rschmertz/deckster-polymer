Deckster-Polymer
================

This repo is essentially two projects in one.  The original intent was to be an exercise in learning the Polymer web component framework[http://www.polymer-project.org/] by implementing bits of Deckster [https://github.com/42sixsolutions/deckster].  The master branch reflects this side of the project.

A secondary purpose is to implement a web-based messaging/update system, similar to [PushUpdater-node](https://github.com/rschmertz/PushUpdater-Node), but expanded to allow client-to-client communication, and general message bus service.  All the code for this is in the [messenger branch](https://github.com/rschmertz/deckster-polymer/tree/messenger).  At this point, however, there is more code in the **messenger** branch than in the **master** branch, as my study of Polymer is on hold.

You must install bower globally to use this.

    sudo npm install -g bower

This is a Node.js/Express project, so also do a simple `npm install` in the directory.

Then run `make`

Then run `node app`.

To view the demo, visit http://localhost:3000/deckster.html.
