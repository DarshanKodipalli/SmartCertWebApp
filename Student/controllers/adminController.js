var dao = require("../dao/dao"),
util = require('../util/util'), 
async = require('async'),
xlsx = require('node-xlsx'),
uuid = require("uuid/v1"),
constant = require("../constants/constants"),
config = require("../Config/config"),
http = require('http'),
HashMap = require('hashmap'),
mailSender = require("../mail/mailSender"),
mailbody = require("../mail/mailbody"),
AadhaarOperations = require("../aadhaar/aadhaar");


var Student = dao.student,
University =  dao.university,
Institution = dao.institution,
Certificate = dao.certificate,
UniversityRef = dao.universityRef;

var options = {
	host:config.issuerIp,
	port:config.issuerPort,
	path:"/login/validate",
	method:'POST',
	headers: {
		'Content-Type': 'application/json'
	}
};

var urlCache = new HashMap();
/**
* @author: Vivek (vivek@xanbell.com)

* Validate LOGIN

* method for validating user login

* @param: takes token as an argument 

* @return: if the login is valid or  not

* used for validating the user credentials

* */

var validateAdminLogin = function (token,action) {
	var pass = util.getHash(token.toString()+"gHgtYjNv52^512");
	options.host = config.adminIp;
	options.port = config.adminPort;
	options.path = "/admin/login/validate";
	util.httpRequest({token:token,password:pass},options,function (result) {
		action(result);
	});
};
/**
* @author: Vivek (Vivek@xanbell.com)

* Roll Back Student

* method for Removing the Student

* @param: state of the function 

* @return: removes the Student

* */

var rollbackStudent =  function (condition) {
	Student.remove(condition,function (argument) {
		console.log("deleted students");
	});
};
/**
* @author: Vivek (Vivek@xanbell.com)

* Roll Back Institution

* method for Removing the Institute

* @param: state of the function 

* @return: removes the Institute

* */

var rollbackInstitution = function (condition) {
	Institution.remove(condition,function (argument) {
		console.log("deleted institutions");
	});
};
/**
* @author: Vivek (Vivek@xanbell.com)

* Roll Back University

* method for Removing the University

* @param: state of the function 

* @return: removes the University

* */

var rollbackUniversity = function (condition) {
	University.remove(condition,function (argument) {
		console.log("deleted university");
	});
};


var checkUrlCache = function(url,action){
	action(true);
	return;
/*	if(urlCache.get(url||" ")){
		action(true);
		return;
	}else{
		var lkey = util.getLkey();
		UniversityRef.find({url:util.encrypt(url,lkey)||" "},function(err,docs){
			if(err){
				console.log(err);
				console.log("checkUrlCache -- error finding UniversityRef");
				action(false);
			}else{
				if(docs[0]){
					urlCache.set(docs[0].url,true);
					action(true);
				}else{
					action(false);
				}
			}
		});
	}*/
};
/**
* @author: Vivek (Vivek@xanbell.com)

* Roll Back Certificate

* method for Removing the Certificate

* @param: state of the function 

* @return: removes the Certificate

* */

var rollbackCertificate = function (condition) {
	Certificate.remove(condition,function (argument) {
		console.log("deleted university");
	});
};
/**
* @author: Vivek (Vivek@xanbell.com)

* Roll Back Student Creation

* method for reverting Student Creation

* @param: state of the function 

* @return: reverts the process of Student Creation

* */

var rollbackStudentCreation = function (studentId) {
	rollbackUniversity({studentId:studentId});
	rollbackInstitution({studentId:studentId});
	rollbackStudent({studentId:studentId});	
};
/**
* @author: Vivek (Vivek@xanbell.com)

* Get Host and Port

* method of fetching the host and port of the url

* @param: url

* @return: host and port of the url

* */

var getHostAndPort = function(uUrl){
	if(!uUrl || typeof uUrl !== "string"){
		return {};
	}
	var split = uUrl.split("//");
	if(split.length>1){
		split = split[1];
	}
	else{
		split = split[0];
	}
	split = split.split(":");
	if(split.length===2){
		return {
			url:split[0],
			port:split[1]||80
		};
	}

};
/**
* @author: Vivek (vivek@xanbell.com)

* Validate LOGIN

* method for validating University login

* @param: takes token as an argument 

* @return: if the login is valid or  not

* used for validating the University credentials

* */

var validateUniversityLogin = function(token,action){
	var data = getHostAndPort(token.url);
	console.log(data);
	console.log(token);
	if(!token.token||!token.url||!data.url||!data.port){
		console.log("no url");
		action(null);
		return;
	}
	checkUrlCache(token.url,function(check){
		if(check){
			var pass = util.getHash(token.token.toString()+"gHgtYjNv52^512");
			options.host = config.issuerIp;
			options.port = config.issuerPort;
			options.path = "/login/validate";
			util.httpRequest({token:token.token,password:pass},options,function (result) {
				action(result);
			});
		}else{
			action(null);
		}
	});
};


