/*jshint esversion: 6 */
var config = require("../Config/config"),
	Certificate = require("../Dao/universityDao").certificate,
	Batch = require("../Dao/universityDao").batch,
	UniversityLogin = require("../Dao/universityDao").universityLogin,
	Course = require("../Dao/universityDao").course,
	uuid = require("uuid/v1"),
	utils = require("../utils/util"),
	mailSender = require("../mailSender/mailSender"),
	UniversityUsers = require("../Dao/universityDao").universityUsers,
	mailbody = require("../mailSender/mailBody"),
	HashMap = require("hashmap"),
	PDFDocument = require('pdfkit'),
	blobStream = require('blob-stream'),
	async = require("async"),
	base64= require("base64-stream"),
	fs = require('fs');
const Cache = require("node-cache");
const tempCache = new Cache();
const universityCache = new Cache();
var unauth = {
	status: -2
};
var options = {
	host: config.issuerIp,
	port: config.issuerPort,
	path: "/login/validate",
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	}
};

/**
* @author: Vivek (Vivek@xanbell.com)

* Increase the pending Count

* method for Updating the pending status

* @param: takes current status as an argument 

* @return: updates the Status

* */

var increasePendingCount = function(err, data) {
	if (!err) {
		if (data) {
			if (!data.pending) {
				data.pending = 0;
			}
			data.pending++;
			data.save(function(err) {
				console.log("updated pending status");
			});
		}
	}else{
		console.log(err);
		console.log("increasePendingCount -- err");
	}
};
/**
* @author: Vivek (Vivek@xanbell.com)

* Decrease the pending Count

* method for Updating the pending status

* @param: takes current status as an argument 

* @return: updates the Status

* */

var decreasePendingCount = function(err, doc) {
	if (!err) {
		if (doc) {
			if (doc.pending) {
				doc.pending--;
			}
			doc.save(function(err) {
				console.log(err);
				console.log("error reducing pending");
			});
		}
	}
};

/**
* @author: Vivek (Vivek@xanbell.com)

* Roll Back Batch

* method for Removing the Batch

* @param: state of the function 

* @return: removes the batch

* */

var rollbackBatch = function (condition) {
	Batch.remove(condition,function (err) {
		if(err){
			console.log("rollbackBatch -- error rolling back batch");
			console.log(err);
		}else{
			console.log("rollbackBatch -- rolledback");
		}
	});
};

/**
* @author: Vivek (Vivek@xanbell.com)

* Roll Back Course

* method for Removing the Course

* @param: state of the function 

* @return: removes the Course

* */

var rollbackCourse = function (condition) {
	Course.remove(condition,function (err) {
		if(err){
			console.log("rollbackCourse -- error rolling back batch");
			console.log(err);
		}else{
			console.log("rollbackCourse -- rolledback");
		}
	});
};

/**
* @author: Vivek (Vivek@xanbell.com)

* Roll Back Certificate

* method for Removing the Certificate

* @param: state of the function 

* @return: removes the Certificate

* */

var rollbackCertificate = function (condition) {
	Certificate.remove(condition,function (err) {
		if(err){
			console.log("rollbackCertificate -- error rolling back batch");
			console.log(err);
		}else{
			console.log("rollbackCertificate -- rolledback");
		}
	});
};

/**
* @author: Vivek (Vivek@xanbell.com)

* Response of the http callback

* Status of the http call

* @param: ?? 

* @return: ??

* */

var httpResponseCallback = function (arg) { // todo
	if(arg && arg.status){
		if(arg.status > 0){
			console.log("http request sent");
		}else{
			console.log("http request Unsuccessful");
		}
	}else{
		console.log("httpRequest Unsuccessful");
	}
};
/*
----------------------------validate admin login ---------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Validate LOGIN

* method for validating user login

* @param: takes token as an argument 

* @return: if the login is valid or  not

* used for validating the user credentials

* */

var validateLogin = function(token, action) {
	if (!token) {
		console.log("validateLogin : no token found");
		action(null);
		return;
	}
	var login = null;
	if (token.token) {
		login = universityCache.get(token.token || " ");
		token = token.token;
		console.log('validateLogin : token found in cache');
	} else if(typeof token === "string"){
		login = universityCache.get(token || " ");
		console.log('validateLogin : token found in cache');
	}
	if (login && login.token) {
		action(login);
	} else {
		var flag = false;
		if (token.status&&token.password==="Tnai31!*7318wysa") {
			token = token.token;
			flag = true;
		}
		UniversityLogin.find({
				token: token||" "
			})
			.exec(function(err, docs) {
				if (err) {
					console.log("validateLogin-- error validating token ");
					console.log(err);
					action(null);
				} else if (!docs[0]) {
					action(null);
				} else if (!docs[0].tokenExpiry) {
					console.log("validateLogin-- no token expiry ");
					action(null);
				} else if (docs[0].tokenExpiry.getTime() < Date.now()) {
					if (docs[0].pending && flag) {
						action(docs[0]);
					} else {
						docs[0].token = null;
						docs[0].save(function(err) {
							if (err) {
								console.log("validateLogin-- error making the token null \n");
								console.log(err);
								action(null);
							}
						});
					}
				} else {
					console.log("validateLogin --  valid docs");
					var lkey = utils.getLkey();
					docs[0].emailId = utils.decrypt(docs[0].emailId, lkey);
					universityCache.set(token, docs[0]);
					action(docs[0]);
				}
			});
	}
};

/*
----------------------------validate admin login endpoint---------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Validate LOGIN

* method for validating user login

* @param: takes token as an argument 

* @return: if the login is valid or  not

* used for validating the user credentials

* */

exports.validateAdminLogin = function(request, response) {
	var pass = utils.getHash((request.body.token||" ").toString()+"gHgtYjNv52^512");
	if(pass !== request.body.password){
		console.log("validateAdminLogin --password not same");
		response.json(null);
		return;
	}
	validateLogin(request.body.token, function(login) {
		if(!login){
			console.log("validateAdminLogin --login not found");
			response.json(null);
			return;
		}
		if (login.token) {
			response.json(login);
			console.log("validateAdminLogin --login token found");
		} else {
			console.log("Validate Admin Login: Unsuccessful");
			response.json(null);
		}
	});
};

/*
----------------------------view certificate ---------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Send the certificates to the from end

* @param: takes certificate ID as an argument 

* @return: the decrypted form of the certificate

* */

exports.viewCertificate = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			response.json(utils.unauth);
			console.log("viewCertificate : no login");
			return;
		}
		if (!login.token && (login.role === "1"|| login.role === "2") ) {
			console.log("viewCertificate : no token");
			response.json(utils.unauth);
		} else if ((login.role === utils.issuerRole || login.role === utils.approverRole)) { 
			Certificate.findOne({
					_id: request.body.id||" "
				})
				.exec(function(err, data) {
					if (err) {
						console.log(err);
						console.log("viewCertificate --error in finding the Certificate");
						response.send(utils.failure);
					} else {
						var sk = data._id + utils.getHash(data._id.toString());
						var buf = Buffer.from(utils.decrypt(data.certificate, sk), 'base64');
						response.writeHead(200, {
							'Content-Type': 'application/pdf',
							'Content-disposition': 'attachment;filename=' + data.certificateName + ".pdf",
							'Content-Length': buf.length
						});
						response.end(buf);
					}
				});
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------university logout---------------------------------

*/

/**
* @author: Darshan (darshan@xanbell.com)

* University Logout

* @param: takes token as an argument 

* @return: Invalidates the token and clears the cache contents

* */

exports.universityLogout = function(request, response) {
	if (!request.body.token) {
		console.log("universityLogout : not token");
		response.json(utils.failure);
		return;
	}
	if (request.body.token.length === 0) {
		console.log("universityLogin : blank token");
		response.json(utils.failure);
		return;
	}
	universityCache.del(request.body.token);
	UniversityLogin.find({
			token: request.body.token||" "
		})
		.exec(function(err, docs) {
			if (err) {
				response.json(err);
				console.log("universityLogout -- error");
			} else if (!docs[0]) {
				console.log("universityLogout -- token not found");
				response.json(utils.success);
			} else {
				if (!docs[0].pending) {
					docs[0].token = null;
				}
				docs[0].logoutDate = new Date(Date.now());
				docs[0].save(function(err) {
					if (err) {
						console.log("UniversityLogout-- token not set to null");
						response.json(utils.failure);
					} else {
						console.log("UniveristyLogout-- logged out");
						response.json(utils.success);
					}
				});
			}
		});
};

/*
----------------------------get certificates ---------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Get All the Certificates

* @param: nill 

* @return: the list of certificates

* */

exports.getCertificates = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			response.json(utils.unauth);
			console.log("getCertificates : no login");
			return;
		}
		if (!login.token) {
			console.log(("getCertificates : no token"));
			response.json(utils.unauth);
		} else if((login.role === utils.issuerRole || login.role === utils.approverRole)){
			console.log("getCertificates -- start:authorized");
			Certificate.find({},function(error, data) {//todos
				if (error) {
					console.log("getCertificates -- error getting certificates");
					console.log(error);
					response.json(utils.failure);
				} else {
					for (var i = 0; i < data.length; i++) {
						var sk = data[i]._id + utils.getHash(data[i]._id.toString());
						data[i].certificate = null;
					}
					response.json(data);
				}
			});
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};


/*
----------------------------increment batch count ---------------------------------

*/

/**
* @author: Vivek (vivek@xanbell.com)

* Increments the batch count

* @param: takes Batch Information as an argument 

* @return: success of the count is incremented 

* Increments the Student Count in a batch

* */

