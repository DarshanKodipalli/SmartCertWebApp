var config = require("../Config/config"),
mongoose = require("mongoose");

var Schema =  mongoose.Schema;

//==========================================================================//

var Verification = new Schema({
	verifiedOn:{type:Date,default:Date.now},
	verifiedBy:{type:String}
});

var Certificate = new Schema({
	//certificate details
	certificateName:String,	
	certificate:{type:String,required:true},	
	certificateDescription:String,
	fileType:String,	

	//certificate metadata
	batch:String,
	batchId:String,
	examDate:Date,
	studentName:String,
	courseName:String,
	streamName:String,
	studentRollNumber:String,
	studentId:{type:String,required:true},
	institutionId:{type:String,required:true},
	institutionName:String,
	universityId:{type:String,required:true},
	universityNumber:String,
	studentEmailId:String,

	//certificate issue details
	awardedDate:{type:Date,default:Date.now},
	uploadedOn:{type:Date,default:Date.now},
	uploadedBy:String,
	sendToApprover:Boolean,
	rejectedComments:String,
	transactionId:String, // for entering in batch
	createdOn:{type:Date,default:Date.now},
	createdBy:String,
	verified:Boolean,
	approved:Boolean,
	batch:String,
	// verification detials
	verification:[Verification],
	blockChainAddress:String,
	certificateHashkey: {type:String}, //{type:String,sparse:true,unique:true},
	proof:String
});

//==========================================================================//

var Institution = new Schema({
	institutionName:String,
	institutionId:{type:String,required:true},
	enrolmentDate:String,
	semester:Number,
	courseName:{type:String},
	branch:{type:String},
	studentId:{type:String,required:true},
	instituteRollNumber:String,
	universityId:String,
	requestCount:{type:Number,default:0},
	specialization:String,
	transactionId:String, // for entering in batch
	createdOn:{type:Date,default:Date.now},
	createdBy:String,
	batchId:String
});

//==========================================================================//

var University = new Schema({
	universityId:String,
	universityName:String,
	studentId:{type:String,required:true},
	enrollmentNumber:String,
	transactionId:String, //for entering in batch
	createdOn:{type:Date,default:Date.now},
	createdBy:String
});

//==========================================================================//

var UniversityRef = new Schema({
	universityId:{type:String,required:true},
	url:{type:String,required:true}//unique:true
});

//==========================================================================//

var Student = new Schema({
		massUploadId:String,
		emailId : {type:String, required:true, unique:true, trim:true},
		notificationEmailId:{type:String,trim:true},
		password : String,
		passwordExpiry : Date,
		name:{type:String,required:true},
		fathersName:String,
		address:String,
		pinCode:String,
		aadhaarId:{type:String},
		nationality:String,
		passportNumber:String,
		dateOfBirth :String,
		joinedDate : String,
		phoneNumber : String,
		rollNumber : String,
		loginCount : {type:Number, default:0},
		publicKey  : {type:String},
		transactionId:String, // for entering in batch
		createdOn:{type:Date,default:Date.now},
		createdBy:String,
		blockChainAddress:String
});
//==========================================================================//
var AadharTable = new Schema({
	aadhaarNumber:{type:String,trim:true,sparse: true,unique:true}
});
//==========================================================================//

/**
 * access = 0 for read
 * access = 1 for create
 * access = 2 for update
 * access = 3 for modify student details
 * access = 4 for modify certificate details
 * 
 * */
var Access = new Schema({
	access:Number
});

var StudentLogin = new Schema({
	emailId:String,
	studentId:String,
	token:String,
	loginDate:{type:Date,default: Date.now},
	tokenExpiry:Date,
	logoutDate:Date,
	loginIp:String,
	otp:String,
	access:[Access],
	otpStatus:Boolean,
	credentials:Boolean
});

//==========================================================================//

var Ip = new Schema({
	ipAddress:String
});

var CertificateList = new Schema({
	certificateIds:String,
	certificateName:String,
	fileType:String
});

var ViewRequest = new Schema({
	emailId:String,
	studentId:String,
	token:String,
	sentToEmail:String,
	sentToPhoneNumber:String,
	viewCount:{type:Number, default:0},
	viewLimit:{type:Number, default:0},
	tokenExpiry:Date,
	otp:String,
	otpStatus:Boolean,
	ips:[Ip],
	certificates:[CertificateList]
});


var Key = new Schema({
	collectionName:String,
	key:String
});

//==========================================================================//

exports.student = mongoose.model(config.CollectionNames.student,Student);
exports.studentLogin = mongoose.model(config.CollectionNames.studentLogin,StudentLogin);
exports.viewRequest = mongoose.model(config.CollectionNames.viewRequest,ViewRequest);
exports.university = mongoose.model(config.CollectionNames.university,University);
exports.institution = mongoose.model(config.CollectionNames.institution,Institution);
exports.certificate = mongoose.model(config.CollectionNames.certificates,Certificate);
exports.universityRef = mongoose.model("universityRef",UniversityRef);
exports.key = mongoose.model("keys",Key);