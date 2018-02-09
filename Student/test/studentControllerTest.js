var http = require('http');

var options = {
	host:"localhost",
	port:3002,
	path:"/",
	method:'POST',
	headers: {
        'Content-Type': 'application/json'
    }
};

var token = {token : ""};

exports.studentLogin =  function(request,response){
	options.path = "/login";
	var data = {emailId:"customerforims@gmail.com",password:"password"};
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

exports.validateStudentOtp = function(request,response){
	options.path = "/validate";
	var data = {};
	data.token = token.token;
	data.otp = "123342";
	var req = http.request(options);
 	req.write(JSON.stringify(data));
	req.end();
	req.on("response", function(resp) {
		resp.setEncoding('utf8');
		resp.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
			response.json(JSON.parse(chunk));
		});
	});
};

exports.studentLogout = function(request,response){
	options.path = "/logout";
	var req = http.request(options);
 	req.write(JSON.stringify(token));
	req.end();
	req.on("response", function(resp) {
		resp.setEncoding('utf8');
		resp.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
			token = {token:""};
			response.json(JSON.parse(chunk));
		});
	});
	
};

exports.getRequests  = function(request,response){
	console.log(token);
	console.log("get request test");
	options.path = "/requests";
	var req = http.request(options);
 	req.write(JSON.stringify(token));
	req.end();
	req.on("response", function(resp) {
		resp.setEncoding('utf8');
		resp.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
			response.json(JSON.parse(chunk));
		});
	});
};

exports.getUniversitiesForStudent = function(request,response){
	options.path = "/get/universities";
	var req = http.request(options);
 	req.write(JSON.stringify(token));
	req.end();
	req.on("response", function(resp) {
		resp.setEncoding('utf8');
		resp.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
			response.json(JSON.parse(chunk));
		});
	});
};

exports.newRequest = function(request,response){
	options.path = "/new/request";
	var data = {
		token:"",
		request:{
			emailId:"customerforims@gmail.com",
			studentId:"",
			sentToEmail:"customerforims@gmail.com",
			sentToPhoneNumber:9812736123,
			certificates:[{
				certificateIds:"595e105d39f762051cb01f79",
				certificateName:"Btech Degree Certificate"
					}]
		}
	};
	data.token = token.token;
	var req = http.request(options);
 	req.write(JSON.stringify(data));
	req.end();
	req.on("response", function(resp) {
		resp.setEncoding('utf8');
		resp.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
			response.json(JSON.parse(chunk));
		});
	});
};

exports.getStudent =function(request,response){
	options.path = "/student";
	var req = http.request(options);
	req.write(JSON.stringify(token));
	req.end();
	req.on("response", function(resp) {
		resp.setEncoding('utf8');
		resp.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
			response.json(JSON.parse(chunk));
		});
	});
};

exports.getCertificates = function (request,response){
	options.path = "/certificates";
	var req = http.request(options);
	req.write(JSON.stringify(token));
	req.end();
	req.on("response", function(resp) {
		resp.setEncoding('utf8');
		resp.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
			response.json(JSON.parse(chunk));
		});
	});
};