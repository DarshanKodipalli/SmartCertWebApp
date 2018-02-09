import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { ApplicationComponents } from '../services/applicationComponents';

@Injectable()

export class RestCallsComponent{
	private token:String = "";

	constructor(private http:Http,private appConstants:ApplicationComponents){
		if(localStorage.getItem("loginData"))
			this.token = JSON.parse(localStorage.getItem("login")).token;
	}

	setToken(){
		this.token = JSON.parse(localStorage.getItem("login")).token;
	}

	createUniversity(universityInformation){
		console.log("Create University");
		universityInformation.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPort()+"/add/university",universityInformation);
	}

	editUniversity(universityInformation){
		console.log("Update University");
		universityInformation.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPort()+"/update/university",universityInformation);
	}

	editInstitute(instituteInformation){
		console.log("Update Institute");
		 instituteInformation.token = this.token
		return this.http.post(this.appConstants.getUrlAndPort()+"/update/institute",instituteInformation);
	}

	createInstitute(instituteInformation){
		console.log("Create institution");
		instituteInformation.token  = this.token
		return this.http.post(this.appConstants.getUrlAndPort()+"/add/institute",instituteInformation);
	}

	deleteInstitute(institute)
	{
		console.log("Delete institution");
		institute.token  = this.token
		return this.http.post(this.appConstants.getUrlAndPort()+"/delete/institute",institute);
	}

	deleteUniversity(univ)
	{
		console.log("Delete university");
		univ.token  = this.token
		return this.http.post(this.appConstants.getUrlAndPort()+"/delete/university",univ);
	}

	getUniversity(){
		var data:any = {};
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPort()+"/get/university",data);
	}

	getInstitutions(){
		var data:any = {};
		data.token = this.token;
		return this.http.post(this.appConstants.getUrlAndPort()+"/get/institutions",data);
	}

	universityLogin(loginData){
		loginData.token  = this.token
		console.log("universityLogin");
		return this.http.post(this.appConstants.getUrlAndPort()+"/university/login",loginData);
	}

	createUniversityUser(userData){
		userData.token  = this.token
		console.log("addUsersForUniversity: ");
		console.log(userData.url)
		return this.http.post(userData.url+"/create/university/user",userData);
	}

	getCheckers(data){
		data.token = this.token;
		data.role = "2";
		console.log('Inside get checkers');
		return this.http.post(data.url+"/get/checkers",data);
	}

	disableUser(data){
		data.token = this.token;
		return this.http.post(data.url+"/disable/user",data);
	}

	getCreators(data){
		data.token = this.token;
		data.role = "0";
		console.log('Inside get checkers');
		return this.http.post(data.url+"/get/checkers",data);
	}
	getIssuers(data){
		data.token = this.token;
		data.role = "1";
		console.log('Inside get issuers');
		return this.http.post(data.url+"/get/issuers",data);
	}

	getAllInstitutesForUniversity(requestOptions){
		requestOptions.token  = this.token
		console.log("Get All institutions for university");
		return this.http.post(this.appConstants.getUrlAndPort()+"/get/AllInstitutesForUniversity",requestOptions);
	}

	validateOTP(otp){ 
        return this.http.post(this.appConstants.getUrlAndPort()+"/admin/login/OTP/Check",otp);
    }
	adminLogin(loginData){
		console.log("adminLogin");
		return this.http.post(this.appConstants.getUrlAndPort()+"/admin/login",loginData);
	}
	adminLogout(data){
		return this.http.post(this.appConstants.getUrlAndPort()+"/admin/logout",data);
	}
	getApplicationUserForEmail(emailId){
		emailId.token  = this.token
		console.log('get User For email: '+emailId);
		return this.http.post(this.appConstants.getUrlAndPort()+"/get/applicationUser/email",{emailId});
	}
}
