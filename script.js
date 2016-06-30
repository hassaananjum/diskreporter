var diskspace = require('diskspace');
var config = require('./config.js');
var Q = require('q');
var _THRESHOLD = config.THRESHOLD;
var _NOTIFICATION = config.EMAIL_NOTIFICATION;
var _EMAIL_SERVER = config.EMAIL_SERVER;
var _SENDER = config.SENDER_NAME+' '+'<'+config.SENDER_EMAIL+'>'
var _RECIPIENT_NAME = config.RECIPIENT.name;
var _RECIPIENT_EMAIL = config.RECIPIENT.email;
diskspace.check('/opt', function (err, total, free, status)
{
	console.log(status)
	var hfree = Math.round(free/1024/1024/1024*100)/100;
	var htotal = Math.round(total/1024/1024/1024*100)/100
	console.log("Free: " + hfree)
	console.log("Total: " + htotal)
	if(hfree < _THRESHOLD){
		console.log('diskspace too low');
		if(_NOTIFICATION){
			var nodemailer = require('nodemailer');
			createNotificationMessage(hfree, htotal, _RECIPIENT_NAME, 'disk_notification').then(function(body){
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
	}
});


function createNotificationMessage(hfree, htotal, name, template){
	var fs = require('fs');
	var ejs = require('ejs');
	var data = {
		"name": name,
		"fspace": hfree,
		"tspace": htotal
	}
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