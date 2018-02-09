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
  selector: 'creator',
  templateUrl: './creator-component.html'
})

export class CreatorComponent implements OnInit {
  constructor(private httpCall: RestCallsComponent, private applicationConstants: ApplicationComponents, private route: Router,private transfer:DataTransferService) {
  }

  public university: any = [];
  public selectedUniversity: any = {};
  public creators:any = [];

  ngOnInit() {
    console.log("getCreators: get Creators");
    this.httpCall.getCreators({url:this.transfer.getUniversityForCreator().universityUrl}).subscribe(
      (response) => {
        if(!response.json().status)
          this.creators = response.json();
        else
          this.creators = [];
        console.log("getCreators: getCreators: response");
        console.log(this.creators);
      },
      (error) => console.log("error"));
    console.log("Checker Page");
  }

  getCreators(university){
    console.log("getCreators: get Creators");
    this.httpCall.getCreators({url:this.transfer.getUniversityForCreator().universityUrl}).subscribe(
      (response) => {
        if(!response.json().status)
          this.creators = response.json();
        else
          this.creators = [];
        console.log("getCreators: getCreators: response");
        console.log(this.creators);
      },
      (error) => console.log("error"));
    console.log("Checker Page");
  }

  deleteUser(user){
    swal({
      title: 'Delete Creator',
      text: 'Are you sure you want to delete the creator ' + user.name,
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
                  text: 'creator deleted!',
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


  editChecker() {
   // this.route.navigate(['editChecker/edit-checker']);
  }

  createCreator(){
    this.route.navigate(['createCreator/create-creator']);
  }

}
