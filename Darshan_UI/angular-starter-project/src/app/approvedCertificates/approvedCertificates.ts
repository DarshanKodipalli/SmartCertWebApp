import { Component,OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { RestCallsComponent } from '../services/httpServices';
import { Router} from '@angular/router';
import { Typeahead } from 'ng2-typeahead-master';
import { ISubscription } from "rxjs/Subscription";

declare var $: any;
declare var typeahead: any;


@Component({
  selector: 'certificatePageApprover',
  templateUrl: '../approvedCertificates/approvedcertificates.html'
/*  styleUrls: [
    '../approvedCertificates/typeahead.scss'
  ]*/
})

export class CertificatePageApprovedComponent implements OnInit {

   constructor(private http:RestCallsComponent,private rout:Router) {
     this.onload();
  }

  public onload(){
          this.hidetable=false;
          this.studentName = "";
          this.cour = "";
          this.stre = "";
          this.selectedCourse = "";
          this.selectedStream = "";
          this.certificateBatch = "";
            console.log("Id:");
        var abc = this.http.getAllVerifiedCertificates().subscribe(
        (response)=>{
                      this.ApprovedCertificates = response.json();
                      console.log(this.ApprovedCertificates);
                    },
        (error)=>console.log(error));

  }
  public ApprovedCertificates:any=[];  
  public studentName:String="";
  public certificateBatch:String="";
  public courses:any = [];
  public streamsOffered:any = [];
  public streams:any[];
  public course:any;
  public cour:String="";
  public stre:String="";
  public hidetable = false;
  public selectedCourse:String;
  public selectedStream:String;

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
  }
  courseSelected(even:any){
    console.log("courseSelected");
    console.log(even);
    this.cour = even.target.value;
    console.log(even.target.value);
  }
  streamSelected(eve:any){
    console.log("streamSelected");
    console.log(eve);
    this.stre = eve.target.value;
  }
  searchCertificates(a,b,c,d){
    console.log("________________________________________");
    console.log(a+ "  "+b+"  ");
    console.log("________________________________________");
    console.log(this.cour);
    var data;
    console.log(this.stre);
    data = {studentName:a,batch:b,courseName:this.cour,stream:this.stre};
    console.log("Data:_______________________________________")
    console.log(data);
    this.http.getCertificatesForGivenInformation(data).subscribe(
      (response)=>{
        console.log(response);
        this.ApprovedCertificates = response.json();
        if(response.json().length==0){
          this.hidetable = true;
        }
      },(error)=>console.log(error));
  }

}
