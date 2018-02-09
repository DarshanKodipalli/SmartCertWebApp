import { Component,OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { RestCallsComponent } from '../services/httpServices';
import { Router} from '@angular/router';
import { DataTransferService } from "../services/DataTransferService";

@Component({
  selector: 'certificatePageApprover',
  templateUrl: '../certificatePageApprover/certificatePageApprover.html'
})

export class CertificatePageApproverComponent implements OnInit {

  public certificatesToBeSigned:any=[];
  public batchesCount:number=0;
  public noBatches:boolean = false;
  public batches:boolean = false;
  public numberOfCertificates:number=0;  
   constructor(
     private http:RestCallsComponent,
     private rout:Router,
     private transfer:DataTransferService) {
   	this.http.getAllBatchesNotVerified({
   	    token: JSON.parse(localStorage.getItem("login")).token
   	}).subscribe(
   	    (response) => {
   	        var resp = response.json();
   	        if(!resp.status){
   	        	resp.certificateType = resp.certificateType?resp.certificateType:[];
   	        	this.certificatesToBeSigned = resp;
	   	        this.batchesCount = this.certificatesToBeSigned.length;
	   	        if (this.batchesCount > 0)
	   	            this.batches = true;
	   	        else
	   	            this.noBatches = true;	   	     
	   	        for (var i = 0; i < this.batchesCount; i++) {
	   	            this.numberOfCertificates += this.certificatesToBeSigned[i].certificateCount;
	   	        }
   	        }else{
   	        	console.log("certificatepageapprovercomponent -- constructor something went wrong");
   	        }
   	    },
   	    (error) => console.log(error));
  }
  ngOnInit(){

  }
  viewCertificates(y){
    this.transfer.setBatch(y);
    this.rout.navigate(['approver/approvesCertificates']);
  }
}
