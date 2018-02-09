/*jshint esversion: 6 */
var config = require("../Config/Config");
var dataService = require("../data/dataService");
const Cache = require('node-cache');
var University = require("../Dao/universityDao").university,
	Student = require("../Dao/universityDao").student,
	Institution = require("../Dao/universityDao").institution,
	AdminLogin = require("../Dao/universityDao").adminLogin,
	ApplicationUsers = require("../Dao/universityDao").applicationUsers,
	Course = require("../Dao/universityDao").course,
	//UniversityUsers = require("../Dao/universityUsers"),
	uuid = require("uuid/v1"),
	utils = require("../utils/util"),
	mailSender = require("../mailSender/mailSender"),
	mailbody = require("../mailSender/mailBody"),
	crypto = require("crypto"),
	async = require("async");
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
				if (err) {
					console.log(err);
					console.log("error reducing pending");
				} else {
					console.log("updated pending count");
				}
			});
		}
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
				if (err) {
					console.log(err);
					console.log("error reducing pending");
				} else {
					console.log("updated pending count");
				}
			});
		}
	}
};
/**
* @author: Vivek (Vivek@xanbell.com)

* Roll Back University

* method for Removing the University

* @param: state of the function 

* @return: removes the University

* */

var rollbackUniversity = function (condition) {
	University.remove(condition,function (err) {
		if(err){
			console.log(err);
			console.log("error deleting University");
		}else{
			console.log("university removed");
		}
	});
};
/**
* @author: Vivek (Vivek@xanbell.com)

* Roll Back Institute

* method for Removing the Institute

* @param: state of the function 

* @return: removes the Instutute

* */

