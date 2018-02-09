var config = require("../Config/Config"),
mongoose = require("mongoose");

var Schema =  mongoose.Schema;

var Verification = new Schema({
	verifiedOn:{type:Date,default:Date.now},
	verifiedBy:{type:String}
});

var Ip = new Schema({
	ipAddress:String
});

var CertificateList = new Schema({
	certificateIds:String,
	certificateName:String,
	fileType:String,
	validateToken:String
});

var Education = new Schema({
	institutionId:String,
	institutionName:String
})
var ViewRequest = new Schema({
	requestId:String,
	emailId:String,
	studentId:String,
	studentName:String,
	studentAddress:String,
	token:String,
	sentToEmail:String,
	sentToPhoneNumber:String,
	viewCount:{type:Number, default:0},
	viewLimit:{type:Number, default:0},
	tokenExpiry:Date,
	otp:String,
	otpStatus:Boolean,
	purpose:String,
	educationalDetails:[Education],
	sharedToName:String,
	ips:[Ip],
	certificates:[CertificateList],
	sharedOn:{type:Date,default:Date.now}
});

var Certificate = new Schema({
	//certificate details
	certificateName:String,	
	certificate:{type:String,required:true},	
	certificateDescription:String,
	fileType:String,	

	//certificate metadata
	batchId:String,
	examDate:Date,
	studentName:String,
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

	// verification detials
	verification:[Verification],
	blockChainAddress:String,
	certificateHashkey: {type:String}, //{type:String,sparse:true,unique:true},
	proof:String
});

var Key = new Schema({
	collectionName:String,
	key:String
});

var Course = new Schema({
  enable:Boolean,
  blockChainAddress:String
});

var Batch = new Schema({
	courseId:String,
	blockChainAddress:String
});

exports.viewRequest = mongoose.model(config.CollectionNames.viewRequest,ViewRequest);
exports.certificate = mongoose.model(config.CollectionNames.certificates,Certificate);
exports.key = mongoose.model("keys",Key);
exports.course = mongoose.model("course",Course);
exports.batch = mongoose.model("batch",Batch);
