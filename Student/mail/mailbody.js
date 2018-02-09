exports.emailId = "smartcert.noreply@gmail.com";
var email =  "smartcert.noreply@gmail.com";
var url = "https://ec2-52-66-162-34.ap-south-1.compute.amazonaws.com:3000";
exports.emailId =  email;
exports.studentlogin = {
		body:"new login from ip ",
		subject:"new login",
		from:email,
		to:""
};

exports.newRequest = {
		body:"has given you access to certificates\n"+url,
		subject:"Certificates",
		from:email,
		to:""
};

exports.otp = {
		body:"Your Otp for login is ",
		subject:"OTP",
		from:email,
		to:""
};

exports.studentPassword = {
		body:"You can now login into Student Portal with your email as the User Name and the Password:",
		subject:"Student Login",
		from:email,
		to:""	
};

exports.certificatesApproved = {
	body:"",
	subject:"",
	from:email,
	to:""
};