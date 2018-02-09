import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/HttpService';
import { ColorsService } from '../../services/colors';

declare var swal: any;


@Component({
  selector: 'student-dashboard',
  templateUrl: './studentDashboard.html',
  providers: [ColorsService]
})

export class StudentDashboardComponent implements OnInit {
  public requests:any = [];
  public certificates:any = [];
  public numberOfCertificatesViewed:number = 0;
  public certificateCount:number = 0;
  public hideActiveRequests:boolean = true;
  public numberOfCertificates:number = 0;
  public numberOfCertificatesShared:number = 0;
  colors: Object;
  public swal: any;

  constructor(private http:HttpService,private colorsService: ColorsService) {
    this.colors = colorsService.getBootstrapColors();
    console.log("___________________________________")
    console.log(JSON.parse(localStorage.getItem("login")));
  	this.http.getRequests(JSON.parse(localStorage.getItem("login"))).subscribe(
  		(response)=>{
  			console.log("StudentDashboardComponent");
        if(!response.json().status)
  			  this.requests = response.json();
                        this.requests = response.json();
                        for(var i=0;i<this.requests.length;i++){
                          this.numberOfCertificatesShared += this.requests[i].certificates.length;
                        }
                this.certificateCount = this.requests.length;
                if(this.certificateCount>0){
                  this.hideActiveRequests = false;
                }
                console.log("________________________");
                console.log(this.certificateCount);
                console.log("________________________");
                for(var i=0;i<this.certificateCount;i++){
                this.numberOfCertificatesViewed+=this.requests[i].viewCount;
               }

        console.log(this.requests);
  		},
  		(err)=>{
  			console.log(err);
  			console.log("student dashboard controller")
  		});
  }

  ngOnInit() {
   this.http.getCertificates(JSON.parse(localStorage.getItem("login"))).
    subscribe(
      (response)=>{
        this.numberOfCertificates = response.json().length;
      },
      (error)=>{
        console.log(error);
        console.log("certificate constructor");
      });

  }

  showCertificates(data){
    this.certificates = data;
    console.log(this.certificates);
  }

  expireToken(data){
    var temp:any = JSON.parse(localStorage.getItem("login"));
    temp._id = data._id;
    this.http.expireRequest(temp).subscribe(
       (response)=>{
         if(response.json().status!=1){
           console.log("error student dashboard expire token");
           this.http.getRequests(JSON.parse(localStorage.getItem("login"))).subscribe(
              (response)=>{
              console.log("StudentDashboardComponent");
              if(!response.json().status)
                this.requests = response.json();
               }
            );
         }
         else{
           console.log("expire success");
         }
       },
       (error)=>{
         console.log(error);
         console.log("student dashboard-- expire token");
       }
    );
  }

  /*expireToken(data){
    this.swal({
      title: 'Are you sure?',
      text: 'You will not be able to recover this imaginary file!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel plx!',
      confirmButtonClass: 'confirm-class',
      cancelButtonClass: 'cancel-class',
      closeOnConfirm: false,
      closeOnCancel: false
    }, function(isConfirm) {
      if (isConfirm) { 
        this.swal('Deleted!', 'Your file has been deleted.', 'success');
        console.log(data);
      } else {
        this.swal('Cancelled', 'Your imaginary file is safe :)', 'error');
      }
    });
  }*/

}
