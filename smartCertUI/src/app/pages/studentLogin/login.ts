import { Component } from '@angular/core';
import { AppComponent } from '../../app.component';
import { HttpService } from '../../services/HttpService';

@Component({
  selector: 'login',
  templateUrl: './login.html'
})

export class LoginPageComponent {
  public emailId:string = "";
  public password:string = "";
  public otp:string = "";
  public flag:boolean = false; 

  constructor(private app:AppComponent,private http:HttpService) {
    if(localStorage.getItem("temp")){
      this.flag = true;
    }
  }

  login(){
    this.http.loginService({emailId:this.emailId,password:this.password}).subscribe(
      (response)=>{
        if(response.json().token){
          localStorage.setItem("temp",JSON.stringify(response.json()));
          this.flag = true;
        }
      },
      (error) =>{
        console.log(error);
      });
  }

  verifyOTP(){
    var data = JSON.parse(localStorage.getItem("temp"));
    data.otp = this.otp;
    this.http.validateOtp(data).subscribe(
      (response)=>{
        console.log(response.json());
        if(response.json().status === 1){
          localStorage.setItem("login",localStorage.getItem("temp"));
          localStorage.removeItem("temp");
          this.app.login = true;
          this.flag = false;
        }
        else{
          localStorage.removeItem("temp");
          this.app.login = false;
          this.flag = false;
        }
      },
      (error)=>{
        console.log(error);
      });
  }
}