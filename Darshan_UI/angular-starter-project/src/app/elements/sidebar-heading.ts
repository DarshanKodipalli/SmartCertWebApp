import { Component,OnInit } from '@angular/core';
import { RestCallsComponent } from '../services/httpServices';
import { Router } from '@angular/router';
import { ApplicationComponents } from '../services/applicationComponents';
import { AppComponent } from '../app.component';

@Component({
  selector: 'sidebar-heading',
  templateUrl: '../elements/sidebar-heading.html',
  //styleUrls: ['./src/styles/elements/sidebar-heading.scss']
})

export class SidebarHeadingComponent implements OnInit{

  data:Object;
  universityName:String;
  primaryContactName:String;
  city:String;
  state:String;
  token:String;
  public universityData:Object;
  constructor(private http:RestCallsComponent,private appCompo:AppComponent, private route:Router) {
  }
  ngOnInit(){
    console.log("Id:");
//  	console.log(JSON.parse(localStorage.getItem("loginData")).emailId);
  	console.log((JSON.parse(localStorage.getItem("universityInfo"))));
    this.universityData = (JSON.parse(localStorage.getItem("universityInfo")));
    console.log(this.universityData);
     this.universityName = (JSON.parse(localStorage.getItem("universityInfo"))).name;
     this.primaryContactName = (JSON.parse(localStorage.getItem("universityInfo"))).primaryContactName;
     this.city = (JSON.parse(localStorage.getItem("universityInfo"))).city;
     this.state = (JSON.parse(localStorage.getItem("universityInfo"))).state;
/*  	this.http.getUniversityForId(JSON.parse(localStorage.getItem("login")).token).subscribe(
  		(response)=>{console.log("Data");
                   console.log(response.json());
                   this.universityName = response.json()[0].name;
                   this.primaryContactName = response.json()[0].primaryContactName;
                   this.city = response.json()[0].city;
                   this.state = response.json()[0].state;
                   this.token = response.json()[0].token;
                   localStorage.setItem("universityInfo",JSON.stringify(response.json()))},
  		(error)=>{console.log("Error:");
                console.log(error)});*/
  }  
  logout(){
    console.log("Logout");
    console.log(JSON.parse(localStorage.getItem("login")));
    localStorage.clear();
    this.http.universityLogout(JSON.parse(localStorage.getItem("login"))).subscribe(
      (response)=>{console.log(response);
                    this.appCompo.login = false;
                    localStorage.clear();
//                    location.reload();
                  },
      (error)=> {console.log("could'nt logout")});
  }
}