/*jshint esversion: 6 */
var dao = require("../dao/dao"),
util = require("../util/util"),
mailSender = require("../mail/mailSender"),
mailbody = require("../mail/mailbody"),
config = require("../Config/config"),
crypto = require('crypto');

var Student = dao.student;
var Certificate = dao.certificate;

const Cache = require("node-cache");

const viewCache = new Cache();
const tempCache = new Cache();

var options = {
		host:config.issuerIp,
		port:config.issuerPort,
		path:"/login/validate",
		method:'POST',
		headers: {
			'Content-Type': 'application/json'
		}
};
/**
* @author: Vivek (Vivek@xanbell.com)

* Verify the Certificate in Block Chain

* method for Verifing the Certificate in Block Chain 

* @param: student and certificate information

* @return: 1 if it is valid else -1

* */

exports.verifyCertificate = function (request,response) {
	if(!request.body.studentAddress||!request.body.certificateAddress){
		response.json(util.failure);
		return;
	}else {
		Student.findOne({_id:request.body.studentAddress||" "})
			.exec(function (err,student) {
				if(err){
					console.log("could not find student");
					console.log(err);
				}else{
					Certificate.findOne({certificateHashkey:request.body.certificateAddress||" "})
					.exec(function (err1,certificate){
						if(err1){
							console.log("could not find a certificate");
							console.log(err1);
						}else {
							options.host = config.blockChainIp;
							options.port = config.blockChainPort;
							options.path = "/check";
							if(student&&certificate){
								util.httpRequest({studentAddress:student.blockChainAddress,
									certificateAddress:certificate.blockChainAddress},options,function (resp) {
									if(resp === null){
										response.json({message:"unable to authenticate certificate"});
									}else if(resp.status){
										response.json({message:"certificate is valid"});
									}else{
										response.json({message:"no certificate found"});
									}
								});
							}else {
								response.json({message:"incomplete data sent"});
							}
						}
					});
				}
			});
	}
};
