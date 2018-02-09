/*jshint esversion: 6 */
var dao = require("../dao/dao"),
util = require("../util/util"),
mailSender = require("../mail/mailSender"),
uuid = require("uuid/v1"),
mailbody = require("../mail/mailbody"),
crypto = require('crypto'),
PDFDocument = require('pdfkit'),
blobStream = require('blob-stream'),
fs = require('fs'),
config = require("../Config/Config");

var ViewRequest = dao.viewRequest,
Certificate = dao.certificate,
Batch = dao.batch,
Course = dao.course;

const Cache = require("node-cache");

const viewCache = new Cache();
const tempCache = new Cache();

var options = {
	host:config.studentIp,
	port:config.studentPort,
	path:"/validate/studentLogin",
	method:'POST',
	headers: {
        'Content-Type': 'application/json'
    }
};

/*
------------------------------------------------- validate consumer token ----------------------------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Validate Consumer token

* validates the consumer token

* @param: token

* @return: returns the result accordingly

* */

exports.validateConsumerLogin = function(request,response){
	validateLogin(request.body.token,function(login){
		if(login && login.token){
			response.json({token:request.body.token});
		}else{
			console.log("validateConsumerLogin -- invalid login or token");
			response.json(null);
		}
	});
};

exports.validateConsumerToken = function(request,response){
	if(!request.body.token){
		response.json(util.failure);
	}
	else{
		console.log(request.body.token);
		ViewRequest.find({token:request.body.token})
		.exec(function(err,docs){
			if(err){
				console.log("validateConsumerToken -- error checking for token");
				response.json(util.failure);
			}
			else{
				if(!docs){
					console.log("no documents found");
					response.json(util.unauth);
					return;
				}
				console.log("validateConsumerToken -- started");
				if(docs.length === 1){
					if(docs[0].tokenExpiry.getTime() < Date.now() && docs[0].viewCount < docs[0].viewLimit){
						response.json(util.unauth);
						return;
					}
					var tempEmail = util.decrypt(docs[0].sentToEmail,docs[0].token+docs[0].studentId).toString(),
					tempPhone = util.decrypt(docs[0].sentToPhoneNumber,docs[0].token+docs[0].studentId).toString();
					if( !request.body.emailId && !request.body.phoneNumber){
						console.log("validateConsumerToken -- validate");
						response.json({token:request.body.token,studentAddress:docs[0].studentAddress});
					}
					else if( tempEmail === request.body.emailId || tempPhone === request.body.phoneNumber){
						//docs[0].otp = util.generateOTP().toString();
						console.log("validateConsumerToken -- emailId");
						docs[0].otp = "12345";
						docs[0].otpStatus = false;
						var mailOptions = mailbody.otp;
						mailOptions.to = request.body.emailId;
						mailOptions.text = mailbody.otp.body+docs[0].otp;
						mailSender.sendMail(mailOptions);
						var time = Date.now() + 600000;
						tempCache.set(request.body.token,docs[0],time/1000);
						response.json({token:request.body.token,studentAddress:docs[0].studentAddress});
					}
					else{
						response.json(util.unauth);
					}
				}
				else{
					response.json(util.failure);
				}
			}
		});
	}
};

/*
------------------------------------------------- validate consumber token ----------------------------------------------------

*/

/**
* @author: vivek (vivek@xanbell.com)

* Validate consumer OTP

* @param: OTP

* @return: returns 1 if the otp is correct else -1

* */

exports.validateConsumerOTP = function(request,response){
	if(request.body.token){
		var check = tempCache.get(request.body.token);
		tempCache.del(request.body.token);
		console.log("validateConsumerOTP -- begin");
		if(check){
			if(request.body.otp === check.otp){
				console.log("validateConsumerOTP -- otp entered is correct");
				check.otpStatus = true;
				check.viewCount++;
				//check.token = null;
				check.save(function(err){
					if(err){
						console.log("validateConsumerOTP -- failed");
						console.log(err);
						response.json(util.failure);
					}
					else{
						console.log("validateConsumerOTP -- successful");
						response.json(util.success);
						viewCache.set(request.body.token,check);
					}
				});
			}
			else{
				console.log("validateConsumerOTP -- OTP entered is wrong");
				response.json(util.unauth);
			}
		}
		else{
			response.json(util.unauth);
		}
	}
	else{
		response.json(util.unauth);
	}
};

