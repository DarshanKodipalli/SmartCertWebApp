var universityTestController = require("./testUniversityController");

exports.assign = function(router){
	router.get("/test/add/university",universityTestController.addUniversity);
	router.get("/test/add/institute",universityTestController.addInstitute);
	router.get("/test/add/certificate",universityTestController.addCertificate);
	router.get("/test/add/users/university",universityTestController.addUsersForUniversity);
};