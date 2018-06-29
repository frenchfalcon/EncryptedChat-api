var express = require('express');
var app = express();
var http = require('http');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var logger = require('morgan');
var config = require('./config/config');

var httpServer = http.createServer(app);

var io = require('./socket/sockets');
var user = require('./models/user.js');
var message = require('./models/message.js');
var conversation = require('./models/conversation.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(logger('dev'));

// Connect to database
mongoose.connect(config.database);

// Load validation middleware
app.all('/api/*', require('./routes/Middleware/validate'));

// Load routes
app.use('/', require('./routes'));

// Error Middleware
app.use(function(err, req, res, next) {
	console.log(err);
 	res.status(500).json({
		"status": 500,
		"message": "Oops ! Something went wrong"
	});
});

// Not found middleware
app.use(function(req, res, next) {
 	res.status(404).json({
		"status": 404,
		"message": "Oops ! Nothing found on this url."
	});
});

httpServer.listen(3000, function () {
  console.log('SecChat API listening on port 3000!');
});

io.attach(httpServer);
