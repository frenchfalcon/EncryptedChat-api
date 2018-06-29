var conversation = require('../../models/conversation');
var mongoose = require('mongoose');

function getConversations(req, res, next) {

  var userId = req.userid;

  conversation
  .find({ users: userId, activated: true })
  .populate('users')
  .lean()
  .exec(function(err, conversations) {
    if (err) { return next(err); }

    conversations.forEach(function(conv, index) {
      conversations[index]["target"] = (conv.users[0]._id != userId) ? conv.users[0] : conv.users[1]
      conversations[index].users = undefined
    })

    return res.json({
      "status": 200,
      "conversations": conversations
    });
  });
}

module.exports = getConversations;