var rollbackInstitute = function (condition) {
	Institution.remove(condition,function (err) {
		if(err){
			console.log(err);
			console.log("error deleting institute");
		}else{
			console.log("institution deleted");
		}
	});
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
		return null;
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


var validateConsumerLogin = function (token,action) {
	if(token&&token.url&&token.token){
		var split = getHostAndPort(token.url);
		if(split&&split.url&&split.port){
			options.host = split.url;
			options.port = split.port;
			options.path = "/check/login";
			utils.httpRequest({token:token},options,function (login) {
				action(login);
				return;
			});
		}else{ 
			console.log("validateConsumerLogin -- url format wrong");
			action(null);
		}
	}else{
		console.log("validateConsumerLogin -- no token or url");
		action(null);
	}		
};

/*
----------------------------------------------- Admin Login -----------------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Logging in into the Admin Application

* method for logging in into the Application

* @param: token, login credentials

* @return: 1 if logged in successfully, else -1

* */
exports.adminLogin = function(request, response) {
	var data = request.body;
	var login = new AdminLogin();
	var token = "";
	console.log("Admin Login");
	try {
		var lkey = utils.getLkey();
		var receivedEmail = utils.encrypt(data.emailId, lkey);
		ApplicationUsers.find({
				emailId: receivedEmail||" "
			})
			.exec(function(err, docs) {
				if (err) {
					console.log("AdminLogin-- error finding emailId in database");
					console.log(err);
					response.json(utils.failure);
				}
				if (docs.length === 1) {
					var pass = utils.encrypt(data.password || " ", utils.getHash(data.password || " "));
					if (docs[0].password === pass) {
						console.log("valid Credentials");
						login.emailId = data.emailId;
						login.universityId = docs[0].universityId;
						login.applicationUserId = docs[0]._id;
						login.loginIp = request.headers['x-forwarded-for'] ||
							request.connection.remoteAddress ||
							request.socket.remoteAddress ||
							request.connection.socket.remoteAddress;
						token = uuid().toString();
						login.token = token;
						login.access = [0];
						login.loginDate = new Date(Date.now());
						login.otp = 12345;
						var time = Date.now() + 600000;
						tempCache.set(token, login, time / 1000);
						var sk = docs[0]._id + utils.getHash(docs[0]._id.toString());
						var mailOptions = mailbody.otp;
						mailOptions.to = data.emailId;
						mailOptions.text = login.otp;
						mailSender.sendMail(mailOptions);
						response.json({
							token: token,
							name: utils.decrypt(docs[0].name, sk),
							encryptedemailId: docs[0].emailId,
							universityId: login.universityId
						});
					} else {
						console.log("invalid password");
						response.json(utils.unauth);
					}
				} else {
					console.log('Logging docs');
					console.log("operation not Authorized");
					response.json(utils.unauth);
				}
			});
	} catch (e) {
		response.json(utils.unauth);
		console.log(e);
	}
};

/*
----------------------------------------------- Validate OTP -----------------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Validating the OTP

* method for checking if the right OTP was entered?

* @param: token, OTP

* @return: 1 if OTP is correct, else -1

* */
exports.validateOTP = function(request, response) {
	if (!request.body.token) {
		response.json(utils.unauth);
		console.log("validateOTP no token");
		return;
	}
	var login = tempCache.get(request.body.token);
	if (login) {
		if (login.otp === request.body.otp) {
			var time = 0;
			universityCache.del(login.token);
			time = Date.now() + 86400000;
			login.tokenExpiry = new Date(time);
			universityCache.set(login.token, login, time / 1000);
			ApplicationUsers.findOne({
					_id: login.applicationUserId||" "
				})
				.exec(function(err, docs) {
					login.emailId = docs.emailId;
					docs.loginCount += 1;
					login.save(function(err) {
						if (err) {
							console.log("error logging user in");
							response.json(utils.failure);
						} else {
							console.log("successful login by user");
							response.json(utils.success);
							docs.save(function(err) {
								if (err) {
									console.log("error saving logincount");
									console.log(err);
								} else {
									console.log("data sent");
								}
							});
						}
					});
				});

		} else {
			console.log("invalid OTP");
			response.json(utils.unauth);
		}
	} else {
		console.log("invalid");
		response.json(utils.unauth);
	}
};
/*
----------------------------------------------- Admin Logout -----------------------------------------

*/

/**
* @author: Darshan (darshan@xanbell.com)

* University Logout

* @param: takes token as an argument 

* @return: Invalidates the token and clears the cache contents

* */

exports.adminLogout = function(request, response) {
	if (!request.body.token) {
		console.log("no token");
		response.json(utils.failure);
		return;
	}
	universityCache.del(request.body.token);
	AdminLogin.find({
			token: request.body.token||" "
		})
		.exec(function(err, docs) {
			if (err) {
				response.json(err);
				console.log("error");
			} else if (!docs[0]) {
				console.log("token not found");
			} else {
				if (!docs[0].pending) {
					docs[0].token = null;
				}
				docs[0].logoutDate = new Date(Date.now());
				docs[0].save(function(err) {
					if (err) {
						console.log("University Logout-- token not set to null");
						response.json(utils.failure);
					} else {
						console.log("Univeristy Logout-- logged out");
						response.json(utils.success);
					}
				});
			}
		});
};

/*
----------------------------------------------- Validate Login -----------------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Validate LOGIN

* method for validating user login

* @param: takes token as an argument 

* @return: if the login is valid or  not

* used for validating the user credentials

* */
var validateLogin = function(token, action) {
	if (!token) {
		action(null);
		return;
	}
	var login = null;
	if(typeof token === "string"){
		login = universityCache.get(token || " ");
		//console.log('validateLogin : token found in cache');
	}
	if (login && login.token) {
		action(login);
	} else {
		var flag = false;
		if (token.status&&token.password==="Tnai31!*7318wysa") {
			token = token.token;
			flag = true;
		}
		AdminLogin.findOne({
				token: token||" "
			})
			.exec(function(err, doc) {
				if (err) {
					console.log("unable to find token -- validateLogin");
					action(null);
				} else {
					if (doc) {
						if (!doc.tokenExpiry) {
							action(null);
							return;
						}
						if (doc.tokenExpiry.getTime() < Date.now()) {
							if (flag && doc.pending) {
								action(doc);
							} else {
								doc.token = null;
								doc.save(function(err) {
									if (err) {
										console.log('error setting token to null');
									}
								});
							}
						} else {
							var lkey = utils.getLkey();
							doc.emailId = utils.decrypt(doc.emailId, lkey);
							universityCache.set(token, doc);
							action(doc);
							return;
						}
					} else {
						console.log("no documents found -- validateLogin");
						action(null);
					}
				}
			});
	}
};

/*
----------------------------------------------- Check Login Token -----------------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Check LOGIN

* method for checking user login

* @param: takes token as an argument 

* @return: if the login is valid or  not

* used for checking the user credentials

* */

exports.checkLogin = function(request, response) {
	var pass = utils.getHash(request.body.token.toString()+"gHgtYjNv52^512");
	if(pass !== request.body.password){
		console.log("validateAdminLogin --password not same");
		response.json(null);
		return;
	}
	validateLogin(request.body.token, function(login) {
		if(!login){
			response.json(null);
			return;
		}
		if (login.token) {
			response.json({
				status: true,
				token: true
			});
		} else {
			response.json(null);
		}
	});
};

/*
----------------------------------------------- Get Universities -----------------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Getting the list of universities

* method for fetching the list of universities

* @param: takes token as an argument 

* @return: list of universities

* */

exports.getUniversities = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			response.json(utils.unauth);
			return;
		}
		if (login.token) {
			var lkey = utils.getLkey();
			University.find({
				enable: true
			},function(err, univ) {
				if (err) {
					console.log("getUniversities -- error getting universities");
					console.log(err);
					response.json(utils.failure);
				} else {
					for (var i = 0; i < univ.length; i++) {
						var sk = univ[i]._id + utils.getHash(univ[i]._id.toString());
						univ[i].name = utils.decrypt(univ[i].name, sk);
						univ[i].city = utils.decrypt(univ[i].city, sk);
						univ[i].address = utils.decrypt(univ[i].address, sk);
						univ[i].pincode = utils.decrypt(univ[i].pincode, sk);
						univ[i].state = utils.decrypt(univ[i].state, sk);
						univ[i].primaryContactName = utils.decrypt(univ[i].primaryContactName, sk);
						univ[i].primaryContactNumber = utils.decrypt(univ[i].primaryContactNumber, sk);
						univ[i].primaryEmailId = utils.decrypt(univ[i].primaryEmailId, lkey);
						univ[i].universityNumber = utils.decrypt(univ[i].universityNumber, sk);
						univ[i].primaryDesignation = utils.decrypt(univ[i].primaryDesignation, sk);
						univ[i].universityUrl = utils.decrypt(univ[i].universityUrl,lkey);
					}
					response.json(univ);
				}
			});
		} else {
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------------------------- Get Institutions -----------------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Getting the list of Institutions

* method for fetching the list of Institutions

* @param: takes token as an argument 

* @return: list of Institutions

* */
exports.getInstitutions = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			response.json(utils.unauth);
			return;
		}
		if (login.token) {
			var num = 1;
			var lkey = utils.getLkey();
			Institution.find({
				enable: true
			}, function(err, insti) {
				if (err) {
					console.log(err);
					console.log("updateUniversity -- error getting university");
					response.json(utils.failure);
				} else {
					for (var i = 0; i < insti.length; i++) {
						var sk = insti[i]._id + utils.getHash(insti[i]._id.toString());
						insti[i].instituteName = utils.decrypt(insti[i].instituteName, sk);
						insti[i].city = utils.decrypt(insti[i].city, sk);
						insti[i].address = utils.decrypt(insti[i].address, sk);
						insti[i].pincode = utils.decrypt(insti[i].pincode, sk);
						insti[i].state = utils.decrypt(insti[i].state, sk);
						insti[i].primaryContactName = utils.decrypt(insti[i].primaryContactName, sk);
						insti[i].primaryContactNumber = utils.decrypt(insti[i].primaryContactNumber, sk);
						insti[i].primaryDesignation = utils.decrypt(insti[i].primaryDesignation, sk);
						insti[i].primaryEmailId = utils.decrypt(insti[i].primaryEmailId, lkey);
						insti[i].instituteNumber = utils.decrypt(insti[i].instituteNumber, sk);
						insti[i].universityId = utils.decrypt(insti[i].universityId, sk);
					}
					response.json(insti);
				}
			});
		} else {
			response.json(utils.unauth);
		}
	});
};

