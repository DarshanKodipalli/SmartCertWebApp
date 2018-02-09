import { Component,OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { RestCallsComponent } from '../services/httpServices';
import { Router} from '@angular/router'

@Component({
  selector: 'dashboardPageApprover',
  templateUrl: '../dashboardPageApprover/dashboardPageApprover.html'
})

export class DashboardPageApproverComponent implements OnInit {

  public certificatesToBeSigned:any=[];
  public batchesCount:number=0;
  public numberOfCertificates:number=0;
  public showBatchesTable:boolean = false;
  constructor(private http:RestCallsComponent) {
  }
  ngOnInit(){
    console.log("Id:");
    var abc = this.http.getAllBatchesNotVerified().subscribe(
      (response)=>{
                    this.certificatesToBeSigned = response.json();
                    this.batchesCount = response.json().length;
                    if(this.batchesCount==0){
                      this.showBatchesTable = true;
                    }else{
                      for(var i=0;i<this.batchesCount;i++){
                        this.numberOfCertificates+=this.certificatesToBeSigned[i].certificateCount;
                        console.log(this.batchesCount + " "+ this.numberOfCertificates)
                      }                      
                    }
                  },
      (error)=>console.log(error));
  }

}
