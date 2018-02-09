import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { ApplicationComponents } from '../services/applicationComponents';
import { Router } from '@angular/router';
import { RestCallsComponent } from '../services/httpServices';
import { DataTransferService } from "../services/dataTransferService";
import { NotificationService } from "../services/notificatationService";


var confirm=false;
declare var $: any;
declare var swal: any;
declare var approve: any;
declare var httpCall: RestCallsComponent;

@Component({
  selector: 'app-institute',
  templateUrl: './institute-component.html'
})


export class InstituteComponent implements OnInit {
  constructor(private httpCall: RestCallsComponent, 
              private applicationConstants: ApplicationComponents, 
              private route: Router, 
              private http: Http,
              private transfer:DataTransferService,
              private notify:NotificationService) {
  }

  public myData:any = [];
  public university:any = [];
  public selectedUniversity:any = {};

  disableInstitute(insti) {
    console.log("sending Http Calls");
    this.httpCall.deleteInstitute(insti).subscribe(
      (response) => {
        var temp = response.json();
        if(temp.status == -1)
          this.notify.errorNotification();
        else if(temp.status == -2)
          this.notify.loginNotification();
        else
          location.reload();
      },
      (error) => {
        console.log(error);
      });
  }

  deleteInstitute(inst): void {
  swal({
    title: 'Delete the Institute?',
    text: 'All the Details for the institute ' + inst.instituteName + ' will be erased!',
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
                text: 'Institute  removed!',
                confirmButtonText: 'Ok!',
                closeOnConfirm: true
            }, function() {
              this.disableInstitute(inst);
              this.getInstitutes();
            }.bind(this));

        } else {
            swal("Cancelled", "Delete intitute revoked ", "error");
        }
    }.bind(this));
  };


  ngOnInit() {
    this.httpCall.getUniversity()
    .subscribe(
      (response) => {
        console.log(response.json());
        if(!response.json().status){
          this.university = response.json();
        }
        else{
          var temp = response.json();
          if(temp.status == -1)
            this.notify.errorNotification();
          else if(temp.status == -2)
            this.notify.loginNotification();
            this.university = [];
        }
      },
      (error) => console.log("error"));
    console.log("Institute Page");
  }

  getInstitutes(){
    this.httpCall.getAllInstitutesForUniversity({universityId:this.selectedUniversity._id})
    .subscribe(
      (response)=>{
        if(!response.json().status){
          this.myData = response.json();
        }else{
          var temp = response.json();
          if(temp.status == -1)
            this.notify.errorNotification();
          else if(temp.status == -2)
            this.notify.loginNotification();
          this.myData = [];
        }
      },
      (error)=>{
        console.log("instituteComponent : getUNiversoty: error");
      });
  }

  editInstitute(y) {
    this.transfer.setInstitute(y);
    this.route.navigate(['editInstitute/edit-institute']);
  }
}
