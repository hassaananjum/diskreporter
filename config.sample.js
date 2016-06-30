exports.MONITOR_LOCATION = [
	{"path":"/opt", "threshold": 2},
	{"path":"/home", "threshold": 5},
]
exports.EMAIL_NOTIFICATION = true;
exports.EMAIL_SERVER = "mailgun";
exports.MAILGUN_CONFIG = {
	"apiKey": "<api-key>",
	"domain": "<mailgun-domain>"
}
exports.SENDER_EMAIL = '<sender-email>'
exports.SENDER_NAME = '<sender name>'
exports.RECIPIENT = {"name":"<recipient-name>", "email":"<recipient-email>"}