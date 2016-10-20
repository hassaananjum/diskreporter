exports.CRON_STRING = "*/30 * * * *"
exports.MONITOR_LOCATION = [
	{"path":"/opt", "threshold": 5},
	{"path":"/home", "threshold": 4},
]
exports.EMAIL_NOTIFICATION = true;
exports.EMAIL_SERVER = "mailgun";
exports.MAILGUN_CONFIG = {
	"apiKey": "<api-key>",
	"domain": "<mailgun-domain>"
}
exports.SENDER_EMAIL = '<sender-email>'
exports.SENDER_NAME = '<sender name>'
exports.RECIPIENT = [{"name":"<recipient-name>", "email":"<recipient-email>"}]
