import { Component } from '@angular/core';
import { AppComponent } from '../app.component';
import { RestCallsComponent } from '../services/httpServices';
import { ApplicationComponents } from '../services/applicationComponents';
import { Router } from '@angular/router';
import { DataService } from "../services/DataService";

declare var $: any;
declare var swal: any;
declare var approve: any;

@Component({
  selector: 'course',
  templateUrl: '../addCourse/addCourse.html'
})

export class CourseComponent {
  public institutes:any = [];
  public courseName:string = "";
  public streams:any = [];
  public stream:string = "";
  public data:any = {};
  public selectedInstitution:String = "";
  constructor(
    private http:RestCallsComponent,
    private dataService:DataService,
    private route:Router){
    var token:any = {};
    var id = JSON.parse(localStorage.getItem("login")).universityId;
    console.log(this.dataService.getUniversityData());
    this.http.getInstitutions({universityId:id}).subscribe(
      (response)=> {
        console.log("institutes:");
        console.log(response.json());
        if(response.json().status)
          this.institutes = [];
        else
          this.institutes = response.json();
            },
      (error)=> console.log(error));
  }
  institutionSelected(data){
    this.data = data;
  }
  addStream(){
    this.streams.push({streamName:this.stream,enable:true});
    this.stream = "";
  }
  removeStream(){
    if(this.streams.length)
      this.streams.pop();
  }
 create(){
  swal({
    title: 'Create Course',
    text: 'A new Course and Stream will be created!',
    type: "info",
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, create it!',
    cancelButtonText: 'No!',
    confirmButtonClass: 'confirm-class',
    cancelButtonClass: 'cancel-class',
    closeOnConfirm: true,
    closeOnCancel: true,
  },  function(isConfirm) {
        if (isConfirm) {
          var temp = {universityId:"",institutionId:"",courseName:"",InstituteAddress:"",streams:[]};
          temp.universityId = this.data.universityId;
          temp.institutionId = this.data._id;
          temp.courseName = this.courseName;
          temp.InstituteAddress = this.data.blockChainAddress;
          temp.streams = this.streams;
          this.http.createCourse(temp).subscribe(
            (response)=>{
              console.log(response.json());
            },
            (error)=>{
              console.log(error);
            });
          this.route.navigate(['dashboardAdder/dashboardPageAdder']);
        } else {
            swal("Cancelled", "No Course Added:)", "error");
        }
    }.bind(this));
  }
}