exports.incrementBatchCount = function (request,response) {
	validateLogin(request.body.token,function (login) {
		if(!login){
			response.json(utils.unauth);
			console.log("incrementBatchCount : no login");
			return;
		}
		if(login.token && login.role === utils.creatorRole){
			var reqData = request.body.batchInfo || {};
			Batch.findOne({
					_id:request.body.id||" "
				}).exec(function (err,doc) {
				if(err){
					console.log(err);
					console.log("incrementBatchCount -- error getting documents");
					response.json(utils.failure);
				}else{
					doc.studentCount+=request.body.count||1;
					doc.save(function (err) {
						if(err){
							console.log("incrementBatchCount -- error incrementing batch count");
							console.log(err);
							response.json(utils.failure);
						}else{
							response.json(utils.success);
						}
					});
				}
			});
		}else{
			response.json(utils.unauth);
			console.log("incrementBatchCount -- no token or invalid User.");
			return;
		}
	});
};

/*
----------------------------Update Student count in Batch ---------------------------------

*/

/**
* @author: Darshan K (darshan@xanbell.com)

* Increments the Student count in a Batch

* @param: takes Batch Information as an argument 

* @return: success if the count is incremented 

* Increments the Student Count in a batch

* */

exports.UpdateStudentCountInBatch = function (request,response) {
	validateLogin(request.body.token,function (login) {
		if(!login){
			response.json(utils.unauth);
			console.log("UpdateStudentCountInBatch : no login");
			return;
		}
		if(login.token && login.role === utils.creatorRole){
			var reqData = request.body.institution || {};
			Batch.findOne({
					_id:request.body.institution.batchId||" "
				}).exec(function (err,doc) {
				if(err){
					console.log(err);
					console.log("UpdateStudentCountInBatch -- error getting documents");
					response.json(utils.failure);
				}else{
					doc.studentCount+=1;
					doc.save(function (err) {
						if(err){
							console.log("UpdateStudentCountInBatch -- error incrementing Student count");
							console.log(err);
							response.json(utils.failure);
						}else{
							response.json(utils.success);
						}
					});
				}
			});
		}else{
			response.json(utils.unauth);
			console.log("UpdateStudentCountInBatch -- no token or invalid User.");
			return;
		}
	});
};
/*
----------------------------create batch for students---------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Create Batch for a Student

* @param: takes Batch Information as an argument 

* @return: success if the batch is Created 

* */

var sendBlockChainRequest = function (data,options) {
	utils.httpRequest(data, options, httpResponseCallback);
};

