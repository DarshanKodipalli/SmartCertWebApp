import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { RestCallsComponent } from '../../services/httpServices';
import { Router} from '@angular/router'
import { DataTransferService } from "../../services/DataTransferService";

@Component({
  selector: 'viewTransactionbatches',
  templateUrl: './viewBatches.html'
})

export class ViewCertificateBatches implements OnInit {

    public requests:any = [];
    public requests1:any = [];
  public certificates:any = [];
  public numberOfCertificatesViewed:number = 0;
  public certificateCount:number = 0;
  public numberOfCertificatesShared:number = 0;
  public showRequest:boolean;
  colors: Object;
  public swal: any;
  public studentName:String = "";
  public certificatesToBeSigned:any=[];
  public batchesCount:number=0;
  public noBatches:boolean = false;
  public batches:boolean = false;
  public numberOfCertificates:number=0;  
  public distinctInstitutions = [];
  constructor(private http:RestCallsComponent,private rout:Router,private transfer:DataTransferService) {
    console.log("Received Data_______");
    var id = JSON.parse(localStorage.getItem("login")).universityId;
    console.log(JSON.parse(localStorage.getItem("ViewRequestForStudent")));
    this.http.getInstitutionsWithMoreThanOneRequestCount({universityId:id}).subscribe(
      (response)=>{
        console.log("StudentDashboardComponent");
        console.log(response.json());
        this.requests = response.json();                        
      },
      (err)=>{
        console.log(err);
        console.log("student dashboard controller")
      });
  }
  ngOnInit(){
  }
    viewStudents(data){
    localStorage.setItem("studentBatchInformation",JSON.stringify(data));
    this.rout.navigate(['View/TransactionStudents']);
  }  
  viewRequests(data){
    console.log("View Requests");
    console.log(data);
    this.http.getRequestsforInstiId({institutionId:data._id}).subscribe(
      (response)=>{
        console.log(response.json());
        this.transfer.setRequestsForInstitution(response.json());
        this.rout.navigate(["View/TransactionStudents"]);
      },
      (error)=>{
        console.log(error);
      });
  }
}
