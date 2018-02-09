var adminController = require("../controllers/adminController");

exports.assign = function (router) {

    //admin operations
    router.post('/add/university', adminController.createUniversityAddress);
    router.post('/add/institute', adminController.createInstituteAddress);
    router.post('/add/course', adminController.createCourseAddress);
    router.post('/add/batch', adminController.createBatchAddress);
    router.post('/add/participant', adminController.createParticipantAddress);
    router.post("/add/certificate", adminController.createCertificateAddress);
    router.post("/approve/certificate",adminController.approveCertificate);
    router.post("/check",adminController.verifyCertificateById);
    router.post("/MassUpload/participant",adminController.MassUploadParticipant);
    router.post("/massCertificate/creationsBlockchain",adminController.MassUploadCertificate);
    router.post("/massUploadCertificates/blockchain",adminController.MassUploadCertificates);
    router.post("/massUniversity/address",adminController.createMassUniversityAddress);
};