//===============================================Admin Operations=====================================================//

/*
  ------------------------------Student Registration--------------------------------------
*/
/**
* @author: Vivek (vivek@xanbell.com)

* Add the University and institution for Student

* method for Adding the university and institution for Student

* @param: University and institution Details 

* @return: 1 if added successfully else -1

* */

var insertInstitutionAndUniversityForStudent = function(request,id){
	console.log("studentRegistration -- university begin");
	var newUniversity = new University(request.body.university);
	newUniversity.studentId = id;
	newUniversity.save(function(err){
		if(err){
			console.log("studentRegistration -- error saving university for student");
			console.log(err);
		}
		else{
			console.log("studentRegistration -- institute begin");
			var newInstitution = new Institution(request.body.institution);
			newInstitution.studentId = id;
			newInstitution.universityId = newUniversity._id;
			newInstitution.save(function(err){
				if(err){
					console.log("studentRegistration -- error saving institution for student");
					console.log(err);
				}
			});
		}
	});	
};

/**
* @author: Vivek (vivek@xanbell.com)

* Add the Student

* method for Adding the Student

* @param: Student Details 

* @return: 1 if added successfully else -1

* */

exports.studentRegistration = function(request,response){
	console.log("studentRegostration url called");
	if(!request.body.student.emailId||!request.body.student.name||!request.body.student.rollNumber){
		response.json(util.unauth);
		return;
	}
	validateUniversityLogin(request.body.token,function (login) {
		if(!login){
			console.log("studentRegistration -- no login");
			response.json(util.unauth);
			return;
		}
		if(!login.token){
			console.log("studentRegistration -- no token");
			response.json(util.unauth);
			return;
		}
		var reqStudent = request.body.student;
		var tempStudent = new Student();
		var lkey = util.getLkey();
		var tempMail = reqStudent.emailId;
		tempStudent.emailId = util.encrypt(reqStudent.emailId,lkey);
		tempStudent.name = " ";
		console.log("studentRegistration --begin");
		Student.findOne({emailId:tempStudent.emailId||" "})
		.exec(function(err,doc){
			if(err){
				response.json(util.failure);
				console.log('studentRegistration -- error finding student by emailId');
				return;
			}
			else if(!doc){
				console.log("student doesnt exist already");
				AadhaarOperations.insertaadhar(reqStudent,function (result){
					if(result.status===-1){
						response.json(util.failure);
						return;
					}
					tempStudent.save(function(err){
						if (err){
							console.log("studentRegistration-- error creating a new record\n");
							console.log(err);
							Student.remove({_id:tempStudent._id},function(err){
								console.log(err);
								console.log("studentRegistration -- undo");
							});
						}
						else{
							insertInstitutionAndUniversityForStudent(request,tempStudent._id);
							var password = uuid().toString().substring(0,7);
							tempStudent.password = util.encrypt(password,util.getHash(password));
							var sk = tempStudent._id+util.getHash(tempStudent._id.toString());
							tempStudent.name = util.encrypt(reqStudent.name, sk).toString();
							tempStudent.rollNumber = reqStudent.rollNumber?util.encrypt(reqStudent.rollNumber,sk).toString():"";
							tempStudent.phoneNumber = reqStudent.phoneNumber?util.encrypt(reqStudent.phoneNumber, sk).toString():"";
							tempStudent.fathersName = reqStudent.fathersName?util.encrypt(reqStudent.fathersName,sk).toString():"";
							tempStudent.address = reqStudent.address?util.encrypt(reqStudent.address, sk).toString():"";
							tempStudent.aadhaarNumber = result.id;
							tempStudent.passportNumber = reqStudent.passportNumber?util.encrypt(reqStudent.passportNumber,sk):"";
							tempStudent.nationality = reqStudent.nationality;
							options.host = config.blockChainIp;
							options.port = config.blockChainPort;
							options.path = "/add/participant";
							tempStudent.save(function(err){
								if(err){
									console.log("studentRegistration-- password encryption failed");
									console.log(err);
									rollbackStudentCreation(tempStudent._id);
									response.json(util.failure);
								}else{
									console.log(password);
									var mailOptions = mailbody.studentPassword;
									mailOptions.to = request.body.student.emailId;
									mailOptions.text = mailbody.studentPassword.body+"	"+password;
									mailSender.sendMail(mailOptions);
									util.httpRequest({
										token:request.body.token,
										participantName:tempStudent._id,
										batchAddress:request.body.batchAddress||""
									},options,function(arg){
										console.log("studentRegistration-- blockchain update initiated");
										console.log(arg);
									});
									response.json(util.success);
									console.log("studentRegistration-- successful");
								}
							});
						}
					});
				});
			}
			else{
				console.log("document exist already");
				response.json(util.failure);
			}
		});
	});
};

