var http = require('http'),
fileSystem = require('fs');

var options = {
		host: "localhost",
		port:3004,
		path:"/",
		method:'POST',
		headers:{
			'Content-Type': 'application/json'
		}
};

var token = "";

exports.addUniversity = function(request,response){
	options.path = "/add/university";
	var data = {
				name:"VTU",
				address:"#272,Gnayana Vidya Mandir",
				city:"Belgaum",
				state:"Karnataka",
				pincode:"899809",
				universityNumber:"VTU-567",
				primaryContactNumber:"9989080989",
				primaryContactName:"Prof Karisiddappa",
				primaryEmailId:"darshan@xanbell.com",
				password:"password"
	};
	var req = http.request(options);
	req.write(JSON.stringify(data));
	req.end();
	req.on("response",function(resp){
		console.log("on response");
		resp.setEncoding('utf8');
		resp.on('data',function(chunk){
			console.log("BODY: "+chunk);
		});
	});
};
exports.addUsersForUniversity = function(request,response){
	options.path = "/create/university/user";
	var data = {
	 user:{
			name:"@imApprover",
			contactNumber:"9288949509",
			emailId:"smartcert.everify@gmail.com",
			role:"2",
			universityName:"VTU",
			password:"password",
			universityId:"59b0fc7d36f0501f60b090cb"
		}
	};
	var req = http.request(options);
	req.write(JSON.stringify(data));
	req.end();
	req.on("response",function(resp){
		console.log("on response");
		resp.setEncoding('utf8');
		resp.on('data',function(chunk){
			console.log("BODY: "+chunk);
		});
	});
};
exports.addCertificate = function(request,response){
	options.path = "/add/certificate";
	var data = {
			batch:"2015",
			certificateName:"8th Sem Marks Card",
			certificate:String,
			certificateDescription:"M.Tech 8th sem Report",
			courseName:"M.Tech",
			stream:"Civil Engineering",
			fileType:String,
			examDate:new Date(Date.now() - 4 * 365 * 86400000),
			awardedDate:new Date(Date.now() - 2 * 365 * 86400000),
			blockChainId:"qwed43rwedwsd2vg54",
			transactionId:"dfvergerve34435435r",
			verified:0,
			uploadedOn:new Date(Date.now() -  365 * 86400000),
			uploadedBy:"University",
			sendToApprover : 0,
			universityNumber : "VTU-256",
			studentId:"5965c747fa839732a009c1f0",
			institutionId:"5971bc91fcadc5268465e1a8",
			universityId:"5963699108ba972eb05e46ea"
	};
	var req = http.request(options);
	req.write(JSON.stringify(data));
	req.end();
	req.on("response",function(resp){
		console.log("on response");
		resp.setEncoding('utf8');
		resp.on('data',function(chunk){
			console.log("BODY: "+chunk);
		});
	});	
};

exports.addInstitute = function(request,response){
	options.path = "/add/institute";
	var data = {
			name:"BNMIT",
			address:"#27,Banashankri 2nd stage",
			city:"Bengaluru",
			state:"Karnataka",
			course:"M.Tech",
			startYear:"2012",
			country:"India",
			pincode:"833802",
			number:"MSRIT-414",
			primaryContactNumber:"9349080989",
			primaryContactName:"Verma",
			primaryEmailId:"darshand@raremile.in",
			universityId:"5991414fa0f0064428d391ae"
	};
	var req = http.request(options);
	req.write(JSON.stringify(data));
	req.end();
	req.on("response",function(resp){
		console.log("on response");
		resp.setEncoding('utf8');
		resp.on('data',function(chunk){
			console.log("BODY: "+chunk);
		});
	});
};

exports.loginIssuer =  function (request,response) {
	options.path = "/university/login";
	var data = {
		emailId:"darshan.kodipalli@gmail.com",
		password:"password"
	};
	var req = http.request(options);
	req.write(JSON.stringify(data));
	req.end();
	req.on("response",function(resp){
		console.log("on response");
		resp.setEncoding('utf8');
		resp.on('data',function(chunk){
			token = JSON.parse(chunk).token;
		});
	});
};

exports.createCertificate = function (request,response) {
	options.path = "/add/certificate";
};
