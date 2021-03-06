// local authentication
var LocalStrategy    = require('passport-local').Strategy;

var User       = require('../app/models/user');

module.exports = function(passport) {

    // Maintaining persistent login sessions
    // serialized  authenticated user to the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // deserialized when subsequent requests are made
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

     passport.use('login', new LocalStrategy({
        usernameField : 'username',
        passReqToCallback : true 
    },
    function(req, username, password, done) {
       process.nextTick(function() {
            User.findOne({ 'user.username' :  username }, function(err, user) {
                if (err){ return done(err);}
                if (!user)
                    return done(null, false, req.flash('error', 'User does not exist.'));

                if (!user.verifyPassword(password))
                    return done(null, false, req.flash('error', 'Enter correct password'));
               else
                    return done(null, user);
            });
        });

    }));

     passport.use('signup', new LocalStrategy({
        usernameField : 'username',
        passReqToCallback : true 
    },
    function(req, username, password, done) {

        process.nextTick(function() {
       
            if (!req.user) {
                User.findOne({ 'user.username' :  username }, function(err, user) {
            	    if (err){ return done(err);}
                    if (user) {
                        return done(null, false, req.flash('signuperror', 'User already exists'));
                    } else {
                        var newUser         = new User();
			             newUser.user.username    = username;
                         newUser.user.email    = req.body.email;
                         newUser.user.password = newUser.generateHash(password);
			 newUser.user.firstname	= req.body.firstname;
                         newUser.user.lastname = req.body.lastname;
			             newUser.user.address	= ''
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }

                });
            } else {
                var user            = req.user;
		        user.user.username    = username;
                user.user.email    = req.body.email;
                user.user.password = user.generateHash(password);
			    newUser.user.firstname   = '';
                newUser.user.lastname = req.body.lastname;
                user.user.address	= ''

                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });

            }

        });


    }));
};
