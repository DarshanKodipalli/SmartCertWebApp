var http = require('https'),
	crypto = require('crypto');

exports.httpRequest =function (data,options,callback) {
	if(!options.host||!options.port||!options.path||!options.method){
		callback(null);
		return;
	}
	options.rejectUnauthorized = false;
    options.requestCert = true;
    options.agent = false;
	var req = http.request(options);
	req.write(JSON.stringify(data));
	req.on('error',function (err) {
		console.log(err);
	    console.log("error sending  http request");
	    callback(null);
	    return;
	});
	req.end();
	var receivedData = "";
	req.on("response", function(resp) {
		resp.setEncoding('utf8');
		resp.on('data', function (chunk) {
			receivedData+=chunk;
		});
		resp.on('end', function (chunk) {
			try {   
				if(receivedData){
					var rdata = JSON.parse(receivedData);
					callback(rdata);
				}
				else{
					callback(null);
					return;
				}
			} catch(e) {
				callback(null);
				console.log(e);
				return;
			}
		});
		resp.on('error',function (chunk) {
			callback(null);
			console.log(chunk);
			console.log("http response error");
			return;
		});
	});
};

exports.getHash = function(text){
	var s3 = crypto.createHash('sha256');
	return s3.update(text).digest("hex");
};

exports.getSha1 = function(text){
	var s3 = crypto.createHash('sha1');
	text = (text||" ").toString();
	return s3.update(text).digest("hex");
};


exports.success = {status : 1};
exports.failure = {status : -1};
exports.unauth = {status : -2};