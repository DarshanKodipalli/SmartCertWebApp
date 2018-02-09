import { Component,OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { RestCallsComponent } from '../services/httpServices';
import { Router} from '@angular/router'

declare var Dropzone: any;

@Component({
  selector: 'institutesPage',
  templateUrl: '../institutesPage/institutesPage.html'
})


export class InstitutePageComponent implements OnInit {

  public institutes:any=[];
  public courses:any=[];
  public batches:any=[];
  public batchYears:Array<Number>;
  public institutioSelected:String;
  public courSelected:String;
  public batSelected:String;
  public universityEnSelected:String;
  public institutioEnSelected:String;
  public courEnSelected:String;
  public batEnSelected:String;

  public hideFileUploads:Boolean;
  constructor(private http:Http, private rest:RestCallsComponent, private ro:Router) {
  }

  ngOnInit(){
    this.hideFileUploads = true;
    console.log("UniversityInfo");
  	console.log(JSON.parse(localStorage.getItem("universityInfo")));
    this.universityEnSelected = JSON.parse(localStorage.getItem("universityInfo"))._id;
  	this.rest.getInstitutions(JSON.parse(localStorage.getItem("universityInfo"))._id).subscribe(
  		(response)=> {console.log("institutes:");
  					  console.log(response.json());
              var flags = [],output=[],length=response.json().length,i;
              console.log(length);
              for(i=0;i<length;i++){
                if(flags[response.json()[i].name])continue;
                flags[response.json()[i].name] = true;
                output.push({name:response.json()[i].name,id:response.json()[i]._id});
              }
  					  this.institutes=output;
  					  console.log(this.institutes);},
  		(error)=> console.log(error));  	

      Dropzone.autoDiscover = false;
    const myDropzone = new Dropzone('#my-dropzone', {
      url: 'http://localhost:5000/upload.php',
      dictDefaultMessage: 'Drop your files here to upload'
    });
  }

  institutionSelected(institute){
    console.log("institute:");
    var dataToBeSent:Object;
  	console.log(institute);
    for(var i=0;i<this.institutes.length;i++){
      if(this.institutes[i].id==institute){
        console.log("condition True:")
        console.log(this.institutes[i]);
        dataToBeSent = this.institutes[i];
        this.institutioSelected = this.institutes[i].name;
        this.institutioEnSelected = this.institutes[i].id;
        console.log("selected Institute:");
        console.log(this.institutioSelected);
        console.log("data to be sent:")
        console.log(dataToBeSent);
        this.rest.getCoursesForInstitute(dataToBeSent).subscribe(
        (response)=> {console.log("Courses:");
                console.log(response.json());
                this.courses=response.json();
                console.log(this.courses);},
        (error)=> console.log(error));    
      }
    }
  }
  courseSelected(course){
    if(course!=undefined){
      console.log(course);
      var date = new Date();
      var courseStartYear:any;
      var Year = date.getUTCFullYear();
      console.log(Year);
      this.batchYears = [];
      for(i=0;i<this.courses.length;i++){
        if(course == this.courses[i]._id){
          courseStartYear = this.courses[i].startYear;
          this.courSelected = this.courses[i].course;
          console.log(this.courSelected);
          console.log(courseStartYear);
            for(var i=(courseStartYear); i<=Year; i++){
              this.batchYears.push(i);
              console.log(i);
          }
        }
      }
  }
}
  batchSelected(batch){
    if(batch!=undefined){
      this.batSelected = batch;
      this.hideFileUploads = false;
      var batchInfo:any = {batchInfo:this.batSelected,courseInfo:this.courSelected,instituteInfo:this.institutioSelected,institutionId:this.institutioEnSelected,unveristyId:this.universityEnSelected};
      console.log(batchInfo);
      localStorage.setItem("certificateParams",JSON.stringify(batchInfo));
    }
  }
  viewUploaded(){
    this.ro.navigate(['institutePage/getUploaded']);
  }
}
