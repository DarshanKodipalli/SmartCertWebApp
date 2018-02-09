var http = require('http');

var options = {
	host:"localhost",
	port:3000,
	path:"/",
	method:'POST',
	headers: {
        'Content-Type': 'application/json'
    }
};

var token = {token : "74cf50e0-631b-11e7-873a-9906a210691b"};

exports.validateConsumerToken = function (request,response) {
	options.path = "/view";
	var data = token;
	data.emailId = "customerforims@gmail.com";
	var req = http.request(options);
 	req.write(JSON.stringify(data));
	req.end();
	req.on("response", function(resp) {
		resp.setEncoding('utf8');
		resp.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
			token = JSON.parse(chunk);
			response.json(JSON.parse(chunk));
		});
	});
};
exports.validateConsumerOTP = function (request,response) {
	options.path = "/check";
	var data = token;
	data.otp = "123342";
	var req = http.request(options);
 	req.write(JSON.stringify(data));
	req.end();
	req.on("response", function(resp) {
		resp.setEncoding('utf8');
		resp.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
			token = JSON.parse(chunk);
			response.json(JSON.parse(chunk));
		});
	});
};