var http = require('http');
var fileSystem = require('fs'),
util = require("../util/util");
var options = {
	host:"localhost",
	port:3003,
	path:"/",
	method:'POST',
	headers: {
        'Content-Type': 'application/json'
    }
};

exports.studentRegistration = function(request,response){
	options.path = "/add";
	var data = {
			student:{
				emailId : "operatorforims@gmail.com",
				notificationEmailId:"ecustomerforims@gmail.com",
				password : "password",
				passwordExpiry : new Date(Date.now + 365 * 86400000),
				name:"Customer for Imse",
				fathersName:"Big Marceleo",
				aadhaarNumber:"10019700003000",
				address:"sfsdfsd",
				nationality:"India",
				dateOfBirth : new Date(Date.now() - 22 * 365 * 86400000),
				joinedDate : new Date(Date.now() - 2 * 365 * 86400000),
				phoneNumber : 9827918272,
				loginCount : 0
			},
			university : {
				universityId:"5963699108ba972eb05e46ea",
				universityName:"Amity University"
			},
			institution:{
					institutionId:"5964b24c81886b3a408e2dd8",
					institutionName:"REVA",
					enrolmentDate:"2015",
					//semester:1,
					courseName:"B.E",
					specialization:"Computer Science",
			}
		};
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

exports.getStudents = function(request,response){
	options.path = "/get";
	var req = http.request(options);
	req.end();
	req.on("response", function(resp) {
		resp.setEncoding('utf8');
		resp.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
			response.json(JSON.parse(chunk));
		});
	});
};

exports.assignCertificate = function(request,response){
	options.path = "/assign";
	fileSystem.readFile("./views/QAF.PDF",{encoding: 'base64'}, function(err, base64data) {
		if(err){
			console.log("error  getting file from fileSystem");
			console.log(err);
		}
		else{
			var data = {
					token:"asdsad",
					certificates:[{
						batch:"2012-2016",
						certificateName:"Eighth Semester marks card",
						certificate:base64data,
						certificateDescription:"marks card for the Eighth semester",
						courseName:"Engineering",
						stream:"Computer Science",
						fileType:"pdf",
						examDate:new Date(Date.now -  365 * 86400000),
						awardedDate:new Date(Date.now- 365 * 86400000),
						blockChainId:"xhabsiw3781723gbiqg2i7tget81",
						transactionId:"xakjb3i7e2gebiubxjkdfn98ye1bi",
						certificateHash:util.getHash(base64data),
						verified:true,
						uploadedOn:new Date(Date.now()),
						uploadedBy:"test",
						studentId:"597c7a7e115d1c0ec044bee1",
						institutionId:"5964b24c81886b3a408e2dd8",
						universityId:"597c7a7e115d1c0ec044bee2",
						createdOn:new Date(Date.now()),
						createdBy:"test",
					},
					{
						batch:"2012-2016",
						certificateName:"Seventh Semester",
						certificate:base64data,
						certificateDescription:"Seventh semester marks card",
						courseName:"Engineering",
						stream:"Computer Science",
						fileType:"pdf",
						examDate:new Date(Date.now -  365 * 86400000),
						awardedDate:new Date(Date.now- 365 * 86400000),
						blockChainId:"sefrw34r4f1234r123e23e132e1e3",
						transactionId:"dde23edqwedw32ewedww3e23e23e",
						certificateHash:util.getHash(base64data),
						verified:true,
						uploadedOn:new Date(Date.now()),
						uploadedBy:"test",
						studentId:"597c7a7e115d1c0ec044bee1",
						institutionId:"5964b24c81886b3a408e2dd8",
						universityId:"597c7a7e115d1c0ec044bee2",
						createdOn:new Date(Date.now()),
						createdBy:"test"
					}
					]
			};
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
		}
	});
};

exports.getMappingFile = function (req,res) {
	options.path = "/upload";
	console.log("upload file test");
	var newReq = request.post("http://localhost:3000/upload", function (err, resp, body) {
	  if (err) {
	    res.json(resp);
	  } else {
	    res.json(body);
	  }
	});
	var form = newReq.form();
	form.append('file',fileSystem.createReadStream("./views/task.xlsx"));
	form.append("text","vivek");
};

exports.testCertIssue = function(request,response){
	options.path = "/api/v1/issue/certificate";
	options.port = 3000;
	options.method ='GET';
	//fileSystem.readFile("./views/QAF.PDF",{encoding: 'base64'}, function(err, base64data) {
		/*if(err){
			console.log("error  getting file from fileSystem");
			console.log(err);
		}
		else{*/
			var data = {
				token:"asdsad",
				studentId:"5971ce538579b2188c6f651d",
				certificateId:"5971d66825bdf01d3c357f84"
			};
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
		//}
	//});
};