/*
-----------------------Get all the student for a institution-------------------------------------

 */
/**
* @author: Vivek (vivek@xanbell.com)

* Get the Students

* method for fetching the Students

* @param: token 

* @return: Student List

* */

exports.getStudents = function(request,response){
	var data = request.body;
	console.log("getStudent -- started");
	validateUniversityLogin(data.token,function(login){
		if(!login){
			console.log("getStudents -- no login");
			response.json(util.unauth);
			return;
		}
		if(login.token){
			console.log("getStudent -- valid credentials");
			Student.find({institutionId:data.institutionId||" "})
			.limit((data.limit||1)*50)
			.exec(function(err,docs){
				if(err){
					console.log("getStudent -- unable to get data");
					response.json(util.failure);
					return;
				}
				for(var i=0;i<docs.length;i++){
					var sk = docs[i]._id+util.getHash(docs[i]._id.toString());
					var lkey = util.getLkey();
					docs[i].name = docs[i].name?util.decrypt(docs[i].name.toString(),sk):"";
					docs[i].rollNumber = docs[i].rollNumber?util.decrypt(docs[i].rollNumber.toString(),sk):"";
					docs[i].phoneNumber = docs[i].phoneNumber?util.decrypt(docs[i].phoneNumber.toString(),sk):"";
					docs[i].emailId = docs[i].emailId?util.decrypt(docs[i].emailId.toString(),lkey):"";
					docs[i].password = "";
				}
				console.log("getStudent -- data sent");
				response.json(docs);
			});
		}
		else{
			console.log("getStudent -- unauthorized");
			response.json(util.unauth);
		}
	});
};


/*
  -------------------------------------Assign Certificate-------------------------------------------------

 */
/**
* @author: Darshan (darshan@xanbell.com)

* Assign the Certificatec

* method for Assigning the certificate

* @param: University Details 

* @return: 1 if assigned successfully else -1

* */

exports.assignCertificate = function(request,response){
	validateUniversityLogin(request.body.token,function(login){
		if(!login){
			console.log("assignCertificate -- no login");
			response.json(util.unauth);
			return;
		}
		if(login.token){
			console.log("assignCertificate -- begin");
			var token = "";
			if(!request.body.transaction){
				token = uuid().toString();
			}
			var certificate = new Certificate();
			var batchInfo = JSON.parse(request.body.batchInfo);
			var certificateInformation = JSON.parse(request.body.certificateInformation);
			var studentInformation = JSON.parse(request.body.studentInformation);
			if(!batchInfo._id||!batchInfo.institutionId){
				response.json(util.failure);
				console.log("assignCertificate -- batch info incomplete");
				return;
			}
			if(!request.body.certificate){
				response.json(util.failure);
				console.log("assignCertificate -- certificateInformation incomplete");
				return;
			}
			if(!studentInformation._id||!studentInformation.name){
				response.json(util.failure);
				console.log("assignCertificate -- studentInformation incomplete");
				return;
			}
			certificate.batchId = batchInfo._id||"";
			certificate.institutionName = batchInfo.institutionName || "";
			certificate.institutionId = batchInfo.institutionId||"";
			certificate.certificateName = certificateInformation.certificateName||"";
			certificate.certificateDescription = certificateInformation.certificateDescription||"";
			certificate.studentId = studentInformation._id||"";
			certificate.studentName = studentInformation.name||"";
			certificate.universityId = JSON.parse(request.body.loginInfo).universityId||"";
			certificate.verified = false;
			certificate.sendToApprover = false;
			certificate.sendToApprover = true;
			certificate.courseName = batchInfo.courseName || "";
			certificate.streamName = batchInfo.stream || "";
			certificate.batch = batchInfo.year || "";
			certificate.certificate = request.body.certificate||"";
			certificate.certificateHashkey = util.getCertHash(certificate.certificate||"");
			certificate.save(function(err) {
				if (err){
					console.log(err);
					console.log("assignCertificate -- error saving certificate");
					rollbackCertificate({_id:certificate._id});
					console.log("assignCertificate -- rolled back certificate certificate");
					response.json(util.failure);
				}else{
					console.log("assignCertificate -- Certificate Added");
					var sk = certificate._id+util.getHash(certificate._id.toString());
					certificate.certificate = util.encrypt(request.body.certificate,sk);
					certificate.save(function(err){
						if(err){
							console.log("assignCertificate -- error in saving the encrypted certificate");
							console.log(err);
							rollbackCertificate({_id:certificate._id});
							console.log("assignCertificate -- rolled back certificate certificate");
							response.json(util.failure);
						}else{
							console.log("assignCertificate -- Certificate Created Successfully in student");
							response.json(util.success);
						}
					});
				}
			});
		}
		else{
			console.log("assignCertificate -- unauthorized");
			response.json(util.unauth);
		}
	});
};