exports.createBatchForStudent = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			response.json(utils.unauth);
			console.log("createBatchForStudent : no login");
			return;
		}
		if(!request.body.batchInfo.courseId){
			console.log("addCourse -- incomplete request");
			response.json(utils.incomplete);
			return;
		}
		if (login.token && login.role === utils.creatorRole) {
			var reqData = request.body.batchInfo || {};
			Batch.find({
					institutionName: reqData.instituteName||" ",
					courseId: reqData.courseId||" ",
					stream: reqData.stream||" ",
					year: reqData.year||" "
				})
				.exec(function(err, docs) {
					if (err) {
						console.log("createBatchForStudent -- error creating batch for student");
						console.log(err);
						response.json(utils.failure);
					} else {
						console.log("createBatchForStudent -- got batches");
						if (!docs.length) {
							var newBatch = new Batch();
							newBatch.institutionName = reqData.instituteName || "";
							newBatch.courseId = reqData.courseId || "";
							newBatch.stream = reqData.stream || "";
							newBatch.year = reqData.year || "";
							newBatch.institutionId = reqData.institutionId || "";
							newBatch.studentCount = 0;
							newBatch.universityId = login.universityId;
							newBatch.sendToApprover = false;
							newBatch.verified = false;
							newBatch.active = true;
							newBatch.verifyFlag = false;
							newBatch.rejectedCount = 0;
							newBatch.certificateCount = 0;
							options.host = config.blockChainIp;
							options.port = config.blockChainPort;
							options.path = "/add/batch";
							UniversityLogin.findOne({
									token: request.body.token.token||request.body.token||" "
								})
							.exec(increasePendingCount);
							newBatch.save(function(err) {
								if (err) {
									console.log("createBatchForStudent --error updating new batch");
									console.log(err);
									rollbackBatch({_id:newBatch._id});
									response.json(utils.failure);
								} else {
									console.log("createBatchForStudent -- batches saved");
									var blockChainData = {
										token: request.body.token,
										courseAddress:request.body.blockChainAddress,
										batchId: newBatch._id
									};
									if(!request.body.blockChainAddress){
										Course.findOne({
												_id: newBatch.courseId||" "
											})
											.exec(function(err, data) {
												console.log("createBatchForStudent -- found course");
												if (data) {
													blockChainData.courseAddress = data.blockChainAddress; 
													sendBlockChainRequest(blockChainData,options);
												}
											});
									}else{
										sendBlockChainRequest(blockChainData,options);
									}
									response.json(utils.success);
								}
							});
						} else {
							console.log("createBatchForStudent: batch already present");
							return response.json({status:1,batchAddress:docs[0].blockChainAddress,_id:docs[0]._id});
						}
					}
				});
		} else {
			console.log("createBatchForStudent : no token or invalid User");
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------get all batches for student ---------------------------------

*/
/**
* @author: Darshan (Darshan@xanbell.com)

* Gets the list of batches

* @param: token to validate 

* @return: Returns the list of batches 

* Returns the list of batches

* */

exports.getAllBatchesForStudents = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			console.log("getAllBatchesForStudents -- no login");
			response.json(utils.unauth);
			return;
		}
		if (!login.token) {
			console.log("getAllBatchesForStudents -- no token");
			response.json(utils.unauth);
		} else if((login.role === utils.creatorRole || login.role === utils.issuerRole)) {
			console.log("getAllBatchesForStudents -- start:authorized");
			Course.find({},function(err,docs){
				if(err){
					console.log("getAllBatchesForStudents -- Error in finding the Courses");
					response.json(utils.unauth);
				}else{
					var map = new HashMap();
					for( var i = 0;i<docs.length;i++){
						map.set(docs[i]._id.toString(),docs[i].courseName);
					}
					Batch.find({active:true},function(err, batches) {
						if (err) {
							console.log(err);
							console.log("getAllBatchesForStudents -- Error in finding the Batches");
							response.json(utils.failure);
						} else {
							for( var i = 0;i<batches.length;i++){
								batches[i].courseName = map.get(batches[i].courseId.toString());	
							}
							response.json(batches);
						}
					});
				}
			});
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------add certificate ---------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Adding Certificate for a Student

* method for Adding a Certificates to a Student

* @param: takes certificate parameters as an argument 

* @return: 1 if certificates are added successfully else -1

* */

exports.addCertificate = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			console.log("addCertificate -- no login");
			response.json(utils.unauth);
			return;
		}
		if (!login.token) {
			console.log("addCertificate -- no token");
			response.json(utils.unauth);
		} else if(login.role === utils.issuerRole) {
			console.log("addCertificate -- start:authorized");
			var base64Certificate = (request.files.files.data||"").toString('base64');
//			console.log(base64Certificate);
			var batchInfo = JSON.parse(request.body.batchInfo) || {},
				studentInformation = JSON.parse(request.body.studentInformation) || {};
			var certificateInformation = JSON.parse(request.body.certificateInformation) || {};			
			if(!batchInfo._id){
				console.log("addCourse -- incomplete request");
				response.json(utils.incomplete);
				return;
			}
			var type = request.files.files.name.split(".");
			var certificate = new Certificate();
			certificate.batchId = batchInfo._id || "";
			certificate.certificateName = certificateInformation.certificateName || "";
			certificate.certificateDescription = certificateInformation.certificateDescription || "";
			certificate.courseName = batchInfo.courseId || "";
			certificate.stream = batchInfo.stream || "";
			certificate.fileType = type[type.length - 1] || "";
			certificate.uploadedBy = login.universityUserId || "";
			certificate.verified = false;
			certificate.sendToApprover = false;
			certificate.universityId = login.universityId || "";
			certificate.institutionId = batchInfo.institutionId || "";
			certificate.institutionName = batchInfo.institutionName || "";
			certificate.courseName = batchInfo.courseName || "";
			certificate.streamName = batchInfo.stream || "";
			certificate.sendToApprover = true;
			certificate.batch = batchInfo.year || "";
			certificate.studentId = studentInformation._id || "";
			certificate.studentName = studentInformation.name || "";
			certificate.studentRollNumber = studentInformation.rollNumber || "";
			certificate.certificate = base64Certificate;
			certificate.certificateHashkey = utils.getHash(base64Certificate);
			certificate.save(function(err) {
				if (err) {
					console.log(err);
					console.log("addCertificate -- error sacing certificate");
					rollbackCertificate({_id:certificate._id});
					response.json(utils.failure);
				} else {
					var sk = certificate._id + utils.getHash(certificate._id.toString());
					certificate.studentId = certificate.studentId || "";
					certificate.certificate = utils.encrypt(certificate.certificate || "", sk);
					console.log("After encrypting")
						              fs.writeFile('abi.txt',certificate.certificate,()=>{
						               console.log('wrote into the file');
						             });
					certificate.save(function(err) {
						if (err) {
							console.log(err);
							console.log("addCertificate - error encrypting certificate");
							rollbackCertificate({_id:certificate._id});
							response.json(utils.failure);
						} else {
							console.log("addCertificate -- certificates encrypted and stored");
							Batch.findOne({
									_id:batchInfo._id||" "
								})
								.exec(function(err, batch) {
									if (err) {
										console.log(err);
										console.log("addCertificate -- error finding batches");
									} else {
										var flag = false;
										batch.sendToApprover = true;
										batch.verified = false;
										batch.verifyFlag = true;
										batch.rejectedCount = 0;
										batch.certificateCount += 1;
										batch.certificatesToBeSigned += 1;
										if(batch.certificateType.length===0&&certificateInformation.certificateDescription){
                                            batch.certificateType.push(certificateInformation.certificateDescription);                                          
                                        }else{                                          
                                            for(var i=0;i<batch.certificateType.length;i++){
                                                if(batch.certificateType[i]===certificateInformation.certificateDescription){
                                                    flag = false;
                                                    break;
                                                }else{
                                                    flag = true;
                                                }
                                            }
                                            if(flag){
                                                batch.certificateType.push(certificateInformation.certificateDescription);
                                            }
                                        }
										batch.save(function(err) {
											if (err) {
												console.log(err);
												console.log("addCertificate -- error saving batches");
											} else {
												request.body.certificate = base64Certificate;
												request.body.certificateHashkey = utils.getHash(base64Certificate);
												var data = request.body;
												options.port = config.studentPort;
												options.host = config.studentIp;
												options.path = "/assign";
												data.token = {token:data.token,url:data.url};
												utils.httpRequest(data, options,httpResponseCallback);

												console.log("addCertificate -- request sent to student");
												options.port = config.blockChainPort;
												options.host = config.blockChainIp;
												options.path = "/add/certificate";
												UniversityLogin.findOne({
													token: request.body.token.token||request.body.token||" "
												}).exec(increasePendingCount);
												utils.httpRequest({
													certificateHash: certificate.certificateHashkey,
													batchAddress: batch.blockChainAddress,
													token:request.body.token,
													url:data.url
												}, options, httpResponseCallback);
												console.log("addCertificate -- request sent to BlockChain");
											}
										});
									}
								});
							response.json(utils.success);
						}
					});
				}
			});
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
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

exports.resendCertificatesForApprover = function(request, response) {
	console.log("___________+_+_+_++___________");
	console.log(request.body.certificateInformation)
	console.log("Resend Called")
	validateLogin(request.body.token, function(login) {
		if(!login){
			console.log("resendCertificatesForApprover -- no login");
			response.json(utils.unauth);
			return;
		}
		if (!login.token) {
			console.log("resendCertificatesForApprover -- no token");
			response.json(utils.unauth);
			return;
		} else{
			var certInfo = JSON.parse(request.body.certificateInformation);
			var query = {
				_id: certInfo.batchId||" ",
			};
			console.log("___________")
			console.log(query)
			console.log("___________")
			Batch.findOne(query)
				.exec(function(err, batches) {
					if (err) {
						console.log("resendCertificatesForApprover -- Error in finding the batch for the Rejected Certificate");
						response.json(utils.failure);
						return;
					} else {
						console.log("Batches:");
						console.log(batches);
						batches.verified = false;
						batches.verifyFlag = false;
						batches.certificatesToBeSigned += 1;
						batches.save(function(err) {
							if (err) {
								console.log("resendCertificatesForApprover -- Error in saving the batches Info for Rejected Certificates");
								response.json(utils.failure);
							} else {
								Certificate.findOne({
										_id: certInfo._id||" "
									})
									.exec(function(err, certificates) {
										if (err) {
											console.log("resendCertificatesForApprover -- Error in finding the rejected certificates");
											response.json(utils.failure);
											return;
										} else {
											oldHashKey = certificates.certificateHashkey; 
											console.log("oldHashKey:"+oldHashKey)
											var base64Certificate = request.files.files.data.toString('base64');
											certificates.verified = false;
											certificates.sendToApprover = true;
											certificates.certificate = base64Certificate;
											certificates.certificateHashkey = utils.getHash(base64Certificate);
											certificates.certificateName = certInfo.certificateName;
											certificates.certificateDescription = certInfo.certificateDescription;
											certificates.save(function(err) {
												if (err) {
													console.log("resendCertificatesForApprover -- Error in resending the Certificates");
													response.json(utils.failure);
													return;
												} else {
													var sk = certificates._id + utils.getHash(certificates._id.toString());
													console.log("resendCertificatesForApprover -- Successfully Re-sent the Certificate");
													certificates.certificate = utils.encrypt(request.files.files.data.toString('base64'), sk);
													certificates.save(function(err) {
														if (err) {
															console.log(err);
															console.log("resendCertificatesForApprover -- Error in saving the encrypted Certificste");
															response.json(utils.failure);
														} else {
															request.body.certificate = base64Certificate;
															request.body.certificateName = certInfo.certificateName;
															request.body.certificateDescription = certInfo.certificateDescription;
															request.body.certificateHashkey = utils.getHash(base64Certificate);
															request.body.oldHashKey = oldHashKey;															
															var data = request.body;
															options.port = config.studentPort;
															options.host = config.studentIp;
															options.path = "/resend/studentCertificate";
															data.token = {token:data.token,url:data.url};
															utils.httpRequest(data, options,httpResponseCallback);
															response.json(utils.success);
														}
													});
												}
											});
										}
									});
							}
						});
					}
				});
		}
	});
};


/*
----------------------------month wise certificate approval ---------------------------------

*/

/**
* @author: Darshan (darshan@xanbell.com)

* Method to returning the number of certificates approved month wise

* @param: no parameters required 

* @return: count of certificates approved monthwise

* */


exports.certificateApprovalMonthWise = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			console.log("certificateApprovalMonthWise -- no login");
			response.json(utils.unauth);
			return;
		}
		if (!login.token) {
			console.log("certificateApprovalMonthWise --  no token");
			response.json(utils.unauth);
		} else if((login.role === utils.issuerRole || login.role === utils.approverRole)) {
			Certificate.aggregate([{
				$project: {
					month: {
						$month: "$createdOn"
					}
				}
			}, {
				$group: {
					_id: "$month",
					certificateCount: {
						$sum: 1
					},
					month: {
						$addToSet: {
							month: "$month"
						}
					}
				}
			}], function(err, result) {
				if (err) {
					console.log(err);
					console.log("certificateApprovalMonthWise -- Error in finding the Results");
					response.json(utils.failure);
				} else {
					response.json(result);
				}
			});
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------get certificates for batch ---------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Get Certificates for a batch

* method for fetching all the certificates in a particular batch

* @param: takes batch parameters as an argument 

* @return: all the certificates for a batch

* */
exports.getCertificatesForBatchAndInstitutionAndUniversity = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			console.log("getCertificatesForBatchAndInstitutionAndUniversity -- no login");
			response.json(utils.unauth);
			return;
		}
		if (!login.token) {
			console.log("getCertificatesForBatchAndInstitutionAndUniversity -- no tokn");
			response.json(utils.unauth);
			return;
		} else if((login.role === utils.issuerRole || login.role === utils.approverRole)){
			var query = {
				institutionId: request.body.batch.institutionId||" ",
				universityId: request.body.batch.unveristyId||" ",
				batch: request.body.batch.batchInfo||" ",
				courseName: request.body.batch.courseInfo||" ",
				sendToApprover: false
			};
			Certificate.find(query)
				.exec(function(err, certificates) {
					if (err) {
						console.log("getCertificatesForBatchAndInstitutionAndUniversity -- Error in finding the certificates");
						response.json(utils.failure);
					} else {
						for (var i = 0; i < certificates.length; i++) {
							var sk = certificates[i]._id + utils.getHash(certificates[i]._id.toString());
							certificates[i].studentName = utils.decrypt(certificates[i].studentName, sk);
							certificates[i].certificate = null;
						}
						response.json(certificates);
					}
				});
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------get rejected certificates for a batch ---------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Get rejected batches

* method for fetching all the rejected batches

* @param: takes batch parameters as an argument 

* @return: all the rejected batches

* */
exports.getRejectedBatches = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			console.log("getRejectedBatches -- no login");
			response.json(utils.unauth);
			return;
		}
		if (!login.token) {
			console.log("getRejectedBatches -- no token");
			response.json(utils.unauth);
		} else if((login.role === utils.issuerRole || login.role === utils.approverRole)){
			Batch.find({
					anyRejected: true
				})
				.exec(function(err, batches) {
					if (err) {
						console.log(err);
						console.log("getRejectedBatches -- Error in finding the rejected Batches");
						response.json(utils.failure);
					} else {
						response.json(batches);
					}
				});
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------get all verified certificates for a batch ---------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Get verified Certificates for a batch

* method for fetching all the verified certificates in a particular batch

* @param: takes batch parameters as an argument 

* @return: all the verified certificates for a batch

* */
exports.getAllVerifiedCertificatesForABatch = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			console.log("getAllVerifiedCertificatesForABatch -- no login");
			response.json(utils.unauth);
			return;
		}
		if (!login.token) {
			console.log("getAllVerifiedCertificatesForABatch -- no token");
			response.json(utils.unauth);
		} else if((login.role === utils.issuerRole || login.role === utils.approverRole)) {
			console.log(request.body);
			console.log("___________")
			var query = {
				batchId: request.body.batch._id,
				institutionId: request.body.batch.institutionId||" ",
				batch: request.body.batch.year||" ",
				courseName: request.body.batch.courseName||" ",
				verified: true
			};
			console.log(query);
			Certificate.find(query)
				.exec(function(err, certificates) {
					if (err) {
						console.log(err);
						console.log("getAllVerifiedCertificatesForABatch -- error in retreiving the rejected Certificates");
						response.json(utils.failure);
					} else {
						for (var i = 0; i < response.length; i++) {
							certificates[i].certificate = null;
						}
						response.json(certificates);
					}
				});
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------get certificates search ---------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Search operation

* method for fetching all the certificates for a given information

* @param: takes all search parameters as an argument 

* @return: all the matched certificates for a given data

* */
exports.getCertificatesForGivenInformation = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			console.log("getCertificatesForGivenInformation -- no login");
			response.json(utils.unauth);
			return;
		}
		if (!login.token) {
			console.log("getCertificatesForGivenInformation -- no token");
			response.json(utils.unauth);
			return;
		} else if((login.role === utils.approverRole)){
			var query = {};
			if (request.body.studentRollNumber) {
				query.studentRollNumber = new RegExp(request.body.studentRollNumber, "i");
			}
			if (request.body.studentName) {
				query.studentName = new RegExp(request.body.studentName, "i");
			}
			if (request.body.batch) {
				query.batch = request.body.batch;
			}
			if (request.body.courseName) {
				query.courseName = request.body.courseName;
			}
			if (request.body.stream) {
				query.stream = request.body.stream;
			}
			query.approved = true;
			Certificate.find(query)
				.exec(function(err, certificates) {
					if (err) {
						console.log("getCertificatesForGivenInformation -- error in finding the certificates");
						response.json(utils.unauth);
					} else {
						for (var i = 0; i < certificates.length; i++) {
							certificates[i].certificate = null;
						}
						response.json(certificates);
					}
				});
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------sign certificates ---------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com), Darshan (darshan@xanbell.com)

