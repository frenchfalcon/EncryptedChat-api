var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var conversationsSchema = new mongoose.Schema({

    initialized_by: mongoose.Schema.Types.ObjectId,

    activated: Boolean,

    is_empty: Boolean,

    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
},
{
    timestamps: true,
    versionKey: false,
});

module.exports = mongoose.model('Conversation', conversationsSchema, 'conversations');
