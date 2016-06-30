var diskspace = require('diskspace');
var async = require('async');
var schedule = require('node-schedule');
var config = require('./config.js');
var Q = require('q');
var _MONITOR_LOCATION  = config.MONITOR_LOCATION;
var _NOTIFICATION = config.EMAIL_NOTIFICATION;
var _EMAIL_SERVER = config.EMAIL_SERVER;
var _SENDER = config.SENDER_NAME+' '+'<'+config.SENDER_EMAIL+'>'
var _RECIPIENT_NAME = config.RECIPIENT.name;
var _RECIPIENT_EMAIL = config.RECIPIENT.email;
var _CRON_STRING = config.CRON_STRING;
var s = schedule.scheduleJob(_CRON_STRING, function(){
	console.log('Checking Disk Space');
	var _STORAGE_STATUS = [];
	var _SHOULD_NOTIFY = false;
	async.each(_MONITOR_LOCATION, function(location, callback){
		checkDiskSpace(location.path).then(function(storage_space){
			if(storage_space.free < location.threshold){
				console.log('diskspace too low');
				_STORAGE_STATUS.push({"path":location.path, "total": storage_space.total, "free": storage_space.free, "warning":true});
				_SHOULD_NOTIFY = true;
			}
			else{
				_STORAGE_STATUS.push({"path":location.path, "total": storage_space.total, "free": storage_space.free});
			}
			callback();
		}).catch(function(err){
			callback(err);
		})
	}, function(err){
		if(err){
			console.log(err);
		}
		if(_NOTIFICATION && _SHOULD_NOTIFY){
			console.log(_STORAGE_STATUS);
			createNotificationMessage(_STORAGE_STATUS, _RECIPIENT_NAME, 'disk_notification').then(function(body){
				if(_EMAIL_SERVER == 'mailgun'){
					var mailgun = require('mailgun-js')(config.MAILGUN_CONFIG);
					var data = {
						from: _SENDER,
						to: _RECIPIENT_EMAIL,
						subject: "Disk Space Notification",
						html: body
					};
					mailgun.messages().send(data, function (error, body) {
						if(error){
							console.log(error);
						}
						else{
							console.log(body);
						}
					});
				}
			}).catch(function(err){
				console.log(err)
			})
		}
	})
});

function checkDiskSpace(location){
	var deferred = Q.defer();
	diskspace.check(location, function (err, total, free, status)
	{
		console.log(location+" "+status)
		var hfree = Math.round(free/1024/1024/1024*100)/100;
		var htotal = Math.round(total/1024/1024/1024*100)/100;
		console.log("Free: " + hfree)
		console.log("Total: " + htotal)
		deferred.resolve({free:hfree, total:htotal})
	})
	return deferred.promise;
}

function createNotificationMessage(storage_status, name, template){
	var fs = require('fs');
	var ejs = require('ejs');
	var data = {"status": storage_status, "name":name}
	var deferred = Q.defer();
	fs.readFile('./templates/'+template+'.ejs', {encoding: 'utf8'}, function(err, email_template){
        if(err){
            console.log(err);
            deferred.reject(new Error(err));
        }
        else {
            var body = ejs.render(email_template, data);
            deferred.resolve(body);
        }
    });
    return deferred.promise;
}