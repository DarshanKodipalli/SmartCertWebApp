var universityController  = require("../controllers/universityController"),
	adminController = require("../controllers/adminController"),
	mongoose = require("mongoose");

exports.assign = function(router){

	router.post("/disable/university/user",adminController.updateUniversityUsers);
	router.post("/create/university/user",adminController.createUniversityUsers);
	router.post("/get/checkers",adminController.getUniversityUsers);
	router.post("/get/issuers",adminController.getUniversityUsers);
	router.post("/disable/user",adminController.disableUniversityUsers);
//_____________________________Data Ingestion___________________________________________//

//	router.post("/test/add/courses",adminController.MassAddCourses);

	
//_____________________________Login Operations___________________________________________//
	
	router.post("/university/logout",universityController.universityLogout);
	router.post("/university/login/OTP/Check",universityController.validateUniversityOTP);
	router.post("/university/login",universityController.universityLogin);
	router.post("/login/validate",universityController.validateAdminLogin);
	
//_____________________________Create Operations___________________________________________//

	router.post("/add/certificate",universityController.addCertificate);
	router.post("/create/Batches",universityController.createBatchForStudent);
	router.post("/create/course",universityController.addCourse);
	router.post("/massupload",universityController.getUploadedCertificates);
	router.post("/confirm/massupload",universityController.confirmMassUpload);

//_____________________________Retrieve Operations___________________________________________//
	
	router.get("/get/certificates",universityController.getCertificates);
	router.post("/get/batches/not/verified",universityController.getBatchesNotVerified);
	router.post("/get/verified/batches",universityController.getBatchesVerified);
	router.post("/get/course",universityController.getCourseForId);
	router.post("/get/universityUser/id",universityController.getUniversityUserForId);
	
	router.post("/get/verified/certificates",universityController.getAllVerifiedCertificatesForABatch);
	router.post("/get/rejected/batches",universityController.getRejectedBatches);
	router.post("/get/certificates/for/given",universityController.getCertificatesForGivenInformation);
	router.post("/get/approved/certificates",universityController.getApprovedCertificates);
	router.post("/get/courses/institute",universityController.getCoursesForInstitute);
	router.post("/certificates/batch/instution/university",universityController.getCertificatesForBatchAndInstitutionAndUniversity);
	router.post("/approver/certificates",universityController.getCertificatesForBatchAndInstitutionAndUniversityForApprover);
	router.post("/send/certificates/signer",universityController.sendCertificatesForSigner);
	router.post("/sign/theCertificates",universityController.SignTheCertificates);

	router.post("/update/StudentCountBatch",universityController.UpdateStudentCountInBatch);
	
	router.post("/get/batches/students",universityController.getAllBatchesForStudents);
	router.post("/view/certificate",universityController.viewCertificate); // id

	router.post("/view/approved/certificates",universityController.getApprovedCertificatesForBatch);
	router.post("/certificate/preview",universityController.previewCertificate);

	router.post("/resend/certificate",universityController.resendCertificatesForApprover);
	router.post("/get/certificateApprovalMonthWise",universityController.certificateApprovalMonthWise);
	router.post("/update/massUpload/count",universityController.UpdateMassUploadCount);

//_____________________________BlockChain Operations___________________________________________//
	
	router.post("/update/course/address",universityController.updateCourseBlockChainAddress);
	router.post("/update/batch/address",universityController.updateBatchBlockChainAddress);
	router.post("/update/certificate/address",universityController.updateCertificateBlockChainAddress);
	router.post("/delete/certificates",universityController.cancelMassUpload);

	router.post("/massCreate/Certificate",universityController.MassCreationCertificate);
	router.post("/send/massCreatedCertificate",universityController.SendMassCreatedCertificate);
	router.post("/UniversityMassUploadCertificate/updateCertificateAddress",universityController.UniversityMassUploadCertificateUpdateCertificateAddress)
};
