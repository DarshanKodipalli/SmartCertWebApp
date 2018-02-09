import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'left-sidebar-1',
  templateUrl: '../elements/left-sidebar-1.html'
})

export class LeftSidebar1Component {
	public name:String = "";
    constructor(private route:Router) {
    	this.name = JSON.parse(localStorage.getItem("login")).name;
    }
 	
 	dashboard(){
 		this.route.navigate(['']);
 	}
 	certificates(){
 		console.log("Certificates")
 		this.route.navigate(['certificates/get']);
 	}
 	profile(){
 		console.log("Profile")
 		this.route.navigate(['user/profile']); 
 	}
 	help(){
 		console.log("Help")
 		this.route.navigate(['help/get']);
 	}
}
