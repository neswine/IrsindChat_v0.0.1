var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var OpenTok = require('opentok');
var path = require('path'),
    fs = require('fs');
 var http = require('http')
var server = http.createServer(app)

var ExpressPeerServer = require('peer').ExpressPeerServer;
var conn = new ExpressPeerServer({key: 'lwjd5qra8257b9'});
var options = {
    debug: true
}

var configDB = require('./config/database.js');

mongoose.connect(configDB.url); 

require('./config/passport')(passport); 

// Verify that the API Key and API Secret are defined
var apiKey = '45104682',
    apiSecret = 'ac1621e5c6c1ac900fb6528e39fd3b5954dd8c76';
if (!apiKey || !apiSecret) {
  console.log('You must specify API_KEY and API_SECRET environment variables');
  process.exit(1);
}

// Initialize OpenTok
var opentok = new OpenTok(apiKey, apiSecret);

// Create a session and store it in the express app
opentok.createSession(function(err, session) {
  if (err) throw err;
  app.set('sessionId', session.sessionId);
  // We will wait on starting the app until this is done
  init();
});
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/peerjs', ExpressPeerServer(server, options));

app.configure(function() {

	app.use(express.cookieParser());
	app.use(express.bodyParser()); 
	app.use(express.static(path.join(__dirname, 'public')));
	app.set('views', __dirname + '/views');
	app.engine('html', require('ejs').renderFile);
	app.use(express.session({ secret: 'mohit' })); 
	app.use(express.bodyParser({uploadDir:'/images'}));
	app.use(passport.initialize());
	app.use(passport.session()); 
	app.use(flash()); 

});


require('./app/routes.js')(app, passport, server, opentok, apiKey); 

function init() {
  server.listen(port, function() {
    console.log('You\'re app is now ready at http://localhost:8080/');
  });
}
//server.listen(port);
//console.log('Listening  to  port ' + port);


