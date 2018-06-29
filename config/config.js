function buildMongoUrl() {

    var prefix = "mongodb://";
    var user = process.env.MONGO_USER;
    var pass = process.env.MONGO_PASS;
    var url = process.env.MONGO_URL;
    var port = process.env.MONGO_PORT;
    var db = process.env.MONGO_DB_NAME;

    return prefix + user + ':' + pass + '@' + url + ':' + port + '/' + db;
}

module.exports = {
    'cryptSaltFactor': 5,
    'secret': process.env.API_SECRET,
    'database': buildMongoUrl()
};