/*
------------------------------------------------- validate consumber session----------------------------------------------------

*/

/**
* @author: Darshan (darshan@xanbell.com)

* View the shared Certificate

* @param: Certificate ID

* @return: returns the certificate

* */
exports.viewCertificate = function(request,response){
	validateLogin(request.body.token,function(login){
		if(login === null){
			response.json(util.unauth);
		}
		else{	
			console.log(request.body);
			Certificate.findOne({certificateHashkey:request.body.id})
			.exec(function(err,resp){
				if(err){
					console.log(err);
					console.log("error in finding the Certificate");
				}else{
					console.log(resp);
					var sk = resp._id+util.getHash(resp._id.toString()); 
					var buf = Buffer.from(util.decrypt(resp.certificate,sk), 'base64');
					response.writeHead(200, {
						'Content-Type':'application/pdf',
						'Content-disposition': 'attachment;filename='+resp.certificateName+".pdf",
						'Content-Length': buf.length
					});
					response.end(buf);							
				}
			});
		}
	});
};

/**
* @author: vivek (vivek@xanbell.com)

* Validate consumer Login

* @param: login Credentials

* @return: returns 1 if the credentials are correct else -1

* */

var validateLogin =  function (token,action){
	if(token&&token.token)
		token = token.token;
	var login = viewCache.get((token||" ").toString());
	if(login){
		console.log("token found in cache");
		action(login);
	}
	else{
		ViewRequest.find({token:token || "  "})
		.exec(function(err,docs){
			if(err){
				console.log("validateLogin -- error checking for token");
				action(null);
			}
			else{
				console.log("validateLogin -- sucess");
				if(docs.length === 1){
					if(docs[0].otpStatus)
						action(docs[0]);
				}
				else{
					action(null);
				}
			}
		});
	}
};

/*
------------------------------------------------- get shared certificates ----------------------------------------------------

*/

/**
* @author: vivek (vivek@xanbell.com)

* Get Certificates

* Get Certificates approved by the approver for a student

* @param: token

* @return: returns all the approved certificates

* */

exports.getCertificates = function(request,response){
	validateLogin(request.body.token,function (login) {
		console.log('get certificates start');
		if (login) {
			var certificates = [];
			for(var i = 0;i < login.certificates.length;i++){
				certificates.push({certificateIds:login.certificates[i].certificateIds,
					certificateName:login.certificates[i].certificateName,
					studentId:login.studentId
				});
			}
			response.json(certificates);
		} else {
			response.json(util.unauth);
		}
	});
};

/*
------------------------------------------------- download given certificate ----------------------------------------------------

*/
/**
* @author: vivek (vivek@xanbell.com)

* Download the Certificate

* @param: certificate hash key

* @return: returns the certificate 

* */

exports.downloadCertificate = function (request,response) {
	//console.log(response);
	console.log("download certificates");
	validateLogin(request.body.token,function (login) {
		if (login) {
			console.log(request.body);
			Certificate.findOne({certificateHashkey:request.body.id})
			.exec(function (err,doc) {
				if(err){
					console.log("downloadCertificate -- error finding certificate ");
					response.json(util.failure);
				}
				else{
					if(doc){
						console.log("downloadCertificate -- success");
						var sk1 = doc._id+util.getHash(doc._id.toString());
						var buf = Buffer.from(util.decrypt(doc.certificate,sk1), 'base64');
						response.writeHead(200, {
							'Content-Type':'application/octet-stream',
							'Content-disposition': 'attachment;filename='+doc.certificateName+"."+doc.fileType,
							'Content-Length': buf.length
						});
						response.end(buf);
					}else{
						console.log("document null");
						response.send(null);
					}
					
				}
			});
		} else {
			console.log("downloadCertificate -- unauth");
			response.json(util.unauth);
		}
	});
};

/*
------------------------------------------------- validate student login ----------------------------------------------------

*/
/**
* @author: vivek (vivek@xanbell.com)

* Validate Student Login

* Validates the Student login

* @param: token

* @return: returns Student info if validated else null

* */

var validateStudentLogin = function (token,callback) {
	var pass;
	options.host = config.studentIp;
	options.port = config.studentPort;
	options.path = "/validate/studentLogin";
	if(token.pass){
		pass = token.pass;
		token = token.token;
	}
	util.httpRequest({token:token,password:pass},options,function(resp){
		callback(resp);
	});
};

/*
------------------------------------------------- get first 5 requests ----------------------------------------------------

*/

