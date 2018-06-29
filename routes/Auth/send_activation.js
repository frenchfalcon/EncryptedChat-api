var async = require('async');
var user = require('../../models/user')
var config = require('../../config/config');
var twilio = require('../../twilio/messaging');

function buildActivationMessage(activation) {
  return activation +
  " is the activation code you have to provide in order to complete your registration." + '\n' +
  "Welcome to SecChat !";
}

function generateActivationToken() {
  return Math.floor(Math.random() * 900000) + 100000 + "";
}

function sendActivation(req, res) {

  var userId = req.body.userid || "";

  if (userId == '') {
    return res.status(422).json({
      status: 422,
      message: "Invalid or missing parameters."
    });
  }

  async.waterfall([
    function(done) {
      user.findOne({ _id: userId }, { activation_token: 1, cellphone: 1 }, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
          return res.status(424)
            .json({
              status: 404,
              message: "This user does not exists."
            });
        }
        if (user.activated == true) {
          return res.status(403)
            .json({
              status: 403,
              message: "This account has already been verified."
            });
        }
        done(null, user);
      });
    },
    function(user, done) {
      var activationToken = generateActivationToken();
      var expirationTimeStamp = new Date();
      expirationTimeStamp.setTime(expirationTimeStamp.getTime() + (60 * 1000));

      user.activation_token.token = activationToken;
      user.activation_token.expires = expirationTimeStamp;

      user.save(function(err, user){
        if (err) { return done(err); }
        return done(null, user.cellphone, activationToken);
      });
    },
    function(cellphone, activationToken, done) {
      var messageBody = buildActivationMessage(activationToken);

      twilio.sendSMS(cellphone, messageBody, function(err) {
        if (err) {
          return res.status(422).
          json({
            status: 422,
            message: "This phone number is invalid."
          });
        }
        done(null, activationToken);
      })
    }
  ],
    function(err) {
      if (err) {
        return res.status(500).
        json({
          status: 500,
          message: "We cannot send a message to this cellphone. An error occurred."
        });
      }
      return res.json({
        "status": 200,
        "message": "Activation token has been sent."
      })
  })
}

module.exports = sendActivation;