/*
  -----------------------------------------Approve the Certificates-------------------------------------------------

 */
 /**
* @author: Vivek (vivek@xanbell.com)

* Send the confirmation Mail

* method for Sending the Confirmation mail

* @param: students list

* @return: 1 if mailed successfully else -1

* */

var sendConfirmationMail = function (students) {
 	var query = Student.find({_id:{$in:students}}).select({"emailId":1,"_id":0});
 	var lkey = util.getLkey();
 	query.exec(function (err,docs) {
 		if(err){
 			console.log("sendConfirmationMail -- error getting students");
 			console.log(err);
 		}else{
 			var temp = {};//todo
 			if(docs){
 				for (var i = docs.length - 1; i >= 0; i--) {
 					var emailId = util.decrypt(docs[i].emailId,lkey);
 					var mailOptions = mailbody.certificatesApproved;
					mailOptions.text = "Your Certificate: " + temp.certificateDescription + "\n" +
					"Certificate Name: " + temp.certificateName + " is approved by the Approver. ";
					mailOptions.subject = "Certificate Update";
					mailOptions.from = mailbody.emailId;
					mailOptions.to = emailId;
					mailSender.sendMail(mailOptions);
 				}
 			}
 		}
 	});
 };

/**
* @author: Darshan (darshan@xanbell.com)

* Sign the Certificates for students

* method for Signing the Certificates for students

* @param: Certificate Details 

* @return: 1 if Signed successfully else -1

* */

exports.SignTheCertificatesInStudents = function(request,response){
	console.log("_____________  Save in Student  _____________")
	console.log(request.body);
	console.log("_____________ _____________");
	validateUniversityLogin(request.body.token,function(login){
		console.log("SignTheCertificatesInStudents -- started");
		if(!login){
			console.log("SignTheCertificatesInStudents -- no login");
			response.json(util.unauth);
			return;
		}
		if(!login.token){
			console.log("SignTheCertificatesInStudents -- unauth");
			response.json(util.unauth);
			return;
		}
		else{
			var query = {
					batchId:request.body.batchId||" "
			};	
			var rejectedCount = 0, setRejected,verified;
			Certificate.find(query)
			.exec(function(err,certificates){
				if(err){
					console.log("SignTheCertificatesInStudents -- error finding certificates");
					response.json(util.failure);
					return;
				}
				console.log("Certificates: _____________")
				console.log(certificates);
				var certificateMap = new HashMap();
				for(var i=0;i<certificates.length;i++){
					certificateMap.set(certificates[i].certificateHashkey.toString(),certificates[i]);
				}
				var temp = {}, students = [];
				async.eachSeries(request.body.certificates,function(certificate,asyncdone){
					if(certificate.isCheckedApproved === true){
						temp = certificateMap.get(certificate.certificateHashkey.toString());
						console.log("Save Student Certificate")
						console.log("_____________")
						console.log(temp);
						console.log("_____________")
						if(temp){
							temp.verified = true;
							temp.approved = true;
							temp.verifiedOn = new Date();
							temp.verifiedBy = request.body.verifierId;
							temp.proof = request.body.proof;
							students.push(temp.studentId);
							temp.save(asyncdone);					
						}else{
							console.log("");
						}
					}else if(certificate.isChecked === true){
						temp = certificateMap.get(certificate.certificateHashkey);
						if(temp!==null){
							temp.rejectedComments = certificate.rejectComments;
							temp.approved = false;
							temp.proof = request.body.proof;
							temp.verified = true;
							temp.verifiedOn = new Date();
							temp.verifiedBy = request.body.verifierId;
							setRejected = true;
							verified=true;
							++rejectedCount;
							temp.save(asyncdone);										
						}else{
							console.log("SignTheCertificatesInStudents -- certificate not found in HashMap");
						}
					}	
				}
				,function(err){
					if(err){
						console.log(err);
						console.log("SignTheCertificatesInStudents -- error");
						response.json(util.failure);
					}else{
						console.log("SignTheCertificatesInStudents -- certificates signed in students");
						response.json(util.success);
					}
				});
				sendConfirmationMail(students);			
			});
		}
	});
};

/*
  -----------------------------------------upload excel file-------------------------------------------------

 */
/**
* @author: Vivek (vivek@xanbell.com)

* Mass Upload Students

* method for uploading students through an excel file

* @param: Excel File

* @return: 1 if added successfully else -1

* */

