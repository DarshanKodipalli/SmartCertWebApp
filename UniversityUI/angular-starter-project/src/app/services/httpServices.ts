import { Injectable } from '@angular/core';
import { Http,ResponseContentType } from '@angular/http';
import { ApplicationComponents } from '../services/applicationComponents';


@Injectable()

export class RestCallsComponent{

	private temp:any;
	private token:any = "";
	private url:any = "";
	private role:any = "";
	private studentTemp:any = {};

	constructor(private http:Http,private appConstants:ApplicationComponents){

	}

	grtTemp(){
		return this.temp;
	}
	setTemp(arg){
		this.temp = arg;
	}
	getStudentFile(){
		return this.studentTemp;
	}
	setStudentTemp(arg){
		this.studentTemp = arg;
	}
	setTokenAndUrl(){
		var temp = JSON.parse(localStorage.getItem("login"));
		console.log(temp);
		this.token = temp.token;
		this.url = temp.url;
		console.log(this.token + "   "+ this.url)
	}
	createUniversity(universityInformation){
		universityInformation.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/add/university",universityInformation);
	}

	getUniversity(){
		return this.http.get(this.appConstants.getUrlAndPortForUniversity()+"/get/university");
	}

	getAllRequests(){
		return this.http.get(this.appConstants.getUrlAndPortForConsumer()+"/educationalDetails/all")
	}
	universityLogin(loginData){
		console.log("universityLogin");
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/university/login",loginData);
	}
	viewMassUploadCertificate(data){
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/massUploaded/view",data,{responseType:ResponseContentType.Blob});		
	}
	massUploadCertificates(dara){
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/massupload",dara);
	}
	massUploadAdditionalData(data){
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/MassCertificateData",data);		
	}
	SendUploadedCertificatesToSigner(data){
		data.token = this.token;
		data.url = this.url;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/confirm/massupload",data);
	}
	deleteCertificates(data){
		console.log(data);
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/delete/certificates",data);
	}
	SendMassCreateCertificates(data){
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/send/massCreatedCertificate",data);
	}
	getUniversityForId(id){
		id.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForApplicationAdmin()+"/get/university/id",id);
	}
	signCertificatesStudent(data){
		var token:any = {};
	    token.token = this.token;
	    token.url = this.url;
	    data.token = token;
		return this.http.post(this.appConstants.getUrlAndPortForStudent()+"/sign/student/certificate",data);
	}
	getInstitutions(id){
		var token:any = {};
	    token.token = this.token;
	    token.url = this.url;
	    id.token = token;
	    console.log(token);
		return this.http.post(this.appConstants.getUrlAndPortForApplicationAdmin()+"/get/institutes/id",id);
	}
	getInstitutionsWithMoreThanOneRequestCount(id){
		var token:any = {};
	    token.token = this.token;
	    token.url = this.url;
	    id.token = token;
	    console.log(token);
		return this.http.post(this.appConstants.getUrlAndPortForApplicationAdmin()+"/get/ViewRequestGT1/institutes",id);
	}
	getCoursesForInstitute(institute){
		var data:any = institute;
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/get/courses/institute",data);
	}
	getRequestsforInstiId(data){
		return this.http.post(this.appConstants.getUrlAndPortForConsumer()+"/get/requestsForId",data);
	}
	getBatchForCourseAndInstitute(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/get/batch/course/institute",data);
	}

	validateOTP(otp){
		console.log(otp);
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/university/login/OTP/Check",otp);
	}

	universityLogout(data){
		console.log(data);
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/university/logout",data);
	}

	getCertificatesForBatchAndInstitutionAndUniversity(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/certificates/batch/instution/university",data);
	}

	getCertificatesForBatchAndInstitutionAndUniversityForApprover(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/approver/certificates",data);		
	}

	getApprovedCertificates(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/approved/certificates",data);				
	}

	getUniversityUserForId(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/get/universityUser/id",data);
		
	}

	sendCertificatesForSigner(data){
		console.log(data);
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/send/certificates/signer",data);
	}

	getAllBatchesNotVerified(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/get/batches/not/verified",data);
	}

	getAllBatchesVerified(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/get/verified/batches",data);		
	}

	signTheCertificates(data){
		data.token = this.token;
		data.url = this.url;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/sign/theCertificates",data);
	}

	getAllVerifiedCertificates(data){
		data.token = this.token;
		console.log("getAllVerifiedCertificates")
		console.log(data)
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/get/approved/certificates",data);
	}

	getCertificatesForGivenInformation(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/get/certificates/for/given",data);
	}

	getRejectedBatches(){
		var data = {token:""};
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/get/rejected/batches",data);
	}

	getAllVerifiedCertificatesForABatch(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/get/verified/certificates",data);
	}

	downLoadDoc(data){
		data.token = this.token;
		return this.http.post("http://"+location.hostname+":"+2004+"/get/survey/item",data);
	}

	updateStudentCountInBatch(data){
		var token:any = {};
	    token.token = this.token;
	    token.url = this.url;
	    data.token = token;		
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/update/StudentCountBatch",data);
	}
	addStudent(data){
		console.log(data);
		var token:any = {};
	    token.token = this.token;
	    token.url = this.url;
	    data.token = token;
		return this.http.post(this.appConstants.getUrlAndPortForStudent()+"/add",data);
	}

	getAllBatchesForStudents(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/get/batches/students",data);
	}

	getAllStudentsForABatch(data){
		var token:any = {};
	    token.token = this.token;
	    token.url = this.url;
	    data.token = token;
		return this.http.post(this.appConstants.getUrlAndPortForStudent()+"/get/students/batch",data);
	}

	createBatchForStudent(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/create/Batches",data);
	}

	addCertificates(data){
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/add/certificate",data);
	}
	viewUploadedDoc(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/view/certificate",data,{responseType:ResponseContentType.Blob});
	}
	certificatePreview(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/certificate/preview",data,{responseType:ResponseContentType.Blob});			
	}
	getAllApprovedCertificatesForABatch(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/view/approved/certificates",data);
	}

	verifyCertificatesInBlockchain(data){
		var token:any = {};
	    token.token = this.token;
	    token.url = this.url;
	    data.token = token;
		return this.http.post(this.appConstants.getUrlAndPortForStudent()+"/approve/certificates",data);
	}

	saveVerificationTokenForCertificate(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/save/verificationToken",data);
	}

	resendCertificatesForApprover(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/resend/certificate",data);
	}

	getListofStudents(data){
		var token:any = {};
	    token.token = this.token;
	    token.url = this.url;
	    data.token = token;
		return this.http.post(this.appConstants.getUrlAndPortForStudent()+"/get",data);
	}

	getRequests(requestData){
		requestData.token = this.token;
		requestData.url = this.url;
		return this.http.post(this.appConstants.getUrlAndPortForConsumer()+"/allRequests/StudentforUniversity",requestData);
	}

	certificateApprovalMonthWise(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/get/certificateApprovalMonthWise",data);
	}

	createCourse(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/create/course",data);
	}

	getCourse(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/get/course",data);
	}

	verifyAadharForStudent(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForStudent()+"/authAadhar",data);
	}

	cancelMassuploadTransaction(data){
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/delete/certificates",data);
	}
	massUploadStudentInformation(data){
		return this.http.post(this.appConstants.getUrlAndPortForStudent()+"/upload",data);		
	}
	createCertificateForAll(data){
		return this.http.post(this.appConstants.getUrlAndPortForUniversity()+"/massCreate/Certificate",data);
	}
}