import { Component, OnInit } from '@angular/core';
import { RestCallsComponent } from '../../services/httpServices';

declare var swal: any;


@Component({
  selector: 'student-transaction',
  templateUrl: './viewRequests.html'
})

export class viewRequestsTransactionPage implements OnInit {
  public requests:any = [];
  public certificates:any = [];
  public numberOfCertificatesViewed:number = 0;
  public certificateCount:number = 0;
  public numberOfCertificatesShared:number = 0;
  public showRequest:boolean;
  colors: Object;
  public swal: any;
  public studentName:String = "";
  //public showTable = false;
  constructor(private http:RestCallsComponent) {
    console.log("Received Data_______");
    console.log(JSON.parse(localStorage.getItem("ViewRequestForStudent")));
    this.studentName = JSON.parse(localStorage.getItem("ViewRequestForStudent")).name;
      var query = {
              token:JSON.parse(localStorage.getItem("login")).token,
              studentId:JSON.parse(localStorage.getItem("ViewRequestForStudent"))._id
            };
  	this.http.getRequests(query).subscribe(
  		(response)=>{
  			console.log("StudentDashboardComponent");
        console.log(response.json());
                        this.requests = response.json();
                this.certificateCount = this.requests.length;
                if(this.certificateCount===0){
                  this.showRequest = false;
                }else{
                  this.showRequest = true;
/*                if(this.certificateCount===0 || this.requests){
                  this.showTable = true;
                }*/
                console.log("________________________");
                console.log(this.certificateCount);
                console.log("________________________");
                for(var i=0;i<this.certificateCount;i++){
                  console.log(this.requests[i].viewCount);
                  this.numberOfCertificatesViewed += this.requests[i].viewCount;
                  this.numberOfCertificatesShared += (this.requests[i].certificates.length);
                  console.log(this.numberOfCertificatesViewed);
               }
        console.log(this.requests);
      }
  		},
  		(err)=>{
  			console.log(err);
  			console.log("student dashboard controller")
  		});
  }

  ngOnInit() {
  }
}