* Approve the certificates

* method for approving all the certificates of a batch

* @param: batch parameters whose certificates are to be signed 

* @return: 1 if all the certificates are signed successfully else -1

* */

exports.SignTheCertificates = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			console.log("SignTheCertificates -- no login");
			response.json(utils.unauth);
			return;
		}
		if (!login.token) {
			console.log("SignTheCertificates -- no token");
			response.json(utils.unauth);
		} else if((login.role === utils.approverRole)){
			console.log("SignTheCertificates -- start:authorized");
			var query = {
				batchId: request.body.certificates[0].batchInfo||" "
			};
			var rejectedCount = 0,setRejected,verified,blockChainReq = {};
			Certificate.find(query)
				.exec(function(err, certificates) {
					if (err) {
						console.log(err);
						console.log("SignTheCertificates -- error  getting certificate");
						response.json(utils.failure);
						return;
					}
					console.log("_______________________________________________")
					console.log(request.body.certificates);
					console.log("_______________________________________________")
					console.log("SignTheCertificates -- get certificates");
					var certificateMap = new HashMap();
					for (var i = 0; i < certificates.length; i++) {
						certificateMap.set(certificates[i]._id.toString(), certificates[i]);
					}
					var temp;
					async.eachSeries(request.body.certificates, function(certificate, asyncdone) {
						if (certificate.isCheckedApproved === true) {
							console.log(certificate.studentName);
							temp = certificateMap.get(certificate._id.toString());
							console.log("_______________________________________________");
							//console.log(temp)
							console.log("_______________________________________________");
							if (temp) {
								temp.verified = true;
								temp.approved = true;
								temp.verifyFlag = true;
								temp.verifiedOn = new Date();
								temp.verifiedBy = request.body.verifierId;
								blockChainReq[temp.studentId] = temp.blockChainAddress;
								temp.save(asyncdone);
							} else {
								console.log("SignTheCertificates -- error in finding the equivalent id in hashmap");
							}
						} else if (certificate.isChecked === true) {
							temp = certificateMap.get(certificate._id);
							if (temp !== null) {
								temp.rejectedComments = certificate.rejectComments;
								temp.approved = false;
								temp.verified = true;
								temp.verifyFlag = true;
								temp.verifiedOn = new Date();
								temp.verifiedBy = request.body.verifierId;
								setRejected = true;
								verified = true;
								++rejectedCount;
								temp.save(asyncdone);
							} else {
								console.log("SignTheCertificates -- error in finding the equivalent id in hashmap");
							}
						}
					}, function(err) {
						if (err) {
							console.log("SignTheCertificates -- error in saving the Certificates");
							console.log(err);
							response.json(utils.failure);
						} else {
							console.log('Sending to Student');
							options.host = config.studentIp;
							options.port = config.studentPort;
							options.path = "/sign/student/certificate";
							var studentRequest = request.body;
							studentRequest.token = { token:request.body.token,url:request.body.url };
							studentRequest.proof = "https://"+config.verifierProofIp+":"+config.verifierPort;
							studentRequest.batchId = request.body.certificates[0].batchInfo;
							utils.httpRequest(studentRequest,options,httpResponseCallback);
							console.log("SignTheCertificates -- request to Student");
							Batch.findOne({
								_id:request.body.certificates[0].batchInfo||" "
							}).exec(function(err, batch) {
								if (err || !batch) {
									console.log(err);
									console.log("SignTheCertificates -- Error in finding the Batch Information");
									response.json(utils.failure);
								} else {
									batch.certificatesToBeSigned -= 1;
									batch.verified = true;
									var data = {};
									data.batch = batch.blockChainAddress;
									data.certificates = blockChainReq;
									data.token = request.body.token;
									console.log("Sending to BlockChain");
									options.host = config.blockChainIp;
									options.port = config.blockChainPort;
									options.path = "/approve/certificate";
									UniversityLogin.findOne({token:request.body.token.token||request.body.token||" "}
										,increasePendingCount);
									utils.httpRequest(data, options,httpResponseCallback);
									if (setRejected === true) {
										batch.anyRejected = true;
										batch.rejectedCount = rejectedCount;
										batch.verifyFlag = true;
										batch.verified = true;
									}
									batch.verifyFlag = false;
									batch.save(function(err) {
										if (err) {
											console.log(err);
											console.log("SignTheCertificates -- error in saving Batch");
											response.json(utils.failure);
										} else {
											response.json(utils.success);
										}
									});
								}
							});

						}
					});
				});
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------get approved certificates ---------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Get all the approved Certificates

* method for fetching all the approved certificates 

* @param: takes token as an argument 

* @return: all the approved certificates

* */
exports.getApprovedCertificates = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			console.log("getApprovedCertificates -- no login");
			response.json(utils.unauth);
			return;
		}
		if (!login.token) {
			console.log("getApprovedCertificates -- no login");
			response.json(utils.unauth);
		} else if((login.role === utils.issuerRole || login.role === utils.approverRole)){
			Certificate.find({
					verified: true,
					approved: true
				})
				.exec(function(err, approvedCertificates) {
					if (err) {
						console.log("getApprovedCertificates -- error in getting the approved Certificates");
						console.log(err);
						response.json(utils.failure);
					} else {
						for (var i = 0; i < approvedCertificates.length; i++) {
							approvedCertificates[i].certificate = null;
						}
						response.json(approvedCertificates);
					}
				});
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};
/*
----------------------------get certificates for batch ---------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Certificates for the approves to approve

* method for fetching all the certificates to be approved by the approver

* @param: takes all batch parameters as an argument 

* @return: all the certificates for a given batch data

* */
exports.getCertificatesForBatchAndInstitutionAndUniversityForApprover = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			console.log("getCertificatesForBatchAndInstitutionAndUniversityForApprover -- no login");
			response.json(utils.unauth);
			return;
		}
		if (!login.token)  {
			console.log("getCertificatesForBatchAndInstitutionAndUniversityForApprover -- no token");
			response.json(utils.unauth);
		} else if((login.role === utils.approverRole)){
			console.log("getCertificatesForBatchAndInstitutionAndUniversityForApprover -- begin");
			var query = {
				batchId:request.body.batch._id||" ",
				sendToApprover: true,
				verified: false
			};
			Certificate.find(query)
				.exec(function(err, certificates) {
					if (err) {
						console.log("getCertificatesForBatchAndInstitutionAndUniversityForApprover -- Error in finding the certificates");
						response.json(utils.failure);
					} else {
						for (var i = 0; i < certificates.length; i++) {
							certificates[i].certificate = null;
						}
						response.json(certificates);
					}
				});
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};
/*
----------------------------send certificates to signer ---------------------------------

*/

/**
* @author: Darshan (darshan@xanbell.com)

* Issue Certificate

* method for issueing all the certificates to the approver

* @param: takes all the certificates to be sent to the approver as an argument 

* @return: 1 if all the certificates are sent to the approver else -1

* */

exports.sendCertificatesForSigner = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			console.log("sendCertificatesForSigner -- no login");
			response.json(utils.unauth);
			return;
		}
		if (!login.token)  {
			console.log("sendCertificatesForSigner -- no token");
			response.json(utils.unauth);
		} else if((login.role === utils.issuerRole)){
			console.log("sendCertificatesForSigner -- begin");
			var reqBatch = request.body.batch,req = request.body;
			var query = {
				institutionId: reqBatch.institutionId||" ",
				universityId: reqBatch.unveristyId||" ",
				batch: reqBatch.batchInfo||" ",
				courseName: reqBatch.courseInfo||" "
			};
			var batch = new Batch();
			batch.institutionName = req.instituteInfo;
			batch.institutionId = req.institutionId;
			batch.courseName = req.courseInfo;
			batch.year = req.batchInfo;
			batch.universityId = req.universityId;
			batch.sendToApprover = true;
			batch.verified = false;
			batch.verifyFlag = false;
			batch.rejectedCount = 0;
			Certificate.find(query)
				.exec(function(err, result) {
					if (err) {
						console.log("sendCertificatesForSigner -- Error in finding the records");
						response.json(utils.failure);
					} else {
						async.eachSeries(result, function(i, asyncdone) {
								i.sendToApprover = true;
								i.save(asyncdone);
							},
							function(err) {
								console.log(err);
							});
						batch.certificateCount = result.length;
						batch.save(function(error) {
							if (error) {
								console.log("sendCertificatesForSigner -- Error in saving Batch Info");
								console.log(error);
								response.json(utils.failure);
							} else {
								console.log("sendCertificatesForSigner -- Batch Info Saved");
								response.json(utils.success);
							}
						});
					}
				});
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};


/*
---------------------------- get batches not verified ---------------------------------

*/


/**
* @author: Darshan (darshan@xanbell.com)

* Get all batches that aren't verified

* method for fetching all the batches that are yet be verified

* @param: token 

* @return: all the batches that are yet be verified

* */

exports.getBatchesNotVerified = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			console.log("getBatchesNotVerified -- no login");
			response.json(utils.unauth);
			return;
		}
		if (!login.token)  {
			console.log("getBatchesNotVerified -- no token");
			response.json(utils.unauth);
		} else if((login.role === utils.approverRole)){
			Course.find({},function(err,docs){
				if(err){
					console.log("getAllBatchesForStudents -- Error in finding the Courses");
					response.json(utils.unauth);
				}else{
					var map = new HashMap();
					for( var i = 0;i<docs.length;i++){
						map.set(docs[i]._id.toString(),docs[i].courseName);
					}
					Batch.find({sendToApprover: true,verified:false},function(err, batches) {
						if (err) {
							console.log(err);
							console.log("getAllBatchesForStudents -- Error in finding the Batches");
							response.json(utils.failure);
						} else {
							for( var i = 0;i<batches.length;i++){
								batches[i].courseName = map.get(batches[i].courseId.toString());	
							}
							response.json(batches);
						}
					});
				}
			});
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};

