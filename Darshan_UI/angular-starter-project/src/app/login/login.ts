import { Component } from '@angular/core';
import { AppComponent } from '../app.component';
import { RestCallsComponent } from '../services/httpServices';
import { ApplicationComponents } from '../services/applicationComponents';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: '../login/login.html'
})

export class LoginComponent {

  public loginData:Object;
  public info:any;
  public data:Object;
  constructor(private appCompo:AppComponent,private appConstants:ApplicationComponents, private http:RestCallsComponent,private route:Router) {
  }
  
  emailEntered:String = "";
  passwordEntered:String = "";
  login = {};
  otpFieldFlag:Boolean = true;
  loginFlag:Boolean = false;
  daata = {emailId:this.emailEntered,password:this.passwordEntered};
  otpEntered:any = "";

  submitLogin(loginData){
    console.log(loginData);
    this.data = loginData;
    this.http.universityLogin(loginData).subscribe(
      (response)=>{console.log("Response:");
                   console.log(response.json().encryptedemailId);
                   this.info = response.json().token;
                   this.loginData = response.json().encryptedemailId;
                   localStorage.setItem("login",JSON.stringify(response.json()));
                   this.http.getUniversityForId(response.json()).subscribe(
                     (response)=>{
                                   console.log(response.json());
                                   localStorage.setItem("universityInfo",JSON.stringify(response.json()));
                                   console.log(this.loginData)
                                   this.http.getUniversityUserForId(this.loginData).subscribe(
                                     (response)=>{
                                                     console.log(response.json());
                                                     localStorage.setItem("universityUserInfo",JSON.stringify(response.json()))
                                                  },
                                     (error)=>console.log(error));
                                  },
                     (error)=>console.log(error));
                   this.otpFieldFlag = false;
                },
      (error)=>{console.log("ERROR:");console.log(error)},
      );
/*  	if(loginData.emailId == "darshan@raremile.in"  && loginData.password =="darshan"){

  	
  }*/
}

  submitOTP(enteredOTP){
    console.log(enteredOTP);
    var otp:Object;
    this.http.validateOTP({otp:enteredOTP,token:this.info}).subscribe(
      (response)=>{
                    console.log("valid otp:")
                    console.log(response.json());
                    localStorage.setItem("loginData",JSON.stringify(this.data));
                    this.appCompo.login = true;
                  },
      (error)=>{console.log(error);console.log("invalid OTP");}
    );
  }

}