/**
* @author: vivek (vivek@xanbell.com)

* Get Requests

* Get the list of all requests for a particular information 

* @param: token, studentId

* @return: returns all the requests for the given information

* */

exports.getRequests = function(request,response){
	console.log("getRequests -- begin");
	var data = request.body;
	validateStudentLogin(data.token, function(login) {
		if(login === null){
			response.json(util.unauth);
		}
		else{
			ViewRequest.find({studentId:login.studentId,token:{$ne:null},tokenExpiry:{$gt:new Date(Date.now())}})
			.sort({date:-1})
			.limit(5)
			.exec(function(err,docs){
				if(err){
					console.log("getRequests -- unable to get all the view requests sent by student");
					console.log(err);
					response.json(util.failure);
				}
				else{
					console.log("getRequests -- response of all the requested docs sent");
					for(var i=0;i<docs.length;i++){
						docs[i].sentToPhoneNumber = util.decrypt(docs[i].sentToPhoneNumber,docs[i].token+docs[i].studentId).toString();
						docs[i].sentToEmail = util.decrypt(docs[i].sentToEmail,docs[i].token+docs[i].studentId).toString();
					}
					response.json(docs);
				}
			});
		}
	});
};



/*
-------------------------------------------------Get All Requests----------------------------------------------------

*/

/**
* @author: vivek (vivek@xanbell.com)

* Get All Requests

* Get the list of all requests  

* @param: token

* @return: returns all the requests

* */

exports.getAllRequests = function(request,response){
	console.log("getRequests -- begin");
	var data = request.body;
	validateStudentLogin(data.token, function(login) {
		if(login === null){
			response.json(util.unauth);
		}
		else{
			ViewRequest.find({studentId:login.studentId})
			.sort({date:-1})
			.exec(function(err,docs){
				if(err){
					console.log("getRequests -- unable to get all the view requests sent by student");
					console.log(err);
					response.json(util.failure);
				}
				else{
					console.log("getRequests -- response of all the requested docs sent");
					for(var i=0;i<docs.length;i++){
						docs[i].sentToPhoneNumber = util.decrypt(docs[i].sentToPhoneNumber,docs[i].token+docs[i].studentId).toString();
						docs[i].sentToEmail = util.decrypt(docs[i].sentToEmail,docs[i].token+docs[i].studentId).toString();
					}
					response.json(docs);
				}
			});
		}
	});
};

exports.getAllRequestsForUniversity = function(request,response){
	ViewRequest.find({}).exec(function(err,requests){
		if(err){
			console.log("Error in finding the Requests")
			console.log(err)
		}else{
			response.json(requests);
		}
	})
}

/*
  -----------------------------------------------Create New Request-----------------------------------------------------
  
*/

/**
* @author: vivek (vivek@xanbell.com)

* Create Request

* Create a new Request 

* @param: token, request data

* @return: returns 1 if the request is created else -1

* */

exports.newRequest =  function(request,response){
	var data = request.body;
	console.log("newRequest -- new request by user");
	console.log(data);
	validateStudentLogin({token:data.token,pass:"mx9237E812w1*!@1tgbd238"},function(login){
		if(!login){
			response.json(util.unauth);
			console.log("unauthorized login attempt");
		}
		else if(data.request.sentToEmail && data.request.sentToPhoneNumber && data.request.certificates.length>0){
			console.log(login.login);
			var lkey = util.getLkey();
			var randNumber = Math.floor(Math.random() * (99999 - 12321) + 12321);
			var randomString = data.request.sharedToName.slice(0,3);
			var requestId = randomString+"--"+randNumber.toString();
			var newReq = new ViewRequest(data.request);
			newReq.emailId = util.encrypt(login.login.emailId, lkey);
			/*newReq.studentName = login.login.*/
			newReq.studentId = login.login.studentId;
			newReq.studentAddress = login.address;
			newReq.token = uuid()+"---"+Buffer.from(request.body.ip).toString('base64');
			newReq.purpose = newReq.purpose;
			newReq.requestId = requestId;
			newReq.sharedToName = newReq.sharedToName;
			newReq.sentToEmail = util.encrypt(newReq.sentToEmail,newReq.token+newReq.studentId);
			newReq.sentToPhoneNumber = util.encrypt(newReq.sentToPhoneNumber,newReq.token+newReq.studentId);
			if(!newReq.tokenExpiry){
				newReq.tokenExpiry = new Date(Date.now()+86400000*2);
			}
			if(!newReq.viewLimit){
				newReq.viewLimit = 10;
			}
			newReq.save(function(err){
				if(err){
					console.log(err);
					console.log("newRequest -- new request  could not be generated");
					response.json(util.failure);
				}
				else{
					console.log("newRequest -- new request generated");
					options.host = config.studentIp;
					options.port = config.studentPort;
					options.path = "/institution/studentId"
					util.httpRequest({studentId:login.login.studentId},options,function(resp){
						console.log("Institute:");
						options.port = config.adminPort;
						options.ip = config.adminIp;
						options.path = "/updateRequestCount/AdminApplication"
						util.httpRequest({institutionId:resp.institutionId},options,function(responseFromAdmin){
							console.log("Updated in Admin");
							response.json(util.success);
							console.log(responseFromAdmin);
						})
					});				
					mailbody.newRequest.to = util.decrypt(newReq.sentToEmail,newReq.token+newReq.studentId);
					var body = mailbody.newRequest.body;
					mailbody.newRequest.text = login.login.emailId + mailbody.newRequest.body + "/view/certificates/"+newReq.token;
					mailSender.sendMail(mailbody.newRequest);
				}
			});
		}
		else{
			console.log("Failure");
			response.json(util.failure);
		}
	});
};

