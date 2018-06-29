var jwt = require('jsonwebtoken');
var fs = require('fs');
var user = require('../../models/user');

module.exports = function(req, res, next){

  var token = req.body.token || req.query.token || "";

  if (token == "") {
    return res.status(403).json({
      "status": 403,
      "message": "Request needs authentication"
    });
  }

  try {

    var key = fs.readFileSync('./keys/public.key', 'utf8');
    var payload = jwt.verify(token, key, { algorithms: ['RS256'] });

  } catch(err) {
    return res.status(403).json({
      status: 403,
      message: "Invalid token"
    });
  }

  var userId = payload.id;
  var cellphone = payload.cellphone;

  user.findOne({ _id: userId, cellphone: cellphone }, function(err, user) {
    if (err) { return next(err); }
    if (!user) {
      return res.status(403).json({
        status: 403,
        message: "Invalid token"
      });
    }

    // Store user id for next middlewares
    req.user = payload
    req.userid = userId;
    req.cellphone = payload.cellphone;
    next();

  });
};
