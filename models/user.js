var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
    cellphone: {
      unique: true,
      type: String,
      required: true,
      select: false,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    profile_pic_url: {
      type: String
    },
    verified: {
      type: Boolean,
      required: true,
    },
    activation_token: {
      token: {
        type: String,
      },
      expires: {
        type: Date,
      }
    }
});

userSchema.pre('save', function(next) {
  var user = this;
  var SALT_FACTOR = 5;

  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

module.exports = mongoose.model('User', userSchema, 'users');