var getIndex = function (data,cols) {
	for(var i = 0; i < cols.length; i++){
		for(var j = 0;j < data.length; j++){
			if(data[j].toUpperCase()===cols[i].toUpperCase()){
				return j;
			}
		}
	}
};
exports.getMappingFile = function (request,response) {
	var SendinstitutionName;
	var SendinstitutionId;
	var SendcourseName;
	var Sendbranch;
	var Sendyear;
	var SendstudentCount=0;
	console.log(JSON.parse(request.body.AdditionalData));
	validateUniversityLogin(JSON.parse(request.body.token),function(login){
		var lkey = util.getLkey();
		console.log("get Mapping file started");
		if(login){
			var students = xlsx.parse(request.files.files.data);
			var index = {
					emailId : 0,//required
					name:0,
					fathersName:0,
					phoneNumber:0,
					dateOfBirth:0,
					joinedDate:0,
					address:0,
					pinCode:0,
					nationality:0,
					aadhaarId:0,
					passportNumber:0,
					certificate:0,
					batch:0,
					rollNumber:0,
					course:0,
					branch:0
			};
			var transactionId = uuid().toString();
			var date = new Date(Date.now());
			if(students[0].data[0]){
				var cols = constant.mappingFile;
				var data = students[0].data[0];
				index.emailId = getIndex(data,cols.emailId);
				index.name = getIndex(data,cols.name);
				index.batch = getIndex(data,cols.batch);
				index.course = getIndex(data,cols.course);
				index.branch = getIndex(data,cols.branch);
				index.rollNumber = getIndex(data,cols.rollNumber);
				index.certificate = getIndex(data,cols.certificate);
				index.fathersName = getIndex(data,cols.fathersName);
				index.phoneNumber = getIndex(data,cols.phoneNumber);
				index.dateOfBirth = getIndex(data,cols.dateOfBirth);
				index.joinedDate = getIndex(data,cols.joinedDate);
				index.address = getIndex(data,cols.address);
				index.pinCode = getIndex(data,cols.pinCode);
				index.nationality = getIndex(data,cols.nationality);
				index.aadhaarId = getIndex(data,cols.aadhaarId);
				index.passportNumber = getIndex(data,cols.passportNumber);
				var docs = [],errorDocs = [];
				var studentMap = new HashMap();
				for(var i = 1;i<students[0].data.length;i++){
					var temp = {};
					if(students[0].data[i][index.emailId]&&students[0].data[i][index.name]){
						temp.emailId = util.encrypt(students[0].data[i][index.emailId].toString(),lkey);
						temp.name = students[0].data[i][index.name];
						temp.rollNumber = students[0].data[i][index.rollNumber];
						temp.fathersName = students[0].data[i][index.fathersName];
						temp.address = students[0].data[i][index.address];
						temp.pinCode = students[0].data[i][index.pinCode];
						temp.nationality = students[0].data[i][index.nationality];
						temp.aadhaarId = students[0].data[i][index.aadhaarId];
						temp.passportNumber = students[0].data[i][index.passportNumber];
						temp.phoneNumber = students[0].data[i][index.phoneNumber];
						temp.emailId = students[0].data[i][index.emailId];
						temp.dateOfBirth = students[0].data[i][index.dateOfBirth];
						temp.joinedDate = students[0].data[i][index.joinedDate];
						Sendyear = students[0].data[i][index.batch];
						temp.transactionId = transactionId;
						temp.createdOn = date;
						temp.password = transactionId;
						docs.push(temp);
						studentMap.set(temp.emailId.toString(),students[0].data[i]);
					}
					else{
						errorDocs.push(data[i]);
					}
				}
				Student.insertMany(docs,function (err) {
					if(err){
						console.log(err);
						console.log("getMappingFile -- error creating student document");
					}
					else{
						console.log("getMappingFile -- stduents entered");
						Student.find({transactionId:transactionId||" "})
						.exec(function(err,results){
							if(results.length>0){
								console.log("getMappingFile -- got results");
								var universities = [],institutions = [],certificates = [];
								for(var i = 0;i<results.length;i++){
									var temp0 = {},temp1 = {}, temp2 = {};
									temp0.universityId  = temp1.universityId  =  temp2.universityId  = login.universityId;
									temp0.studentId     = temp1.studentId     =  temp2.studentId     = results[i]._id;
									temp0.transactionId = temp1.transactionId =  temp2.transactionId = transactionId;
									temp0.createdOn     = temp1.createdOn     =  temp2.createdOn     = date;

									temp0.universityName = login.universityName;
									temp0.enrollmentNumber = studentMap.get(results[i].emailId)[index.rollNumber];

									temp1.institutionId = JSON.parse(request.body.AdditionalData).institutionId;
									temp1.specialization = studentMap.get(results[i].emailId.toString())[index.branch];
									temp1.courseName = studentMap.get(results[i].emailId.toString())[index.course];
									temp1.institutionName = JSON.parse(request.body.AdditionalData).institutionName;
									temp1.batchId = JSON.parse(request.body.AdditionalData)._id;

									temp2.certificate = studentMap.get(results[i].emailId)[index.certificate];
									temp2.institutionId = JSON.parse(request.body.AdditionalData).institutionId;
									institutions.push(temp1);
									certificates.push(temp2);
									universities.push(temp0);
									studentMap.remove(results[i].emailId);
								}
								University.insertMany(universities,function (err) {
									if(err){
										console.log(err);
										console.log("getMappingFile -- error creating university for student");
									}
									else{
										console.log("getMappingFile -- universities created for students");
									}
								});
								Institution.insertMany(institutions,function (err) {
									if(err){
										console.log(err);
										console.log("getMappingFile -- error creating Institution for student");
									}
									else{
										console.log("getMappingFile -- institutions created for students");
									}
								});
								if(certificates.certificate){	// todo
									Certificate.insertMany(certificates,function (err) {
										if(err){
											console.log(err);
											console.log("getMappingFile -- error creating certificates");
										}
										else{
											console.log("getMappingFile -- certificates created for students");
										}
									});									
								}
								var massUploadIdForABatch = uuid().toString();
								async.eachSeries(results,function (doc,asyncdone) {
									var sk = doc._id+util.getHash(doc._id.toString());
									SendstudentCount += 1;
									var password = uuid().toString();
									doc.massUploadId = massUploadIdForABatch;
									var trimmedPassword = password.substring(0,7);
									doc.password = util.encrypt(trimmedPassword,util.getHash(trimmedPassword));
									doc.name = util.encrypt(doc.name,sk);
									var mailOptions = mailbody.studentPassword;
									mailOptions.to = doc.emailId;
									mailOptions.text = mailbody.studentPassword.body+"	"+trimmedPassword;
									mailSender.sendMail(mailOptions);
									var lkey = util.getLkey();
									doc.fathersName = util.encrypt(doc.fathersName,sk);
									doc.rollNumber = util.encrypt(doc.rollNumber,sk);
									doc.phoneNumber = util.encrypt(doc.phoneNumber,sk);
									doc.address = util.encrypt(doc.address,sk);
									doc.emailId = util.encrypt(doc.emailId,lkey);
									doc.save(asyncdone);
								},
								function (err) {
									if(err){
										console.log(err);
										console.log("getMappingFile -- error encrypting student details");
									}else{

										options.host = config.issuerIp;
										options.port = config.issuerPort;
										options.path = "/update/massUpload/count";
										util.httpRequest({
											batchAddress:(JSON.parse(request.body.AdditionalData)).batchAddress||"",
											studentCount:SendstudentCount
										},options,function(arg){
											console.log("Updated Student Count in University");
											console.log(arg);
											options.host = config.blockChainIp;
											options.port = config.blockChainPort;
											options.path = "/MassUpload/participant";
											util.httpRequest({
												token:request.body.token,
												transactionId:massUploadIdForABatch,
												batchAddress:(JSON.parse(request.body.AdditionalData)).batchAddress||""
											},options,function(arg){
												console.log("MassStudentRegistration-- blockchain update initiated");
												console.log(arg);
											});
										});
									}
								});
								response.json({transactionId:transactionId,status:1});
								return;
							}
							else{
								response.json(util.failure);
								console.log("getMappingFile -- no results saved");
							}
						});
					}
				});
			}
			else{
				response.json(util.failure);
				console.log("getMappingFile -- no excel sheet uploaded");
				return;
			}
		}
		else{
			response.json(util.unauth);
			console.log("getMappingFile --unauthorized");
		}
	});
};

