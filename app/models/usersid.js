var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var useridSchema = mongoose.Schema({
    userid            : {
		userid           :String,
        username        : String,
     }
});



module.exports = mongoose.model('Usersid', useridSchema);
