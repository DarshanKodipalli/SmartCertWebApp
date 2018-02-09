exports.emailId = "arturovidalviera@gmail.com";
var email =  "arturovidalviera@gmail.com";
var url = "http://localhost:4201";

exports.newRequest = {
		body:" has given you an access to certificates:\n"+url,
		subject:"Certificates",
		from:email,
		to:""
};

exports.verificationReport = {
		body:"The certificate and the Verification Report can be found in the attachments ",
		subject:"Verification Report",
		from:email,
		to:""
};

exports.otp = {
		body:"Your Otp for login is ",
		subject:"OTP",
		from:email,
		to:""
};