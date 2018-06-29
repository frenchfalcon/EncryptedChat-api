var async = require('async');
var message = require('../../models/message');
var conversation = require('../../models/conversation');
var mongoose = require('mongoose');

function getMessages(req, res, next) {

  var userId = req.userid;
  var conversationId = req.query.conversation_id || "";
  var lastMessageUUID = req.query.last_message_uuid;

  if (conversationId == "") {
    return res.status(422).json({
      status: 422,
      message: "Invalid or missing parameters."
    });
  }

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
        done(null);
      });
    },
    function(done) {
      message.findOne({ conversation: conversationId, encrypted_for: userId, uuid: lastMessageUUID }, function(err, lastMessage) {
        if (err) { return done(err); }
        if (lastMessage) {
          done(null, lastMessage._id)
        }
        else {
          done(null, null);
        }
      });
    },
    function(lastMessageId, done) {
      if (lastMessageId) {
        message.find({ conversation: conversationId, encrypted_for: userId, _id: { $gt: lastMessageId } }, function(err, messages) {
          messages.reverse();
          done(err, messages);
        });
      }
      else {
        message
          .find({
            conversation: conversationId, encrypted_for: userId
          })
          .sort('-updatedAt')
          .limit(30)
          .exec(function(err, messages) {
            done(err, messages)
          });
      }
    }
  ], function(err, messages) {
      if (err) { return next(err); }
      messages.reverse();
      return res.json({
        status: 200,
        messages: messages
      });
  });
}

module.exports = getMessages;