/*
----------------------------------------------- Update UNiversity -----------------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Updating the university

* method for Updating the university

* @param: university to be updated 

* @return: 1 if updated successfully else -1

* */

exports.updateUniversity = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			response.json(utils.unauth);
			return;
		}
		if (login.token) {
			console.log('Update University');
			var lkey = utils.getLkey();
			University.find({
				_id: request.body.id||" ",
			}).exec(function(err, univ) {
				if (err) {
					console.log(err);
					console.log("updateUniversity -- error getting university");
					response.json(utils.failure);
				} else {
					var sk = univ[0]._id + utils.getHash(univ[0]._id.toString());
					console.log('University fetched');
					univ[0].address = request.body.address ? utils.encrypt(request.body.address, sk) : univ[0].address;
					univ[0].primaryContactName = request.body.primaryContactName ? utils.encrypt(request.body.primaryContactName, sk) : univ[0].primaryContactName;
					univ[0].primaryContactNumber = request.body.primaryContactNumber ? utils.encrypt(request.body.primaryContactNumber.toString(), sk) : univ[0].primaryContactNumber;
					univ[0].primaryEmailId = request.body.primaryEmailId ? utils.encrypt(request.body.primaryEmailId, lkey) : univ[0].primaryEmailId;
					univ[0].city = request.body.city ? utils.encrypt(request.body.city, sk) : univ[0].city;
					univ[0].state = request.body.state ? utils.encrypt(request.body.state, sk) : univ[0].state;
					univ[0].pincode = request.body.pincode ? utils.encrypt(request.body.pincode.toString(), sk) : univ[0].pincode;
					univ[0].universityUrl = request.body.url?utils.encrypt(request.body.url,lkey):univ[0].universityUrl;
					univ[0].save(function(err) {
						if (err) {
							console.log("updateUniversity -- error updating university");
							console.log(err);
							response.json(utils.failure);
						} else {
							console.log('updateUniversity -- Successfully updated');
							response.json(utils.success);
						}
					});
				}

			});
		} else {
			response.json(utils.unauth);
		}
	});
};
/*
----------------------------------------------- Update Institutions -----------------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Updating the Institution

* method for Updating the Institution

* @param: Institute to be updated 

* @return: 1 if updated successfully else -1

* */
exports.updateInstitute = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			response.json(utils.unauth);
			return;
		}
		if (login.token) {
			console.log('Update Institution');
			var lkey = utils.getLkey();
			Institution.find({
				_id: request.body.id||" ",
			}).exec(function(err, insti) {
				if (err) {
					response.json(err);
				} else {
					var sk = insti[0]._id + utils.getHash(insti[0]._id.toString());
					console.log('Institute fetched ');
					insti[0].address = request.body.address ? utils.encrypt(request.body.address, sk) : insti[0].address;
					insti[0].primaryContactName = request.body.primaryContactName ? utils.encrypt(request.body.primaryContactName, sk) : insti[0].primaryContactName;
					insti[0].primaryContactNumber = request.body.primaryContactNumber ? utils.encrypt(request.body.primaryContactNumber.toString(), sk) : insti[0].primaryContactNumber;
					insti[0].primaryDesignation = request.body.primaryDesignation ? utils.encrypt(request.body.primaryDesignation, sk) : insti[0].primaryDesignation;
					insti[0].primaryEmailId = request.body.primaryEmailId ? utils.encrypt(request.body.primaryEmailId, lkey) : insti[0].primaryEmailId;
					insti[0].city = request.body.city ? utils.encrypt(request.body.city, sk) : insti[0].city;
					insti[0].state = request.body.state ? utils.encrypt(request.body.state, sk) : insti[0].state;
					insti[0].pincode = request.body.pincode ? utils.encrypt(request.body.pincode.toString(), sk) : insti[0].pincode;
					insti[0].save(function(err) {
						if (err) {
							console.log("updateInstitute -- error updating institute");
							console.log(err);
							response.json(utils.failure);
						} else {
							console.log('Successfully updated');
							response.json(insti[0]);
						}

					});
				}

			});
		} else {
			response.json(utils.unauth);
		}
	});
};
/*
----------------------------------------------- Delete Institutions -----------------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Delete the Institute

* method for Deleting the Institute

* @param: Institute to be deleted 

* @return: 1 if deleted successfully else -1

* */

