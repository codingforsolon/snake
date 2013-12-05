var Code = require('../../../../config/code');
var dispatcher = require('../../../util/dispatcher');

/**
 * Gate handler that dispatch user to connectors.
 */
module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

Handler.prototype.queryEntry = function (msg, session, next) {
    console.log("username: "+msg.username);
    var username = msg.username;
    if (!username) {
        next(null, {code: Code.FAIL});
        return;
    }

    var connectors = this.app.getServersByType('connector');
    if (!connectors || connectors.length === 0) {
        next(null, {code: Code.GATE.FA_NO_SERVER_AVAILABLE});
        return;
    }
    console.log("before next");

	var res = dispatcher.dispatch(connectors);
	next(null, {code: Code.OK, host: res.host, port: res.clientPort});
//    next(null, {code: Code.OK, host: 'localhost', port: '3050'});
    // next(null, {code: Code.OK, host: res.pubHost, port: res.clientPort});
};