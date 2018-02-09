import { Component,OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { RestCallsComponent } from '../services/httpServices';
import { Router} from '@angular/router';
import { ISubscription } from "rxjs/Subscription";

declare var $: any;
declare var typeahead: any;


@Component({
  selector: 'certificatePageApprover',
  templateUrl: '../approvedCertificates/approvedCertificates.html'
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
          this.studentRollNumber = "";
            console.log("Id:");
        var abc = this.http.getAllVerifiedCertificates({token:JSON.parse(localStorage.getItem("login")).token}).subscribe(
        (response)=>{
                      this.ApprovedCertificates = response.json();
                      this.numberOfCertificates = response.json().length;
                      console.log(this.ApprovedCertificates);
                    },
        (error)=>console.log(error));

  }
  public numberOfCertificates:number = 0;
  public ApprovedCertificates:any=[];  
  public studentName:String="";
  public studentRollNumber:String="";
  public certificateBatch:String="";
  public courses:any = [];
  public streamsOffered:any = [];
  public streams:any[];
  public course:any;
  public cour:String="";
  public stre:String="";
  public hidetable = false;
  public coursess:any = [];
  public streamss:any = [];
  public selectedCourse:String;
  public selectedStream:String;

  ngOnInit(){
    this.streamss = ['Automobile Engineering','Applied Electronics and Instrumentation Engineering','Agricultural Engineering','Aeronautical Engineering',
                   'Bio Technology','Biochemical Engineering','Civil Engineering','Chemical and Alcohol Technology','Computer Science Engineering','Chemical Engineering',
                    'Electronics & Instrumentation Engineering','Electronics & Telecomm Engineering','Electronics Engineering','Electronics Instrumentation & Control','Electrical & Electronics Engineering',
                  'Electrical Engineering','Electronics & Communication Engineering','Environmental Engineering','Industrial Production Engineering','Instrumentation & Control',
                  'Food Technology','Industrial Engineering','Instrumentation Engineering','Information Technology','Leather Technology','Marine Engineering',
                  'Material Science','Mechanical & Industrial Engineering','Mechanical Engineering','Man Made Fibre Technology','Manufacturing Technology','Oil Technology',
                  'Metallurgical Engineering','Production Engineering','Plastic Technology','Textile Engineering','Textile Technology','Production & Industrial Engineering'
                ];
    this.coursess = ['B.E','B.Sc. Courses','B.C.A.','B.Arch','B.Pharmacy','B.B.A.','Commercial Pilot training','Diploma Course in Fire Safety and Technology',
                    'Merchant Navy related courses','Diploma courses','M.B.A','M.Com','M.S','M.Tech'];
  }
  courseSelected(even){
    console.log("courseSelected");
    console.log(even);
    this.cour = even;
  }
  streamSelected(eve){
    console.log("streamSelected");
    this.stre = eve;
  }
    viewCertificate(a) {
        console.log(a);
        this.http.viewUploadedDoc({
            token: JSON.parse(localStorage.getItem("login")).token,
            id: a._id
        }).subscribe(
            (response) => {
                console.log(response);
                var resp: any = response;
                console.log(resp);
                var file = new Blob([resp.json()], {
                    type: 'application/pdf'
                });
                var fileUrl = URL.createObjectURL(file);
                window.open(fileUrl);
            },
            (error) => console.log(error));
    }  
  searchCertificates(a,b,c,d,e){
    console.log("________________________________________");
    console.log(a+ "  "+b+"  ");
    console.log("________________________________________");
    console.log(this.cour);
    var data;
    console.log(this.stre);
    data = {studentName:a,batch:b,studentRollNumber:c,courseName:this.cour,stream:this.stre,token:JSON.parse(localStorage.getItem("login")).token};
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
