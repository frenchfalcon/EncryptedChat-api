var express = require('express');
var router = express.Router();

router.post('/signup', require('./Auth/register'));

router.post('/login', require('./Auth/login'));

router.post('/send_activation', require('./Auth/send_activation'));

router.post('/verify', require('./Auth/verify'));

router.post('/api/conversation', require('./Messaging/create_conversation'));

router.get('/api/conversation', require('./Messaging/get_single_conversation'));

router.get('/api/conversation/all', require('./Messaging/get_all_conversations'));

router.get('/api/message', require('./Messaging/get_messages'));

router.post('/api/message', require('./Messaging/send_message'));

module.exports = router;
