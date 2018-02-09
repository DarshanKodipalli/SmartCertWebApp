import { Injectable } from "@angular/core";
import { Http,ResponseContentType } from "@angular/http";

@Injectable()
export class HttpService{
	private url:string = "https://localhost:3004/";
	private consumerUrl:string = "https://localhost:3002/";
	private blockChainUrl:string = "https://localhost:3008";
	private flag = 1;
	constructor(private http:Http){
		if(this.flag == 1){
			this.url = "https://106.51.74.119:3004/";// location.hostname;
			this.consumerUrl = "https://58.68.95.151:3002/",
			this.blockChainUrl = "https://localhost:3008/"
		}
	}

/*
-------------------------------student calls here---------------------------------------
*/

	loginService(loginData){
		return this.http.post(this.url+"login",loginData);
	}
	validateOtp(loginData){
		return this.http.post(this.url+"validate",loginData);
	}
	logoutService(logoutData){
		return this.http.post(this.url+"logout",logoutData);
	}
	updateStudent(studentData){
		return this.http.post(this.url+"update",studentData);
	}
	updateValidate(otp){
		return this.http.post(this.url+"update/validate",otp);
	}
	getCertificates(loginData){
		return this.http.post(this.url+"certificates",loginData);
	}

	getStudent(loginData){
		return this.http.post(this.url+"student",loginData);
	}

	getUniversities(loginData){
		return this.http.post(this.url+"get/universities",loginData);
	}

	getInstitutions(universityData){
		return this.http.post(this.url+"institutions",universityData);
	}

	updatePassword(data){
		return this.http.post(this.url+"update/password",data);
	}

/*
-------------------------------consumer calls here---------------------------------------
*/	

	expireRequest(requestData){
		return this.http.post(this.consumerUrl+"expire",requestData);
	}
	createRequest(requestData){
		return this.http.post(requestData.ip+"new/request",requestData);
	}
	getRequests(requestData){
		console.log("_____________");
		console.log(requestData);
		return this.http.post(this.consumerUrl+"requests",requestData);
	}
	allRequests(requestData){
		return this.http.post(this.consumerUrl+"all/requests",requestData);
	}

	validateConsumnerLink(tokenData){
		return this.http.post(tokenData.ip+"view",tokenData);
	}

	validateConsumnerOtp(otpData){
		return this.http.post(otpData.ip+"check",otpData);
	}

	getCertificatesForRequest(consumerData){
		return this.http.post(consumerData.ip+"view/certificates",consumerData);
	}
	
	getStudentName(data){
		return this.http.post(data.ip+"get/student/information",data);
	}
	
	getCertificate(consumerData){
		return this.http.post(consumerData.ip+"view/certificate",consumerData,{responseType: ResponseContentType.Blob});
	}

	blockChainVerification(certificateData){
		console.log("Certificate Data");
		console.log(certificateData);
		return this.http.post(certificateData.ip+"verify/certificate",certificateData);
	}

	viewUploadedDoc(data){
		return this.http.post(this.url+"view/certificate",data,{responseType:ResponseContentType.Blob});
	}

	sendVerificationReport(data){
		return this.http.post(this.consumerUrl+"send/verificationReport",data);
	}

	getConsumerCertificate(data){
		return this.http.post(data.ip +"view/certificate",data,{responseType:ResponseContentType.Blob});
	}

}

