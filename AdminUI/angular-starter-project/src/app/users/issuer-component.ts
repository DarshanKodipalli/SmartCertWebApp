import { Component, OnInit } from '@angular/core';
import { ApplicationComponents } from '../services/applicationComponents';
import { Router } from '@angular/router';
import { RestCallsComponent } from '../services/httpServices';
import { DataTransferService } from "../services/dataTransferService";

var confirm=false;
declare var $: any;
declare var swal: any;
declare var approve: any;
declare var httpCall: RestCallsComponent;

@Component({
  selector: 'app-issuer',
  templateUrl: './issuer-component.html'
})

export class IssuerComponent implements OnInit {
  constructor(private httpCall: RestCallsComponent, 
              private applicationConstants: ApplicationComponents, 
              private route: Router,
              private transfer:DataTransferService) {
  }

  public myData: Array<Object>;
  public university:any = [];
  public selectedUniversity:any = {};

  ngOnInit() {
    console.log("IssuerComponent: getIssuers");
    this.httpCall.getIssuers({url:this.transfer.getUniversityForIssuer().universityUrl}).subscribe(
      (response) => {
        this.myData = response.json();
        console.log("IssuerComponent: getIssuers: response");
        console.log(this.myData);
      },
      (error) => console.log("error"));
    console.log("Checker Page");
  }

  getIssuers(university){
    console.log("IssuerComponent: getIssuers");
    this.httpCall.getIssuers({url:this.transfer.getUniversityForIssuer().universityUrl}).subscribe(
      (response) => {
        this.myData = response.json();
        console.log("IssuerComponent: getIssuers: response");
        console.log(this.myData);
      },
      (error) => console.log("error"));
    console.log("Checker Page");
  }

  deleteUser(user){
    swal({
      title: 'Delete Issuer',
      text: 'Are you sure you want to delete the issuer ' + user.name,
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
                  text: 'Issuer deleted',
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

  editIssuer(y) {
    this.transfer.setUser(y);
    this.route.navigate(['editIssuer/edit-issuer']);
  }

  createIssuer(){
    this.route.navigate(['createIssuer/create-issuer']);
  }

}
