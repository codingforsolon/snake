var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
//var dataApi = require('../util/dataApi');
//var Player = require('../domain/entity/player');
//var User = require('../domain/user');
var consts = require('../consts/consts');
//var equipmentsDao = require('./equipmentsDao');
//var bagDao = require('./bagDao');
//var fightskillDao = require('./fightskillDao');
//var taskDao = require('./taskDao');
var async = require('async');
var token = require('../util/token');
var secret = require('../../config/session').secret;
var utils = require('../util/utils');

var userDao = module.exports;

/**
 * Get user data by username.
 * @param {String} username
 * @param {String} passwd
 * @param {function} cb
 */
userDao.getUserInfo = function (username, passwd, cb) {
	var sql = 'select * from user where name = ?';
	var args = [username];

	pomelo.app.get('dbclient').query(sql,args,function(err, res) {
		if(err !== null) {
				utils.invokeCallback(cb, err, null);
		} else {
			var userId = 0;
			if (!!res && res.length === 1) {
				var rs = res[0];
				userId = rs.id;
				rs.uid = rs.id;
				utils.invokeCallback(cb,null, rs);
			} else {
				utils.invokeCallback(cb, null, {uid:0, username: username});
			}
		}
	});
};

/**
 * Get an user's all players by userId
 * @param {Number} uid User Id.
 * @param {function} cb Callback function.
 */