/*
  -----------------------------------------------Create New Request-----------------------------------------------------
  
*/

/**
* @author: vivek (vivek@xanbell.com)

* Invalidate the link

* expire the link- make is unaccessible for the consumer 

* @param: token, request id

* @return: invalidates the link

* */

exports.expire = function (request,response) {
	if(!request.body.token){
		response.json(util.unauth);
	}
	validateStudentLogin(request.body.token,function (login) {
		if(!login){
			response.json(util.unauth);
			return;
		}
		ViewRequest.findOne({_id:request.body._id})
			.exec(function (err,doc) {
				if(err){
					console.log("unable to find request with id");
					console.log(err);
					response.json(util.failure);
				}
				else{
					if(!doc){
						console.log("no documents found");
						response.json(util.failure);
						return;
					}
					doc.tokenExpiry = new Date(Date.now()-3600000);
					doc.save(function (err) {
						if(err){
							console.log("error updating token of request");
							console.log(err);
							response.json(util.failure);
						}
						else{
							response.json(util.success);
						}
					});
				}
			});
	});
};
/**
* @author: Darshan (darshan@xanbell.com)

* Get Requests for transaction

* @param: studentId

* @return: returns all the requests for a Student

* */

exports.getRequestsForTransaction = function(request,response){
	console.log("getRequests -- begin");
	var data = request.body;
	console.log(request.body);
	validateStudentLogin(data.token, function(login) {
		if(login === null){
			response.json(util.unauth);
		}
		else{
			ViewRequest.find({studentId:request.body.studentId})
			.exec(function(err,docs){
				if(err){
					console.log("getRequests -- unable to get all the view requests sent by student");
					console.log(err);
					response.json(util.failure);
				}
				else{
					console.log("getRequests -- response of all the requested docs sent");
					console.log(docs);
					for(var i=0;i<docs.length;i++){
						docs[i].sentToPhoneNumber = util.decrypt(docs[i].sentToPhoneNumber,docs[i].token+docs[i].studentId).toString();
						docs[i].sentToEmail = util.decrypt(docs[i].sentToEmail,docs[i].token+docs[i].studentId).toString();
					}
					response.json(docs);
				}
			});
		}
	});
};

exports.getAllTransactionsOfStudentsForUniversity = function(request,response){
	console.log("getRequests -- begin");
	var data = request.body;
	console.log(request.body);
	ViewRequest.find({studentId:request.body.studentId})
		.exec(function(err,docs){
			if(err){
				console.log("getRequests -- unable to get all the view requests sent by student");
				console.log(err);
				response.json(util.failure);
			}
			else{
				console.log("getRequests -- response of all the requested docs sent");
				console.log(docs);
				for(var i=0;i<docs.length;i++){
					docs[i].sentToPhoneNumber = util.decrypt(docs[i].sentToPhoneNumber,docs[i].token+docs[i].studentId).toString();
					docs[i].sentToEmail = util.decrypt(docs[i].sentToEmail,docs[i].token+docs[i].studentId).toString();
				}
				response.json(docs);
			}
	});
}
/**
* @author: Darshan (darshan@xanbell.com)

* Send Verification Report

* Sends verification report once the verification is done by the employer

* @param: certificate and request information

* @return: sends mail to the employers email

* */

