var studentTest = require("./studentControllerTest");
var adminTest = require("./adminControllerTest");
var consumerTest = require("./consumerControllerTest");

exports.assign = function(router){

	router.get("/test/add",adminTest.studentRegistration);
	router.get("/test/get",adminTest.getStudents);
	router.get('/test/assign',adminTest.assignCertificate);
	router.get('/test/upload',adminTest.getMappingFile);
	router.get('/test/issue',adminTest.testCertIssue);

	router.get("/test/login",studentTest.studentLogin);
	router.get("/test/validate",studentTest.validateStudentOtp);
	router.get("/test/logout",studentTest.studentLogout);
	router.get("/test/requests",studentTest.getRequests);
	router.get("/test/new/request",studentTest.newRequest);
	router.get("/test/get/universities",studentTest.getUniversitiesForStudent);
	router.get('/test/student',studentTest.getStudent);
	router.get('/test/certificates',studentTest.getCertificates);

	router.get('/test/view',consumerTest.validateConsumerToken);
	router.get("/test/check",consumerTest.validateConsumerOTP);

};
