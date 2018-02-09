import { Component,OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { RestCallsComponent } from '../services/httpServices';
import { Router} from '@angular/router'

@Component({
  selector: 'certificatePageApprover',
  templateUrl: '../certificatePageApprover/certificatePageApprover.html'
})

export class CertificatePageApproverComponent implements OnInit {

   constructor(private http:RestCallsComponent,private rout:Router) {
  }
  public certificatesToBeSigned:any=[];
  public batchesCount:number=0;
  public noBatches:boolean = false;
  public batches:boolean = false;
  public numberOfCertificates:number=0;  
  ngOnInit(){
  	    console.log("Id:");
    var abc = this.http.getAllBatchesNotVerified().subscribe(
      (response)=>{
                    this.certificatesToBeSigned = response.json();
                    this.batchesCount = response.json().length;
                    console.log(this.batchesCount);
                    if(this.batchesCount>0){
                      this.batches = true;
                      for(var i=0;i<this.batchesCount;i++){
                        this.numberOfCertificates+=this.certificatesToBeSigned[i].certificateCount;
                        console.log(this.batchesCount + " "+ this.numberOfCertificates)
                      }                      
                    }else{
                      this.noBatches = true;
                    }
                  },
      (error)=>console.log(error));

  }
  viewCertificates(y){
    console.log(y);
    localStorage.setItem("batchInf",JSON.stringify(y));
    this.rout.navigate(['approver/approvesCertificates']);
  }
}
