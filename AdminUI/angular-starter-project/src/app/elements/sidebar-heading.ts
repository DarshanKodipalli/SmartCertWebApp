import { Component, OnInit } from '@angular/core';
import { RestCallsComponent } from '../services/httpServices';
import { Router } from '@angular/router';
import { ApplicationComponents } from '../services/applicationComponents';
import { AppComponent } from '../app.component';

@Component({
  selector: 'sidebar-heading',
  templateUrl: '../elements/sidebar-heading.html',
  //styleUrls: ['./src/styles/elements/sidebar-heading.scss']
})

export class SidebarHeadingComponent implements OnInit {

  data: Object;
  userName: String;
  emailId: String;
  designation: String;
  roleName: String;
  token: String;
  public userData: Object;
  constructor(private http: RestCallsComponent, private appCompo: AppComponent, private route: Router) {
  }
  ngOnInit() {
    var xyz=JSON.parse(localStorage.getItem('login'));
    this.http.getApplicationUserForEmail(xyz).subscribe(
      (res) => {
        this.userName=res.json().name;
        this.designation=res.json().designation;
        this.roleName=res.json().roleName;
        this.emailId=res.json().emailId;
      },
      (err) => console.log(err));
  }
  logout() {
    this.http.adminLogout(JSON.parse(localStorage.getItem("login"))).subscribe(
      (response) => {
        console.log(response);
        this.appCompo.login = false;
        localStorage.clear();
        this.route.navigate(['login/login']);
        //                    location.reload();
      },
      (error) => { console.log("could'nt logout") });
  }
}
