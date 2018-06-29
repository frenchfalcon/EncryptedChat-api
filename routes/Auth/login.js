var fs = require('fs');
var jwt = require('jsonwebtoken');
var async = require('async');
var bcrypt = require('bcrypt-nodejs');
var user = require('../../models/user');

// Retrieve Private key
var cert = {
  key: fs.readFileSync('./keys/private.key', 'utf8'),
  passphrase: 'cecs'
};

function login(req, res, next) {

  var cellphone = req.body.cellphone || "";
  var password = req.body.password || "";

  if (cellphone == "" || password == "") {
    return res.status(422).json({
      status: 422,
      message: "Invalid or missing parameters."
    });
  }

  async.waterfall([
    function(done) {
      user.findOne({ cellphone: cellphone }, { password: 1, verified: 1 }, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
          return res.status(404)
          .json({
            status: 404,
            message: "This user does not exists."
          });
        }
        done(null, user);
      });
    },
    function(user, done) {
      bcrypt.compare(password, user.password, function(err, result) {
        if (err) { return done(err); }
        if (result) {
          if (user.verified != true) {
            return res.status(403).json({
              status: 403,
              userid: user._id,
              message: "This account needs to be verified."
            });
          }
          var token = jwt.sign({
            id: user._id,
            cellphone: cellphone
          }, cert, { algorithm: 'RS256'});
          done(null, token, user._id);
        }
        else {
          return res.status(401)
          .json({
            status: 401,
            message: "Invalid credentials."
          });
        }
      });
    }
  ], function(err, token, userId) {
    if (err) { return next(err); }
    return res.json({
      status: 200,
      message: "Login success.",
      token: token,
      userid: userId
    });
  });
}

module.exports = login;
