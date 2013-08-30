# comment

messenger = require './ozone-messenger'

dummyCB = (data) ->

channel_options = 
	channelType: "oneway"
	dataType: "chat"
	junk: "hello"

messenger.createChannel "FakeLog", "FakeLogOwner", channel_options, dummyCB

