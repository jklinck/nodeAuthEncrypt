var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var CommentSchema = new Schema({
	comment:{type:String},
	commentBy:{type:mongoose.Schema.Types.ObjectID,ref:'User'},
	created_at:{type: Date, default: Date.now}
});

module.exports = mongoose.model('Comment',CommentSchema);