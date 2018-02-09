

import { Component } from '@angular/core';
import { AppComponent } from '../app.component';
import { RestCallsComponent } from '../services/httpServices';
import { ApplicationComponents } from '../services/applicationComponents';
import { Router } from '@angular/router';
//import { FORM_DIRECTIVES } from '@angular/common';
@Component({
  selector: 'app-login',
  templateUrl: '../login/login.html'
})

export class LoginComponent {

  public loginData: Object;
  public info: any;
  public data: Object;
  constructor(private appCompo: AppComponent, private appConstants: ApplicationComponents, private http: RestCallsComponent, private route: Router) {
  }

  login = <any>{};
  otpFieldFlag: Boolean = true;
  otpEntered: any = "";
  checkFlag:number = 2;
  passCheck:number = 2;
  otpCheck:number = 2;
  respData:any = {};

  submit(){
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var email = this.login.emailId,password = this.login.password;
    if(email){
      if(re.test(email)){
        this.checkFlag = 1;
      }else{
        this.checkFlag = 0
      }
    }else{
      this.checkFlag = -1;
    }
    if(password){
      this.passCheck = 1;
    }else{
      this.passCheck = 0;
    }
    if(this.passCheck === 1 && this.checkFlag === 1){
      this.http.adminLogin(this.login).subscribe(
        (response) =>{
          this.respData = response.json();
          if(!this.respData.status){
            console.log(localStorage.getItem('emailId'));
            this.otpFieldFlag = false;
          }
          else{
            this.passCheck = this.respData.status;
          }
        },
        (error) => {
          this.passCheck = -1;
          console.log("ERROR:");
          console.log(error);
      });
    }
  }

  submitOtp(){
    if(!this.otpFieldFlag){
      if(this.otpEntered){
        this.otpCheck = 1;
      }else{
        this.otpCheck = 0;
      }
      if(this.otpCheck === 1){
        this.http.validateOTP({ otp: this.otpEntered, token: this.respData.token }).subscribe(
        (response) => {
          if(response.json().status>0){
            console.log('Inside correct otp method');
            this.respData.emailId = response.json().emailId;
            localStorage.setItem("login", JSON.stringify(this.respData));
            this.http.setToken();
            this.appCompo.login = true;
            this.route.navigate(['university/university-component']);
          }
          else{
            localStorage.clear();
            this.otpCheck = -1;
            this.otpFieldFlag = true;
          }
        },
        (error) => { 
          console.log(error); console.log("invalid OTP");
          localStorage.removeItem("login");
          this.otpFieldFlag = false;
        });
      }
    }
  }
}
