var adminController = require("../controllers/adminController"),
  mongoose = require("mongoose");

exports.assign = function(router) {

  router.post("/add/university", adminController.addUniversity);
  router.post("/update/university", adminController.updateUniversity);
  router.post("/update/institute", adminController.updateInstitute);
  router.post("/add/institute", adminController.addInstitution);
  router.get("/add/user",adminController.addApplicationUser);

  router.get("/add/multipleUniversities",adminController.AddMultipleUniversities);

  router.post("/get/university", adminController.getUniversities);
  router.post("/get/institutions", adminController.getInstitutions);
  router.post("/get/university/id",adminController.getUniversityPerId);
  router.post("/get/institutes/id",adminController.getInstutionsForId);
  router.post("/get/ViewRequestGT1/institutes",adminController.getViewRequestGT1institutes)
  router.post("/get/AllInstitutesForUniversity", adminController.getAllInstitutesForUniversity);
  router.post("/delete/institute", adminController.deleteInstitute);
  router.post("/delete/university", adminController.deleteUniversity);
  router.post("/admin/login/OTP/Check", adminController.validateOTP);
  router.post("/admin/login", adminController.adminLogin);
  router.post("/admin/login/validate", adminController.checkLogin);
  router.post("/admin/logout", adminController.adminLogout);
  router.post("/get/address",adminController.getUniversityAndInstituteAddress);
  router.post('/consumer/get/university',adminController.getUniversityForConsumer);

  /*_________________________________________ Block Chain Calls_________________________________________
*/
  router.post("/update/university/address",adminController.updateUniversityBlockChainAddress);
  router.post("/update/institute/address",adminController.updateInstituteBlockChainAddress);  
  router.post("/updateRequestCount/AdminApplication",adminController.updateRequestCountInAdminApplication)
};
