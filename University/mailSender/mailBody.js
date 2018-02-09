exports.emailId = "smartcert.noreply@gmail.com";
var email = "smartcert.noreply@gmail.com";
exports.universityLogin = {
		body: "New Login from IP: ",
		subject: "New Login",
		from:email,
		to:""
};
exports.otp = {
		body:"Your Otp for login is ",
		text:"Your Otp for login is ",
		subject:"OTP",
		from:email,
		to:""
};
exports.certificateNotification = {
		body:"Update on your certificate ",
		text:"Your Certificate: ",
		certificateType: "",
		textContd: "Certificate Name: ",
		certificateName:"",
		textContd2: "is dpproved by the Approver.",
		subject:"Certificate Update",
		from:email,
		to:""		
}