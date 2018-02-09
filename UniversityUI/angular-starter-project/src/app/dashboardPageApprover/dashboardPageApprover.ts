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
  public numberOfVerifiedCertificates:Number = 0;
  constructor(private http:RestCallsComponent) {
  }
  ngOnInit(){
    console.log("Id:");
        var abc = this.http.getAllVerifiedCertificates({token:JSON.parse(localStorage.getItem("login")).token}).subscribe(
        (response)=>{
                      this.numberOfVerifiedCertificates = response.json().length;
                      this.http.getAllBatchesNotVerified({token:JSON.parse(localStorage.getItem("login")).token}).subscribe(
                          (response)=>{
                                        this.certificatesToBeSigned = response.json();
                                        this.batchesCount = response.json().length;
                                        if(this.batchesCount==0){
                                          this.showBatchesTable = true;
                                        }else{
                                          for(var i=0;i<this.batchesCount;i++){
                                            this.numberOfCertificates+=this.certificatesToBeSigned[i].certificatesToBeSigned;
                                            console.log(this.batchesCount + " "+ this.numberOfCertificates)
                                          }                      
                                        }
                                      },
                          (error)=>console.log(error));
                    },
        (error)=>console.log(error));
  }

}
