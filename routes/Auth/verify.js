var user = require('../../models/user');

function verify(req, res, next) {

  var userId = req.body.userid || "";
  var token = req.body.token || "";

  if (userId == "" || token == "") {
    return res.status(422).json({
      status: 422,
      message: "Invalid or missing parameters."
    });
  }

  user.findOne({ _id: userId }, { verified: 1, activation_token: 1 }, function(err, user) {
    if (err) { return next(err); }
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "No user found with this id."
      });
    }
    if (user.verified == true) {
      return res.status(403).json({
        status: 403,
        message: "This account has already been verified."
      });
    }

    if (!user.activation_token) {
      return res.status(404).json({
        status: 404,
        message: "Please request a verification token in order to verify this account."
      });
    }

    if (user.activation_token.token == token) {
      user.verified = true;
      user.activation_token = undefined;
      user.save(function(err) {
        if (err) { return next(err); }
        return res.status(200).json({
          status: 200,
          message: "This account is now verified."
        });
      });
    }
    else {
      return res.status(403).json({
        status: 403,
        message: "This token is invalid."
      });
    }
  });
}

module.exports = verify;
