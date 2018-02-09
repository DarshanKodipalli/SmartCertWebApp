import { Component, OnInit,Pipe, PipeTransform } from '@angular/core';
import { Http, RequestOptions, URLSearchParams } from '@angular/http';
import { ApplicationComponents } from '../services/applicationComponents';
import { Router } from '@angular/router';
import { RestCallsComponent } from '../services/httpServices';
import { DataTransferService } from "../services/dataTransferService";

declare var swal: any;

@Component({
	selector: 'view-institutes-component',
	templateUrl: './view-institutes-component.html'
})

export class ViewInstitutesComponent implements OnInit {
	constructor(private httpCall: RestCallsComponent, 
				private applicationConstants: ApplicationComponents, 
				private route: Router, 
				private http: Http,
				private transfer:DataTransferService) {}


	public myData: Array < Object > ;
	public univName;
	public univId;
	public universityName:String = "";
	public univToAddInstitutions:any;
	ngOnInit() {
		var listUniv = [];
		var univ:any = this.transfer.getUniversity();
		this.univToAddInstitutions = univ;
		this.universityName = univ.name;
		console.log(univ);
		this.httpCall.getAllInstitutesForUniversity({universityId:univ._id}).subscribe(
			(response) => {
				console.log(response.json());
				this.myData = response.json();
				console.log("Hello");
				console.log(this.myData);
			},
			(error) => console.log("error"));
		console.log("View all Institutes Page");
	}

	editInstitution(institution){
		this.transfer.setInstitute(institution);
		this.route.navigate(['editInstitute/edit-institute']);
	}

	disableInstitution(institution){
		swal({
		    title: 'Delete the Institute?',
		    text: 'All the Details for the institute ' + institution.instituteName + ' will be erased!',
		    type: "warning",
		    showCancelButton: true,
		    confirmButtonColor: '#3085d6',
		    cancelButtonColor: '#d33',
		    confirmButtonText: 'Yes',
		    cancelButtonText: 'Cancel',
		    confirmButtonClass: 'confirm-class',
		    cancelButtonClass: 'cancel-class',
		    closeOnConfirm: false,
		    closeOnCancel: false,
		  },function(isConfirm) {
		    if (isConfirm) {
		        swal({
		            title: 'Deleted!',
		            text: 'Institute  removed!',
		            confirmButtonText: 'Ok!',
		            closeOnConfirm: true
		        }, function() {
		            this.disable(institution);
		        }.bind(this));
		    } else {
		            swal("Cancelled", "Delete intitute revoked ", "error");
		        }
		}.bind(this));
	}
  createInstitute(){
    console.log('create Institute');
    this.transfer.setUniversity(this.univToAddInstitutions);
    this.route.navigate(['createInstitute/create-institute']);

  }
	disable(institution){
		this.httpCall.deleteInstitute(institution).subscribe(
        (response) => {
          this.route.navigate(['institute/institute-component']);
          console.log("disable: view institute component");
          console.log(response);
        },
        (error) => {console.log(error); console.log("error : disable : view institute component");});
	}

}