userDao.getPlayersByUid = function(uid, cb){
	var sql = 'select * from Player where userId = ?';
	var args = [uid];

	pomelo.app.get('dbclient').query(sql,args,function(err, res) {
		if(err) {
			utils.invokeCallback(cb, err.message, null);
			return;
		}

		if(!res || res.length <= 0) {
			utils.invokeCallback(cb, null, []);
			return;
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

/**
 * Get an user's all players by userId
 * @param {Number} playerId
 * @param {function} cb Callback function.
 */
userDao.getPlayer = function(playerId, cb){
	var sql = 'select * from Player where id = ?';
	var args = [playerId];

	pomelo.app.get('dbclient').query(sql,args,function(err, res){
		if(err !== null){
			utils.invokeCallback(cb, err.message, null);
		} else if (!res || res.length <= 0){
			utils.invokeCallback(cb,null,[]);
			return;
		} else{
			utils.invokeCallback(cb,null, new Player(res[0]));
		}
	});
};

/**
 * get by Name
 * @param {String} name Player name
 * @param {function} cb Callback function
 */
userDao.getPlayerByName = function(name, cb){
	var sql = 'select * from Player where name = ?';
	var args = [name];

	pomelo.app.get('dbclient').query(sql,args,function(err, res){
		if (err !== null){
			utils.invokeCallback(cb, err.message, null);
		} else if (!res || res.length <= 0){
			utils.invokeCallback(cb, null, null);
		} else{
			utils.invokeCallback(cb,null, new Player(res[0]));
		}
	});
};

/**
 * Get all the information of a player, include equipments, bag, skills, tasks.
 * @param {String} playerId
 * @param {function} cb
 */
userDao.getPlayerAllInfo = function (playerId, cb) {
	async.parallel([
		function(callback){
			userDao.getPlayer(playerId, function(err, player) {
				if(!!err || !player) {
					logger.error('Get user for userDao failed! ' + err.stack);
				}
				callback(err,player);
			});
		},
		function(callback) {
			equipmentsDao.getEquipmentsByPlayerId(playerId, function(err, equipments) {
				if(!!err || !equipments) {
					logger.error('Get equipments for eqipmentDao failed! ' + err.stack);
				}
				callback(err,equipments);
			});
		},
		function(callback) {
			bagDao.getBagByPlayerId(playerId, function(err, bag) {
				if(!!err || !bag) {
					logger.error('Get bag for bagDao failed! ' + err.stack);
				}
				callback(err,bag);
			});
		},
		function(callback) {
			fightskillDao.getFightSkillsByPlayerId(playerId, function(err, fightSkills) {
				if(!!err || !fightSkills){
					logger.error('Get skills for skillDao failed! ' + err.stack);
				}
				callback(err, fightSkills);
			});
		},
		function(callback){
			taskDao.getCurTasksByPlayId(playerId, function(err, tasks) {
				if(!!err) {
					logger.error('Get task for taskDao failed!');
				}
				callback(err, tasks);
			});
		}
	], 
	function(err, results) {
		var player = results[0];
		var equipments = results[1];
		var bag = results[2];
		var fightSkills = results[3];
		var tasks = results[4];
		player.bag = bag;
		player.setEquipments(equipments);
		player.addFightSkills(fightSkills);
		player.curTasks = tasks || {};
		
		if (!!err){
			utils.invokeCallback(cb,err);
		}else{
			utils.invokeCallback(cb,null,player);
		}
	});
};

/**
 * Get userInfo by username
 * @param {String} username
 * @param {function} cb
 */
userDao.getUserByName = function (username, cb){
	var sql = 'select * from user where name = ?';
	var args = [username];
	pomelo.app.get('dbclient').query(sql,args,function(err, res){
		if(err !== null){
			utils.invokeCallback(cb, err.message, null);
		} else {
			if (!!res && res.length === 1) {
				var rs = res[0];
				var user = new User({id: rs.id, name: rs.name, password: rs.password, from: rs.from});
				utils.invokeCallback(cb, null, user);
			} else {
				utils.invokeCallback(cb, ' user not exist ', null);
			}
		}
	});
};

/**
 * get user infomation by userId
 * @param {String} uid UserId
 * @param {function} cb Callback function
 */
userDao.getUserById = function (uid, cb){
	var sql = 'select * from user where id = ?';
	var args = [uid];
	pomelo.app.get('dbclient').query(sql,args,function(err, res){
		if(err !== null){
			utils.invokeCallback(cb,err.message, null);
			return;
		}

		if (!!res && res.length > 0) {
			utils.invokeCallback(cb, null, new User(res[0]));
		} else {
			utils.invokeCallback(cb, ' user not exist ', null);
		}
	});
};

/**
 * delete user by username
 * @param {String} username
 * @param {function} cb Call back function.
 */
userDao.deleteByName = function (username, cb){
	var sql = 'delete from user where name = ?';
	var args = [username];
	pomelo.app.get('dbclient').query(sql,args,function(err, res){
		if(err !== null){
				utils.invokeCallback(cb,err.message, null);
		} else {
			if (!!res && res.affectedRows>0) {
				utils.invokeCallback(cb,null,true);
			} else {
				utils.invokeCallback(cb,null,false);
			}
		}
	});
};

/**
 * Create a new user
 * @param (String) username
 * @param {String} password
 * @param {String} from Register source
 * @param {function} cb Call back function.
 */
userDao.createUser = function (username, password, money, cb){
//	var sql = 'insert into user (id,name,password,money,loginCount,lastLoginTime) values(lower(replace(uuid(),\'-\',\'\')),?,?,?,?,?)';
	var sql = 'insert into user (name,password,money,loginCount,lastLoginTime) values(?,?,?,?,?)';
	var loginTime = Date.now();
	var args = [username, password, money || 100, 1, loginTime];
	pomelo.app.get('dbclient').insert(sql, args, function(err,res){
        console.log("in dao");
        console.log(err);
        console.log(res);
		if(err !== null){
			utils.invokeCallback(cb, {code: err.number, msg: err.message}, null);
		} else {
//			var user = new user({id: res.insertId, name: username, password: password, loginCount: 1, lastLoginTime:loginTime});
            var user = {id: res.insertId, token: token.create(res.insertId, Date.now(), secret)};
			utils.invokeCallback(cb, null, user);
		}
	});
};

/**
 * Update a player
 * @param {Object} player The player need to update, all the propties will be update.
 * @param {function} cb Callback function.
 */
userDao.updatePlayer = function (player, cb){
	var sql = 'update Player set x = ? ,y = ? , hp = ?, mp = ? , maxHp = ?, maxMp = ?, country = ?, rank = ?, level = ?, experience = ?, areaId = ?, attackValue = ?, defenceValue = ?, walkSpeed = ?, attackSpeed = ? , skillPoint = ? where id = ?';
	var args = [player.x, player.y, player.hp, player.mp, player.maxHp, player.maxMp, player.country, player.rank, player.level, player.experience, player.areaId, player.attackValue, player.defenceValue, player.walkSpeed, player.attackSpeed, player.skillPoint, player.id];

	pomelo.app.get('dbclient').query(sql,args,function(err, res){
		if(err !== null){
			utils.invokeCallback(cb,err.message, null);
		} else {
			if (!!res && res.affectedRows>0) {
				utils.invokeCallback(cb,null,true);
			} else {
				logger.error('update player failed!');
				utils.invokeCallback(cb,null,false);
			}
		}
	});
};

/**
 * Delete player
 * @param {Number} playerId
 * @param {function} cb Callback function.
 */
userDao.deletePlayer = function (playerId, cb){
	var sql = 'delete from	Player where id = ?';
	var args = [playerId];
	pomelo.app.get('dbclient').query(sql,args,function(err, res){
		if(err !== null){
			utils.invokeCallback(cb,err.message, null);
		} else {
			if (!!res && res.affectedRows>0) {
				utils.invokeCallback(cb,null,true);
			} else {
				utils.invokeCallback(cb,null,false);
			}
		}
	});
};


