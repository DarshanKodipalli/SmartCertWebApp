import { Component } from '@angular/core';
import { AppComponent } from '../app.component';
import { RestCallsComponent } from '../services/httpServices';
import { ApplicationComponents } from '../services/applicationComponents';
import { Router } from '@angular/router';
import { NotificationService } from "../services/NotificationService";
import { DataService } from "../services/DataService";
import { NavigationItems } from "../services/sideNavigation";

@Component({
  selector: 'app-login',
  templateUrl: '../login/login.html'
})

export class LoginComponent {

  public loginData:any = {};
  public info:any;
  public data:Object;
  public login:any = {};
  public otpFieldFlag:Boolean = true;
  public otpEntered:any = "";
  public userInfo:any={};
  public token:any={};
  public passCheck:number = 0;

  constructor(
    private appCompo:AppComponent,
    private appConstants:ApplicationComponents,
    private http:RestCallsComponent,
    private route:Router,
    private notify:NotificationService,
    private dispData:DataService,
    private nav:NavigationItems){
  }

  submitLogin(loginData){
    if(typeof loginData.emailId == undefined || typeof loginData.password == undefined){
      console.log("loginComponent: empty");
    }else{
      this.http.universityLogin(loginData).subscribe(
        (response)=>{
          console.log("LoginComponent,response");
          this.token = response.json();
          console.log("__()")
          console.log(this.token);
          console.log("__()")
          if(!this.token.status){
            console.log(this.token.role);
            this.nav.setRole(this.token.role);
            this.otpFieldFlag = false;
          }
          else{
            this.passCheck = -2;
            this.notify.invalidLogin();
          }
        },
        (error)=>{console.log("ERROR:");console.log(error)},
      );
    }
  }

  submitOTP(enteredOTP){
    this.http.validateOTP({otp:enteredOTP,token:this.token.token}).subscribe(
      (response)=>{
        if(response.json().status == 1){
          console.log("Token");
          console.log(this.token);
          localStorage.setItem("login",JSON.stringify(this.token));
          this.http.setTokenAndUrl();
          this.dispData.setUser();
          this.appCompo.login = true;                      
          if(this.token.role==="1")
            this.route.navigate(['dashboard/dashboardPage']);
          else if(this.token.role==="2")
            this.route.navigate(['dashboardApprover/dashboardPageApprover']);
          else
            this.route.navigate(['dashboardAdder/dashboardPageAdder']);
        }else{
          this.passCheck = -3;
          this.otpEntered = "";
          this.login = {};
          this.otpFieldFlag = true;
          console.log("sd");
        }
      },
      (error)=>{console.log(error);console.log("invalid OTP");}
    );
  }

}