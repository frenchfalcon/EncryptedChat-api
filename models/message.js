var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = new mongoose.Schema({
    conversation: mongoose.Schema.Types.ObjectId,
    sender: mongoose.Schema.Types.ObjectId,
    encrypted_for: mongoose.Schema.Types.ObjectId,

    uuid: {
      type: String,
      required: true,
    },
    ct: {
      type: String,
      required: true,
    },
    it: {
      type: String,
      required: true,
    },
    ek: {
      type: String,
      required: true,
    }
},
{
    timestamps: true,
    versionKey: false,
});

module.exports = mongoose.model('Message', messageSchema, 'messages');
