var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var chatSchema = mongoose.Schema({
    chat             : {
		from           :String,
        to        : String,
	msg	  : String
     }
});



module.exports = mongoose.model('Chat', chatSchema);
