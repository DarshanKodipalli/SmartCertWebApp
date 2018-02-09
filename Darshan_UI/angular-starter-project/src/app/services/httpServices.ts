import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { ApplicationComponents } from '../services/applicationComponents';

@Injectable()

export class RestCallsComponent{
	constructor(private http:Http,private appConstants:ApplicationComponents){

	}
	
	createUniversity(universityInformation){
		console.log("Create University");
		return this.http.post(this.appConstants.getUrlAndPort()+"/add/university",universityInformation);
	}

	getUniversity(){
		return this.http.get(this.appConstants.getUrlAndPort()+"/get/university");
	}

	universityLogin(loginData){
		console.log("universityLogin");
		return this.http.post(this.appConstants.getUrlAndPort()+"/university/login",loginData);
	}

	getUniversityForId(id){
		console.log("received Id: ");
		console.log(id);
		return this.http.post(this.appConstants.getUrlAndPort()+"/get/university/id",{id});
	}

	getInstitutions(id){
		console.log("universityId: ");
		console.log(id)
		return this.http.post(this.appConstants.getUrlAndPort()+"/get/institutes/id",{id});
	}

	getCoursesForInstitute(institute){
		console.log("Institute:");
		console.log(institute);
		return this.http.post(this.appConstants.getUrlAndPort()+"/get/courses/institute",institute);
	}
	getBatchForCourseAndInstitute(data){
		console.log("BatchData");
		console.log(data);
		return this.http.post(this.appConstants.getUrlAndPort()+"/get/batch/course/institute",data);
	}
	validateOTP(otp){
		console.log(otp);
		return this.http.post(this.appConstants.getUrlAndPort()+"/university/login/OTP/Check",otp);
	}
	universityLogout(data){
		console.log(data);
		return this.http.post(this.appConstants.getUrlAndPort()+"/university/logout",data);
	}
	getCertificatesForBatchAndInstitutionAndUniversity(data){
		console.log(data);
		return this.http.post(this.appConstants.getUrlAndPort()+"/certificates/batch/instution/university",data);
	}
	getCertificatesForBatchAndInstitutionAndUniversityForApprover(data){
		console.log("Certificate for Approver: ")
		console.log(data);
		return this.http.post(this.appConstants.getUrlAndPort()+"/approver/certificates",data);		
	}
	getApprovedCertificates(data){
		return this.http.post(this.appConstants.getUrlAndPort()+"/approved/certificates",data);				
	}
	getUniversityUserForId(data){
		console.log("getUniversityUserForId");
		console.log(data);
		return this.http.post(this.appConstants.getUrlAndPort()+"/get/universityUser/id",{data});
		
	}
	sendCertificatesForSigner(data){
		console.log(data);
		return this.http.post(this.appConstants.getUrlAndPort()+"/send/certificates/signer",data);
	}
	getAllBatchesNotVerified(){
		return this.http.get(this.appConstants.getUrlAndPort()+"/get/batches/not/verified");
	}
	getAllBatchesVerified(){
		return this.http.get(this.appConstants.getUrlAndPort()+"/get/verified/batches");		
	}
	signTheCertificates(data){
		return this.http.post(this.appConstants.getUrlAndPort()+"/sign/theCertificates",data);
	}
	getAllVerifiedCertificates(){
		return this.http.get(this.appConstants.getUrlAndPort()+"/get/approved/certificates");
	}
	getCertificatesForGivenInformation(data){
		return this.http.post(this.appConstants.getUrlAndPort()+"/get/certificates/for/given",data);
	}
	getRejectedBatches(){
		return this.http.get(this.appConstants.getUrlAndPort()+"/get/rejected/batches");
	}
	getAllRejectedCertificatesForABatch(data){
		return this.http.post(this.appConstants.getUrlAndPort()+"/get/certificates/rejected",data);
	}
	downLoadDoc(data){
		return this.http.post("http://"+location.hostname+":"+2004+"/get/survey/item",data);
	}
	addStudent(data){
		console.log(data);
		return this.http.post("http://"+location.hostname+":"+3002+"/add",data);
	}
}