/*
---------------------------- get approved certificates for batch ---------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Get all approved certificates for a batch

* method for fetching all the approved certificates for a batch

* @param: batch information 

* @return: all the approved certificates for a batch

* */
exports.getApprovedCertificatesForBatch = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			console.log("getApprovedCertificatesForBatch -- no login");
			response.json(utils.unauth);
			return;
		}
		if (!login.token)  {
			console.log("getApprovedCertificatesForBatch -- no token");
			response.json(utils.unauth);
		} else if((login.role === utils.issuerRole || login.role === utils.approverRole)){
			var query = {
				institutionId: request.body.institutionId||" ",
				batch: request.body.year||" ",
				courseName: request.body.courseName||" ",
				verified: true,
				approved: true
			};
			Certificate.find(query)
				.exec(function(err, result) {
					if (err) {
						console.log(err);
						console.log("error in retreiving the rejected Certificates");
						response.json(utils.failure);
					} else {
						for (var i = 0; i < result.length; i++) {
							result[i].certificate = null;
						}
						response.json(result);
					}
				});
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------get verified batches ---------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Get all verified batches

* method for fetching all the batches that are verified

* @param: token 

* @return: all the batches that are verified

* */
exports.getBatchesVerified = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			console.log("getBatchesVerified -- no login");
			response.json(utils.unauth);
			return;
		}
		if (!login.token)  {
			console.log("getBatchesVerified -- no login");
			response.json(utils.unauth);
			return;
		} else if((login.role === utils.issuerRole || login.role === utils.approverRole)){
			Course.find({},function(err,docs){
				if(err){
					console.log("getAllBatchesForStudents -- Error in finding the Courses");
					response.json(utils.unauth);
				}else{
					var map = new HashMap();
					for( var i = 0;i<docs.length;i++){
						map.set(docs[i]._id.toString(),docs[i].courseName);
					}
					Batch.find({verified: true},function(err, batches) {
						if (err) {
							console.log(err);
							console.log("getAllBatchesForStudents -- Error in finding the Batches");
							response.json(utils.failure);
						} else {
							for( var i = 0;i<batches.length;i++){
								batches[i].courseName = map.get(batches[i].courseId.toString());	
							}
							response.json(batches);
						}
					});
				}
			});
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};


/*
---------------------------- get courses for institute---------------------------------

*/
/**
* @author: Vivek (Vivek@xanbell.com)

* Get Courses of an institute

* method for fetching Courses of an institute

* @param: Institute Information 

* @return: Courses of an institute

* */

exports.getCoursesForInstitute = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			console.log("getCoursesForInstitute -- no login");
			response.json(utils.unauth);
			return;
		}
		if (!login.token)  {
			console.log("getCoursesForInstitute -- no token");
			response.json(utils.unauth);
		} else if((login.role === utils.creatorRole)){
			console.log("___________");
			console.log(request.body);
			console.log("___________")
			Course.find({
					instituteId: request.body.instituteId||" "
				})
				.exec(function(err, docs) {
					if (err) {
						console.log(err);
						console.log("getCoursesForInstitute -- error getting courses");
						response.json(utils.unauth);
					} else {
						console.log(docs);
						console.log("getCoursesForInstitute -- response sent");
						response.json(docs);
					}
				});
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------get university user per id ---------------------------------
s
*/

/**
* @author: Darshan (darshan@xanbell.com)

* Get university User for an id

* method for fetching the university User for a particular id

* @param: token, universityId

* @return: send all users of a university

* */

exports.getUniversityUserForId = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if (!login) {
			console.log("getUniversityUserForId -- no login");
			response.json(utils.unauth);
			return;
		}
		if (!login.token) {
			console.log("getUniversityUserForId -- no token");
			response.json(utils.unauth);
			return;
		}
		UniversityUsers.findOne({
				id: request.body.id||" "
			})
			.exec(function(err, users) {
				if (err) {
					console.log("getUniversityUserForId -- error getting users");
					console.log(err);
					response.json(utils.failure);
				} else {
					if (users) {
						var sk = users._id + utils.getHash(users._id.toString());
						users.name = utils.decrypt(users.name, sk);
						response.json(users);
					} else {
						response.json(utils.failure);
					}
				}
			});
	});
};


/*
---------------------------- university login ---------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Logging in into the university

* method for logging in into the university

* @param: token, login credentials

* @return: 1 if logged in successfully, else -1

* */
exports.universityLogin = function(request, response) {
	var login = new UniversityLogin();
	var data = request.body;
	var lkey = utils.getLkey();
	var receivedEmail = utils.encrypt(data.emailId, lkey);
	UniversityUsers.findOne({
			emailId: receivedEmail||" "
		})
		.exec(function(err, arg) {
			var pass = utils.encrypt(data.password||" ", utils.getHash(data.password)||" ");
			if (!arg) {
				response.json(utils.unauth);
				return;
			}
			if (arg.password !== pass) {
				response.json(utils.unauth);
				return;
			}
			if (arg.status || 1) { //todo
				console.log("valid Credentials");
				login.emailId = data.emailId;
				login.universityId = arg.universityId;
				login.role = arg.role;
				login.universityUserId = arg._id;
				login.loginIp = request.headers['x-forwarded-for'];
				var token = uuid().toString();
				login.token = token;
				login.access = [0];
				login.loginDate = new Date(Date.now());
				//login.otp = utils.generateOTP().toString();
				login.otp = 12345;
				var time = Date.now() + 600000;
				tempCache.set(token, login, time / 1000);
				var sk = arg._id + utils.getHash(arg._id.toString());
				var mailOptions = mailbody.otp;
				mailOptions.to = data.emailId;
				mailOptions.text = login.otp;
				mailSender.sendMail(mailOptions);
				response.json({
					token: token,
					name: utils.decrypt(arg.name, sk),
					id: arg._id,
					universityId: login.universityId,
					universityName: utils.decrypt(arg.universityName, sk),
					universityUrl : utils.decrypt(arg.universityUrl, sk),
					role: arg.role
				});
			} else {
				response.json(utils.unauth);
			}
		});
};
/*
---------------------------- validate university otp ---------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Validating the OTP

* method for checking if the right OTP was entered?

* @param: token, OTP

* @return: 1 if OTP is correct, else -1

* */
exports.validateUniversityOTP = function(request, response) {
	if (!request.body.token) {
		response.json(utils.unauth);
		return;
	}
	var login = tempCache.get(request.body.token);
	tempCache.del(request.body.token);
	if (login.token) {
		if (!login.otp) {
			response.json(utils.unauth);
			return;
		}
		if (login.otp === request.body.otp) {
			var time = 0;
			tempCache.del(login.token);
			time = Date.now() + 86400000;
			login.tokenExpiry = new Date(time);
			universityCache.set(login.token, login, time / 1000);
			login.emailId = utils.encrypt(login.emailId, login.universityId + utils.getHash(login.loginDate.toString()));
			login.save(function(err) {
				if (err) {
					console.log("validateUniversityOTP -- error logging user in");
					console.log(err);
					response.json(utils.unauth);
				} else {
					console.log("validateUniversityOTP -- successful login by user");
					response.json(utils.success);
				}
			});

		} else {
			console.log("validateUniversityOTP -- invalid OTP");
			response.json(utils.unauth);
		}
	} else {
		console.log("validateUniversityOTP -- invalid");
		response.json(utils.unauth);
	}
};
/*
----------------------------------------------Create Course-----------------------------------
*/
/**
* @author: Vivek (Vivek@xanbell.com)

* Add a Course

* method for Adding a course for an institute

* @param: Course Details

* @return: 1 if the course is added successfully else -1

* */

