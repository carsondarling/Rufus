'use strict';

var crypto = require('crypto');
var request = require('request');

// Enable parsing of the email body
exports.hook_data = function (next, connection) {
	// enable mail body parsing
	connection.transaction.parse_body = 1;
	next();
};

// Once the email is fully accepted, we want to transmit it to other servers
exports.hook_queue = function (next, connection) {
	var plugin = this;
	var conf = plugin.config.get('deliver_api.json', 'json');

	plugin.logdebug('Beginning of forward to API');

	// Build object to be sent out
	var inMail = connection.transaction.body;
	var outMail = {};
	// outMail.headers = inMail.header.headers_decoded;
	outMail.body = inMail.bodytext;
	for (var header in inMail.header.headers_decoded) {
		outMail[header] = inMail.header.headers_decoded[header];
	}
	
	// Generate signature
	crypto.randomBytes(48, function(ex, buf) {
		if (ex) {
			plugin.logerror('Could not generate token');
			return next(CONT);
		}
		
		// Add authorization tokens
		outMail.token = buf.toString('hex');
		outMail.sha1 = crypto.createHmac('sha1', conf.secretkey).update(outMail.token).digest('hex');

		plugin.logdebug("Starting API request");
		request.post(conf.endpoint, {form: outMail}, function (error, response, body) {
			if (error) {
				plugin.logwarn('Could not reach API endpoint');
				return next(CONT);
			}

			// Check if we got a positive response
			if (response.statusCode == 200) {
				plugin.logdebug('Delivered mail to API');
				return next(OK);
			}

			// We got a response, but it wasn't 200 OK
			plugin.logwarn('Could not deliver mail to API. Status code: ' + response.statusCode);
			return next(CONT);
		});
	});
};