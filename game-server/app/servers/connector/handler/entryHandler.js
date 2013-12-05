var Code = require('../../../../config/code');
var userDao = require('../../../dao/userDao');
var async = require('async');
var channelUtil = require('../../../util/channelUtil');
var utils = require('../../../util/utils');
var logger = require('pomelo-logger').getLogger(__filename);

module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;

    if(!this.app)
        logger.error(app);
};

var pro = Handler.prototype;

pro.register = function(msg, session, next) {
    console.log("before createUser");
    userDao.createUser(msg.username, msg.password, msg.money, function(err, user) {
        console.log("in create callback");
        console.log(err);
        console.log(user);
        if (err || !user) {
            console.error(err);
        } else {
            console.log('A new user was created! --' + msg.username);
            next(null, user);
        }
    });
}

pro.login = function(msg, session, next) {

}

pro.logout = function(msg, session, next) {

}