exports.addCourse = function(request, response) {
	console.log(request.body);
	validateLogin(request.body.token, function(login) {
		if(!login){
			console.log('addCourse -- no login');
			response.json(utils.unauth);
			return;
		}
/*		if(!request.body.InstituteAddress){
			console.log("addCourse -- incomplete request");
			response.json(utils.incomplete);
			return;
		}
*/		if (login.token && login.role === utils.creatorRole) {
			var newCourse = new Course();
			newCourse.universityId = request.body.universityId || "";
			newCourse.instituteId = request.body.institutionId || "";
			newCourse.enable = true;
			newCourse.courseName = request.body.courseName || "";
			newCourse.streams = request.body.streams;
			options.host = config.blockChainIp;
			options.port = config.blockChainPort;
			options.path = "/add/course";
			if (newCourse.universityId && newCourse.courseName) {
				newCourse.save(function(err) {
					if (err) {
						console.log(err);
						console.log('addCourse -- error saving new course');
						response.json(utils.failure);
					} else {
						utils.httpRequest({
							token: request.body.token,
							courseName: newCourse._id,
							InstituteAddress: request.body.InstituteAddress || ""
						}, options,httpResponseCallback);
						console.log("addCourse -- course added");
					}
				});
				UniversityLogin.findOne({
						token: request.body.token.token||request.body.token||" "
					})
					.exec(increasePendingCount);
				response.json(utils.success);
			} else {
				console.log("addCourse : no adequate data");
				response.json(utils.failure);
			}
		} else {
			console.log("addCourse : no token or Invalid User");
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------------------------Update BlockChain Adress in Course-----------------------------------
*/
/**
* @author: Vivek (Vivek@xanbell.com)

* Update Course in the Block Chain

* method for updating Course of an institute in block chain 

* @param: ??

* @return: ??

* */

exports.updateCourseBlockChainAddress = function(request, response) {
	console.log("updateCourseBlockChainAddress --  update process started");
	var pass = utils.getHash(request.body.token+"wr1234512#!@$f1");
	if(pass !== request.body.password){
		response.json(utils.unauth);
		console.log("updateCourseBlockChainAddress -- wrong password");
		return;
	}
	validateLogin({
		token: request.body.token,
		status: true,
		password:"Tnai31!*7318wysa"
	}, function(login) {
		if (!login) {
			console.log("updateCourseBlockChainAddress -- no login");
			response.json(utils.unauth);
			return;
		}
		if (login.token) {
			Course.findOne({
					_id: request.body._id||" "
				})
				.exec(function(err, doc) {
					if (err) {
						console.log("updateCourseBlockChainAddress -- error updating transaction id for course");
						console.log(err);
						response.json(utils.failure);
					} else {
						if (doc) {
							if (!doc.blockChainAddress) {
								doc.blockChainAddress = request.body.address;
							}
							doc.save(function(err) {
								if (err) {
									console.log("updateCourseBlockChainAddress -- error saving updated record");
									response.json(utils.failure);
								} else {
									response.json(utils.success);
								}
							});
							UniversityLogin.findOne({
									token: request.body.token||" "
								})
								.exec(decreasePendingCount);
						} else {
							console.log("updateCourseBlockChainAddress -- document not found");
							response.json(utils.failure);
						}
					}
				});
		} else {
			console.log("updateCourseBlockChainAddress -- no token");
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------------------------Update BlockChain Adress in Batch-----------------------------------
*/
/**
* @author: Vivek (Vivek@xanbell.com)

* Update Batch in the Block Chain

* method for updating Batch in block chain 

* @param: ??

* @return: ??

* */

exports.updateBatchBlockChainAddress = function(request, response) {
	console.log("updateBatchBlockChainAddress -- update process started");
	var pass = utils.getHash(request.body.token+"wr1234512#!@$f1");
	if(pass !== request.body.password){
		response.json(utils.unauth);
		console.log("updateBatchBlockChainAddress -- wrong password");
		return;
	}
	validateLogin({
		token: request.body.token,
		status: true,
		password:"Tnai31!*7318wysa"
	}, function(login) {
		if (!login) {
			console.log("updateBatchBlockChainAddress -- no login");
			response.json(utils.unauth);
			return;
		}
		if (login.token) {
			Batch.findOne({
					_id: request.body._id||" ",
					blockChainAddress: {
						$in: ["", null]
					}
				})
				.exec(function(err, doc) {
					if (err) {
						console.log("updateBatchBlockChainAddress --error updating transaction id for university");
					} else {
						if (doc) {
							doc.blockChainAddress = request.body.address;
							doc.save(function(err) {
								if (err) {
									console.log("updateBatchBlockChainAddress --error saving updated record");
								} else {
									response.json(utils.success);
								}
							});
							UniversityLogin.findOne({
									token: request.body.token||" "
								})
								.exec(decreasePendingCount);
						} else {
							console.log("updateBatchBlockChainAddress --document not found");
							response.json(utils.failure);
						}
					}
				});
		} else {
			console.log("unauth");
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------------------------Update BlockChain Adress in Certificate-----------------------------------
*/
/**
* @author: Vivek (Vivek@xanbell.com)

* Update Certificate in the Block Chain

* method for updating Certificate in block chain 

* @param: ??

* @return: ??

* */

exports.updateCertificateBlockChainAddress = function(request, response) {
	var pass = utils.getHash(request.body.token+"wr1234512#!@$f1");
	if(pass !== request.body.password){
		response.json(utils.unauth);
		console.log("updateCertificateBlockChainAddress -- wrong password");
		return;
	}
	console.log("updateCertificateBlockChainAddress -- update process started");
	validateLogin({
		token: request.body.token.token,
		status: true,
		password:"Tnai31!*7318wysa"
	}, function(login) {
		if (!login) {
			console.log("updateCertificateBlockChainAddress -- no login");
			response.json(utils.unauth);
			return;
		}
		if (login.token ) {
			Certificate.findOne({
					certificateHashkey: request.body._id||" ",
					blockChainAddress: {
						$in: ["", null]
					}
				}) 
				.exec(function(err, doc) {
					if (err) {
						console.log("updateCertificateBlockChainAddress -- error updating transaction id for certificate");
						console.log(err);
						response.json(utils.failure);
					} else {
						if (doc) {
							if (!doc.blockChainAddress) {
								doc.blockChainAddress = request.body.address;
								doc.save(function(err) {
									if (err) {
										console.log("updateCertificateBlockChainAddress -- error saving updated record");
									}
								});
								options.path = "/update/certificate/address";
								options.host = config.studentIp;
								options.port = config.studentPort;
								utils.httpRequest(request.body, options, function(arg) {
									UniversityLogin.findOne({
											token: request.body.token||" "
										})
										.exec(decreasePendingCount);
								});
							}
							response.json(utils.success);
						} else {
							console.log("updateCertificateBlockChainAddress -- document not found");
							response.json(utils.failure);
						}
					}
				});
		} else {
			console.log("updateCertificateBlockChainAddress -- no token");
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------------------------Delete Certificate-----------------------------------
*/
/**
* @author: Darshan (darshan@xanbell.com)

* Delete the certificate

* Delete the certificates from the bulk upload for various reasons

* @param: batch information

* @return: returns 1 if the certificates are deleted successfully else -1

* */

exports.deleteCertificates = function(request,response){
	validateLogin(request.body.token,function (login) {
		if (!login) {
			console.log("deleteCertificates -- no login");
			response.json(utils.unauth);
			return;
		}
		if(!login.token){
			console.log("deleteCertificates -- no token");
			response.json(utils.unauth);
			return;
		}
		else if(login.role === utils.issuerRole ){
			var deleteQuery = {
		        institutionId: JSON.parse(request.body.batchInfo).institutionId,
		        throughFileUpload:true,
		        courseName: JSON.parse(request.body.batchInfo).courseName,
		        batch: JSON.parse(request.body.batchInfo).year,
		        stream: JSON.parse(request.body.batchInfo).stream,
		        sendToApprover: false
		    };
		    Certificate.remove(deleteQuery)
		    .exec(function(err,result){
		        if(err){
		            console.log("deleteCertificates -- Error in removing the Certificates");
		            console.log(err);
		            response.json(utils.failure);            
		        }else{
		            console.log("deleteCertificates -- Certificates removed Successfully");
		            response.json(utils.success);            
		        }
		    });
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------------------------Get Uploaded Files -----------------------------------
*/
/**
* @author: Vivek (Vivek@xanbell.com)

* Get the Uploaded Certificates

* method for getting the uploaded certificates 

* @param: Token to validate

* @return: return the uploaded Certificates

* */

exports.getUploadedCertificates = function (request,response) {
	validateLogin(request.body.token,function (login) {
		if (!login) {
			console.log("getUploadedCertificates -- no login");
			response.json(utils.unauth);
			return;
		}
		if(!login.token){
			console.log("getUploadedCertificates -- unauthorized");
			response.json(utils.unauth);
			return;
		}
		else if((login.role === utils.issuerRole)){
			var loginInfo = JSON.parse(request.body.loginInfo);
			var certificateMap = new HashMap(),transactionId = uuid().toString(),files = request.files.files;
			if(!files){
				response.json(utils.unauth);
				console.log("getUploadedCertificates -- no files uploaded");
				return;
			}
			if(!files.length){
				certificateMap.set(files.name.split(".")[0],files.data.toString('base64'));
			}else{				
				for (var i = files.length - 1; i >= 0; i--) {
					certificateMap.set(files[i].name.split(".")[0],files[i].data.toString('base64'));
				}
			}
			var batchInfo = JSON.parse(request.body.batchInfo),certInfo = JSON.parse(request.body.certificateInformation);
			var lkey = utils.getLkey();
			options.host = config.studentIp;
			options.port = config.studentPort;
			options.path = "/get/students/batch";
			utils.httpRequest({token:{token:loginInfo.token,url:loginInfo.url},batchInfo:batchInfo},options,function (docs) {
				if(!docs || docs.status){
					console.log("getUploadedCertificates -- error getting students for file");
					response.json(utils.failure);
				}else{
					console.log("getUploadedCertificates -- got list of students");
					var date = new Date(Date.now());
					async.eachSeries(docs,function (doc,asyncdone) {
						var base64Certificate = certificateMap.get(doc.rollNumber||" ".toString());
						if(base64Certificate){
							var type = ".pdf";
							var certificate = new Certificate();
							certificate.batchId = batchInfo._id;
							certificate.certificateName = certInfo.certificateName;
							certificate.certificateDescription = certInfo.certificateDescription;
							certificate.fileType = type;
							certificate.certificate = base64Certificate;
							certificate.certificateHashkey = utils.getHash(base64Certificate);
							certificate.studentId = doc._id;
							certificate.studentRollNumber = doc.rollNumber;
							certificate.studentName = doc.name;
							certificate.transactionId = transactionId;
							certificate.universityId = login.universityId;
							certificate.institutionId = batchInfo.institutionId;
							certificate.institutionName = batchInfo.institutionName;
							certificate.sendToApprover = false;                                    
							certificate.institutionId = batchInfo.institutionId;
							certificate.createdOn = date;
							certificate.courseName = batchInfo.courseName || "";
							certificate.streamName = batchInfo.stream || "";
							certificate.uploadedBy = login.universityUserId || "";
							certificate.batch = batchInfo.batch || "";
							certificate.save(function(err,doc){
								if(err){
									console.log(err);
								}else{
									console.log("encrypt");
									var sk = doc._id+utils.getHash(doc._id.toString());
									doc.certificate = utils.encrypt(doc.certificate,sk);
									doc.save(asyncdone);
								}
							});
						}else{
							console.log("Match Not Found");
						}
					},function (err) {
						if(err){
							console.log("getUploadedCertificates -- error saving all certificates");
							console.log(err);
							var s = utils.failure;
							var sDate = date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear();
							s.transactionId = transactionId;
							s.date = sDate;
							s.time = date.toTimeString();
							response.json(s);
						}else{
							console.log("getUploadedCertificates -- completed saving certificates");
							Certificate.find({transactionId:transactionId||" "})
								.exec(function (err,docs) {
									if(err){
										console.log("getUploadedCertificates -- error getting certificates");
										console.log(err);
										response.json(utils.unauth);
									}else{
										for(var it = 0;it<docs.length;it++){
											docs[it].certificate = "";
										}
										var sDate = date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear();
										response.json({docs:docs,date:sDate,time:date.toTimeString(),transactionId:transactionId});
									}
								});
						}
					});
				}
			});
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------------------------Get Uploaded certificates -----------------------------------
*/
/**
* @author: Vivek (Vivek@xanbell.com)

* Send the Uploaded Certificates

* method for sending the uploaded certificates 

* @param: Token to validate

* @return: send the uploaded Certificates

* */
exports.sendUploadedFiles =  function (request,response) {
	validateLogin(request.body.token,function (login) {
		if(!login){
			console.log("sendUploadedFiles -- no login");
			response.json(utils.unauth);
			return;
		}
		if(!login.token){
			console.log("sendUploadedFiles -- no token");
			response.json(utils.unauth);
			return;
		}
		else if((login.role === utils.issuerRole)){
			Certificate.find({transactionId:request.body.transactionId||" "},function (err,docs) {
				if(err){
					console.log("sendUploadedFiles -- error getting certificates");
					console.log(err);
					response.json(utils.failure);
				}else{
					for (var i = docs.length - 1; i >= 0; i--) {
						var sk = docs[i]._id+utils.getHash(docs[i]._id);
						docs[i]._id = null;
						docs[i].certificate = utils.decrypt(docs.certificate,sk);
					}
					response.json(docs);
				}
			});
		}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------------------------Send Uploaded Certificates For Signer-----------------------------------
*/
/**
* @author: Vivek (Vivek@xanbell.com)

* ??

* ?? 

* @param: ??

* @return: ??

* */

exports.confirmMassUpload = function (request,response) {
	console.log(request.body);
	validateLogin(request.body.token,function (login) {
		if(!login){
			console.log("confirmMassUpload -- unauthenticated");
			response.json(utils.unauth);
			return;
		}
		if(!login.token){
			console.log("confirmMassUpload -- unauth login");
			response.json(utils.unauth);
			return;
		}
		options.host = config.studentIp;
		options.port = config.studentPort;
		options.path = "/get/uploaded";
		var certs = [];
		Certificate.find({transactionId:request.body.transactionId||" "},function(err,docs){
			if(err){
				console.log("confirmMassUpload -- http request didnt return data");
				response.json(utils.failure);
				return;
			}else{
				console.log("confirmMassUpload -- certificate found");
				async.eachSeries(docs,function (doc,asyncdone) {
					var sk = doc._id+utils.getHash(doc._id);
					doc.verified = false;
                    doc.sendToApprover = true;
                    doc.save(asyncdone);
                    doc.certificate = utils.decrypt(doc.certificate,sk);
                    certs.push(doc);
				},function (err) {
					if(err){
						console.log("confirmMassUpload -- error saving ");
						console.log(err);
						response.json(utils.failure);
					}else{
						Batch.findOne({
                            	_id:request.body.batchId
                            },function (err,batch) {
							if(err){
								console.log("confirmMassUpload -- error getting batch");
								console.log(err);
								response.json(utils.failure);
							}else{
								console.log("confirmMassUpload -- Batch Information...");
                                batch.universityId = request.body.universityId;
                                batch.sendToApprover = true;
                                batch.verified = false;
                                batch.verifyFlag = true;
                                batch.rejectedCount = 0;
                                batch.certificateCount += certs.length;
                                batch.certificateType.push(docs[0].certificateDescription);                                          
                                batch.save(function(err) {
                                    if (err) {
                                        console.log(err);
                                        console.log("confirmMassUpload -- error saving batch");
                                        response.json(utils.failure);
                                    } else {
                                        console.log("confirmMassUpload -- Batch Saved Successfully");
                                        options.host = config.studentIp;
                                        options.port = config.studentPort;
                                        //todo change path
                                        options.path = "/save/MassUploadedCertificates";
                                        var studentRequest = {
                                        	token:{
                                        		token:request.body.token,
                                        		url:request.body.url
                                        	},
                                        	certificates:certs,
                                        	url:request.body.url
                                        };
                                        utils.httpRequest(studentRequest,options,function (resp) {
                                            console.log("confirmMassUpload -- data send to student");
                                            options.host = config.blockChainIp;
                                            options.port = config.blockChainPort;
                                            options.path = "/massUploadCertificates/blockchain";
                                            var massUploadCertificates = {
                                            	token: {
	                                            		token:request.body.token,
		                                        		url:request.body.url
                                            	},
                                            	certificates : certs,
                                            	batchAddress : request.body.batchAddress
                                            }
                                            utils.httpRequest(massUploadCertificates,options,function(response){
                                            	console.log("Saved in Blockchain");
    	                                        //response.json({status:1});
	                                        })                                            
                                        });
                                        response.json({status:1});
                                    }
                                });
							}
						});
					}
				});
			}
		});
	});
};

/*
---------------------------------------------- Cencel Mass upload -----------------------------------
*/

exports.cancelMassUpload = function(request,response){
	validateLogin(request.body.token,function(login){
		if(login && login.token){
			console.log("cancelMassUpload --success");
			rollbackCertificate({transactionId:request.body.transactionId});
			response.json(utils.success);
		}else{
			console.log("cancelMassUpload -- unauth");
			response.json(utils.unauth);
		}
	});
};

/*
---------------------------------------------- Batch passed out -----------------------------------
*/
/**
* @author: Vivek (Vivek@xanbell.com)

* ??

* ?? 

* @param: ??

* @return: ??

* */

exports.passOutBatchForId = function(request,response){
	validateLogin(request.body.token,function(login){
		if(!login){
			console.log("passOutBatchForId : no login");
			response.json(utils.unauth);
			return;
		}
		if(!login.token){
			console.log("passOutBatchForId : no token");
			response.json(utils.unauth);
			return;
		}
		else if(login.role === utils.approverRole){
		Batch.findOne({_id:request.body.id||" "},function(err,doc){
			if(err){
				console.log(err);
				console.log("passOutBatchForId : error getting batches");
				response.json(utils.failure);
				return;
			}else{
				doc.active = false;
				doc.save(function(err){
					if(err){
						console.log("passOutBatchForId : error saveing batch");
						response.json(utils.failure);
					}else{
						console.log("passOutBatchForId : batch updated");
					}
				});
			}
		});	
	}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------------------------get course by id -----------------------------------
*/

exports.getCourseForId = function(request,response){
	validateLogin(request.body.token,function(login){
		if(!login){
			console.log("getCourseForId : no login");
			response.json(utils.unauth);
			return;
		}
		if(!login.token){
			console.log("getCourseForId : no token");
			response.json(utils.unauth);
			return;
		}
		Course.findOne({_id:request.body.id||" "},function(err,doc){
			if(err){
				console.log(err);
				console.log("getCourseForId : error getting batches");
				response.json(utils.failure);
				return;
			}else{
				console.log("getCourseForId : got course");
				response.json(doc);
			}
		});	
	});
};


exports.UpdateMassUploadCount = function(request,response){
	Batch.findOne({blockChainAddress:request.body.batchAddress}).exec(function(err,BatchInfo){
		if(err){
			console.log("error in finding the Batch Information");
			console.log(err);
		}else{
			BatchInfo.studentCount += request.body.studentCount;
			BatchInfo.save(function(err){
				if(err){
					console.log(err);
					console.log("Error in saving Batch Address");
				}else{
					console.log("Student Count Updated in Batch");
					response.json({status:1});
				}
			})
		}
	})
}

exports.MassCreationCertificate = function(request,response){
	validateLogin(JSON.parse(request.body.loginInfo).token,function (login) {
		if(!login){
			console.log("previewCertificate -- no login");
			response.json(utils.unauth);
			return;
		}
		if(!login.token){
			response.json(utils.unauth);
			console.log("previewCertificate -- no token");
			return;
		}else if((login.role === utils.issuerRole)){
				var CertificatesToBeSent = [];
				var batchInformation = JSON.parse(request.body.batchInfo);
				var certificateInformation = JSON.parse(request.body.certificateInformation);
				var loginInformation = JSON.parse(request.body.loginInfo);
				console.log(certificateInformation)
				options.port = config.studentPort;
				options.host = config.studentIp;
				var transactionId = uuid().toString();
				var token = {};
				token.token = loginInformation.token;
				token.url = loginInformation.url;
				options.path = "/get/students/batch";
				_id={}
				_id = batchInformation._id; 
			    utils.httpRequest({token:token,batchInfo:{_id}},options,function (arg) {
			    	console.log("StudentInformation");
					async.eachSeries(arg, function(a, asyncdone) {
						var doc = new PDFDocument();
						var stream = doc.pipe(blobStream());
						doc.pipe(fs.createWriteStream('Certificate - ' + a.name + '.pdf'));// todo
						doc.font('Times-Roman', 'Chalkboard-Bold')
							.fontSize(25)
							.fillColor('teal')
							.text(certificateInformation.universityInformation, 120, 30);
						doc.image('./Capture.png', 250, 60);
						doc.font('Times-Roman')
							.fontSize(22)
							.fillColor('teal')
							.text(certificateInformation.certificateContent1, 240, 225);
						doc.font('fonts/Merriweather-Regular.ttf')
							.fontSize(27)
							.fillColor('black')
							.text(a.name, 210, 255);
						doc.font('Times-Roman')
							.fontSize(22)
							.fillColor('teal')
							.text(certificateInformation.certificateContent2, 120, 300);
						doc.font('fonts/Alegreya-Bold.ttf')
							.fontSize(27)
							.fillColor('olive')
							.text(certificateInformation.selectedCourseInContent, 275, 320);
						doc.font('Times-Roman')
							.fontSize(22)
							.fillColor('teal')
							.text(certificateInformation.certificateContent3, 140, 370);
						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('teal')
							.text(("University Seat Number "), 50, 480, {
								continued: true
							});
						doc.fillColor('teal')
							.text(":", 60, 480, {
								continued: true
							});
						doc.fillColor('black')
							.text(certificateInformation.universityNumber, 75, 480, {
								width: 100,
								align: 'justify'
							});
						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('teal')
							.text(("Subject "), 50, 510, {
								continued: true
							});
						doc.fillColor('teal')
							.text(":", 193.5, 510, {
								continued: true
							});
						doc.fillColor('black')
							.text(certificateInformation.selectedStreamInContent, 210, 510, {
								width: 100,
								align: 'justify'
							});
						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('teal')
							.text(("Class"), 50, 540, {
								continued: true
							});
						doc.fillColor('teal')
							.text(":", 216, 540, {
								continued: true
							});
						doc.fillColor('black')
							.text(certificateInformation.selectedClass, 231, 540, {
								width: 100,
								align: 'justify'
							});
						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('teal')
							.text("Given under the seal of the University", 140, 600);
						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('teal')
							.text(certificateInformation.city, 50, 640);
						doc.font('Times-Roman')
							.fontSize(20)
							.fillColor('teal')
							.text(("Date: "), 50, 695, {
								continued: true
							});
						doc.fillColor('black')
							.text(certificateInformation.awardedDate, {
								width: 100,
								align: 'justify'
							});
						doc.font('Times-Roman')
							.fontSize(18)
							.fillColor('teal')
							.text("VICE CHANCELLOR", 325, 695);
						doc.end();		
						var cert = new Certificate();

						cert.batchId = batchInformation._id;
						cert.certificateName = certificateInformation.certificateName;
						cert.certificateDescription = certificateInformation.certificateDescription;
						cert.courseName = batchInformation.courseId;
						cert.fileType = "pdf";
						cert.transactionId = transactionId;
						cert.uploadedBy = login.universityUserId;
						cert.universityId = login.universityId;
						cert.institutionId = batchInformation.institutionId;
						cert.courseName = batchInformation.courseName;
						cert.streamName = batchInformation.stream;
						cert.batch = batchInformation.year;
						cert.studentId = a._id;
						cert.studentName = a.name;
						cert.studentRollNumber = a.rollNumber;
						cert.certificate = doc.toString("base64");
						cert.certificateHashkey = utils.getHash(doc.toString("base64"));
						cert.save(function(err) {
								var sk = cert._id + utils.getHash(cert._id.toString());
								cert.studentId = cert.studentId || "";
								cert.certificate = utils.encrypt(cert.certificate || "", sk);
								CertificatesToBeSent.push(cert);
								cert.save(asyncdone);
							
						});
					},function(err){
						console.log("Created all the Certificates");
						console.log(CertificatesToBeSent);
						response.json({CertificatesToBeSent,transactionId:transactionId});
					})
			});
		}else{
			console.log("Invalid Operator-- User not Authorized to call this Function");
			json.response({status:-2})
		}
	})
}
/*
----------------------------preview certificate ---------------------------------

*/
/**
* @author: Darshan (darshan@xanbell.com)

* Creating a certificate for a Student

* @param: the certificate content as an argument 

* @return: the created certificate

* */
exports.previewCertificate = function(request, response) {
	validateLogin(request.body.token,function (login) {
		if(!login){
			console.log("previewCertificate -- no login");
			response.json(utils.unauth);
			return;
		}
		if(!login.token){
			response.json(utils.unauth);
			console.log("previewCertificate -- no token");
			return;
		}else if((login.role === utils.issuerRole)){
				var doc = new PDFDocument();
				var stream = doc.pipe(blobStream());
				var certificateInformation = JSON.parse(request.body.certificateInformation);
				doc.pipe(fs.createWriteStream('Certificate - ' + certificateInformation.selectedStudentInContent + '.pdf'));// todo
				doc.font('Times-Roman', 'Chalkboard-Bold')
					.fontSize(25)
					.fillColor('teal')
					.text(certificateInformation.universityInformation, 120, 30);
				doc.image('./Capture.png', 250, 60);
				doc.font('Times-Roman')
					.fontSize(22)
					.fillColor('teal')
					.text(certificateInformation.certificateContent1, 240, 225);
				doc.font('fonts/Merriweather-Regular.ttf')
					.fontSize(27)
					.fillColor('black')
					.text(certificateInformation.selectedStudentInContent, 210, 255);
				doc.font('Times-Roman')
					.fontSize(22)
					.fillColor('teal')
					.text(certificateInformation.certificateContent2, 120, 300);
				doc.font('fonts/Alegreya-Bold.ttf')
					.fontSize(27)
					.fillColor('olive')
					.text(certificateInformation.selectedCourseInContent, 275, 320);
				doc.font('Times-Roman')
					.fontSize(22)
					.fillColor('teal')
					.text(certificateInformation.certificateContent3, 140, 370);
				doc.font('Times-Roman')
					.fontSize(20)
					.fillColor('teal')
					.text(("University Seat Number "), 50, 480, {
						continued: true
					});
				doc.fillColor('teal')
					.text(":", 60, 480, {
						continued: true
					});
				doc.fillColor('black')
					.text(certificateInformation.universityNumber, 75, 480, {
						width: 100,
						align: 'justify'
					});
				doc.font('Times-Roman')
					.fontSize(20)
					.fillColor('teal')
					.text(("Subject "), 50, 510, {
						continued: true
					});
				doc.fillColor('teal')
					.text(":", 193.5, 510, {
						continued: true
					});
				doc.fillColor('black')
					.text(certificateInformation.selectedStreamInContent, 210, 510, {
						width: 100,
						align: 'justify'
					});
				doc.font('Times-Roman')
					.fontSize(20)
					.fillColor('teal')
					.text(("Class"), 50, 540, {
						continued: true
					});
				doc.fillColor('teal')
					.text(":", 216, 540, {
						continued: true
					});
				doc.fillColor('black')
					.text(certificateInformation.selectedClass, 231, 540, {
						width: 100,
						align: 'justify'
					});
				doc.font('Times-Roman')
					.fontSize(20)
					.fillColor('teal')
					.text("Given under the seal of the University", 140, 600);
				doc.font('Times-Roman')
					.fontSize(20)
					.fillColor('teal')
					.text(certificateInformation.city, 50, 640);
				doc.font('Times-Roman')
					.fontSize(20)
					.fillColor('teal')
					.text(("Date: "), 50, 695, {
						continued: true
					});
				doc.fillColor('black')
					.text(certificateInformation.awardedDate, {
						width: 100,
						align: 'justify'
					});
				doc.font('Times-Roman')
					.fontSize(18)
					.fillColor('teal')
					.text("VICE CHANCELLOR", 325, 695);
				doc.end();
				doc.pipe(response);
			}else{
			console.log("Invalid User -- Operation not defined for this user");
			response.json(utils.unauth);
		}
	});
};

exports.SendMassCreatedCertificate = function(request,response){
	console.log(request.body);
	validateLogin(request.body.loginInfo.token,function (login) {
		if(!login){
			console.log("confirmMassUpload -- unauthenticated");
			response.json(utils.unauth);
			return;
		}
		if(!login.token){
			console.log("confirmMassUpload -- unauth login");
			response.json(utils.unauth);
			return;
		}
		options.host = config.studentIp;
		options.port = config.studentPort;
		options.path = "/get/uploaded";
		var certs = [];
		Certificate.find({transactionId:request.body.transactionId||" "},function(err,docs){
			if(err){
				console.log("confirmMassUpload -- http request didnt return data");
				response.json(utils.failure);
				return;
			}else{
				console.log("confirmMassUpload -- certificate found");
				async.eachSeries(docs,function (doc,asyncdone) {
					var sk = doc._id+utils.getHash(doc._id);
					doc.verified = false;
                    doc.sendToApprover = true;
                    doc.save(asyncdone);
                    doc.certificate = utils.decrypt(doc.certificate,sk);
                    certs.push(doc);
				},function (err) {
					if(err){
						console.log("confirmMassUpload -- error saving ");
						console.log(err);
						response.json(utils.failure);
					}else{
						Batch.findOne({
                            	_id:request.body.batchInfo._id
                            },function (err,batch) {
							if(err){
								console.log("confirmMassUpload -- error getting batch");
								console.log(err);
								response.json(utils.failure);
							}else{
								console.log("confirmMassUpload -- Batch Information...");
                                batch.universityId = request.body.batchInfo.universityId;
                                batch.sendToApprover = true;
                                batch.verified = false;
                                batch.verifyFlag = true;
                                batch.rejectedCount = 0;
                                batch.certificateCount += certs.length;
                                batch.certificatesToBeSigned += certs.length;
                                batch.certificateType.push(docs[0].certificateDescription);                                          
                                batch.save(function(err) {
                                    if (err) {
                                        console.log(err);
                                        console.log("confirmMassUpload -- error saving batch");
                                        response.json(utils.failure);
                                    } else {
                                        console.log("confirmMassUpload -- Batch Saved Successfully");
                                        options.host = config.studentIp;
                                        options.port = config.studentPort;
                                        //todo change path
                                        options.path = "/save/MassUploadedCertificates";
                                        var studentRequest = {
                                        	token:{
                                        		token:request.body.loginInfo.token,
                                        		url:request.body.loginInfo.url
                                        	},
                                        	certificates:certs,
                                        	url:request.body.loginInfo.url
                                        };
                                        utils.httpRequest(studentRequest,options,function (resp) {
                                            console.log("confirmMassUpload -- data send to student");
                                            options.host = config.blockChainIp;
                                            options.port = config.blockChainPort;
                                            options.path = "/massCertificate/creationsBlockchain";
                                            var massUpdateCertificates = {
                                            	token:{
	                                        		token:request.body.loginInfo.token,
	                                        		url:request.body.loginInfo.url                                            		
                                            	},
	                                        	certificates:certs,
	                                        	batchAddress:request.body.batchInfo.blockChainAddress
                                            }
                                            utils.httpRequest(massUpdateCertificates,options,function(response){
                                            	console.log("Saved in Blockchain");
    	                                        response.json(utils.success);
	                                        })
                                        });
                                    }
                                });
							}
						});
					}
				});
			}
		});
	});	
}
exports.UniversityMassUploadCertificateUpdateCertificateAddress = function(request,response){
	console.log("_______________________________________________");
	console.log("UniversityMassUploadCertificateUpdateCertificateAddress");
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
				if(i==certificateList.length){
					response.json({status:1});
				}
			}			
		}
	})	
}