import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { RestCallsComponent } from '../services/httpServices';
import { Router} from '@angular/router';
import { DataTransferService } from "../services/DataTransferService";

@Component({
  selector: 'certificatePage',
  templateUrl: '../certificatePage/certificatePage.html'
})

export class CertificatePageComponent {

   constructor(private http:RestCallsComponent,private rout:Router,private transfer: DataTransferService) {
  }
  public certificatesToBeSigned:any=[];
  public batchesCount:number=0;
  public noBatches:boolean = false;
  public batches:boolean = false;
  public numberOfCertificates:number=0;  
  ngOnInit(){
  	    console.log("Id:");
    var abc = this.http.getAllBatchesVerified({token:JSON.parse(localStorage.getItem("login")).token}).subscribe(
      (response)=>{
                    console.log(response.json());
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
    this.transfer.setVerifiedBatchesForIssuer(y);
    this.rout.navigate(['view/rejected']);
  }
}