exports.deleteInstitute = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			response.json(utils.unauth);
			return;
		}
		if (login.token) {
			console.log('Delete Institution');
			var lkey = utils.getLkey();
			Institution.find({
				_id: request.body._id||" ",
			}).exec(function(err, insti) {
				if (err) {
					response.json(err);
				} else {
					insti[0].enable = false;
					insti[0].save(function(err) {
						if (err) {
							console.log(err);
							console.log("deleteInstitute -- error deleting institution");
							response.json(utils.failure);
						} else {
							console.log('Successfully updated');
							response.json(insti[0]);
						}

					});
				}

			});
		} else {
			response.json(utils.unauth);
		}
	});
};
/*
----------------------------------------------- Delete Univerity -----------------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Delete the University

* method for Deleting the university

* @param: University to be deleted 

* @return: 1 if deleted successfully else -1

* */
exports.deleteUniversity = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			response.json(utils.unauth);
			return;
		}
		if (login.token) {
			console.log('Delete University');
			var lkey = utils.getLkey();
			University.findOne({
				_id: request.body._id||" ",
			}).exec(function(err, univ) {
				if (err || !univ) {
					console.log(err);
					console.log(univ);
					console.log("error deleting university");
				} else {
					univ.enable = false;
					Institution.update({
						universityId: univ._id
					}, {
						$set: {
							enable: false
						}
					}, function(argument) {
						console.log("deleteUniversity -- institutions updated");
					});
					var uUrl = utils.decrypt(univ.universityUrl,lkey);
					uUrl = getHostAndPort(uUrl);
					options.host = uUrl.url;
					options.port = uUrl.port;
					options.path = "/disable/university/user";
					utils.httpRequest({
						token: request.body.token,
						_id: univ._id
					}, options, function(arg) {
						if (arg) {
							if (arg.status >= 0) {
								console.log("deleteUniversity -- users updated");
							}
						}
					});
					univ.save(function(err) {
						if (err) {
							console.log(err);
							console.log("deleteUniversity -- error in saving university");
							response.json(utils.failure);
						} else {
							response.json(utils.success);
						}
					});
				}
			});
		} else {
			response.json(utils.unauth);
		}
	});
};
/*
----------------------------------------------- Add University -----------------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Add the University

* method for Adding the university

* @param: University Details 

* @return: 1 if added successfully else -1

* */

exports.addUniversity = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			response.json(utils.unauth);
			return;
		}
		if (login.token) {
			console.log("Add University");
			var lkey = utils.getLkey();
			var university = new University();
			university.primaryEmailId = utils.encrypt((request.body.primaryEmailId || " ").toString(), lkey);
			university.save(function(err, data) {
				if (err) {
					console.log(err);
					console.log("Couldn't save");
					response.json(utils.failure);
					rollbackUniversity({_id:data._id});
				} else {
					var sk = university._id + utils.getHash(university._id.toString());
					university.name = utils.encrypt(request.body.name || "", sk).toString();
					university.address = utils.encrypt(request.body.address || "", sk).toString();
					university.primaryContactName = utils.encrypt(request.body.primaryContactName || "", sk).toString();
					university.primaryContactNumber = utils.encrypt(request.body.primaryContactNumber || "", sk).toString();
					university.primaryDesignation = utils.encrypt(request.body.primaryDesignation || "", sk).toString();
					university.universityNumber = utils.encrypt(request.body.universityNumber || "", sk).toString();
					university.city = utils.encrypt(request.body.city || "", sk).toString();
					university.state = utils.encrypt(request.body.state || "", sk).toString();
					university.pincode = utils.encrypt(request.body.pincode || "", sk).toString();
					university.universityUrl = request.body.url?utils.encrypt(request.body.url,lkey):undefined;
					options.host = config.studentIp;
					options.port = config.studentPort;
					options.path = "/update/univref";
					utils.httpRequest({
						universityId:university._id,
						url:university.universityUrl,
						token:request.body.token
					},options,function(temp){
						console.log("url updated in student");
						console.log(temp);
					});
					AdminLogin.findOne({
							token: request.body.token||" "
						})
						.exec(increasePendingCount);
					university.enable = true;
					university.save(function(err) {
						if (err) {
							response.json(utils.failure);
							console.log(err);
							console.log("addUniversity -- error saving University");
							rollbackUniversity({_id:university._id});
						} else {
							console.log("University Added:");
							options.host = config.blockChainIp;
							options.port = config.blockChainPort;
							options.path = "/add/university";
							utils.httpRequest({
								token: request.body.token,
								_id: university._id
							}, options, function(arg) {
								console.log("block chain create triggered");
								console.log(arg);
							});
							response.json(utils.success);
						}
					});
				}
			});
		} else {
			response.json(utils.unauth);
		}
	});
};

