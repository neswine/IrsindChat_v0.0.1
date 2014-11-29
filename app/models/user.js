var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    user             : {
   	username	 : String,
	firstname    : String,
    lastname     : String,
    email        : String,
    password     : String,
    address		 : String,
	city         : String,
	state		 : String,
	country		 : String
    }
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.verifyPassword = function(password) {
    return bcrypt.compareSync(password, this.user.password);
};

userSchema.methods.updateUser = function(request, response){

	this.user.firstname = request.body.firstname;
	this.user.lastname = request.body.lastname;
	this.user.address = request.body.address;
	 this.user.save();
	response.redirect('/profile');
};



module.exports = mongoose.model('User', userSchema);
