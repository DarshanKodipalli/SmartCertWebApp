import { Component } from '@angular/core';
import { HttpService } from '../../services/HttpService';

@Component({
  selector: 'allRequests',
  templateUrl: './allRequests.html'
})

export class AllRequestsComponent {
  public requests:any = [];
  constructor(private http:HttpService) {
  	this.http.allRequests(JSON.parse(localStorage.getItem("login"))).subscribe(
  		(response)=>{
  			console.log("StudentDashboardComponent");
        if(!response.json().status)
  			  this.requests = response.json();
  		},
  		(err)=>{
  			console.log(err);
  			console.log("student dashboard controller")
  		});
  }

}