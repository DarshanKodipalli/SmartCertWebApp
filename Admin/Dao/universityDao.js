var config = require("../Config/Config"),
  mongoose = require("mongoose");

var Schema = mongoose.Schema;

var Student = new Schema({
  studentId: Number,
  studentEmailId: String,
});

var University = new Schema({
  id: String,
  name: {
    type: String,
    unique: true
  },
  address: String,
  city: String,
  enable: Boolean, // Enable status for the record | Can be 1 for enable or 0 for disable
  state: String,
  pincode: String,
  universityNumber: String,
  primaryContactNumber: String,
  primaryContactName: String,
  primaryEmailId: String,
  primaryDesignation: String,
  createdBy: String,
  createdOn: Date,
  modifiedBy: String,
  modifiedOn: Date,
  blockChainAddress:String,
  universityUrl:{type:String,unique:true}
});

var Institution = new Schema({
  id: String,
  address: String,
  city: String,
  state: String,
  country: String,
  pincode: String,
  primaryContactNumber: String,
  primaryContactName: String,
  primaryEmailId: String,
  primaryDesignation: String,
  // password: String,
  enable: Boolean, // Enable status for the record | Can be 1 for enable or 0 for disable
  createdBy: String,
  createdOn: Date,
  modifiedBy: String,
  modifiedOn: Date,
  instituteName: {
    type: String,
    unique: true
  },
  instituteNumber: String,
  requestCount:{type:Number,default:0},
  universityId: String,
  studentId: String,
  blockChainAddress:String
});

var ApplicationUsers = new Schema({
  name: String,
  contactNumber: String,
  emailId: {
    type: String,
    unique: true
  },
  password: String,
  enable: Boolean,
});

var UniversityUsers = new Schema({
  name: String,
  contactNumber: String,
  emailId: {
    type: String,
    unique: true
  },
  employeeId: String,
  designation: String,
  password: String,
  role: [Number],
  checkerId: String,
  checkerName: String,
  enable: String,
  universityId: String,
  universityName: String,
});

var Access = new Schema({
  access: Number
});

var AdminLogin = new Schema({
  emailId: String,
  token: String,
  applicationUserId: String,
  loginDate: Date,
  otp: String,
  role: String,
  tokenExpiry: Date,
  logoutDate: Date,
  loginIp: String,
  pending:{type:Number,default:0},
  access: [Access]
});

var Course = new Schema({
  universityId:String,
  instituteId:String,
  courseName:String,
  enable:Boolean,
  blockChainAddress:String
});

var Domains = new Schema({
  universityId:{type:String,unique:true},
  domain:{type:String,unique:true}
});

var Key = new Schema({
  collectionName:String,
  key:String
});

exports.university = mongoose.model("university", University);
exports.institution = mongoose.model("institution", Institution);
exports.student = mongoose.model("student", Student);
exports.applicationUsers = mongoose.model("applicationUsers", ApplicationUsers);
exports.adminLogin = mongoose.model("adminLogin", AdminLogin);
exports.course = mongoose.model("course",Course);
exports.universityUsers = mongoose.model("universityUsers",UniversityUsers);
exports.key = mongoose.model("keys",Key);
