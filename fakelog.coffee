# comment

messenger = require './ozone-messenger'

dummyCB = (data) ->

channel_options = 
	channelType: "oneway"
	dataType: "chat"
	junk: "hello"

messenger.createChannel "FakeLog", "FakeLogOwner", channel_options, dummyCB

http = require "http"

http.createServer((req, res) ->
	#req.on 'end', () ->
		message = "Log message: " + new Date()
		messenger.sendMessage "FakeLog", { message: message, senderID: "FakeLogOwner"}, (data) ->
			if data.error
				console.log "FakeLog error: " + data.error
		res.writeHead 200, {
			'Content-Type': 'text/plain'
		}
		res.end 'Hello HTTP'
).listen 8888
