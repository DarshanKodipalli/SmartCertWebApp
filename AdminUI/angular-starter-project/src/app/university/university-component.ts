import { Component,OnInit } from '@angular/core';
import { ApplicationComponents } from '../services/applicationComponents';
import { Router } from '@angular/router';
import { RestCallsComponent } from '../services/httpServices';
import { DataTransferService } from '../services/dataTransferService';

declare var $: any;
declare var swal: any;
declare var approve: any;
declare var httpCall: RestCallsComponent;

@Component({
	selector: 'app-university',
	templateUrl:'./university-component.html'
})

export class UniversityComponent implements OnInit{

  public myData:Array<any>;
  public selectedUniv;

	constructor(private httpCall:RestCallsComponent,
              private applicationConstants:ApplicationComponents,
              private route:Router,
              private transfer:DataTransferService){
	}

  disableUniversity(univ) {
    console.log("sending Http Calls");
    this.httpCall.deleteUniversity(univ).subscribe(
      (response) => {
        console.log("disableUniversity:");
        console.log(response);
        this.route.navigate(['university/university-component']);
      },
      (error) => console.log(error));

  }

  deleteUniversity(univ): void {
  swal({
    title: 'Delete the University?',
    text: 'All the Details for the university ' + univ.name + ' and its entities will be erased!',
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, cancel delete!',
    confirmButtonClass: 'confirm-class',
    cancelButtonClass: 'cancel-class',
    closeOnConfirm: false,
    closeOnCancel: false,
  },  function(isConfirm) {
        if (isConfirm) {
            swal({
                title: 'Deleted!',
                text: 'University and its components are removed!',
                confirmButtonText: 'Ok!',
                closeOnConfirm: true
            }, function() {
              this.disableUniversity(univ);
            }.bind(this));

        } else {
            swal("Cancelled", "University and its components are safe", "error");
        }
    }.bind(this));
};

	ngOnInit(){
		var listUniv = [];
		var login:Object;
		login = localStorage.getItem("login");
		this.httpCall.getUniversity().subscribe(
			(response)=>{
        var temp = response.json();
        if(temp.status)
          this.myData = [];
        else
				  this.myData = temp;
				console.log("ngOnInit UniversityComponent");
				console.log(this.myData);},
			(error)=>{console.log("error ngOnInit UniversityComponent")});
			console.log("University Page");
	}

	createUniversity(){
		this.route.navigate(['createUniversity/create-university']);
	}

  selectUniv(y){
    this.selectedUniv = y;
  }

  editUniversity(){
    if(this.selectedUniv){
      this.transfer.setUniversity(this.selectedUniv);
      console.log("edit University");
      this.route.navigate(['editUniversity/edit-university']);
    }
  }

  viewInstitutes(y){
    if(y){
      this.transfer.setUniversity(y);
      console.log("view institute");
      this.route.navigate(['university/view-institutes-component']);
    }
  }
  createInstitute(){
    console.log('create Institute');
    if(this.selectedUniv){
      this.transfer.setUniversity(this.selectedUniv);
      this.route.navigate(['createInstitute/create-institute']);
    }
  }
}