/*
  -----------------------------------------get student for assigning certificate-------------------------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Get Student Information

* method for fetching the Student

* @param: Student Id

* @return: return the Student

* */

exports.getStudent = function(request,response){
	validateUniversityLogin(request.body.token,function(login){
		if(!login.token){
			response.json(util.unauth);
		}
		else{
			var lkey = util.getLkey();
			Student.findOne({_id:request.body.studentId||" "})
			.exec(function(err,docs){
				if(docs){
					var sk = docs._id+util.getHash(docs._id.toString());
					var send = {};
					send.emailId = util.decrypt(docs.emailId,lkey);
					send.name = util.decrypt(docs.name, sk);
					send.phoneNumber = util.decrypt(docs.phoneNumber, sk);
					send.address = util.decrypt(docs.address, sk);
					Certificate.findOne({certificateHashkey:request.body.certificateHashkey||" "})
					.exec(function (err,cert) {
						if(cert.studentId === docs._id.toString()){
							var sk = util.getHash(cert.institutionId)+util.getHash(cert.studentId);
							send.certificate = util.decrypt(cert.certificate.toString(),sk);
							response.json([send]);
						}
						else{
							console.log("certificate not found");
							response.json(null);
						}
					});
				}
				else{
					console.log("data not found");
					response.json(null);
				}
			});
		}
	});
};

/*
  -----------------------------------------get all stduents for a batch-------------------------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Get all the Students for a batch

* method for fetching the students for a batch

* @param: batch details

* @return: Students for a batch

* */

