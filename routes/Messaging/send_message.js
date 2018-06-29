var async = require('async');
var io = require('../../socket/sockets');
var uuid = require('uuid');
var conversation = require('../../models/conversation');
var messageModel = require('../../models/message');

function sendMessage(req, res, next) {

  var targetId = "";
  var senderId = req.userid
  var conversationId = req.body.conversation_id || "";

  var messagesJson = req.body.messages_json || ""

  if (conversationId == "" || messagesJson == "") {
    return res.status(422).json({
      status: 422,
      message: "Invalid or missing parameters."
    });
  }

  try {
    var messages = JSON.parse(messagesJson);
  }
  catch (e) {
    return res.status(422).json({
      status: 422,
      message: "Invalid or missing parameters."
    });
  }

  messages.forEach(function(message){
    if (message.ct == undefined ||
        message.it == undefined ||
        message.ek == undefined ||
        message.encrypted_for == undefined) {
          return res.status(422).json({
            status: 422,
            message: "Invalid or missing parameters."
          });
        }
  });

  async.waterfall([
    function(done) {
      conversation.findOne({ _id: conversationId }, function(err, conv) {
        if (err) { return done(err); }
        if (!conv) {
          return res.status(404).json({
            status: 404,
            message: "Conversation not found."
          });
        }
        targetId = (conv.users[0]!= senderId) ? conv.users[0]: conv.users[1];
        done(null, conv);
      });
    },
    function(conversation, done) {

      var messageUUID = uuid.v1();

      async.each(messages, function(message, next) {

        var newMessage = new messageModel();

        newMessage.conversation = conversationId;
        newMessage.encrypted_for = message.encrypted_for;
        newMessage.uuid = messageUUID;
        newMessage.ct = message.ct;
        newMessage.it = message.it;
        newMessage.ek = message.ek;
        newMessage.sender = senderId;
        newMessage.save(function(err) {
          return next(err);
        });
      }, function(err) {
        done(err, conversation, messageUUID);
      });
    },
    function(conversation, messageUUID, done) {
      if (conversation.is_empty == true) {
        conversation.is_empty = false;
      }
      conversation.lastmessage = messageUUID;
      conversation.save(function(err) {
        if (err) { return done(err); }
        io.to(targetId).emit('received_message', {
          conversation_id: conversationId
        });
        done(null, messageUUID);
      })
    },
  ], function(err, messageUUID) {
    if (err) { return next(err); }
    return res.json({
      status: 200,
      message: "Message sent successfully.",
      message_uuid: messageUUID
    });
  });
}

module.exports = sendMessage;