exports.AddMultipleUniversities = function(request,response) {
			console.log("Add University");
			var lkey = utils.getLkey();
			var Data = dataService.getUniversityData()
			console.log(Data);
			var universityIds = [];
			async.eachSeries(Data, function(universityList,asyncdone){
				console.log("________")
				console.log(universityList);
				console.log("________")
			var university = new University();
			university.primaryEmailId = utils.encrypt((universityList.primaryEmailId || " ").toString(), lkey);
			university.save(function(err, data) {
				if (err) {
					console.log(err);
					console.log("Couldn't save");
					response.json(utils.failure);
				} else {
					universityIds.push(university._id)
					var sk = university._id + utils.getHash(university._id.toString());
					university.name = utils.encrypt(universityList.name || "", sk).toString();
					university.address = utils.encrypt(universityList.address || "", sk).toString();
					university.primaryContactName = utils.encrypt(universityList.primaryContactName || "", sk).toString();
					university.primaryContactNumber = utils.encrypt(universityList.primaryContactNumber || "", sk).toString();
					university.primaryDesignation = utils.encrypt(universityList.primaryDesignation || "", sk).toString();
					university.universityNumber = utils.encrypt(universityList.universityNumber || "", sk).toString();
					university.city = utils.encrypt(universityList.city || "", sk).toString();
					university.state = utils.encrypt(universityList.state || "", sk).toString();
					university.pincode = utils.encrypt(universityList.pincode || "", sk).toString();
					university.universityUrl = universityList.universityUrl?utils.encrypt(universityList.universityUrl,lkey):undefined;
					options.host = config.studentIp;
					options.port = config.studentPort;
					options.path = "/update/univref";
					utils.httpRequest({
						universityId:university._id,
						url:university.universityUrl,
						token:""
					},options,function(temp){
						console.log("url updated in student");
						console.log(temp);
					});
					AdminLogin.findOne({
							token: request.body.token||" "
						})
						.exec(increasePendingCount);
					university.enable = true;
					university.save(asyncdone);
				}
			})	
		},function(err){
			if(!err){
				console.log("No Error");
				for(var i=0;i<universityIds.length;i++){
					console.log("University Added:");
					options.host = config.blockChainIp;
					options.port = config.blockChainPort;
					options.path = "/massUniversity/address";
					utils.httpRequest({
						_id: universityIds[i]
					}, options, function(arg) {
						console.log("block chain create triggered");
						console.log(arg);
					});
						console.log(i + "	"+ universityIds.length)
					if(i == universityIds.length-1){
						console.log(i + "	"+ universityIds.length)
						response.json(utils.success);
					}
				}
			}else{
				console.log("Error")
				console.log(err);
			}
		})
;
};
/*
----------------------------------------------- Add Application user -----------------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Add the Application User

* method for Adding the application user

* @param: User Details

* @return: 1 if added successfully else -1

* */
exports.addApplicationUser = function(request, response) {
/*	utils.httpRequest({hello:"hello"},options,function(data){
		
	});
	validateLogin(request.body.token, function(login) {
		if(!login){
			response.json(utils.unauth);
			return;
		}
		if (login.token) {*/
			console.log("Add University User");
			var lkey = utils.getLkey();
			var user = new ApplicationUsers();
			user.emailId = utils.encrypt((request.body.emailId || "customerforims@gmail.com").toString(), lkey);
			user.save(function(err, data) {
				if (err) {
					console.log(err);
					ApplicationUsers.remove({_id:user._id});
					console.log("addApplicationUser -- error saving doc");
					response.json(utils.failure);
				} else {
					user.password = utils.encrypt(request.body.password || "password", utils.getHash(request.body.password || "password"));
					var sk = user._id + utils.getHash(user._id.toString());
					user.name = request.body.name ? utils.encrypt(request.body.name || "Jagan Mohan", sk).toString() : "";
					user.contactNumber = request.body.contactNumber ? utils.encrypt(request.body.contactNumber || "8762232323".toString(), sk).toString() : "";
					user.enable = true;
					user.save(function(err) {
						if (err) {
							response.json(utils.failure);
							ApplicationUsers.remove({_id:user._id});
							console.log("addApplicationUser -- error adding user, rolled back");
							console.log(err);
						} else {
							console.log("User Added:");
							response.json(utils.success);
						}
					});
				}
			});
/*		} else {
			response.json(utils.unauth);
		}
		});*/
};
/*
----------------------------------------------- Add Institutions -----------------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Add the Institution

* method for Adding the Institution

* @param: Institute Details 

* @return: 1 if added successfully else -1

* */

