var studentController  = require("../controllers/studentController"),
adminController = require("../controllers/adminController"),
consumerController = require("../controllers/consumerController");
var multer = require("multer");
var upload = multer();

exports.assign = function(router){

	/* 	Admin Operations	*/
	router.post("/add",adminController.studentRegistration);
	router.post("/get",adminController.getStudents);
	router.post("/assign",adminController.assignCertificate);
	router.post("/upload",adminController.getMappingFile);
	router.post("/get/student",adminController.getStudent);
	router.post("/get/students",adminController.getStudentList);
	router.post("/get/students/batch",adminController.getAllStudentsForABatch);
	router.post("/sign/student/certificate",adminController.SignTheCertificatesInStudents);
	router.post("/update/student/address",adminController.updateStudentBlockChainAddress);
	router.post("/update/certificate/address",adminController.updateCertificateBlockChainAddress);
	router.post("/save/MassUploadedCertificates",adminController.saveUploadedCertificatesInStudent);
	router.post("/update/univref",adminController.saveUniversityRef);

	/*	Student Operations	*/
	router.post("/login",studentController.studentLogin);
	router.post("/validate",studentController.validateStudentOTP);
	router.post("/logout",studentController.studentLogout);
	router.post("/get/universities",studentController.getUniversitiesForStudent);
	router.post("/student",studentController.getStudent);
	router.post("/certificates",studentController.getCertificates);
	router.post("/update",studentController.updateStudent);
	router.post("/update/validate",studentController.updateStudentValidate);
	router.post("/institutions",studentController.getInstitutionsForUniversityAndStudent);
	router.post("/validate/studentLogin",studentController.validateStudentLoginToken);
	router.post("/view/certificate",studentController.viewCertificate);
	router.post("/update/password",studentController.updatePassword);
	router.post("/resend/studentCertificate",studentController.resendStudentCertificate);
	router.post("/massUpload/getStudents",studentController.MassUploadGetStudents);
	router.post("/massUpload/updateStudentAddress",studentController.MassUploadStudentAddressUpdate);
	router.post("/institution/studentId",studentController.updateRequestCountInInstitute);
	router.post("/massUploadCertificate/updateCertificateAddress",studentController.MassUploadCertificateUpdateCertificateAddress);
};
