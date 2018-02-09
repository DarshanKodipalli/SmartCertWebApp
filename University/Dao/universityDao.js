var config = require("../Config/config"),
	mongoose = require("mongoose");

var Schema =  mongoose.Schema;

var Verification = new Schema({
	verifiedOn:{type:Date,default:Date.now},
	verifiedBy:String
});

var Certificate = new Schema({
	//certificate details
	certificateName:String,	
	certificate:{type:String,required:true},	
	certificateDescription:String,
	fileType:String,	

	courseName:String,
	streamName:String,
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
	batch:String,
	// verification detials
	verification:[Verification],
	blockChainAddress:String,
	certificateHashkey: {type:String}, //{type:String,sparse:true,unique:true},
	proof:String
});

var Stream = new Schema({
	streamName:String,
	enable:Boolean
});

var Course = new Schema({
  universityId:String,
  instituteId:String,
  courseName:String,
  enable:Boolean,
  blockChainAddress:String,
  streams:[Stream]
});

var Batch = new Schema({
	institutionName:String,
	institutionId:String,
	courseId:String,
	year:String,
	active:Boolean,
	stream:String,
	studentCount:Number,
	universityId:String,
	sendToApprover:Boolean,		//0=not sent;1=sent            sent to approver : true or false
	verified:Boolean,			//0=not verified;1=verified    verified by approver :true or false
	anyRejected:Boolean,		//0=not rejected;1=rejected    rejected by approver :ture or false
	certificateType:Array,
	rejectedCount:Number,
	verifyFlag:Boolean,			//5 - if not verified; 0 - if verified 
	certificateCount:Number,
	blockChainAddress:String,
	courseName:String,
	certificatesToBeSigned:{type:Number,default:0}
});

var Institution = new Schema({
	name:String,
	address:String,
	city:String,
	state:String,
	course:String,
	startYear:String,
	country:String,
	pincode:String,
	number:String,
	primaryContactNumber:String,
	primaryContactName:String,
	primaryEmailId:String,	
	requestCount:Number,
	createdBy:String,
	createdOn:Date,
	modifiedBy:String,
	modifiedOn:Date,	
	universityId:String,
});
 
var Access = new Schema({
	access:Number
});

var UniversityLogin = new Schema({
	emailId:String,
	universityId:String,
	token:String,
	universityUserId:String,
	loginDate:Date,
	otp:String,
	role:String,
	tokenExpiry:Date,
	logoutDate:Date,
	loginIp:String,
	access:[Access],
	pending:{type:Number,default:0}
});

var University = new Schema({	
	name:{type:String,unique:true},
	address:String,
	city:String,
	state:String,
	pincode:String,
	universityNumber:String,
	primaryContactNumber:String,
	primaryContactName:String,
	loginCount:{type:Number,default:0},	
	primaryEmailId:String,	
	password:String,
	createdBy:String,
	createdOn:Date,
	modifiedBy:String,
	modifiedOn:Date,
	institution:[Institution],
	universityUrl:{type:String,unique:true,required:true}	
});

var UniversityUsers = new Schema({
	name:String,
	contactNumber:String,
	emailId:String,
	role:String, //issuer,checker
	checkerId:String,
	password:String,
	universityId:String,
	enable:Boolean
});

var Transactions = new Schema({

	signed:Boolean,
	verified:Boolean,
	broadcasted:Boolean,
	distributed:Boolean,
	blockChainAddress:String
});

var Key = new Schema({
	collectionName:String,
	key:String
});

exports.university = mongoose.model("university",University);
exports.certificate= mongoose.model("certificate",Certificate);
exports.transactions= mongoose.model("transactions",Transactions);
exports.institution= mongoose.model("institution",Institution);
exports.access = mongoose.model("access",Access);
exports.batch = mongoose.model("batch",Batch);
exports.universityUsers = mongoose.model("universityUsers",UniversityUsers);
exports.universityLogin = mongoose.model("universityLogin",UniversityLogin);
exports.course = mongoose.model("course",Course);
exports.key = mongoose.model("keys",Key);