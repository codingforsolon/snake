var pomelo = require('pomelo');//hello world pomelo
var instanceManager = require('./app/services/instanceManager');
//var dataApi = require('./app/util/dataApi');
var routeUtil = require('./app/util/routeUtil');

/**
* Init app for client.
*/
var app = pomelo.createApp();
app.set('name', 'slot machine');

// configure for global
app.configure('production|development', function () {
    app.before(pomelo.filters.toobusy());
    app.enable('systemMonitor');
    require('./app/util/httpServer');

    //var sceneInfo = require('./app/modules/sceneInfo');
    var onlineUser = require('./app/modules/onlineUser');
    if (typeof app.registerAdmin === 'function') {
        //app.registerAdmin(sceneInfo, {app: app});
        app.registerAdmin(onlineUser, {app: app});
    }

    // proxy configures
    app.set('proxyConfig', {
        cacheMsg: true,
        interval: 30,
        lazyConnection: true
        // enableRpcLog: true
    });

    // remote configures
    app.set('remoteConfig', {
        cacheMsg: true,
        interval: 30
    });

    // route configures
    app.route('connector', routeUtil.connector);

    app.loadConfig('mysql', app.getBase() + '/config/mysql.json');
    app.filter(pomelo.filters.timeout());

});

// Configure for auth server
app.configure('production|development', 'auth', function () {
    // load session congfigures
    app.set('session', require('./config/session.json'));
});

app.configure('production|development', 'manager', function () {
    var events = pomelo.events;

    app.event.on(events.ADD_SERVERS, instanceManager.addServers);

    app.event.on(events.REMOVE_SERVERS, instanceManager.removeServers);
});

// Configure database
app.configure('production|development', 'auth|connector|master', function () {
    var dbclient = require('./app/dao/mysql/mysql').init(app);
    app.set('dbclient', dbclient);
    // app.load(pomelo.sync, {path:__dirname + '/app/dao/mapping', dbclient: dbclient});
//    app.use(sync, {sync: {path: __dirname + '/app/dao/mapping', dbclient: dbclient}});
});

app.configure('production|development', 'connector', function () {
    var dictionary = app.components['__dictionary__'];
    var dict = null;
    if (!!dictionary) {
        dict = dictionary.getDict();
    }

    app.set('connectorConfig',
        {
            connector: pomelo.connectors.hybridconnector,
            heartbeat: 30,
            useDict: true,
            useProtobuf: true,
            handshake: function (msg, cb) {
                cb(null, {});
            }
        });
});

app.configure('production|development', 'gate', function () {
    app.set('connectorConfig',
        {
            connector: pomelo.connectors.hybridconnector,
            useProtobuf: true
        });
});

//start
app.start();

// Uncaught exception handler
process.on('uncaughtException', function (err) {
    console.error(' Caught exception: ' + err.stack);
});
