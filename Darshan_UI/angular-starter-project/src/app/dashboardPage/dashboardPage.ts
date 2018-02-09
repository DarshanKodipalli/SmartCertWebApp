import { Component,OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { RestCallsComponent } from '../services/httpServices';
import { Router} from '@angular/router'

@Component({
  selector: 'dashboardPage',
  templateUrl: "../dashboardPage/dashboardPage.html"  
  
})

export class DashboardPageComponent implements OnInit {

  public certificatesToBeSigned:any=[];
  public batchesCount:number=0;
  public numberOfCertificates:number=0;
  public showBatchTable:boolean = false;
  constructor(private http:RestCallsComponent) {
  }
  ngOnInit(){
    console.log("Id:");
    var abc = this.http.getAllBatchesVerified().subscribe(
      (response)=>{
                    console.log("_______________________________________________________________________________")
                    console.log(response.json())
                    this.certificatesToBeSigned = response.json();
                    this.batchesCount = response.json().length;
                    if(this.batchesCount>0){
                      for(var i=0;i<this.batchesCount;i++){
                        //if(this.certificatesToBeSigned[i].rejectedCount===0)
                        this.numberOfCertificates+=this.certificatesToBeSigned[i].rejectedCount;
                        console.log("_____________________certificateCount_____________");
                        console.log(this.numberOfCertificates);
                        if(this.numberOfCertificates===NaN){
                          this.numberOfCertificates = 0;
                        }
                        console.log(this.batchesCount + " "+ this.numberOfCertificates)
                      }                      
                    }else{
                      this.showBatchTable =true;
                    }
                  },
      (error)=>console.log(error));
  }
}