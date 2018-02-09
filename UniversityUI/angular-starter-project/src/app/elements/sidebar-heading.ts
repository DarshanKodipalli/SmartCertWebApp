import { Component,OnInit } from '@angular/core';
import { RestCallsComponent } from '../services/httpServices';
import { AppComponent } from '../app.component';
import { DataService } from "../services/DataService";
import { NotificationService } from "../services/NotificationService";

@Component({
  selector: 'sidebar-heading',
  templateUrl: '../elements/sidebar-heading.html',
})

export class SidebarHeadingComponent implements OnInit{

  public universityData:any = {};

  constructor(
    private http:RestCallsComponent,
    private appCompo:AppComponent, 
    private dataService:DataService,
    private notify:NotificationService) {
    if(!this.universityData.universityName){
      var login = JSON.parse(localStorage.getItem("login"));
      this.http.getUniversityForId({universityId:login.universityId}).subscribe(
        (response)=>{
          var temp = response.json();
            if(!temp.status){
              this.universityData = temp;
              this.dataService.setUniversityData(temp);
              console.log("Sidebarheading component: University: data");
              console.log(temp);
              if(!login.url){
                login.url = temp.universityUrl;
                localStorage.setItem("login",JSON.stringify(login));
                this.http.setTokenAndUrl();
              }
            }
            else{
              console.log("Sidebarheading component: University");
              console.log(temp);
              this.notify.errorNotification();
            }
        },
        (error)=>{
          console.log("Sidebarheading component: University : error");
      });
      console.log("Sidebarheading component: university data not present");
    }else{
      var login = JSON.parse(localStorage.getItem("login"));
      if(!login.url){
        login.url = this.universityData.universityUrl;
        localStorage.setItem("login",JSON.stringify(login));
        this.http.setTokenAndUrl();
      }
      console.log("Sidebarheading component : university Data present");
    }
    console.log("Sidebarheading component");
    console.log(this.universityData);
  }

  ngOnInit(){
  }  
  logout(){
    console.log("Logout");
    console.log(JSON.parse(localStorage.getItem("login")));
    this.http.universityLogout(JSON.parse(localStorage.getItem("login"))).subscribe(
      (response)=>{console.log(response);
        this.appCompo.login = false;
        localStorage.clear();
      },
      (error)=> {console.log("could'nt logout")});
  }
}