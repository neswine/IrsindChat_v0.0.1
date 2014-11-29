var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var friendrequestSchema = mongoose.Schema({
    friendrequest             : {
		mainfriendid           :String,
        anotherfriendid        : String,
     }
});



module.exports = mongoose.model('Friendrequest', friendrequestSchema);
