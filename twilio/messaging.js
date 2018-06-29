var config = require('./config');
var LookupsClient = require('twilio').LookupsClient;
var lookup = new LookupsClient(config.accountSid, config.authToken);
var client = require('twilio')(config.accountSid, config.authToken);

module.exports.sendSMS = function(cellphone, message, cb) {
  client.messages.create({
    body: message,
    to: cellphone,
    from: config.sendingNumber,
  }, function(err, data) {
    cb(err);
  });
};

module.exports.validate = function(cellphone) {
  lookup.phoneNumbers(cellphone).get({
    type: 'carrier'
  }, function(error, number) {
    if (error) {
      console.log(error);
    }
    console.log(number);
  });
};
