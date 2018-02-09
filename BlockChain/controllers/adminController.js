/ijshint esversion: 6 */
var sysConfig = require('../config/config'),
    util = require('../utils/utils'),
    async = require('async');

var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(sysConfig.ethNodeEndpoint));
var Accountaddress = web3.eth.accounts[sysConfig.defaultAccount];
web3.eth.defaultAccount = Accountaddress;
var abi = web3.eth.contract(sysConfig.abiCode);
var smartCertContract = abi.at(sysConfig.contractAddr) ; 

var gasLimit = 3000000;

var options = {
    host: sysConfig.issuerIp,
    port: sysConfig.issuerPort,
    path: "/login/validate",
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

var validateAdminLogin = function(token, action) {
    var pass = util.getSha1(token.toString()+"gHgtYjNv52^512");
    options.host = sysConfig.adminIp;
    options.port = sysConfig.adminPort;
    options.path = "/admin/login/validate";
    util.httpRequest({token: token,password:pass},
        options,
        function(status) {
            if (status) {
                action(status);
            } else {
                action(false);
            }
        });
};

var validateUniversityLogin = function(token, action) {
    var pass = util.getSha1(token.toString()+"gHgtYjNv52^512");
    options.host = sysConfig.issuerIp;
    options.port = sysConfig.issuerPort;
    options.path = "/login/validate";
    util.httpRequest({token: token,password:pass},
        options,
        function(status) {
            if (status) {
                action(status);
            } else {
                action(false);
            }
        });
};

exports.createUniversityAddress = function(req, res) {
    validateAdminLogin(req.body.token,function (login) {
        if(login){
            var universityName = req.body._id;
            console.log("validated university login");
            if (!universityName) {
                res.json({
                    error: 'Input parameters are Empty. Please verify'
                });
            } else {
                var universityContractMethod = smartCertContract.createUniversity;
                var universityEvent = smartCertContract.UniversityAddress();
                universityEvent.watch(function(err, result) {
                    console.log("University Event Triggered " + result.args.univ);
                    options.path = "/update/university/address";
                    options.host = sysConfig.internalIp;
                    options.port = sysConfig.adminPort;
                    if(!err){
                        var  reqPass =  util.getSha1(req.body.token+"wr1234512#!@$f1");
                        util.httpRequest({token:req.body.token,address:result.args.univ,_id:universityName,password:reqPass},options,function (arg) {
                            console.log("updated in admin" + result.args.univ);
                        });
                    }
                });
                var gasEstimation = universityContractMethod.estimateGas(universityName);
                console.log("Estimategas from method is " + gasEstimation);
                web3.eth.getBlock('latest', function(err, block) {
                    var blockGasLimit = Math.floor(block.gasLimit - (5 * block.gasLimit) / 1024);
                    if (gasEstimation > gasLimit) {
                        console.log('Gas required exceeds limit: ' + gasLimit);
                    }
                    if (gasEstimation > blockGasLimit) {
                        console.log("Estimated Gas: " + gasEstimation);
                        console.log('Gas required exceeds block gas limit: ' + blockGasLimit);
                    }
                    universityContractMethod.sendTransaction(universityName, {
                        from: web3.eth.accounts[sysConfig.defaultAccount],
                        gas: gasEstimation
                    }, function(err, result) {
                        console.log('Transaction Hash is ' + result);
                    });
                });
            }
            res.json(util.success);
        }
        else{
            res.json(util.failure);
	    console.log("create university failure");
        }
    });
};

exports.createMassUniversityAddress = function(req, res) {
    console.log("createMassUniversityAddress called")
            var universityName = req.body._id;
            console.log(universityName)
            if (!universityName) {
                res.json({
                    error: 'Input parameters are Empty. Please verify'
                });
            } else {
                var universityContractMethod = smartCertContract.createUniversity;
                var universityEvent = smartCertContract.UniversityAddress();
                universityEvent.watch(function(err, result) {
                    console.log("University Event Triggered " + result.args.univ);
                    options.path = "/update/university/address";
                    options.host = sysConfig.internalIp;
                    options.port = sysConfig.adminPort;
                    if(!err){
                        var  reqPass =  util.getSha1(req.body.token+"wr1234512#!@$f1");
                        util.httpRequest({token:"",address:result.args.univ,_id:universityName,password:reqPass},options,function (arg) {
                            console.log("updated in admin" + result.args.univ);
                        });
                    }
                });
                var gasEstimation = universityContractMethod.estimateGas(universityName);
                console.log("Estimategas from method is " + gasEstimation);
                web3.eth.getBlock('latest', function(err, block) {
                    var blockGasLimit = Math.floor(block.gasLimit - (5 * block.gasLimit) / 1024);
                    if (gasEstimation > gasLimit) {
                        console.log('Gas required exceeds limit: ' + gasLimit);
                    }
                    if (gasEstimation > blockGasLimit) {
                        console.log("Estimated Gas: " + gasEstimation);
                        console.log('Gas required exceeds block gas limit: ' + blockGasLimit);
                    }
                    universityContractMethod.sendTransaction(universityName, {
                        from: web3.eth.accounts[sysConfig.defaultAccount],
                        gas: gasEstimation
                    }, function(err, result) {
                        console.log('Transaction Hash is ' + result);
                    });
                });
            }
            res.json(util.success);
};

exports.createInstituteAddress = function(req, res) {
    console.log(req.body);
    validateAdminLogin(req.body.token,function (login) {
        if(login){
            console.log('Creating Institute...');
            var universityAddress = req.body.universityAddress||"";
            var instituteName = req.body.instituteName || "";
            if (universityAddress === '' || instituteName === '') {
                res.json({
                    error: 'Input parameters are empty. Please verify'
                }); 
            } else {
                var instituteContractMethod = smartCertContract.createInstitute;
                var instituteEvent = smartCertContract.InstituteAddress();
                instituteEvent.watch(function(err, result) {
                    console.log(result);
                    console.log("Institute Event Triggered" + result.args.institute);
                    options.path = "/update/institute/address";
                    options.host = sysConfig.internalIp;
                    options.port = sysConfig.adminPort;
                    if(!err){
                        var  reqPass =  util.getSha1(req.body.token+"wr1234512#!@$f1");
                        util.httpRequest({token:req.body.token,address:result.args.institute,_id:instituteName,password:reqPass},options,function (arg) {
                            console.log("updated in admin" + arg);
                        });
                    }
                });
                var gasEstimation = instituteContractMethod.estimateGas(universityAddress, instituteName);
                console.log("Estimategas from method is " + gasEstimation);
                web3.eth.getBlock('latest', function(err, block) {
                    var blockGasLimit = Math.floor(block.gasLimit - (5 * block.gasLimit) / 1024);
                    console.log('blockGasLimit ' + blockGasLimit);
                    if (gasEstimation > gasLimit) {
                        console.log('Gas required exceeds limit: ' + gasLimit);
                    }
                    if (gasEstimation > blockGasLimit) {
                        console.log("Estimated Gas: " + gasEstimation);
                        console.log('Gas required exceeds block gas limit: ' + blockGasLimit);
                    }
                    instituteContractMethod.sendTransaction(universityAddress, instituteName, {
                        from: web3.eth.accounts[sysConfig.defaultAccount],
                        gas: gasEstimation
                    }, function(err, result) {
                        console.log('Transaction Hash is ' + result);
                    });
                });
            }
            res.json(util.success);
        }
        else{
            res.json(util.failure);
        }
    });
};

exports.createCourseAddress = function(req, res) {
    validateUniversityLogin(req.body.token, function(login) {
        if (!login) {
            res.json(util.unauth);
            return;
        } else {
            var web3 = new Web3(new Web3.providers.HttpProvider(sysConfig.ethNodeEndpoint));
            var Accountaddress = web3.eth.accounts[sysConfig.defaultAccount];
            console.log('Creating Course...');
            var InstituteAddress = req.body.InstituteAddress || '';
            var noOfMaxPart = req.body.noOfMaxPart || 0; // validate for numbers
            var duration = req.body.duration || 0;
            var activeStatus = req.body.activeStatus || true;
            var courseName = req.body.courseName || '';
            var flag = true;
            if (courseName === '' || InstituteAddress === '') {
                res.json({
                    error: 'Input parameters are Empty. Please verify'
                });
            } else {
                var courseContractMethod = smartCertContract.createCourse;
var courseEvent = smartCertContract.CourseAddress({}, {fromBlock: 1, toBlock: 'latest'});                courseEvent.watch(function(err, result) {
                    console.log("Course Event Triggered"  + result.args.course);
                    options.path = "/update/course/address";
                    options.host = sysConfig.issuerIp;
                    options.port = sysConfig.issuerPort;
                    console.log({token:req.body.token,address:result.args.course,_id:courseName});
                    if(!err&&flag){
                        var  reqPass =  util.getSha1(req.body.token+"wr1234512#!@$f1");
                        util.httpRequest({token:req.body.token,address:result.args.course,_id:courseName,password:reqPass},options,function (arg) {
                            console.log("updated in university" + arg);
                        });
                        flag = false;
                    }
                });
                var gasEstimation = courseContractMethod.estimateGas(InstituteAddress, courseName);
                console.log("Estimategas from method is " + gasEstimation);
                web3.eth.getBlock('latest', function(err, block) {
                    var blockGasLimit = Math.floor(block.gasLimit - (5 * block.gasLimit) / 1024);
                    if (gasEstimation > gasLimit) {
                        console.log('Gas required exceeds limit: ' + gasLimit);
                    }
                    if (gasEstimation > blockGasLimit) {
                        console.log("Estimated Gas: " + gasEstimation);
                        console.log('Gas required exceeds block gas limit: ' + blockGasLimit);
                    }
                    courseContractMethod.sendTransaction(InstituteAddress, courseName, {
                        from: web3.eth.accounts[sysConfig.defaultAccount],
                        gas: gasEstimation
                    },function(err, result) {
                        console.log('Transaction Hash is ' + result);
                    });
                });
            }
            res.json(util.success);
        }
    });
};

exports.createBatchAddress = function(req, res) {
    validateUniversityLogin(req.body.token, function(login) {
        if (!login) {
            res.json(util.unauth);
            return;
        } else {
            console.log('Creating Batch...');
            var courseAddress = req.body.courseAddress || '';
            var batchPeriod = req.body.batchId || '';

            if (courseAddress === '' || batchPeriod === '') {
                res.json({
                    error: 'Input parameters are Empty. Please verify'
                });
            } else {
                var batchContractMethod = smartCertContract.createBatch;
                var batchEvent = smartCertContract.BatchAddress();
                batchEvent.watch(function(err, result) {
                    console.log("Batch Event Triggered");
                    options.path = "/update/batch/address";
                    options.host = sysConfig.issuerIp;
                    options.port = sysConfig.issuerPort;
                    if(!err){
                        var  reqPass =  util.getSha1(req.body.token+"wr1234512#!@$f1");
                        util.httpRequest({token:req.body.token,address:result.args.batch,_id:batchPeriod,password:reqPass},options,function (arg) {
                            console.log("updated in admin" + arg);
                        });
                    }
                });
                var gasEstimation = batchContractMethod.estimateGas(courseAddress, batchPeriod);
                web3.eth.getBlock('latest', function(err, block) {
                    var blockGasLimit = Math.floor(block.gasLimit - (5 * block.gasLimit) / 1024);
                    if (gasEstimation > gasLimit) {
                        console.log('Gas required exceeds limit: ' + gasLimit);
                    }
                    if (gasEstimation > blockGasLimit) {
                        console.log("Estimated Gas: " + gasEstimation);
                        console.log('Gas required exceeds block gas limit: ' + blockGasLimit);
                    }
                    batchContractMethod.sendTransaction(courseAddress, batchPeriod, {
                        from: web3.eth.accounts[sysConfig.defaultAccount],
                        gas: gasEstimation
                    });
                });
            }
            res.json({
                status:1
            });
        }
    });
};

exports.createParticipantAddress = function(req, res) {
    console.log(req.body);
    validateUniversityLogin(req.body.token, function(login) {
        if (!login) {
            res.json(util.unauth);
            return;
        } else {
            console.log('Creating Participant...');
            var participantName = req.body.participantName || '';
            var batchAddress = req.body.batchAddress;
                console.log("participantName:"+participantName+"  batchAddress:"+batchAddress)
            if (participantName === '') {
                res.json({
                    error: 'Input parameters are Empty. Please verify'
                });
            } else {
                var participantContractMethod = smartCertContract.addNewStudent;
                var participantEvent = smartCertContract.StudentAddress();
                participantEvent.watch(function(err, result) {
                    console.log("Participant Event Triggered");
                    options.path = "/update/student/address";
                    options.host = sysConfig.studentIp;
                    options.port = sysConfig.studentPort;
                    if(!err){
                        var  reqPass =  util.getSha1(req.body.token+"wr1234512#!@$f1");
                        util.httpRequest({token:req.body.token,address:result.args.student,_id:participantName,password:reqPass},options,function (arg) {
                            console.log("updated in student " + result.args.student);
                        });
                    }
                });
                var gasEstimation = participantContractMethod.estimateGas(batchAddress,participantName);
                console.log(gasEstimation);
                web3.eth.getBlock('latest', function(err, block) {
                    var blockGasLimit = Math.floor(block.gasLimit - (5 * block.gasLimit) / 1024);
                    if (gasEstimation > gasLimit) {
                        console.log('Gas required exceeds limit: ' + gasLimit);
                    }
                    if (gasEstimation > blockGasLimit) {
                        console.log("Estimated Gas: " + gasEstimation);
                        console.log('Gas required exceeds block gas limit: ' + blockGasLimit);
                    }
                    participantContractMethod.sendTransaction(batchAddress,participantName, {
                        from: web3.eth.accounts[sysConfig.defaultAccount],
                        gas: gasEstimation
                    });
                });
            }
            res.json({
                        status:1
                    });
        }
    });
};

exports.MassUploadParticipant = function(request,response){
    validateUniversityLogin((JSON.parse(request.body.token)).token, function(login) {
        if (!login) {
            res.json(util.unauth);
            return;
        } else {
            console.log("Getting Students ...")
            options.path = "/massUpload/getStudents";
            options.host = sysConfig.studentIp;
            options.port = sysConfig.studentPort;
            var studentList = [];
            var participantContractMethodMassUpload = smartCertContract.addNewStudent;
            var participantEventMassUpload = smartCertContract.StudentAddress();
            util.httpRequest({massUploadId:request.body.transactionId},options,function (arg) {
                console.log("Student Count ");
                console.log(arg.length)
                studentList = arg;
                for(i=0;i<arg.length;i++){
                    var participantName1 = arg[i]._id;
                    var batchAddress1 = request.body.batchAddress;
                    console.log("participantName:"+participantName1+"  batchAddress:"+batchAddress1);
                    var gasEstimation = participantContractMethodMassUpload.estimateGas(batchAddress1,participantName1);
                        participantContractMethodMassUpload.sendTransaction(batchAddress1,participantName1, {
                            from: web3.eth.accounts[sysConfig.defaultAccount],
                            gas: gasEstimation
                        });
                }
                var finalResult = [];
                    participantEventMassUpload.watch(function(err,result){
                        if(err){
                            console.log("Error in updating in the Blockchain");
                        }else{
                            console.log("no error");
                            finalResult.push(result.args);
                        }
                        if(finalResult.length === studentList.length){
                            for(var i=0;i<finalResult.length;i++){
                                finalResult[i]._id = web3.toUtf8(finalResult[i]._id);
                            }
                            console.log(finalResult);
                            console.log("Updating in Student");
                            options.path = "/massUpload/updateStudentAddress";
                            options.host = sysConfig.studentIp;
                            options.port = sysConfig.studentPort;
                            util.httpRequest({massUploadId:request.body.transactionId,studentAddresses:finalResult},options,function (arg) {
                                console.log("updated in student");
                            });
                        }
                    })
            });
            response.json({status:1});
        }
    });
}
exports.MassUploadCertificate = function(request,response){
    console.log("Mass Upload Certificates");
    console.log(request.body.token.token);
    validateUniversityLogin(request.body.token.token,function(login){
        if(login){
            console.log("valid cerdentials");
            for(var i=0;i<request.body.certificates.length;i++){
                var certificateEvent = smartCertContract.CertificateAddress();
                var certName = request.body.certificates[i].certificateHashkey||"";
                var splitAddress1 = certName.substr(0,31);
                var splitAddress2 = certName.substr(31,39);
                var certArray = [];
                certArray[0] = splitAddress1;
                certArray[1] = splitAddress2;
                var batchAddress = request.body.batchAddress||"";
                var participantName = request.body.studentAddress||"";
                if(!certName){
                    console.log("request not complete");
                    console.log(req.body);
                    return;
                }
                    console.log("certName:"+certName+"  batchAddress:"+batchAddress);
                    var certificateContractMethod = smartCertContract.createCertificate;
                    var gasEstimation = certificateContractMethod.estimateGas(batchAddress, certArray, true, true);
                    smartCertContract.createCertificate.sendTransaction(batchAddress, certArray, true, true,{
                        from: web3.eth.accounts[sysConfig.defaultAccount],
                        gas: gasEstimation
                    });
            }
            var finalResult = [];            
            certificateEvent.watch(function(err, result) {
                if(err){
                    console.log("Error in Updating in the blockchain");
                }else{
                    console.log("no error");
                    finalResult.push(result.args);
                }
                console.log("Result:")
                console.log(result.args);
                if(finalResult.length === request.body.certificates.length){
                    for(var i=0;i<finalResult.length;i++){
                        console.log(web3.toUtf8(finalResult[i]._id[0]))
                        console.log(web3.toUtf8(finalResult[i]._id[1]))                        
                        finalResult[i]._id = web3.toUtf8(finalResult[i]._id[0]).concat(web3.toUtf8(finalResult[i]._id[1]));
                    }
                    console.log("Result:");
                    console.log(finalResult);
                    options.path = "/massUploadCertificate/updateCertificateAddress";
                    options.host = sysConfig.studentIp;
                    options.port = sysConfig.studentPort;
                    util.httpRequest({certificates:request.body.certificates,blockchainAddresses:finalResult},options,function (arg) {
                        console.log("updated in student");
                    });
                }
            });
        }
        else{
            response.json({status:-2});
        }
    });    
}

exports.MassUploadCertificates = function(request,response){
    console.log("Mass Upload Certificates");
    console.log(request.body);
    validateUniversityLogin(request.body.token,function(login){
        if(login){
            console.log("valid cerdentials");
            for(var i=0;i<request.body.certificates.length;i++){
                var certificateEvent = smartCertContract.CertificateAddress();
                var certName = request.body.certificates[i].certificateHashkey||"";
                var splitAddress1 = certName.substr(0,31);
                var splitAddress2 = certName.substr(31,39);
                var certArray = [];
                certArray[0] = splitAddress1;
                certArray[1] = splitAddress2;
                var batchAddress = request.body.batchAddress||"";
                var participantName = request.body.studentAddress||"";
                if(!certName){
                    console.log("request not complete");
                    console.log(req.body);
                    return;
                }
                    console.log("certName:"+certName+"  batchAddress:"+batchAddress);
                    var certificateContractMethod = smartCertContract.createCertificate;
                    var gasEstimation = certificateContractMethod.estimateGas(batchAddress, certArray, true, true);
                    smartCertContract.createCertificate.sendTransaction(batchAddress, certArray, true, true,{
                        from: web3.eth.accounts[sysConfig.defaultAccount],
                        gas: gasEstimation
                    });
            }
            var finalResult = [];            
            certificateEvent.watch(function(err, result) {
                if(err){
                    console.log("Error in Updating in the blockchain");
                }else{
                    console.log("no error");
                    finalResult.push(result.args);
                }
                console.log("Result:")
                console.log(result.args);
                if(finalResult.length === request.body.certificates.length){
                    for(var i=0;i<finalResult.length;i++){
                        console.log(web3.toUtf8(finalResult[i]._id[0]))
                        console.log(web3.toUtf8(finalResult[i]._id[1]))                        
                        finalResult[i]._id = web3.toUtf8(finalResult[i]._id[0]).concat(web3.toUtf8(finalResult[i]._id[1]));
                    }
                    console.log("Result:");
                    console.log(finalResult);
                    options.path = "/massUploadCertificate/updateCertificateAddress";
                    options.host = sysConfig.studentIp;
                    options.port = sysConfig.studentPort;
                    util.httpRequest({certificates:request.body.certificates,blockchainAddresses:finalResult},options,function (arg) {
                        console.log("updated in student");
                    });
                }
            })
        }
        else{
            response.json({status:-2});
        }
    });    
}

exports.createCertificateAddress = function(req,res){
    console.log("certificate addition started");
    validateUniversityLogin(req.body.token,function(login){
        if(login){
            console.log("valid cerdentials");
            var certificateEvent = smartCertContract.CertificateAddress();
            var certName = req.body.certificateHash||"";
            var splitAddress1 = certName.substr(0,31);
            var splitAddress2 = certName.substr(31,39);
            var certArray = [];
            certArray[0] = splitAddress1;
            certArray[1] = splitAddress2;
            console.log("Certificate Hash Key sent to the Blockchain")
            console.log(certArray)
            var batchAddress = req.body.batchAddress||"";
            var participantName = req.body.studentAddress||"";
            if(!certName){
                console.log("request not complete");
                console.log(req.body);
                return;
            }
            certificateEvent.watch(function(err, result) {
                var certAddr;
                if(result)
                    certAddr = result.args.certificate || '';
                console.log("cert address " + certAddr);
                options.path = "/update/certificate/address";
                options.host = sysConfig.issuerIp;
                options.port = sysConfig.issuerPort;
                if(!err&&certAddr){
                    //smartCertContract.setCertHash(certAddr,certName);
                    var  reqPass =  util.getSha1(req.body.token+"wr1234512#!@$f1");
                    util.httpRequest({token:req.body.token,address:certAddr,_id:certName,url:req.body.url,password:reqPass},options,function (arg) {
                        console.log("updated in university " + result.args);
                    });
                }
            });
            var certificateContractMethod = smartCertContract.createCertificate;
            var gasEstimation = certificateContractMethod.estimateGas(batchAddress, certName , true, true);
            web3.eth.getBlock('latest', function(err, block) {
                var blockGasLimit = Math.floor(block.gasLimit - (5 * block.gasLimit) / 1024);
                if (gasEstimation > gasLimit) {
                    console.log('Gas required exceeds limit: ' + gasLimit);
                }
                if (gasEstimation > blockGasLimit) {
                    console.log("Estimated Gas: " + gasEstimation);
                    console.log('Gas required exceeds block gas limit: ' + blockGasLimit);
                }
                smartCertContract.createCertificate.sendTransaction(batchAddress, certName, true, true,{
                    from: web3.eth.accounts[sysConfig.defaultAccount],
                    gas: gasEstimation
                },function(err, result) {
                    console.log('Transaction Hash is ' + result);
                });
            });
            res.json({status:1});
        }
        else{
            res.json({status:-2});
        }
    }); 
};

exports.approveCertificate = function(request,response){
    console.log("approveCertificate start");
    console.log(request.body);
    validateUniversityLogin(request.body.token,function(login){
        if(!login){
            response.json(util.unauth);
            return;
        }else{
            console.log("authenticated");
            var grantEvent = smartCertContract.CertificateGranted();
            var timestamp = Date.now();
            var batchAddr = request.body.batch|| '';
            var certificates = request.body.certificates;
            var studentIds = [];
            grantEvent.watch(function(err,result){
                if(!err){
                    console.log("grant event  Triggered");
                    console.log(result);
                }
            });
            studentIds = Object.keys(certificates);
            options.path = "/get/students";
            options.host = sysConfig.studentIp;
            options.port = sysConfig.studentPort;
            var  reqPass =  util.getSha1(request.body.token+"wr1234512#!@$f1"); 
            util.httpRequest({token:request.body.token,students:studentIds,password:reqPass},options,function (students) {
                if(students){
                    async.eachSeries(studentIds,function(studentId,asyncdone){
                        var issueCertificateContractMethod = smartCertContract.issueCertificate;
                        var gasEstimation = issueCertificateContractMethod.estimateGas(batchAddr, students[studentId], certificates[studentId], timestamp);
                        web3.eth.getBlock('latest', function(err, block) {
                            var blockGasLimit = Math.floor(block.gasLimit - (5 * block.gasLimit) / 1024);
                            if (gasEstimation > gasLimit) {
                                console.log('Gas required exceeds limit: ' + gasLimit);
                            }
                            if (gasEstimation > blockGasLimit) {
                                console.log("Estimated Gas: " + gasEstimation);
                                console.log('Gas required exceeds block gas limit: ' + blockGasLimit);
                            }
                            smartCertContract.issueCertificate.sendTransaction(batchAddr, students[studentId], certificates[studentId], timestamp, {
                                    from: web3.eth.accounts[sysConfig.defaultAccount],
                                    gas: gasEstimation
                                },
                            function(issueErr, issueResult) {
                                if (!issueErr) {
                                    console.log("issue certificate mined in blockchain at " + issueResult);
                                } else {
                                    console.log("issue error");
                                }
                            });
                        });
                    });
                    response.json(util.success);
                }
                else{
                    response.json(util.failure);
                }
            });
        }
    }); 
};

exports.verifyCertificateById = function(request,response){
    console.log(request.body);
    var certificateId = request.body.certificateAddress;
    var studentId = request.body.studentAddress;
    var pass = util.getSha1("DB938e!(*2831hs1bDcb");
    if(request.body.password!=pass){
        console.log("password is wrong");
        response.json(null);
        return;
    }
    console.log(studentId + "   "+certificateId);
    smartCertContract.verifyCertificate.call(studentId, certificateId, function(err, result){
        if(err){
            console.log('problem in fetching smart contract data');
            response.json(null);
        }else if(result){
            console.log("certificate verified");
            options.host = sysConfig.adminIp;
            options.port = sysConfig.adminPort;
            options.path = "/get/address";
            util.httpRequest({
                token:request.body.token,
                universityId:request.body.universityId,
                instituteId:request.body.institutionId,
		password:pass
            },options,function(data){
                if(data){
                    smartCertContract.checkHierarchy(data.university,
                        data.institution,
                        request.body.courseAddress,
			request.body.batchAddress,
                        function(err,hierarchy){
                            if(hierarchy){
                                console.log("hierarchy verified");
                                var splitAddress1 = request.body.certificateHash.substr(0,31);
                                var splitAddress2 = request.body.certificateHash.substr(31,39);
                                var certArray = [];
                                certArray[0] = splitAddress1;
                                certArray[1] = splitAddress2;
                                console.log(certArray);
                                smartCertContract.verifyCertHash(certificateId,certArray,function (hash) {
                                    if(hash){
                                        console.log("Hash verified");
                                        response.json({status:1,course:request.body.courseAddress,batch:request.body.batchAddress,certificate:certificateId,student:studentId,institution:data.institution,university:data.university});
                                        return;
                                    }else{
                                        console.log("Hash not verified");
                                        response.json({status:1,course:request.body.courseAddress,batch:request.body.batchAddress,certificate:certificateId,student:studentId,institution:data.institution,university:data.university});
                                    }
                                });
                            }else{
                                console.log("hierarchy not verified");
                                response.json(null);
                            }
                        });
                }else{
                    response.json(null);
                }   
            });
        }else{
            console.log('The certificate data is not present in smart contract');
            response.json(null);
        }
    });
};
