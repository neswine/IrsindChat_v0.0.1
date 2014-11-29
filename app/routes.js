var User    = require('../app/models/user');
var Friend  = require('../app/models/friend');
var Friendrequest = require('../app/models/friendrequest');
var Usersid = require('../app/models/usersid');
var Newfriend = require('../app/models/newfriend');
    async   = require("async");
var path    = require('path'),
    fs      = require('fs');

module.exports = function(app, passport,server, opentok, apiKey) {
	app.get('/', function(request, response) {
		response.render('index.html');
	});

	app.get('/user', auth, function(request, response) {
		response.render('user.html', {
			user : request.user
		});
	});

	app.get('/image.png', function (req, res) {
    		res.sendfile(path.resolve('./uploads/image_'+req.user._id));
	}); 

	app.get('/profile', auth, function(request, response) {
		response.render('profile.html', {
			user : request.user
		});
	});

	app.get('/about', auth, function(request, response) {
		response.render('about.html', {
			user : request.user
		});
	});

	app.get('/home', auth, function(request, response) {
		response.redirect('/profile');
	});

	app.get('/chat', auth, function(req,res){
			res.render('pchat.html',{
			user : req.user
		});
	});

	app.get('/logout', function(request, response) {
		request.logout();
		response.redirect('/');
	});

	app.get('/login', function(request, response) {
		response.render('login.html', { message: request.flash('error') });
	});

	app.post('/login', passport.authenticate('login', {
		successRedirect : '/profile1', 
		failureRedirect : '/login', 
		failureFlash : true
	}));

	app.get('/signup', function(request, response) {
		response.render('signup.html', { message: request.flash('signuperror') });
	});


	app.post('/signup', passport.authenticate('signup', {
		successRedirect : '/profile1',
		failureRedirect : '/signup', 
		failureFlash : true 
	}));
		
	app.get('/profile', function(request, response) {
		response.render('profile.html', { message: request.flash('updateerror') });
	});


	app.post('/profile',  function (req, res){
		var tempPath = req.files.file.path,
        	targetPath = path.resolve('./uploads/'+req.files.file.originalFilename);
    		if ((path.extname(req.files.file.name).toLowerCase() === '.png') || (path.extname(req.files.file.name).toLowerCase() === '.jpg') ) {
        		fs.rename(tempPath, './uploads/image_'+req.user._id, function(err) {
            			if (err) throw err;
            				console.log("Upload completed!");
        		});
    		}
 		User.findOne({ 'user.username' :  req.body.username }, function(err, user) {
                	if (err){ return done(err);}
                	if (user)
                 	user.updateUser(req, res)
		});
  	});
	
	app.get('/profile1', auth, function(request, response) {
		var friendrequest = [];
		var newfrienddetails = [];
		
		
		var querys = Friendrequest.find({'friendrequest.mainfriendid': request.user._id});
		querys.exec(function(err,friendss){
			async.each(friendss, function(friend, callback){
				friendrequest.push(friend.friendrequest.anotherfriendid);
				callback();
				}
			);
			
		});

		var query = Friend.find({'friend.mainfriendid': request.user._id}, { 'friend.anotherfriendid': 1 });
		query.exec(function(err, friends) {
		
		if (!err) {
			var frdDetails = []
			async.each(friends,
    			function(friend, callback){
				if(friend.friend.anotherfriendid == ''){
					console.log('No Friend')
				}else{
    					User.findById(friend.friend.anotherfriendid, function(err, user) {
						frdDetails.push(user.user.firstname);
 						callback();
					});
   				}
					
  			},
  			function(err){
         			response.render('profile1.html', {
					user : request.user,
					friends: frdDetails,
					friendss: friendrequest
				});
  			}
		);
       		} else {
         		res.send(JSON.stringify(err), {
            			'Content-Type': 'application/json'
         		}, 404);
      		}
   		});
	});
	
	app.get('/search_member', function(req, res) {
   		var regex = new RegExp(req.query["term"], 'i');
   		var query = User.find({ $and: [ {'user.firstname': regex}, { _id: { $ne: req.user._id } } ] } ).limit(20);
      		// Execute query in a callback and return users list
  		query.exec(function(err, users) {
      			if (!err) {
         		// Method to construct the json result set
         			res.send(users, {
            				'Content-Type': 'application/json'
         			}, 200);
      			} else {
         			res.send(JSON.stringify(err), {
            				'Content-Type': 'application/json'
         			}, 404);
      			}
   		});
	});

	app.post('/friend',  function (request, response){
		Friend.findOne({ $and: [ {'friend.mainfriendid': request.param('mainfriendid')}, { 'friend.anotherfriendid': request.param('anotherfriendid') } ] }, function(err, friend) {
            	    	if (err){ return done(err);}
                    	if (friend) {
				response.redirect('/profile1');
                    	} else {
				if(request.param('anotherfriendid') != ''){
					var newFriend = new Friend();
 			 		newFriend.friend.mainfriendid = request.param('mainfriendid');
					newFriend.friend.anotherfriendid = request.param('anotherfriendid');
	 				newFriend.save();
				}
				response.redirect('/profile1');
			}
 		});	
	});

app.get('/videochat', function(req, res) {
		  var sessionId = app.get('sessionId'),
		      // generate a fresh token for this client
		      	token = opentok.generateToken(sessionId);
		 	res.render('videochat.html', {
		    		apiKey: apiKey,
		    		sessionId: sessionId,
		    		token: token
		  	});
	});
	
app.get('/gchat' ,auth, function(req,res){
		res.render('gchat.html',{
			user : req.user
		});
	});
		
var usersonline  = {};
var io = require('socket.io').listen(server);
var usernamed = {};//for peer chat
var usersocketss = {};//for peer chat
var names 
var usersockets = {};
var usernames = {};// for room chat
var usernamess = {};
var rooms = ['room1'];
var userconnected = {};
var peerid = {};

io.sockets.on('connect', function(socket){

	socket.on('search result', function(name, add){
		//console.log(name, add);
		socket.emit('search result', name, add);
	});

	socket.on('friend request', function(myid, friendname, friendadd, username){
		
		var client_socket = usersocketss[friendname];
		if(client_socket == null){
			var querys = Usersid.findOne({'userid.username': friendname});
			querys.exec(function(err, friendid){
				var query = Friendrequest.find({'friendrequest.mainfriendid': myid});
				query.exec(function(err,friendreq){
					if(friendreq == ''){
						var newrequest = Friendrequest();
						newrequest.friendrequest.mainfriendid = friendid.userid.userid;
						newrequest.friendrequest.anotherfriendid = username;
						newrequest.save();
					} else {	
						async.each(friendreq, function(friend,callback){				
							if(friend.friendrequest.anotherfriendid == friendname){
								console.log('req present');
							} else {
								var newrequest = Friendrequest();
								newrequest.friendrequest.mainfriendid = friendid.userid.userid;
								newrequest.friendrequest.anotherfriendid = username;
								newrequest.save();					
							}
						});					
					}			
				});	
			});			
		}
		else{
			client_socket.emit('friend request', friendname, friendadd, username);		
		}	
	});

	// Add a new room to the available list
	socket.on('adduser', function(roomname, username){
		if(roomname in rooms) {
			socket.emit('not available', { msg: 'room name already taken ' });
			console.log('1');
		}
		else {
			socket.namess = username;
			// store the username in the socket session for this client
			socket.usernam = username;
			// store the room name in the socket session for this client
			socket.room = roomname;
			// add the client's username to the global list
			usernames[username] = username;
			// send client to room 1
			socket.join(roomname);
			// echo to client they've connected
			socket.emit('join', 'SERVER', 'you have connected to' , roomname );
			// echo to room 1 that a person has connected to their room
			socket.broadcast.to(roomname).emit('connected to room', 'SERVER', username + ' has connected to this room');
			rooms.push(socket.room);
			socket.emit('updaterooms', rooms, roomname);		
		}
	});
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data,username) {
		socket.usernam = username;
		//console.log(socket.usernam)
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', socket.usernam, data);
	});
	
	// when client wnats to click and join another room 
	socket.on('switchRoom', function(newroom){
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('join', 'SERVER', 'you have connected to '+ newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('disconect', 'SERVER', socket.namess+' has left this room');
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('join', 'SERVER', socket.namess+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	});
	

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.usernam];
		delete rooms[socket.room];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('disconect', 'SERVER', socket.usernam + ' has disconnected');
		socket.leave(socket.room);
	});
	
	// For adding friends
	socket.on('adduserr', function(data, id){
		
		var query = Usersid.findOne({'userid.username': data});
		query.exec(function(err,useridsearch){
			if(useridsearch == null){
				var user = Usersid();
				user.userid.userid = id;
				user.userid.username = data;
				user.save();
			} else if(useridsearch.userid.userid == id){
				console.log('already present');
			} else {		
				var user = Usersid();
				user.userid.userid = id;
				user.userid.username = data;
				user.save();
			}
		});
		
		socket.name = data;
		socket.username = data;
		//usernames[socket.username] = data;
		//usersockets[socket.username] = socket;
		io.emit('updateuserrs' , usernamess, data);
        	usernamess[data] = data;
        	io.sockets.emit('updateuserrs', usernamess);
		//io.emit('connected' , usernamess, data);
  	});

	socket.on('add new friend', function(friendname, userid, username){
		
		var query = Usersid.findOne({'userid.username':friendname});
		query.exec(function(err,friendid){
			var querys = Friend.find({'friend.mainfriendid': userid});
			querys.exec(function(err,friendlist){
				if(friendlist == ""){
					var newfriend =	Friend();
					newfriend.friend.mainfriendid = userid;
					newfriend.friend.anotherfriendid = friendid.userid.userid;
					newfriend.save();

					var newfriends = Friend();
					newfriends.friend.mainfriendid = friendid.userid.userid;
					newfriends.friend.anotherfriendid = userid;
					newfriends.save();					
				} else {
					async.each(friendlist,function(friend,callback){
						if(friend.friend.anotherfriendid == friendid.userid.userid){	
							console.log('already a friend');						
						} else {
							var newfriend =	Friend();
							newfriend.friend.mainfriendid = userid;
							newfriend.friend.anotherfriendid = friendid.userid.userid;
							newfriend.save();

							var newfriends = Friend();
							newfriends.friend.mainfriendid = friendid.userid.userid;
							newfriends.friend.anotherfriendid = userid;
							newfriends.save();							
						}					
					});
				}				
			});	

			var deleterequest = Friendrequest.findOne({$and:[{'friendrequest.mainfriendid':userid},{'friendrequest.anotherfriendid':friendname}]});
			deleterequest.exec(function(err,request){
				request.remove();
				console.log('request removed');			
			});
			
		});
					
	});

		
	

	
	// For adding online friends for peerchat	
	socket.on('names' , function(data,id){
		peerid[data] = id;
		//console.log(peerid);
		io.emit('peerid', peerid);
		socket.names = data;
		socket.usernames = data;
		usernamed[socket.usernames] = data;
		usersocketss[socket.usernames] = socket;
		//io.emit('connected' , usernamed, data);
		io.sockets.emit('friends' , usernamed, data);
		//console.log(peerid);
	});
		
	// For sending private chat
	socket.on('sendprivatechat', function(key, msg){
  		var clientSocket = usersocketss[key];
  		if(clientSocket == null){
  		}else{
   			clientSocket.emit('getprivatemsg', socket.usernames, key, "<b>"+socket.usernames+"</b>: "+msg);
  		}
 	});

	// For updating online friends when disconneted
	socket.on('disconnect', function(){
		delete usernamed[socket.usernames];
		delete usersocketss[socket.usernames];
		io.emit('friends', usernamed);	
	});

	socket.on('status send', function(msg,name){
		io.emit('show notification',name);
		io.emit('receive status', msg,name);
	});

	socket.on('delete request', function(nametobedeleted, userid, username){
		console.log(nametobedeleted,userid);	
		var query = Friendrequest.findOne({$and:[{"friendrequest.anotherfriendid":nametobedeleted},{"friendrequest.mainfriendid":userid}]});
		query.exec(function(err,data){
			data.remove();
			console.log('data successfully deleted');		
		});	
	});

});

};

// Function for authentication
function auth(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
  	res.redirect('/login')
}
