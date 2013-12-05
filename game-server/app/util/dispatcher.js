var crc = require('crc');

module.exports.dispatch = function(connectors) {
	var index = getRandomInt(0, connectors.length-1);
    return connectors[index]
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}