exports.sendVerifiationReport = function(request,response){
	var CertificateInfo = [];
	var requestView;
	console.log(request.body);
	console.log("Request ____________")
	Certificate.find({certificateHashkey:request.body.certificateAddress})
	.exec(function (err,certificates) {
		if(err){
			console.log(err);
			console.log("Error in finding the certificate");
		}else{
			CertificateInfo = certificates;
			options.host = config.adminIp;
			options.port = config.adminPort;
			options.path = "/consumer/get/university";
			var id = {};
			id.universityId=CertificateInfo[0].universityId;
			util.httpRequest(id,options,function (result) { //get university Information
				console.log("University Details");
				console.log(result)
				var universityName = "VTU University";
				var Awarderarray = [];
				var currentDate = [];
				var issuedArray = [];
				var Presentdate = new Date(Date.now());
				currentDate.push((Presentdate.toString()).split(' '));
				var CurrentDate = currentDate[0][0]+" "+currentDate[0][1]+"-"+currentDate[0][2]+"  "+currentDate[0][3];//convert date into a readable format
				var currentTime = currentDate[0][4];
				Awarderarray.push(((CertificateInfo[0].awardedDate).toString()).split(' '));
				issuedArray.push(((CertificateInfo[0].uploadedOn).toString()).split(' '));
				var issuedDate = issuedArray[0][0]+" "+issuedArray[0][1]+"-"+issuedArray[0][2]+"  "+issuedArray[0][3];
				var awardedDate = Awarderarray[0][0]+" "+Awarderarray[0][1]+"-"+Awarderarray[0][2]+"  "+Awarderarray[0][3];
				ViewRequest.find({token:request.body.token})
				.exec(function(err,viewRequest){
					if(err){
						console.log("error in finding the viewRequest");
						console.log(err);
					}else{
						requestView = viewRequest;
						var doc = new PDFDocument();
						var stream = doc.pipe(blobStream());
						doc.pipe(fs.createWriteStream('Certificate - '+request.body.certificateAddress+'.pdf'));

						doc.image('./new-yellow-university-128.jpeg',30,30);   

						doc.font('Times-Roman','Chalkboard-Bold')
						   .fontSize(35)
						   .fillColor('black')
						   .text("Verification Report",160,30);

						doc.font('Times-Roman')
							.fontSize(25)
							.fillColor('black')
							.text("Dear Sir/Madam,",20,140);

						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('black')
							.text("Sub: Verification Report for Request ID-",25,170);

						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('olive')
							.text(requestView[0].requestId,355,170);

						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('black')
							.text("Kindly find academic record verification report for request initiated by you (Request ID- ",25,220);

						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('olive')
							.text(requestView[0].requestId,265,242);

						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('black')
							.text("  ) for the purpose",350,242);

						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('black')
							.text("of:",25,267);
	  
						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('olive')
							.text(requestView[0].purpose,60,267);
	 
						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('black')
							.text("Student Name                              :  ",40,330);

						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('olive')
							.text(CertificateInfo[0].studentName,325,330);


						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('black')
							.text("Academic Credential                   : ",40,360);

						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('olive')
							.text(CertificateInfo[0].certificateName,325,360);

						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('black')
							.text("Enrollment Number                     : ",40,390);

						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('olive')
							.text(CertificateInfo[0].studentRollNumber,325,390);

						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('black')
							.text("Original Document Issued On     : ",40,420);

						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('olive')
							.text(issuedDate,325,420);

						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('black')
							.text("Original Document Issued By     : ",40,450);

						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('olive')
							.text(universityName,325,450);


						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('black')
							.text("Original Document Verified On   : ",40,480);

						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('olive')
							.text(awardedDate,325,480);


						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('black')
							.text("Certificate Hash                            : ",40,510);

						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('olive')
							.text(request.body.blockAddressed.certificate,325,510);

						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('black')
							.text("Verified By,",40,580);

						doc.font('Times-Roman')
							.fontSize(23)
							.fillColor('black')
							.text("SmartCert",40,610);
						doc.image('./sclogo-large.png',40,640);   

						doc.end();

						var sk = CertificateInfo[0]._id+util.getHash(CertificateInfo[0]._id.toString()); 
						var buf = Buffer.from(util.decrypt(CertificateInfo[0].certificate,sk), 'base64');

                        var mailOptions = mailbody.verificationReport;
                        mailOptions.to = request.body.emailId;
                        mailOptions.subject ="Verification Report" ;
                        mailOptions.text = "Dear "+viewRequest[0].sharedToName+",\n\t\t"+"Here is the verification Report for the Request initiated by you. The Request id is: "+requestView[0].requestId+" \n\t\tRegards,\nSmartCert";
						mailOptions.attachments= [
														{
															filename: 'Academic Credential - '+CertificateInfo[0].certificateName+'.pdf',
															content: buf,
															contentType: 'application/pdf'
														},
														{
														    filename: 'Verification Report - '+CertificateInfo[0].studentName+'.pdf',
														    path: '/home/ubuntu/Desktop/Demo/SmartCertWebApp/Verifier/'+'Certificate - '+request.body.certificateAddress+'.pdf',
														    contentType: 'application/pdf'
														}
												 ];                    
                        mailSender.sendMail(mailOptions);
                        response.json({status:1})
						}
				});
			});
		}								
	});
};

