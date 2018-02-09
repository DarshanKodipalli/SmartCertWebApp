var consumerController = require("../controllers/consumerController");

exports.assign = function(router){
	/* consumer operations */
	router.post("/view",consumerController.validateConsumerToken);
	router.post("/check",consumerController.validateConsumerOTP);
	router.post("/view/certificates",consumerController.getCertificates);
	router.post("/view/certificate",consumerController.downloadCertificate);
	router.post("/requests",consumerController.getRequests);
	router.post("/all/requests",consumerController.getAllRequests);
	router.post("/new/request",consumerController.newRequest);
	router.post("/expire",consumerController.expire);
	router.post("/get/requeststransaction",consumerController.getRequestsForTransaction);
	router.post("/allRequests/StudentforUniversity",consumerController.getAllTransactionsOfStudentsForUniversity);
	router.post("/send/verificationReport",consumerController.sendVerifiationReport);
	router.post("/verify/certificate",consumerController.verifyCertificate);
	router.post("/check/login",consumerController.validateConsumerLogin);
	router.get("/getAll/Requests",consumerController.getAllRequestsForUniversity)
	router.get("/educationalDetails/all",consumerController.getAllEducationalDetailsOfARequest);
	router.post("/get/requestsForId",consumerController.getRequestsForId);
};
