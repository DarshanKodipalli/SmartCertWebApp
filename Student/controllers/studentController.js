/*jshint esversion: 6 */
var config = require("../Config/config"),
dao = require("../dao/dao"),
uuid = require("uuid/v1"),
util = require("../util/util"),
mailSender = require("../mail/mailSender"),
mailbody = require("../mail/mailbody");
var options = {
	host: config.issuerIp,
	port: config.issuerPort,
	path: "/login/validate",
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	}
};

const allowedIps = [config.issuerIp,config.verifierIp,config.studentIp];

var HashMap = require('hashmap');
const Cache = require("node-cache");

//=========================Globals=======================//

const studentCache = new Cache(); 
const tempCache = new Cache();

//======================Models==========================//

var Student = dao.student,
StudentLogin = dao.studentLogin,
ViewRequest = dao.viewRequest,
University =  dao.university,
Institution = dao.institution,
Batches = dao.batches,
Certificate = dao.certificate;


//=====================================================//
/**
 * status = 0 operation util.successful
 * status = -1 operation failed
 * status = -2 operation not authorized
 * 
 * */
/**
* @author: Vivek (vivek@xanbell.com)

* Validating the token

* method for validating the login 

* @param: token

* @return: 1 if it is valid successfully else -1

* */

var validateLogin = function(token,action){
	if(!token){
		console.log("validateLogin - null check for token");
		action(null);
		return;
	}
	var login = studentCache.get(token);
	if(login){
		console.log("token found in cache");
		action(login);
	}
	else{
		console.log("token not found in cache");
		StudentLogin.find({token:token||" "})
		.exec(function(err,docs){
			if(err){
				console.log("validateLogin-- error validating token \n");
				console.log(err);
				action(null);
			}
			else if(!docs[0]){
				action(null);
			}
			else if(!docs[0].tokenExpiry){
				console.log("validateLogin-- document fetch error \n");
				console.log(err);
				action(null);
			}
			else if(docs[0].tokenExpiry.getTime() < Date.now()){
				docs[0].token = null;
				docs[0].save(function(err){
					if(err){
						console.log("validateLogin-- error making the token null \n");
						console.log(err);
						action(null);
					}
				});
			}
			else{
				var lkey = util.getLkey();
				docs[0].emailId = util.decrypt(docs[0].emailId,lkey);
				//docs[0].notificationEmailId = util.decrypt(docs[0].notificationEmailId,lkey);
				studentCache.set(token,docs[0]);
				action(docs[0]);
			}
		});
	}
};
exports.MassUploadGetStudents = function(request,response){
	Student.find({massUploadId:request.body.massUploadId},function(err,docs){
		if(err){
			console.log(err);
			console.log("Error in fetching the Student List");
		}else{
			response.json(docs);
		}
	})
}
exports.validateStudentLoginToken = function (request,response) {
	var ip = request.headers['x-forwarded-for']|| request.connection.remoteAddress|| request.socket.remoteAddress|| request.connection.socket.remoteAddress;
    console.log(ip);
    /*var temp = ip.split(":");
    if(temp[temp.length-1] !== "127.0.0.1"){
    	response.json(null);
    	return;
    }*/
	if(!request.body.token){
		response.json(null);
		return;
	}
	else{
		validateLogin(request.body.token,function (login) {
			if(request.body.password&&request.body.password === "mx9237E812w1*!@1tgbd238"){
				console.log("new request created");
				if(login){
					Student.findOne({_id:login.studentId||" "},function(err,docs){
						if(err||!docs){
							console.log(err);
							console.log("validateStudentLoginToken -- student error");
							response.json(null);
						}else{
							console.log("validateStudentLoginToken -- sent");
							response.json({login:login,address:docs.blockChainAddress});
						}
					});
				}else {
					response.json(null);
				}
			}else{
				response.json(login);
			}
		});
	}
};

//===========================================Stduent Operations=========================================//


/*
 -------------------------------------Student Login-----------------------------------------------
  
*/
/**
* @author: Vivek (vivek@xanbell.com)

* Logging in into the Student portal

* method for logging in into the student portal

* @param: token, login credentials

* @return: 1 if logged in successfully, else -1

* */