exports.getAllStudentsForABatch = function(request,response){
	console.log("getAllStudentsForABatch");
	console.log(request.body);
	validateUniversityLogin(request.body.token,function(login){
		if(!login){
			console.log("getAllStudentsForABatch  --  no login");
			response.json(util.unauth);
			return;
		}
		if(!login.token){
			console.log("getAllStudentsForABatch -- no token");
			response.json(util.unauth);
		}else{
			var studentId = [];
			var query = {
					batchId:request.body.batchInfo.batchId||request.body.batchInfo._id||" "
			};
			Institution.find(query)
			.exec(function(err,institutes){
				if(err){
					console.log(err);
					console.log("Error in finding the Batches");
					response.json(util.failure);
				}else{
					for(var i=0; i<institutes.length;i++){
						studentId.push(institutes[i].studentId);
					}
					var innerQuery = {_id:{$in:studentId}};
					Student.find(innerQuery)
					.exec(function(err,students){
						if(err){
							console.log(err);
							console.log("Error in retreiving the student Records");
							response.json(util.failure);
						}else{
							for(var i=0;i<students.length;i++){
								var sk = students[i]._id+util.getHash(students[i]._id.toString());
								var lkey = util.getLkey();
								students[i].name = util.decrypt(students[i].name,sk);
								students[i].password = util.decrypt(students[i].password,util.getHash(students[i].password));
								students[i].fathersName = util.decrypt(students[i].fathersName,sk);
								students[i].rollNumber = util.decrypt(students[i].rollNumber,sk);
								students[i].phoneNumber = util.decrypt(students[i].phoneNumber,sk);
								students[i].emailId = util.decrypt(students[i].emailId,lkey);							
							}
							response.json(students);
						}
					});
				}
			});
		}	
	});	
};

/*
  -----------------------------------------approve certificate for a student-------------------------------------------------

*/


exports.approveCertificate = function (request,response) {
	validateUniversityLogin(request.body.token,function (login) {
		if(login === null){
			console.log('approveCertificate --  unauthenticated login'); // todo
			return;
		}
		response.json(util.unauth);
	});
};

/*
  ----------------------------------------- get students for list of Ids-------------------------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Get all the Students 

* method for fetching the students

* @param: token

* @return: Student List

* */

exports.getStudentList = function (request,response) {
	console.log("update process started");
	validateUniversityLogin(request.body.token,function (login) {
		if(login.token){
			Student.find({_id:{$in:request.body.students}})
			.exec(function (err,docs) {
				if(!err){
					var students = {};
					for(var i = 0;i<docs.length;i++){
						students[docs[i]._id.toString()] = docs[i].blockChainAddress;
					}
					response.json(students);
					console.log("sent all student details");
				}
				else{
					console.log("error sending files");
					response.json(null);
				}
			});
		}
		else{
			console.log("unauth");
			response.json(util.unauth);
		}
	});
};


/*
  -----------------------------------------update blockchain token for student-------------------------------------------------

*/
/**
* @author: Vivek (Vivek@xanbell.com)

* Update Student in the Block Chain

* method for updating Student of an institute in block chain 

* @param: ??

* @return: ??

* */

exports.updateStudentBlockChainAddress = function (request,response) {
	console.log("update process started");
	var pass = util.getHash(request.body.token+"wr1234512#!@$f1");
	if(pass !== request.body.password){
		response.json(util.unauth);
		console.log("updateStudentBlockChainAddress -- wrong password");
		return;
	}
	validateUniversityLogin(request.body.token,function (login) {
		if(!login){
			console.log("updateStudentBlockChainAddress -- no login");
			response.json(util.unauth);
			return;
		}
		if(login.token){
			Student.findOne({_id:request.body._id||" "})
			.exec(function (err,doc) {
				if(err){
					console.log("error updating transaction id for Student");
				}
				else{
					if(doc){
						if(!doc.blockChainAddress){
							doc.blockChainAddress = request.body.address;
							doc.save(function(err){
								if(err){
									console.log("error saving updated record");
									response.json(util.failure);
								}
								else{
									console.log("updated student address");
									response.json(util.success);
								}
							});
						}
						else{
							response.json(util.success);
						}
					}
					else{
						console.log("document not found");
						response.json(util.failure);
					}
				}
			});
		}
		else{
			console.log("unauth");
			response.json(util.unauth);
		}
	});
};

/*
----------------------------------------------Update BlockChain Adress in Certificate-----------------------------------
*/
/**
* @author: Vivek (Vivek@xanbell.com)

* Update Certificate in the Block Chain

* method for updating Certificate  in block chain 

* @param: ??

* @return: ??

* */

