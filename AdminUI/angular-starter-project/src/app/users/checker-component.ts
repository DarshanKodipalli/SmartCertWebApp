import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Http } from '@angular/http';
import { ApplicationComponents } from '../services/applicationComponents';
import { Router } from '@angular/router';
import { RestCallsComponent } from '../services/httpServices';
import { DataTransferService } from "../services/dataTransferService";

var confirm=false;
declare var $: any;
declare var swal: any;

@Component({
  selector: 'app-checker',
  templateUrl: './checker-component.html'
})

export class CheckerComponent implements OnInit {

  public myData: Array<Object>;
  public university:any = [];
  public selectedUniversity:any = {};

  constructor(private httpCall: RestCallsComponent, 
              private applicationConstants: ApplicationComponents, 
              private route: Router, 
              private http: Http,
              private transfer:DataTransferService ){

  }

  ngOnInit() {
    console.log("CheckerComponent: get checkers");
    this.httpCall.getCheckers({url:this.transfer.getUniversityForApprover().universityUrl}).subscribe(
      (response) => {
        if(!response.json().status)
          this.myData = response.json();
        else
          this.myData = [];
        console.log("CheckerComponent: getCheckers: response");
        console.log(this.myData);
      },
      (error) => console.log("error"));
    console.log("Checker Page");
  }

  deleteUser(user){
    swal({
      title: 'Delete Checker',
      text: 'Are you sure you want to delete the checker ' + user.name,
      type: "info",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonClass: 'confirm-class',
      cancelButtonClass: 'cancel-class',
      closeOnConfirm: false,
      closeOnCancel: false,
    },  function(isConfirm) {
          if (isConfirm) {
              swal({
                  title: 'Success!',
                  text: 'checker deleted!',
                  confirmButtonText: 'Ok!',
                  closeOnConfirm: true
              }, function() {
                this.disableUser(user);
              }.bind(this));

          } else {
              swal("Cancelled", "Delete aborted", "error");
          }
      }.bind(this));
  }

  disableUser(user){
    user.url = this.selectedUniversity.universityUrl;
    this.httpCall.disableUser({id:user._id}).subscribe(
      (response)=>{
        if(!response.json().status){
          console.log("disableUser: success");
        }else{
          console.log("disableUser: failure");
        }
      }
    )
  }

  getCheckers(university){
    console.log("CheckerComponent: get checkers");
    this.httpCall.getCheckers({url:this.transfer.getUniversityForApprover().universityUrl}).subscribe(
      (response) => {
        if(!response.json().status)
          this.myData = response.json();
        else
          this.myData = [];
        console.log("CheckerComponent: getCheckers: response");
        console.log(this.myData);
      },
      (error) => console.log("error"));
    console.log("Checker Page");
  }

  editChecker(y) {
    this.transfer.setUniversity(y);
    this.route.navigate(['editChecker/edit-checker']);
  }

  createChecker(){
    this.route.navigate(['createChecker/create-checker']);
  }

}