exports.studentLogin =  function(request,response){
	var data = request.body;
	console.log("studentLogin-- student login request by ");
	var login = new StudentLogin();
	var token = "";
	try{
		var lkey = util.getLkey();
		console.log(util.encrypt(data.emailId,lkey));
		Student.find({emailId:util.encrypt(data.emailId,lkey)||" "})
		.exec(function(err,docs){
			if(err){
				console.log("studentLogin-- error finding emailId in database");
				console.log(err);
				response.json(util.failure);
			}
			if(docs.length === 1){
				if(docs[0].password === util.encrypt(data.password,util.getHash(data.password))){
					console.log("studentLogin-- credentials valid ");
					login.emailId = data.emailId;
					login.studentId = docs[0]._id;
					login.loginIp = request.headers['x-forwarded-for'];
					token = uuid().toString();   
					login.token = token;
					login.access = [0];
					login.loginDate = new Date(Date.now());
					//login.otp = util.generateOTP().toString();
					console.log(login.otp);//todo
					login.otp = "12345";
					var time = Date.now() + 600000 ;
					tempCache.set(token,login,time/1000);
					var sk = docs[0]._id+util.getHash(docs[0]._id.toString());
					var mailOptions = mailbody.otp;
					//mailOptions.to = util.decypt(data.notificationEmailId,sk);
					mailOptions.to = data.emailId;
					mailOptions.text = mailbody.otp.body+login.otp;
					mailSender.sendMail(mailOptions);
					response.json({token:token,name:util.decrypt(docs[0].name,sk)});
				}
				else{
					response.json(util.unauth);
					console.log("studentLogin-- invalid credentials");
				}
			}
			else{
				console.log("unauthorized login");
				response.json(util.unauth);
				//util.unauthorized login
			}
		});
	}catch(e){
		response.json(util.unauth);
	}
};

/*
-------------------------------------------Validate Student OTP----------------------------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Validating the OTP

* method for checking if the right OTP was entered?

* @param: token, OTP

* @return: 1 if OTP is correct, else -1

* */

