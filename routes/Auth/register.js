var fs = require('fs');
var jwt = require('jsonwebtoken');
var path = require('path');
var async = require('async');
var user = require('../../models/user');

function register(req, res, next) {

  var cellphone = req.body.cellphone || "";
  var firstName = req.body.firstname || "";
  var lastName = req.body.lastname || "";
  var password = req.body.password || "";

  if (cellphone == "" || firstName == "" || lastName == "" || password == "") {
    return res.status(422).json({
      status: 422,
      message: "Invalid or missing parameters."
    });
  }

  async.waterfall([
    function(done) {
      user.findOne({ cellphone: cellphone }, function(err, user) {
        if (user) {
          return res.status(409).json({
            status: 409,
            message: "A user is already registered with this cellphone number."
          });
        }
        done(err);
      });
    },
    function(done) {
      var newUser = new user();

      newUser.cellphone = cellphone;
      newUser.firstname = firstName;
      newUser.lastname = lastName;
      newUser.password = password;
      newUser.verified = false;
      newUser.save(function (err, user) {
        done(err, user);
      });
    }
  ], function(err, user) {
      if (err) { return next(err); }
      res.status(201).json({
        status: 201,
        userid: user._id,
        message: "Sign-up success. You can now login through /login."
      });
  });
}

module.exports = register;
