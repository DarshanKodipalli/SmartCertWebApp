import { Component,OnInit } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { Http } from '@angular/http';
import { RestCallsComponent } from '../services/httpServices';
import { Router} from '@angular/router';
import { DataService } from "../services/DataService";
import { DataTransferService } from "../services/DataTransferService";

declare var $: any;
declare var swal: any;
declare var approve: any;

@Component({
  selector: 'addStudentsUniversity',
  templateUrl: '../addStudents/addStudentsUniversity.html'
})

export class AddStudentsUniversityComponent implements OnInit {

  public institutes:any = [];
  public selectedCourse:any;
  public selectedStream:any;
  public selectedYear:String;
  public selectedInstitution:any = {};
  public hideDecisionDiv:boolean = true;
  public hideCreate:boolean = true;
  public courses:any = [];
  public streams:any = [];
  public year:String = "";

  constructor(
    private http:RestCallsComponent,
    private rout:Router,
    private dataService:DataService,
    private transfer:DataTransferService) {
    var id =  JSON.parse(localStorage.getItem("login")).universityId;
    this.http.getInstitutions({universityId:id}).subscribe(
      (response)=> {
        if(!response.json().status)
          this.institutes=response.json();
        else
          this.institutes=[];
      },
      (error)=> {
        console.log(error);
      });
  }

  ngOnInit(){

  }
  institutionSelected(institute){
    this.selectedInstitution = institute;
    console.log(this.selectedInstitution);
    this.http.getCoursesForInstitute({instituteId:institute._id}).subscribe(
          (response)=>{
            if(!response.json().status)
              this.courses = response.json();
            else
              this.courses  = [];
            console.log(this.courses);
          },
          (error)=>{
            console.log(error);
          }
          ); 
  }
  courseSelected(even){
    console.log("courseSelected");
    this.selectedCourse = even;
    this.streams = even.streams;
    console.log(even.streams);
  }
  streamSelected(eve){
    console.log("streamSelected");
    console.log(eve);
    this.selectedStream = eve;
  }
  yearSelected(year){
    this.selectedYear = year;
    if(this.selectedCourse&&this.selectedInstitution&&this.selectedStream&&this.selectedYear){
      this.hideDecisionDiv = false;
    }
  }
  createBatch(){
      swal({
        title: 'Create Batch',
        text: 'Should this batch be created?',
        type: "info",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!',
        cancelButtonText: 'No!',
        confirmButtonClass: 'confirm-class',
        cancelButtonClass: 'cancel-class',
        closeOnConfirm: true,
        closeOnCancel: true,
      },  function(isConfirm) {
            if (isConfirm) {
                  if(!this.hideDecisionDiv){
                    var batchInfo = {
                      instituteName:this.selectedInstitution.instituteName,
                      institutionId:this.selectedInstitution._id,
                      courseId:this.selectedCourse._id,
                      courseName:this.selectedCourse.courseName,
                      stream:this.selectedStream.streamName,
                      year:this.selectedYear,
                      batchAddress : "",
                      _id:""
                    };
                    this.http.createBatchForStudent({token:JSON.parse(localStorage.getItem("login")).token,batchInfo:batchInfo}).subscribe(
                      (response)=>{
                        console.log(response.json());
                        if(!response.json()._id){
                                  swal({
                                        title: 'Batch Created',
                                        text: 'New Batch Created!',
                                        confirmButtonText: 'Ok!',
                                        closeOnConfirm: true
                                    }, function(isConfirm) {
                                          if(isConfirm){
                                            this.rout.navigate(['view/StudentBatches']);
                                          }
                                      }.bind(this));
                        }else{
                          console.log("batch created");
                            batchInfo.batchAddress = response.json().batchAddress;
                            batchInfo._id = response.json()._id;
                            this.transfer.setBatch(batchInfo);
                            this.hideCreate = false;
                        }
                      },
                      (error)=>{
                        console.log(error)
                      });
                  }              
            } else {
                swal("Cancelled", "No Batch Added:)", "error");
            }
        }.bind(this));    
  }
  manualAdditionSelected(){
    console.log("manualAdditionSelected:");
    this.rout.navigate(['addStudent/manually']);
  }
  fileUploadAdditionSelected(){
    console.log("fileUploadAdditionSelected");
    this.rout.navigate(['addStudent/throughFile']);
  }
}