exports.validateStudentOTP = function(request,response){
	if(!request.body.token){
		response.json(util.unauth);
		return;
	}
	var login = tempCache.get(request.body.token);
	tempCache.del(request.body.token);
	if(!login){
		response.json(util.unauth);
		console.log("validateStudentOTP -- no login");
		return;
	}
	if(login.token){
		console.log("validateStudentOTP -- begin");
		if(!request.body.otp){
			response.json(util.unauth);
			return;
		}
		if(login.otp === request.body.otp){
			var time = 0;
			studentCache.del(login.token);
			if(request.body.flag){
				console.log("studentLogin-- from personal device");
				time = Date.now() +365 * 86400000;
				login.tokenExpiry = new Date(time);
				studentCache.set(login.token,login,time/1000);
				//for personal device like phone keep token alive for a year
			}
			else{
				console.log("studentLogin-- from external device");
				time = Date.now() + 86400000 ;
				login.tokenExpiry = new Date(time);
				studentCache.set(login.token,login,time/1000);
				// validate token for one day
			}
			Student.findOne({_id:login.studentId||" "})
			.exec(function(err,docs){
				login.emailId = docs.emailId;
				docs.loginCount += 1;
				login.save(function(err){
					if(err){
						console.log("error logging user in");
						console.log(err);
						response.json(util.failure);
					}
					else{
						console.log("successful login by user");
						docs.save(function(err){
							if(err){
								console.log("error saving logincount");
								console.log(err);
							}
						});
						response.json(util.success);
					}
				});
			});
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
 -----------------------------------------Get The complete Student Details--------------------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Get the Student

* method for fetching the Student

* @param: student Details

* @return: Student Information

* */

exports.getStudent = function(request,response){
	validateLogin(request.body.token,function(login){
		if(!login){
			response.json(util.unauth);
			console.log("getStudent -- no login");
			return;
		}
		if(!login.token){
			response.json(util.unauth);
		}
		else{
			var lkey = util.getLkey();
			Student.findOne({_id:login.studentId||" "})
				.exec(function(err,docs){
					var sk = docs._id+util.getHash(docs._id.toString());
					docs.emailId = util.decrypt(docs.emailId,lkey);
					docs.name = util.decrypt(docs.name, sk);
					docs.phoneNumber = util.decrypt(docs.phoneNumber, sk);
					docs.address = util.decrypt(docs.address, sk);
					docs.password = null;
					docs.rollNumber = util.decrypt(docs.rollNumber, sk);
					docs._id = null;
					response.json(docs);
				});
		}
	});
};

/*
---------------------------------------------Student Logout-------------------------------------------------
*/
/**
* @author: Darshan (darshan@xanbell.com)

* Student Logout

* @param: takes token as an argument 

* @return: Invalidates the token and clears the cache contents

* */

exports.studentLogout = function(request,response){
	if(!request.body.token){
		response.json(util.failure);
		return;
	}
	if(request.body.token.length === 0){
		response.json(util.failure);
		return;
	}
	studentCache.del(request.body.token);
	StudentLogin.find({token:request.body.token||" "})
	.exec(function(err,docs){
		if(err){
			console.log("studentLogout-- token not found");
			console.log(err);
		}
		else if(!docs[0]){
			console.log("studentLogout-- token not found");
			console.log(err);
		}
		else{
			docs[0].token = null;
			docs[0].logoutDate = new Date(Date.now());
			Student.findOne({_id:docs[0].studentId||" "})
				.exec(function(err,doc){
					if(err){
						console.log(err);
						console.log("studentLogout-- error getting student by id");
					}
					else{
						doc.loginCount = doc.loginCount - 1;
						doc.save(function(err){
							if(err){
								console.log(err);
								console.log("studentLogout-- error saving active logged on accounts");
							}
						});
					}
				});
			docs[0].save(function(err){
				if(err){
					console.log("studentLogout-- token not set to null");
					response.json(util.failure);
				}
				else{
					console.log("studentLogout-- logged out");
					response.json(util.success);
				}
			});
		}
	});
};


/*
 ----------------------------------------Get all the universities for a student----------------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* University of a student

* @param: takes Student information as an argument 

* @return: university in which the student studies

* */

exports.getUniversitiesForStudent =  function(request,response){
	validateLogin(request.body.token, function(login) {
		if(login!==null){
			University.find({studentId:login.studentId||" "})
			.exec(function(err,docs){
				if(err){
					console.log("getUniversitiesForStudent -- error getting docs");
					console.log(err);
					response.json(util.failure);
				}
				else{
					console.log("getUniversitiesForStudent -- util.successful");
					for(var i = 0;i<docs.length;i++){
						docs[i].studentId = null;
					}
					response.json(docs);
				}
			});
		}
		else{
			console.log("getUniversitiesForStudent -- util.unauthorized access");
			response.json(util.unauth);
		}
	});
};

/*
 ----------------------------------------Get all the institutes for a student----------------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Institute of a student

* @param: takes Student information as an argument 

* @return: Institute in which the student studies

* */

exports.getInstitutionsForUniversityAndStudent = function(request,response){
	validateLogin(request.body.token,function (login) {
		if (login!==null) {
			Institution.find({universityId:request.body.universityId||" ",studentId:login.studentId||" "})
			.exec(function (err,docs) {
				if(err){
					console.log("getInstitutionsForUniversityAndStudent - error getting institutions");
					console.log(err);
				}
				else{
					for(var i = 0;i<docs.length;i++){
						docs[i].studentId = null;
					}
					response.json(docs);
				}
			});
		} else {
			console.log("getInstitutionsForUniversityAndStudent -- util.unauthorized");
			response.json(util.unauth);
		}
	});
};


/*

--------------------------------------------Update student-------------------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Updating the Student

* method for Updating the Student Information

* @param: Student to be updated 

* @return: 1 if updated successfully else -1

* */

exports.updateStudent = function(request,response){
	validateLogin(request.body.token,function(login){
		if(!login){
			response.json(util.unauth);
			console.log("updateStudent -- no login");
			return;
		}
		if(login.token){
			console.log("updateStudent -- request to update password");
			var lkey = util.getLkey();
			Student.findOne({emailId:util.encrypt(login.emailId,lkey)||" "})
				.exec(function(err,docs){
					var sk = docs._id+util.getHash(docs._id.toString());
					if(request.body.password){
						docs.password = util.encrypt(request.body.password,util.getHash(request.body.password));
					}
					if(request.body.address){
						docs.address = util.encrypt(request.body.address,sk).toString();
					}
					if(request.body.fathersName){
						docs.fathersName = util.encrypt(request.body.fathersName,sk).toString();
					}
					if(request.body.aadhaarNumber){
						docs.aadhaarNumber = util.encrypt(request.body.aadhaarNumber,sk).toString();
					}
					if(request.body.passportNumber){
						docs.passportNumber = util.encrypt(request.body.passportNumber,sk).toString();
					}
					if(request.body.phoneNumber){
						docs.phoneNumber = util.encrypt(request.body.phoneNumber,sk).toString();
					}
					var otp = util.generateOTP().toString();
					var time = Date.now() + 600000;
					tempCache.set(request.body.token,docs,time);
					var mailOptions = mailbody.otp;
					mailOptions.to = login.emailId;
					mailOptions.text = mailbody.otp.text+otp;
					mailSender.sendMail(mailOptions);
				});
		}
		else{
			response.json(util.unauth);
		}
	});
};

/*

--------------------------------------------Validate Otp for update phone number-------------------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Updating the Student Phone Number

* method for Updating the Student Phone Number

* @param: Student to be updated 

* @return: 1 if updated successfully else -1

* */

exports.updateStudentValidate = function (request,response) {
	validateLogin(request.body.token,function(login){
		if(!login){
			response.json(util.unauth);
			console.log("updateStudentValidate -- no login");
			return;
		}
		if(login.token){
			var temp = tempCache.get(request.body.token);
			if(request.body.token === temp.otp){
				var docs = temp.docs;
				//var sk = docs._id+util.getHash(docs._id.toString());
				docs.save(function(err){
					if(err){
						console.log("updateStudent -- error updating password");
						response.json(util.failure);
					}
					else{
						console.log("updateStudent -- updated password util.successfully");
						response.json(util.success);
					}
				});
			}
			else{
				response.json(util.unauth);
			}
		}
		else{
			response.json(util.unauth);
		}
	});
};


/*

--------------------------------------------Get Certificates for student-------------------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Get All the Certificates

* @param: nill 

* @return: the list of certificates

* */

exports.getCertificates = function (request,response){
	validateLogin(request.body.token,function(login){
		if(!login){
			response.json(util.unauth);
			console.log("getCertificates -- no login");
			return;
		}
		if(login.token){
			console.log("getCertificates -- begin");
			Certificate.find({studentId:login.studentId||" ",verified:true,approved:true})
			.exec(function (err,docs) {
				if(err){
					console.log("getCertificates -- error finding certificates");
					response.json(util.failure);
				}
				else{
					for (var i = 0; i < docs.length; i++) {
						docs[i].certificate = null;
						docs[i].studentId = null;
					}
					console.log("getCertificates --successful");
					response.json(docs);
				}
			});
		}
		else{
			console.log("getCertificates -- unauthorized");
			response.json(util.unauth);
		}
	});
};

/*

---------------------------------------------View Certificate------------------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Send the certificates to the from end

* @param: takes certificate ID as an argument 

* @return: the decrypted form of the certificate

* */

exports.viewCertificate = function(request,response){
	validateLogin(request.body.token,function(login){
		if(!login){
			response.json(util.unauth);
			console.log("viewCertificate -- no login");
			return;
		}
		if(!login.token){
			response.json(util.unauth);
		}
		else{	
				console.log(request.body);
					Certificate.findOne({certificateHashkey:request.body.id||" "})
						.exec(function(err,resp){
							if(err){
								console.log(err);
								console.log("error in finding the Certificate");
							}else{
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

exports.updatePassword = function(request,response){
	console.log(request.body);
	var lkey = util.getLkey();
	Student.find({emailId:util.encrypt(request.body.emailId,lkey)||" "})
	.exec(function(err,docs){
		if(err){
			console.log(err);
			console.log("Updata password:-- error in finding the student information");
			response.json(util.failure);
		}
		if(docs.length === 1){
			console.log(docs[0].password);
			if(docs[0].password === util.encrypt(request.body.currentPassword,util.getHash(request.body.currentPassword))){
				docs[0].password = util.encrypt(request.body.newPassword,util.getHash(request.body.newPassword));
				docs[0].save(function(err){
					if(err){
						console.log(err);
						console.log("Update password:-- error in saving the new password");
					}else{
						console.log("Update password:-- Password Updated");
						response.json(util.success);
					}
				});
			}else{
				console.log("The current password doesnt match with the new one");
				response.json({status:-5});
			}
		}else{
			console.log("Update password:-- error. More than one record");
		}
	});
};

/*
----------------------------resend certificates for approval ---------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Resend the rejected certificates to the approver

* method for resending all the rejected certificates

* @param: batch information of all the rejected certificates 

* @return: updated certificate

* */

exports.resendStudentCertificate = function(request, response) {
	console.log("___________+_+_+_++___________");
	console.log(request.body);
	console.log("Resend Called")
	var certInfo = JSON.parse(request.body.certificateInformation);
	console.log(certInfo)
	var query = {
		_id: certInfo.batchId||" ",
	};
	console.log("___________")
	console.log(query)
	console.log("___________")
	Certificate.findOne({
			certificateHashkey: request.body.oldHashKey||" "
		})
		.exec(function(err, certificates) {
			if (err) {
				console.log(err)
				console.log("resendCertificatesForApprover --Student-- Error in finding the rejected certificates");
				response.json(utils.failure);
				return;
			} else {
				certificates.certificate = request.body.certificate;
				certificates.certificateHashkey = request.body.certificateHashkey;
				certificates.certificateName = request.body.certificateName;
				certificates.certificateDescription = request.body.certificateDescription;
				certificates.save(function(err) {
					if (err) {
						console.log("resendCertificatesForApprover --Student-- Error in resending the Certificates");
						response.json(utils.failure);
						return;
					} else {
						response.json({status:1});
					}
				});
			}
		});
};

exports.MassUploadStudentAddressUpdate = function(request,response){
	console.log("_______________________________________________");	
	console.log("MassUploadStudentAddressUpdate:")
	Student.find({massUploadId:request.body.massUploadId}).exec(function(err,students){
		if(err){
			console.log(err);
			console.log("Error in Finding the Students");
		}else{
			for(var i=0;i<students.length;i++){
				for(var j=0;j<request.body.studentAddresses.length;j++){
					if(students[i]._id.toString() == request.body.studentAddresses[j]._id.toString()){
						students[i].blockChainAddress = request.body.studentAddresses[j].student;
						students[i].save(function(err){
							console.log(err||"");
						})
					}
				}
			}
		}
	})
}

exports.MassUploadCertificateUpdateCertificateAddress = function(request,response){
	console.log("_______________________________________________");
	console.log("MassUploadCertificateUpdateCertificateAddress");
	console.log(request.body);
	console.log("_______________________________________________");
	console.log(request.body.certificates);
	console.log(request.body.blockchainAddresses)
	var transactionId = request.body.certificates[0].transactionId;
	Certificate.find({transactionId:transactionId}).exec(function(err,certificateList){
		if(err){
			console.log("Error in finding the Student List")
			console.log(err);
		}else{
				for(var i=0;i<certificateList.length;i++){
				for(j=0;j<request.body.blockchainAddresses.length;j++){
						console.log(certificateList[i].certificateHashkey + "	"+ request.body.blockchainAddresses[j]._id);
					if(certificateList[i].certificateHashkey == request.body.blockchainAddresses[j]._id){
						certificateList[i].blockChainAddress = request.body.blockchainAddresses[j].certificate;
						certificateList[i].save(function(err){
							if(!err){
								console.log("no Error")
							}
						})
					}
				}
				console.log(i);
				if(i === certificateList.length-1){
					console.log("Updating in University");
                    options.path = "/UniversityMassUploadCertificate/updateCertificateAddress";
                    options.host = config.issuerIp;
                    options.port = config.issuerPort;
                    util.httpRequest({certificates:request.body.certificates,blockchainAddresses:request.body.blockchainAddresses},options,function (arg) {
                        console.log("Updated in University");
                        response.json({status:1});
                    });
				}
			}			
		}
	})
}

exports.updateRequestCountInInstitute = function(request,response){
	Institution.find({studentId:request.body.studentId}).exec(function(err,institute){
		if(err){
			console.log("Error in finding the Institution Id")
			console.log(err)
		}else{
			console.log(institute);
			response.json(institute[0]);
		}
	})	
}