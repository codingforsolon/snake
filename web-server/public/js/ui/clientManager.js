var pomelo = window.pomelo;
var host = "127.0.0.1";
var port = 3014;
function queryEntry(msg, callback) {
    var route = 'gate.gateHandler.queryEntry';
    pomelo.init({
        host: host,
        port: port,
        log: true
    }, function() {
        pomelo.request(route, {
            username: msg.username,
            password: msg.password,
            money: msg.money
        }, function(data) {
            pomelo.disconnect();
            if (data.code === 500) {
                alert("request gate error");
                return;
            }
            callback(data.host, data.port);
        });
    });
}

function submit() {
    console.log(window.location.hostname);
    var msg = {};
    msg.username = $("#username").val();
    msg.password = $("#password").val();
    msg.money = $("#money").val();
    queryEntry(msg, function(host, port) {
        pomelo.init({
            host: host,
            port: port,
            log: true
        }, function() {
            console.log("ready to connect connector");
            var route = "connector.entryHandler.register";
            pomelo.request(route, msg, function(data) {
                if (data.error) {
                    alert("request connector error");
                    return;
                }
                alert("request connector success");
            })
        })
    });
}