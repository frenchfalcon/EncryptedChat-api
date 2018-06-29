var io = require('socket.io')();
var fs = require('fs');
var socketioJwt = require('socketio-jwt');

io.sockets
  .on('connection', socketioJwt.authorize({
    secret: fs.readFileSync('./keys/public.key', 'utf8'),
    algorithm: 'RS256',
    timeout: 9000 // 9 seconds to send the authentication message
  })).on('authenticated', function(socket) {

  var clientId = socket.decoded_token.id;
	// Joins unique channel for private messaging
	socket.join(clientId);

  socket.on('unauthorized', function(msg){
	 	console.log('Error');
  });
	// On user disconnection
  socket.on('disconnect', function() {
    socket.leave(clientId);
	});
});

module.exports = io;