exports.addInstitution = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			response.json(utils.unauth);
			return;
		}
		if (login.token) {
			console.log("Add Institution");
			var lkey = utils.getLkey();
			var institute = new Institution();
			institute.primaryEmailId = utils.encrypt((request.body.primaryEmailId || "").toString(), lkey);
			institute.save(function(err, insti) {
				if (err) {
					console.log(err);
					console.log("couldn't save institute");
					rollbackInstitute({_id:insti._id});
					response.json(utils.failure);
				} else {
					var sk = insti._id + utils.getHash(insti._id.toString());
					insti.instituteName = utils.encrypt(request.body.instituteName || "", sk).toString();
					if (request.body.instituteNumber) {
						insti.instituteNumber = utils.encrypt(request.body.instituteNumber.toString(), sk).toString();
					}
					insti.address = utils.encrypt(request.body.address || "", sk).toString();
					insti.city = utils.encrypt(request.body.city || "", sk).toString();
					insti.state = utils.encrypt(request.body.state || "", sk).toString();
					insti.pincode = utils.encrypt(request.body.pincode || "", sk).toString();
					insti.primaryContactNumber = utils.encrypt(request.body.primaryContactNumber || "", sk).toString();
					insti.primaryDesignation = utils.encrypt(request.body.primaryDesignation || "", sk).toString();
					insti.primaryContactName = utils.encrypt(request.body.primaryContactName || "", sk).toString();
					insti.primaryEmailId = utils.encrypt(request.body.primaryEmailId || "", lkey);
					insti.enable = true;
					insti.universityId = (request.body.universityId || "").toString();
					options.host = config.blockChainIp;
					options.port = config.blockChainPort;
					options.path = "/add/institute";
					University.findOne({
							_id: request.body.universityId||" "
						})
						.exec(function(err, doc) {
							if (doc) {
								utils.httpRequest({
									token: request.body.token,
									universityAddress: doc.blockChainAddress,
									instituteName: institute._id
								}, options, function(arg) {
									console.log(arg);
								});
							}
						});
					AdminLogin.findOne({
							token: request.body.token||" "
						})
						.exec(increasePendingCount);
					insti.save(function(err) {
						if (err) {
							console.log("error in creating the Institute");
							console.log(err);
							rollbackInstitute({_id:insti._id});
							response.json(utils.failure);
						} else {
							console.log("Institution Added");
							response.json(utils.success);
						}
					});
				}
			});
		} else {
			response.json(utils.unauth);
		}
	});
};
/*
----------------------------------------------- Get All Institutions for University -----------------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Get all institutes for a univesity

* method for getting all institutes for a univesity

* @param: University Details 

* @return: All institutes for a univesity

* */

exports.getAllInstitutesForUniversity = function(request, response) {
	validateLogin(request.body.token, function(login) {
		if(!login){
			response.json(utils.unauth);
			return;
		}
		if (login.token) {
			var lkey = utils.getLkey();
			var id = request.body.universityId;
			//id = utils.encrypt(id,id); //change encryption check add institute
			Institution.find({universityId:id||" "}).exec(function(err, insti) {
				if (err) {
					console.log("getAllInstitutesForUniversity -- error getting institutes for university");
					console.log(err);
					response.json(utils.failure);
				} else {
					for (var i = 0; i < insti.length; i++) {
						var sk = insti[i]._id + utils.getHash(insti[i]._id.toString());
						if (insti[i].enable) {	// && insti[i].universityId === login.universityId) {
							insti[i].instituteName = utils.decrypt(insti[i].instituteName, sk);
							insti[i].city = utils.decrypt(insti[i].city, sk);
							insti[i].address = utils.decrypt(insti[i].address, sk);
							insti[i].pincode = utils.decrypt(insti[i].pincode, sk);
							insti[i].state = utils.decrypt(insti[i].state, sk);
							insti[i].primaryContactName = utils.decrypt(insti[i].primaryContactName, sk);
							insti[i].primaryContactNumber = utils.decrypt(insti[i].primaryContactNumber, sk);
							insti[i].primaryEmailId = utils.decrypt(insti[i].primaryEmailId, lkey);
							insti[i].instituteNumber = utils.decrypt(insti[i].instituteNumber, sk);
							insti[i].universityId = utils.decrypt(insti[i].universityId, request.body.universityId);// remove line
							insti[i].primaryDesignation = utils.decrypt(insti[i].primaryDesignation, sk);
						}
					}
					response.json(insti);
				}
			});
		} else {
			response.json(utils.unauth);
		}
	});
};
/*
----------------------------------------------Update BlockChain Address for UNiversity-----------------------------------
*/
/**
* @author: Vivek (Vivek@xanbell.com)

* Update University in the Block Chain

* method for updating University in block chain 

* @param: ??

* @return: ??

* */

exports.updateUniversityBlockChainAddress = function(request, response) {
	console.log("update process started for University");
	if(!request.body.token){
			University.findOne({
				_id: request.body._id||" "
			})
			.exec(function(err, doc) {
				if (err) {
					console.log("error updating transaction id for university");
				} else {
					if (doc) {
						if (!doc.blockChainAddress) {
							doc.blockChainAddress = request.body.address;
							doc.save(function(err) {
								if (err) {
									console.log("error saving updated record");
									response.json(utils.failure);
								} else {
									response.json(utils.success);
								}
							});
							AdminLogin.findOne({
									token: request.body.token||" "
								})
								.exec(decreasePendingCount);
						}
						else{
							response.json(utils.success);
						}
					} else {
						console.log("document not found");
						response.json(utils.failure);
					}
				}
			});
	}else{
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
		if(!login){
			response.json(utils.unauth);
			return;
		}
		if (login.token) {
			University.findOne({
					_id: request.body._id||" "
				})
				.exec(function(err, doc) {
					if (err) {
						console.log("error updating transaction id for university");
					} else {
						if (doc) {
							if (!doc.blockChainAddress) {
								doc.blockChainAddress = request.body.address;
								doc.save(function(err) {
									if (err) {
										console.log("error saving updated record");
										response.json(utils.failure);
									} else {
										response.json(utils.success);
									}
								});
								AdminLogin.findOne({
										token: request.body.token||" "
									})
									.exec(decreasePendingCount);
							}
							else{
								response.json(utils.success);
							}
						} else {
							console.log("document not found");
							response.json(utils.failure);
						}
					}
				});
		} else {
			console.log("unauth");
			response.json(utils.unauth);
		}
	});		
	}
};

