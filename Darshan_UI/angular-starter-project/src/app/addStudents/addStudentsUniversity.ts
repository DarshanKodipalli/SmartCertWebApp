import { Component,OnInit } from '@angular/core';
import { Typeahead } from 'ng2-typeahead-master';
import { ISubscription } from "rxjs/Subscription";
import { Http } from '@angular/http';
import { RestCallsComponent } from '../services/httpServices';
import { Router} from '@angular/router';

declare var $: any;
declare var typeahead: any;

@Component({
  selector: 'addStudentsUniversity',
  templateUrl: '../addStudents/addStudentsUniversity.html'
})

export class AddStudentsUniversityComponent implements OnInit {

public institutes:any = [];
public selectedCourse:String;
public selectedStream:String;
public selectedYear:String;
public institutioEnSelected:String;
public selectedInstitution:String;

public hideDecisionDiv:boolean = true;
public hideFileUploads:boolean = true;
public instituteFlag:boolean = false;
public courseFlag:boolean = false;
public streamFlag:boolean = false;
public yearFlag:boolean = false;


  constructor(private http:RestCallsComponent,private rout:Router) {
  }

  ngOnInit(){
  	    let streams = ['Automobile Engineering','Applied Electronics and Instrumentation Engineering','Agricultural Engineering','Aeronautical Engineering',
                   'Bio Technology','Biochemical Engineering','Civil Engineering','Chemical and Alcohol Technology','Computer Science Engineering','Chemical Engineering',
                    'Electronics & Instrumentation Engineering','Electronics & Telecomm Engineering','Electronics Engineering','Electronics Instrumentation & Control','Electrical & Electronics Engineering',
                  'Electrical Engineering','Electronics & Communication Engineering','Environmental Engineering','Industrial Production Engineering','Instrumentation & Control',
                  'Food Technology','Industrial Engineering','Instrumentation Engineering','Information Technology','Leather Technology','Marine Engineering',
                  'Material Science','Mechanical & Industrial Engineering','Mechanical Engineering','Man Made Fibre Technology','Manufacturing Technology','Oil Technology',
                  'Metallurgical Engineering','Production Engineering','Plastic Technology','Textile Engineering','Textile Technology','Production & Industrial Engineering'
                ];
    let courses = ['B.E','B.Sc. Courses','B.C.A.','B.Arch','B.Pharmacy','B.B.A.','Commercial Pilot training','Diploma Course in Fire Safety and Technology',
                    'Merchant Navy related courses','Diploma courses','M.B.A','M.Com','M.S','M.Tech'];
    $('.typeahead-1').typeahead({
      source: courses
    });
    $('.typeahead-2').typeahead({
      source: streams
    });

    console.log("UniversityInfo");
  	console.log(JSON.parse(localStorage.getItem("universityInfo")));
  	this.http.getInstitutions(JSON.parse(localStorage.getItem("universityInfo"))._id).subscribe(
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
  }
  institutionSelected(institute){
  	console.log("InstituteSelected");
  	this.instituteFlag = true;
  	for(var i=0;i<this.institutes.length;i++){
      if(this.institutes[i].id==institute){
        console.log(this.institutes[i]);
        this.selectedInstitution = this.institutes[i].name;
        this.institutioEnSelected = this.institutes[i].id;
    	}
	}
  }
  courseSelected(even:any){
  	this.courseFlag = true;
    console.log("courseSelected");
    console.log(even);
    console.log(even.target.value);
    this.selectedCourse = even.target.value;
  }
  streamSelected(eve:any){
  	this.streamFlag = true;
    console.log("streamSelected");
    console.log(eve);
    this.selectedStream = eve.target.value;
  }
  yearSelected(year){
  	this.selectedYear = year;
  	if(this.instituteFlag === true && this.courseFlag === true && this.streamFlag===true){
  		this.hideDecisionDiv = false;
  		var batchInfo = {instituteName:this.selectedInstitution,institutionId:this.institutioEnSelected,courseName:this.selectedCourse,stream:this.selectedStream,year:this.selectedYear};
  		localStorage.setItem("batchInfoForStudent",JSON.stringify(batchInfo));
  	}
  }
  manualAdditionSelected(){
  	console.log("manualAdditionSelected:");
  	this.rout.navigate(['addStudent/manually']);
  }
  fileUploadAdditionSelected(){
  	console.log("fileUploadAdditionSelected");
  }
}
