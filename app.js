
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app)
, io = require('socket.io').listen(server);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// Keep track of all clients to make sure there are no duplicate IDs
var messengerClients = {};

io.sockets.on('connection', function (socket) {

    // connectionClients keeps track of clients attached to this socket, so
    // they can be de-registered when the connection is broken
    connectionClients = {};
    //socket.emit('news', "Connected!");
    socket.on('new client', function (data, fn) {
        console.log("got new client " + data.clientName);
        if (messengerClients[data.clientName]) {
            var newName = "client-" + Math.random();
            fn({error: "Houston, we have a problem",
               newName: newName});
        } else {
            messengerClients[data.clientName] = {};
            connectionClients[data.clientName] = {};
            fn({message: "addedd " + data.clientName});
        };
    });
    socket.on('disconnect', function () {
        console.log('Hey, browser disconnected');
        for (var key in connectionClients) {
            delete messengerClients[key];
        };
        connectionClients = {};
    });
});
