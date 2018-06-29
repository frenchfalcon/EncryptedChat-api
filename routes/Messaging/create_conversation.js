var async = require('async');
var io = require('../../socket/sockets');
var conversation = require('../../models/conversation');

function createConversation(req, res, next) {

  var userId = req.userid || "";
  var targetUserId = req.body.targetid || ""
  
  if (targetUserId == "") {
    return res.status(422).json({
      status: 422,
      message: "Invalid or missing parameters."
    });
  }

  if (userId == targetUserId) {
    return res.status(404).json({
      status: 404,
      message: "Unable to create conversation. Target user ID must be different than current user ID."
    });
  }

  // We try to find a conversation where the 2 users are involved
  conversation.findOne({ users: { $all: [ userId , targetUserId ] } }, function(err, conv) {
    if (err) { return next(err); }
    // If theres no conversation found with the 2 users, then we will create it
    // and this users will be referred as the one who initiated it
    if (!conv) {
      var newConv = new conversation();
      newConv.initialized_by = userId;
      newConv.activated = false;
      newConv.is_empty = true;
      newConv.users.push(userId, targetUserId);
      newConv.save(function(err) {
        if (err) { return next(err); }
        return res.status(201).json({
          status: 201,
          activated: false,
          message: "The conversation has been successfully created. " +
          "It will remain unactivated until the other user activates it."
        });
      });
    }
    // If the conversation exists
    else {
      // If it's already activated, stop here
      if (conv.activated == true ) {
        return res.status(409).json({
          status: 409,
          message: "This conversation has already been created and activated."
        });
      }
      // If it's not activated yet, but initiated by the current user, stop here
      // because we wait for the target user to activate
      if (conv.activated == false && conv.initialized_by == userId) {
        return res.status(403).json({
          status: 403,
          message: "You already created this conversation. " +
          "It will remain unactivated until the other user activates it."
        });
      }
      // If it's not activated yet, and the current user is not the one who initialized it
      if (conv.activated == false && conv.initialized_by == targetUserId) {
        conv.activated = true;
        conv.save(function(err, conversation){
          if (err) { return next(err); }
          // We reach the other user (the one who initialized the conversation)
          // and tell him that the conversation is ready
          io.to(targetUserId).emit('conversation_activated', {
            conversation_id: conv._id
          });
          // Return the conversation id to the current user who just activated it
          // so he can GET it right after
          return res.status(201).json({
            status: 201,
            activated: true,
            message: "The conversation has been activated.",
            conversation_id: conv._id
          });
        });
      }
    }
  });
}

module.exports = createConversation;
