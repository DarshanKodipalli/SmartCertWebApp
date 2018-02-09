var consumerTest = require("./consumerControllerTest");

exports.assign = function(router){

	router.get('/test/view',consumerTest.validateConsumerToken);
	router.get("/test/check",consumerTest.validateConsumerOTP);

};