exports.verifyCertificate = function (request,response) {
	if(!request.body.certificateAddress){
		console.log("verifyCertificate -- no certificate reference");
		response.json(util.failure);
		return;
	}
	validateLogin(request.body.token,function (login) {
		if (login) {
			var student = login.studentAddress;
			Certificate.findOne({certificateHashkey:request.body.certificateAddress|| " "}).select({certificate:0})
			.exec(function (err1,certificate){
				if(err1||!certificate){
					console.log("verifyCertificate -- could not find a certificate");
					console.log(err1);
					response.json(util.failure);
				}else {
					var tokenSplit = request.body.token.split("---");
					var url = Buffer.from(tokenSplit[1]||" ",'base64').toString();
					var pass = util.getHash("DB938e!(*2831hs1bDcb");
					Batch.findOne({_id:certificate.batchId},function (err,batch) {
						if(!err&&batch){
							Course.findOne({_id:batch.courseId},function (err,course) {
								if(!err&&course){
									options.host = config.blockChainIp;
									options.port = config.blockChainPort;
									options.path = "/check";
									util.httpRequest({
										token:{
											token:request.body.token,
											url:url.substring(0,url.length-1)
										},
										universityId:certificate.universityId,
										institutionId:certificate.institutionId,
										studentAddress:student,
										courseAddress:course.blockChainAddress,
										batchAddress:batch.blockChainAddress,
										certificateAddress:certificate.blockChainAddress,
										password:pass,
										certificateHash:certificate.certificateHashkey,
									},options,function (resp) {
										if(resp === null){
											response.json({status:-1});
										}else if(resp.status){
											response.json(resp);
										}else{
											response.json({status:-1});
										}
									});
								}else{
									console.log("verifyCertificate -- could not find a course");
									console.log(err1);
									response.json(util.failure);
								}
							});
						}else{
							console.log(err);
							console.log("verifyCertificate -- error  getting batch");
							response.json(util.failure);
							return;
						}
					});
				}
			});	
		}else{
			console.log("verifyCertificate -- no login");
			response.json(util.unauth);
		}								
	});
};

exports.getAllEducationalDetailsOfARequest = function(request,response){
	ViewRequest.find({}).select("educationalDetails").exec(function(err,educationalDetails){
		if(err){
			console.log(err);
			console.log("Error");
		}else{
			console.log("____________")
			console.log(educationalDetails);
			console.log("____________")
			response.json(educationalDetails);
		}
	})
}

exports.getRequestsForId = function(request,response){
	console.log(request.body.institutionId);
	ViewRequest.find({"educationalDetails.institutionId":request.body.institutionId},function(err,viewRequests){
		if(err){
			console.log("Error in finding the ViewRequests");
			console.log(err)
		}else{
			console.log("____________")
			console.log(viewRequests);
			console.log("____________")
			for(var i=0;i<viewRequests.length;i++){
				viewRequests[i].sentToPhoneNumber = util.decrypt(viewRequests[i].sentToPhoneNumber,viewRequests[i].token+viewRequests[i].studentId).toString();
				viewRequests[i].sentToEmail = util.decrypt(viewRequests[i].sentToEmail,viewRequests[i].token+viewRequests[i].studentId).toString();
			}

			response.json(viewRequests);
		}
	})
}