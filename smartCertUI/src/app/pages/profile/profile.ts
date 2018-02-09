import { Component } from '@angular/core';
import { HttpService } from '../../services/HttpService';
import { Router } from "@angular/router";

declare var $: any;
declare var swal: any;
declare var approve: any;

@Component({
  selector: 'profile',
  templateUrl: './profile.html'
})

export class ProfileComponent {
	public student:any = {};
	public universities:any = [];
	public institutions:any = [];
	public currentPassword:String = "";
	public newPassword:String = "";
	public confirmPassword:String = "";

    constructor(private http:HttpService,private router:Router) {
	    this.http.getStudent(JSON.parse(localStorage.getItem("login"))).
	    subscribe(
		    (response)=>{
			    if(!response.json().status)
			    	this.student = response.json();
			    else{
				    if(response.json().status === -2){
				    }
		    	}
		    	console.log(response.json());
		    },
		    (error)=>{
			    console.log(error);
			    console.log("profile constructor");
	    });

	    this.http.getUniversities(JSON.parse(localStorage.getItem("login"))).
	    subscribe(
	    	(response)=>{
	    		if(!response.json().status)
	    			this.universities = response.json();
	    		else{
				    if(response.json().status === -2){
				    }
		    	}		    	
		    	console.log(response.json());
	    	},
	    	(error)=>{
	    		console.log(error);
	    		console.log("profile constructor");
	    	}
	    );
    }

updatePassword(){
	swal({
	  title: 'Update Password',
	  text: 'Are you sure you want to Update the Password? ',
	  type: "info",
	  showCancelButton: true,
	  confirmButtonColor: '#3085d6',
	  cancelButtonColor: '#d33',
	  confirmButtonText: 'Yes',
	  cancelButtonText: 'No',
	  confirmButtonClass: 'confirm-class',
	  cancelButtonClass: 'cancel-class',
	  closeOnConfirm: false,
	  closeOnCancel: false,
	},  function(isConfirm) {
	      if (isConfirm) {
			if(this.newPassword === this.confirmPassword ){
				var data = {
					token: JSON.parse(localStorage.getItem("login")).token,
					currentPassword: this.currentPassword,
					newPassword: this.newPassword,
					confirmPassword: this.confirmPassword,
					emailId:this.student.emailId
				}
				console.log("Passwords Match");
				this.http.updatePassword(data).subscribe(
					(response)=>{
									console.log("Update Password Status");
									console.log(response.json())
									if(response.json().status===-5){
							          swal({
							              title: 'Failed',
							              text: 'Incorrect Old Password',
							              confirmButtonText: 'Ok!',
							              closeOnConfirm: true
							          }, function() {
											console.log("Invalid old Password");
											this.currentPassword = "";
											this.newPassword = "";
											this.confirmPassword = "";
							          }.bind(this));
									}else if(response.json().status == 1){
							          swal({
							              title: 'Success',
							              text: 'Password Updated!',
							              confirmButtonText: 'Ok!',
							              closeOnConfirm: true
							          }, function() {
												this.router.navigate([""]);
							          }.bind(this));
									}
								},
					(error)=>{console.log(error)})		
			}else{
	          swal({
	              title: 'Failed',
	              text: 'Passwords did not Match!',
	              confirmButtonText: 'Ok!',
	              closeOnConfirm: true
	          }, function() {
					this.currentPassword = "";
					this.newPassword = "";
					this.confirmPassword = "";
	          }.bind(this));
			}
	      } else {
	          swal("Cancelled", "Password not updated:)", "error");
	      }
	  }.bind(this));
}
    getInstitutions(universityId){
    	var temp:any = JSON.parse(localStorage.getItem("login"));
    	temp.universityId = universityId;
    	this.http.getInstitutions(temp).subscribe(
    		(response)=>{
    			if(!response.json().status)
	    			this.institutions = response.json();
	    		console.log(this.institutions);
    		},
    		(error)=>{

    		}
    	);
    }

}