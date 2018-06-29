var conversation = require('../../models/conversation');
var mongoose = require('mongoose');

function getConversations(req, res, next) {

  var userId = req.userid;
  var conversationId = req.query.conversation_id || "";

  if (conversationId == "") {
    return res.status(422).json({
      status: 422,
      message: "Invalid or missing parameters."
    });
  }

  conversation
  .findOne({ _id: conversationId })
  .populate('users')
  .lean()
  .exec(function(err, conversation) {
    if (err) { return next(err); }
    if (!conversation) {
      return res.status(404).json({
        status: 404,
        message: "Conversation not found."
      });
    }
    if (conversation.activated != true) {
      return res.status(403).json({
        status: 403,
        message: "This conversation exists but is not activated yet."
      });
    }

    conversation["target"] = (conversation.users[0]._id != userId) ? conversation.users[0] : conversation.users[1]
    conversation.users = undefined

    return res.json({
      "status": 200,
      "conversation": conversation
    });
  });
}

module.exports = getConversations;