/*
----------------------------------------------Update BlockChain Address for Institute-----------------------------------
*/
/**
* @author: Vivek (Vivek@xanbell.com)

* Update Institute in the Block Chain

* method for updating institution in block chain 

* @param: ??

* @return: ??

* */

exports.updateInstituteBlockChainAddress = function(request, response) {
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
		if(!login){
			response.json(utils.unauth);
			return;
		}
		if (login.token) {
			Institution.findOne({
					_id: request.body._id||" "
				})
				.exec(function(err, doc) {
					if (err) {
						console.log("error updating transaction id for university");
					} else {
						if (doc) {
							if (!doc.blockChainAddress) {
								doc.blockChainAddress = request.body.address;
								doc.save(function(err) {
									if (err) {
										console.log("error saving updated record");
										console.log(utils.failure);
									} else {
										response.json(utils.success);
									}
								});
								AdminLogin.findOne({
										token: request.body.token||" "
									})
									.exec(decreasePendingCount);
							}else{
								response.json(utils.success);
							}
						} else {
							response.json(utils.failure);
						}
					}
				});
		} else {
			response.json(utils.unauth);
		}
	});
};

/*
---------------------------- validate university login ---------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Validate LOGIN

* method for validating University login

* @param: takes token as an argument 

* @return: if the login is valid or  not

* used for validating the university credentials

* */
var validateUniversityLogin = function(token, action) {
	if(!token.url||!token.port||!token.token){
		action(null);
		return;
	}
	var pass = utils.getHash(token.token.toString()+"gHgtYjNv52^512");
	options.host = config.issuerIp;
	options.port = config.issuerPort;
	options.path = "/login/validate";
	utils.httpRequest({
		token: token.token,
		password:pass
	}, options, function(login) {
		if (login) {
			action(login);
		} else {
			action(null);
		}
	});
};

/*
---------------------------- get institutions for id ---------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Get institution for an id

* method for fetching the institution for a particular id

* @param: token, institutionId

* @return: institution for an id

* */
exports.getInstutionsForId = function(request, response) {
	var token = request.body.token;
	console.log(request.body);
	var temp = getHostAndPort(token.url);
	if(!temp){
		console.log("getInstutionsForId -- no url");
		response.json(utils.failure);
		return;
	}
	token.url =  temp.url;
	token.port = temp.port;
	validateUniversityLogin(token, function(login) {
		if(!login){
			console.log("getInstutionsForId -- no login");
			response.json(utils.unauth);
			return;
		}
		if (!login.universityId) {
			console.log("getInstutionsForId -- no universityId");
			response.json(utils.failure);
			return;
		}
		if (!login.token) {			
			console.log("getInstutionsForId -- no token");
			response.json(utils.unauth);
		} else {
			var lkey = utils.getLkey();
			Institution.find({
					universityId: request.body.universityId||" " // todo utils.encrypt(request.body.institutes||" ",request.body.institutes||" ");
				})
				.exec(function(err, insti) {
					if (err) {
						console.log(err);
						console.log("getInstutionsForId -- error getting institutes");
						response.json(utils.failure);
					} else {
						if (login.universityId === request.body.universityId) {
							for (var i = 0; i < insti.length; i++) {
								var sk = insti[i]._id + utils.getHash(insti[i]._id.toString());
								if (insti[i].enable) {	// && insti[i].universityId === login.universityId) {
									insti[i].instituteName = utils.decrypt(insti[i].instituteName, sk);
									insti[i].city = utils.decrypt(insti[i].city, sk);
									insti[i].address = utils.decrypt(insti[i].address, sk);
									insti[i].pincode = utils.decrypt(insti[i].pincode, sk);
									insti[i].state = utils.decrypt(insti[i].state, sk);
									insti[i].primaryContactName = utils.decrypt(insti[i].primaryContactName, sk);
									insti[i].primaryContactNumber = utils.decrypt(insti[i].primaryContactNumber, sk);
									insti[i].primaryEmailId = utils.decrypt(insti[i].primaryEmailId, lkey);
									insti[i].instituteNumber = utils.decrypt(insti[i].instituteNumber, sk);
									insti[i].universityId = utils.decrypt(insti[i].universityId, request.body.universityId);// remove line
									insti[i].primaryDesignation = utils.decrypt(insti[i].primaryDesignation, sk);
								}
							}
							response.json(insti);
						} else {
							console.log("getInstutionsForId -- not same universityId");
							response.json(utils.unauth);
						}
					}
				});
		}
	});
};
exports.getViewRequestGT1institutes = function(request, response) {
	var token = request.body.token;
	console.log(request.body);
	var temp = getHostAndPort(token.url);
	if(!temp){
		console.log("getInstutionsForId -- no url");
		response.json(utils.failure);
		return;
	}
	token.url =  temp.url;
	token.port = temp.port;
	validateUniversityLogin(token, function(login) {
		if(!login){
			console.log("getInstutionsForId -- no login");
			response.json(utils.unauth);
			return;
		}
		if (!login.universityId) {
			console.log("getInstutionsForId -- no universityId");
			response.json(utils.failure);
			return;
		}
		if (!login.token) {			
			console.log("getInstutionsForId -- no token");
			response.json(utils.unauth);
		} else {
			var lkey = utils.getLkey();
			Institution.find({
					universityId: request.body.universityId||" ", 
					requestCount: { $gt : 0 }// todo utils.encrypt(request.body.institutes||" ",request.body.institutes||" ");
				})
				.exec(function(err, insti) {
					if (err) {
						console.log(err);
						console.log("getInstutionsForId -- error getting institutes");
						response.json(utils.failure);
					} else {
						if (login.universityId === request.body.universityId) {
							for (var i = 0; i < insti.length; i++) {
								var sk = insti[i]._id + utils.getHash(insti[i]._id.toString());
								if (insti[i].enable) {	// && insti[i].universityId === login.universityId) {
									insti[i].instituteName = utils.decrypt(insti[i].instituteName, sk);
									insti[i].city = utils.decrypt(insti[i].city, sk);
									insti[i].address = utils.decrypt(insti[i].address, sk);
									insti[i].pincode = utils.decrypt(insti[i].pincode, sk);
									insti[i].state = utils.decrypt(insti[i].state, sk);
									insti[i].primaryContactName = utils.decrypt(insti[i].primaryContactName, sk);
									insti[i].primaryContactNumber = utils.decrypt(insti[i].primaryContactNumber, sk);
									insti[i].primaryEmailId = utils.decrypt(insti[i].primaryEmailId, lkey);
									insti[i].instituteNumber = utils.decrypt(insti[i].instituteNumber, sk);
									insti[i].universityId = utils.decrypt(insti[i].universityId, request.body.universityId);// remove line
									insti[i].primaryDesignation = utils.decrypt(insti[i].primaryDesignation, sk);
								}
							}
							response.json(insti);
						} else {
							console.log("getInstutionsForId -- not same universityId");
							response.json(utils.unauth);
						}
					}
				});
		}
	});
};