exports.updateCertificateBlockChainAddress = function (request,response) {
	console.log("update process started");
	var pass = util.getHash(request.body.token+"wr1234512#!@$f1");
	if(pass !== request.body.password){
		response.json(util.unauth);
		console.log("updateCertificateBlockChainAddress -- wrong password");
		return;
	}
	validateUniversityLogin(request.body.token,function (login) {
		if(!login){
			console.log("updateCertificateBlockChainAddress -- unauthenticated");
			response.json(util.unauth);
		}
		if(login.token){
			Certificate.findOne({certificateHashkey:request.body._id||" "})
			.exec(function (err,doc) {
				if(err){
					console.log("error updating transaction id for certificate");
				}
				else{
					if(doc){
						if(!doc.blockChainAddress){
							doc.blockChainAddress = request.body.address;
							doc.save(function(err){
								if(err){
									console.log("error saving updated record");
									response.json(util.failure);
								}
								else{
									console.log("updated certificate address");
									response.json(util.success);
								}
							});
						}
						else{
							response.json(util.success);
						}
					}
					else{
						console.log("document not found");
						response.json(util.failure);
					}
				}
			});
		}
		else{
			console.log("unauth");
			response.json(util.unauth);
		}
	});
};
/**
* @author: Darshan (darshan@xanbell.com)

* Save the Certifcates in the Student

* method for Saving the Certifcates of bulk upload in the Student 

* @param: Certificate Information

* @return: 1 is Saved successfully else -1 

* */

exports.saveUploadedCertificatesInStudent = function (request,response) {
	validateUniversityLogin(request.body.token,function (login) {
		if(!login.token){
			console.log("saveUploadedCertificatesInStudent -- unauthenticated");
			response.json(util.unauth);
		}
		var encrypting = function (err,doc) {
			if(!err&&doc){
				var sk = doc._id+util.getHash(doc._id);
				doc.certificate = util.encrypt(doc.certificate);
				doc.save();
			}
		};
		async.eachSeries(request.body.certificates, function(certificates, asyncdone) {
	        var certificate = new Certificate();
	        certificate.batch = certificates.batch;
	        certificate.certificateName = certificates.certificateName;
	        certificate.certificateDescription = certificates.certificateDescription;
	        certificate.fileType = certificates.fileType;
	        certificate.certificate = certificates.certificate;
	        certificate.studentId = certificates.studentId;
	        certificate.studentRollNumber = certificates.studentRollNumber;
	        certificate.studentName = certificates.studentName;
	        certificate.studentEmailId = certificates.studentEmailId;
	        certificate.certificateHashkey = certificates.certificateHashkey;                    
	        certificate.universityId = certificates.universityId;
	        certificate.throughFileUpload = true;
	        certificate.transactionId = certificates.transactionId;
	        certificate.institutionId = certificates.institutionId;
	        certificate.institutionName = certificates.institutionName;
	        certificate.certificate = certificates.certificate;
	        certificate.batchId = certificates.batchId;
	        certificate.verified = false;
	        certificate.sendToApprover = true;
	        certificate.save(function(err,doc){
	        	if(err){
	        		console.log("saveUploadedCertificatesInStudent -- error saving certificate");
	        		console.log(err);
	        	}else{
	        		var sk = doc._id+util.getHash(doc._id);
					doc.certificate = util.encrypt(doc.certificate,sk);
					doc.save(asyncdone);
	        	}
	        });        
		    },function(err){
		        if(err){
		            console.log(err);
		            console.log("Error in saving the certificate");
		            response.json(util.failure);
		        }else{
		        	console.log("Certificates Saved Successfully in Student");
		        	response.json(util.success);
		        }
			});
	});
};

/**
* @author: Vivek (vivek@xanbell.com)

* Store University url ref

* used for getting view requests from different universities 

* @param: Certificate Information

* @return: 1 is Saved successfully else -1 

* */

exports.saveUniversityRef = function(request,response){
if(!request.body.token){
				var url = new UniversityRef();
			url.universityId = request.body.universityId;
			url.url = request.body.url;
			url.save(function(err){
				if(err){
					console.log(err);
					console.log("saveUniversityRef -- error saving UniversityRef");
					response.json(util.failure);
				}else{
					console.log("saveUniversityRef --  saved url");
					response.json(util.success);
				}
			});
}else{
	validateAdminLogin(request.body.token,function(login){
		if(!login){
			console.log("saveUniversityRef -- no login");
			response.json(util.unauth);
			return;
		}
		if(login.token){
			var url = new UniversityRef();
			url.universityId = request.body.universityId;
			url.url = request.body.url;
			url.save(function(err){
				if(err){
					console.log(err);
					console.log("saveUniversityRef -- error saving UniversityRef");
					response.json(util.failure);
				}else{
					console.log("saveUniversityRef --  saved url");
					response.json(util.success);
				}
			});
		}else{
			console.log("saveUniversityRef -- no token");
			response.json(util.unauth);
			return;
		}
	});
}
};	