/*
----------------------------get university per id ---------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Get university for an id

* method for fetching the university for a particular id

* @param: token, universityId

* @return: university for a particular id

* */
exports.getUniversityPerId = function(request, response) {
	University.findOne({_id:request.body.universityId||" "},function (err,university) {
		if(!university){
			response.json(utils.unauth);
			return;
		}
		var lkey = utils.getLkey();
		var data = {token:request.body.token,url:utils.decrypt(university.universityUrl,lkey)};
		var tempUrl = getHostAndPort(data.url);
		data.url = tempUrl.url;
		data.port = tempUrl.port;
		validateUniversityLogin(data, function(login) {
			if(!login){
				console.log("1");
				response.json(utils.unauth);
				return;
			}
			else if(!login.universityId){
				console.log("2");
				response.json(utils.unauth);
				return;
			}else if (login.universityId !== request.body.universityId) {
				console.log("3");
				response.json(utils.unauth);
				return;
			}
			var sk = university._id + utils.getHash(university._id.toString()),lkey = utils.getLkey();
			university.name = utils.decrypt(university.name, sk);
			university.city = utils.decrypt(university.city, sk);
			university.state = utils.decrypt(university.state, sk);
			university.primaryContactName = utils.decrypt(university.primaryContactName, sk);
			university.universityUrl = utils.decrypt(university.universityUrl,lkey);
			response.json(university);
		});
	});
};


exports.getUniversityAndInstituteAddress = function (request,response) {
	validateConsumerLogin(request.body.token,function (login) {
		var pass = utils.getHash("DB938e!(*2831hs1bDcb");
		if(!login||!login.token||request.body.password!==pass.toString()){
			console.log("getUniversityAndInstituteAddress -- login invalid");
			response.json(null);
			return;
		}else{
			University.findOne({_id:request.body.universityId},function (err,university) {
				if(err){
					console.log("getUniversityAndInstituteAddress -- error getting university");
					console.log(err);
					response.json(null);
					return;
				}
				console.log("getUniversityAndInstituteAddress -- got university");
				Institution.findOne({_id:request.body.instituteId},function (err,institution) {
					if(err){
						console.log("getUniversityAndInstituteAddress -- error getting institution");
						console.log(err);
						response.json(null);
						return;
					}
					console.log("getUniversityAndInstituteAddress -- got institute, sent data");
					response.json({university:university.blockChainAddress,institution:institution.blockChainAddress});
				});
			});
		}
	});
};
exports.getUniversityForConsumer = function(request,response){
console.log("_+_+_+_+_+_+");
	console.log(request)
	University.findOne({_id:request.body.universityId},function(err,university){
		if(err){
			console.log("Error in retrieving the University for Consumer");
			console.log(err);
		}else{
			response.json(university);
		}
	})
}
exports.updateRequestCountInAdminApplication = function(request,response){
	Institution.findOne({_id:request.body.institutionId}).exec(function(err,institute){
		if(!err){
			institute.requestCount += 1;
			institute.save(function(err){
				if(!err){
					console.log("Saved in the Student");
					response.json({status:1});
				}else{
					console.log("Error in saving the requestCount");
					console.log(err);
				}
			})
		}	
	})
}